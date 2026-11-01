package com.shopsphere.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopsphere.dto.ProductDto;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.ProductImage;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProductScraperService {

    private static final Logger log = LoggerFactory.getLogger(ProductScraperService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductService productService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public ProductScraperService(ProductRepository productRepository,
                                 CategoryRepository categoryRepository,
                                 ProductService productService,
                                 ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productService = productService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public List<ProductDto> scrapeAndImportOnlineCatalog(int limit) {
        List<ProductDto> imported = new ArrayList<>();
        int fetchLimit = (limit <= 0 || limit >= 190) ? 250 : limit;

        // 1. Ingest DummyJSON Worldwide Products (24 Categories)
        try {
            String url = "https://dummyjson.com/products?limit=" + fetchLimit;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode productsNode = root.get("products");

                if (productsNode != null && productsNode.isArray()) {
                    for (JsonNode item : productsNode) {
                        try {
                            ProductDto dto = processOnlineProductNode(item);
                            if (dto != null) {
                                imported.add(dto);
                            }
                        } catch (Exception ex) {
                            log.warn("Skipping single product import: {}", ex.getMessage());
                        }
                    }
                }
            } else {
                log.warn("Online catalog feed returned HTTP {}", response.statusCode());
            }
        } catch (Exception e) {
            log.error("Failed to connect to online product feed: {}", e.getMessage());
        }

        // 2. Ingest FakeStore Global Products
        try {
            String fakeStoreUrl = "https://fakestoreapi.com/products";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fakeStoreUrl))
                    .timeout(Duration.ofSeconds(15))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode items = objectMapper.readTree(response.body());
                if (items.isArray()) {
                    for (JsonNode item : items) {
                        try {
                            ProductDto dto = processFakeStoreNode(item);
                            if (dto != null) {
                                imported.add(dto);
                            }
                        } catch (Exception ex) {
                            log.warn("Skipping fake store item: {}", ex.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("FakeStore feed failed (non-critical): {}", e.getMessage());
        }

        return imported;
    }

    private ProductDto processFakeStoreNode(JsonNode item) {
        String title = item.path("title").asText("");
        if (title.isBlank()) return null;

        int itemId = item.path("id").asInt(0);
        String slug = generateSlug(title) + "-fs-" + itemId;
        Optional<Product> existing = productRepository.findBySlug(slug);
        if (existing.isPresent()) {
            return productService.mapToDto(existing.get());
        }

        String categoryName = item.path("category").asText("General");
        String categorySlug = generateSlug(categoryName);
        Category category = getOrCreateCategory(capitalize(categoryName), categorySlug);

        double usdPrice = item.path("price").asDouble(49.99);
        BigDecimal inrPrice = BigDecimal.valueOf(usdPrice * 83.0).setScale(0, RoundingMode.HALF_UP);
        BigDecimal discountPrice = inrPrice.multiply(BigDecimal.valueOf(0.88)).setScale(0, RoundingMode.HALF_UP);

        Product product = new Product();
        product.setName(title);
        product.setSlug(slug);
        product.setBrand("Global Collection");
        product.setSku("FS-" + itemId + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        String desc = item.path("description").asText("Handpicked global fashion and electronics.");
        product.setDescription(desc);
        product.setShortDescription(desc.length() > 250 ? desc.substring(0, 250) + "..." : desc);
        product.setPrice(inrPrice);
        product.setDiscountPrice(discountPrice);
        product.setStockQuantity(40);

        JsonNode ratingNode = item.path("rating");
        double rate = ratingNode.path("rate").asDouble(4.2);
        int count = ratingNode.path("count").asInt(85);
        product.setRating(BigDecimal.valueOf(Math.min(rate, 5.0)).setScale(2, RoundingMode.HALF_UP));
        product.setReviewCount(count);
        product.setFeatured(true);
        product.setActive(true);
        product.setCategory(category);
        product.setSpecifications("{\"Category\": \"" + categoryName + "\", \"Rating\": \"" + rate + "\"}");

        String img = item.path("image").asText("");
        if (!img.isBlank() && img.startsWith("http")) {
            product.addImage(new ProductImage(img, title, true, 0));
        }

        Product saved = productRepository.save(product);
        return productService.mapToDto(saved);
    }

    public List<ProductDto> searchAndImportGlobal(String query) {
        List<ProductDto> imported = new ArrayList<>();
        if (query == null || query.isBlank()) return imported;

        try {
            String encoded = java.net.URLEncoder.encode(query.trim(), java.nio.charset.StandardCharsets.UTF_8);
            String url = "https://dummyjson.com/products/search?q=" + encoded;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode productsNode = root.get("products");
                if (productsNode != null && productsNode.isArray()) {
                    for (JsonNode item : productsNode) {
                        try {
                            ProductDto dto = processOnlineProductNode(item);
                            if (dto != null) {
                                imported.add(dto);
                            }
                        } catch (Exception ignored) {}
                    }
                }
            }
        } catch (Exception e) {
            log.error("Global product search failed for: {} - {}", query, e.getMessage());
        }

        return imported;
    }

    public ProductDto scrapeFromUrl(String productUrl) {
        if (productUrl == null || productUrl.isBlank()) {
            throw new IllegalArgumentException("Product URL cannot be empty");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(productUrl))
                    .timeout(Duration.ofSeconds(12))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String html = response.body();

            String title = extractMeta(html, "og:title", "twitter:title", "<title>(.*?)</title>");
            String description = extractMeta(html, "og:description", "twitter:description", "name=\"description\" content=\"(.*?)\"");
            String image = extractMeta(html, "og:image", "twitter:image", "<img[^>]+src=[\"']([^\"']+)[\"']");
            String priceStr = extractPrice(html);

            if (title == null || title.isBlank()) {
                title = "Imported Online Product";
            } else {
                title = title.replaceAll("\\s*\\|.*$", "").replaceAll("\\s*-.*Amazon.*$", "").trim();
            }

            BigDecimal price = BigDecimal.valueOf(1999.00);
            if (priceStr != null) {
                try {
                    price = new BigDecimal(priceStr.replaceAll("[^0-9.]", ""));
                } catch (Exception ignored) {}
            }

            Category category = getOrCreateCategory("Online Imports", "online-imports");

            String slug = generateSlug(title);
            Product product = new Product();
            product.setName(title);
            product.setSlug(slug);
            product.setBrand("Imported");
            product.setSku("SCRAPE-" + (System.currentTimeMillis() % 1000000));
            product.setDescription(description != null && !description.isBlank() ? description : "Imported directly from online store: " + productUrl);
            product.setShortDescription(description != null && description.length() > 120 ? description.substring(0, 120) + "..." : description);
            product.setPrice(price);
            product.setDiscountPrice(price.multiply(BigDecimal.valueOf(0.85)).setScale(2, RoundingMode.HALF_UP));
            product.setStockQuantity(25);
            product.setRating(BigDecimal.valueOf(4.5));
            product.setReviewCount(12);
            product.setFeatured(true);
            product.setActive(true);
            product.setCategory(category);
            product.setSpecifications("{\"SourceURL\": \"" + productUrl + "\", \"Scraped\": \"Auto-imported\"}");

            if (image != null && !image.isBlank() && image.startsWith("http")) {
                product.addImage(new ProductImage(image, title, true, 0));
            }

            Product saved = productRepository.save(product);
            return productService.mapToDto(saved);

        } catch (Exception e) {
            log.error("Scraping failed for URL: {} - {}", productUrl, e.getMessage());
            throw new RuntimeException("Could not scrape product: " + e.getMessage());
        }
    }

    private ProductDto processOnlineProductNode(JsonNode item) {
        String title = item.path("title").asText("");
        if (title.isBlank()) return null;

        int itemId = item.path("id").asInt(0);
        String slug = generateSlug(title) + "-" + itemId;
        Optional<Product> existing = productRepository.findBySlug(slug);
        if (existing.isPresent()) {
            return productService.mapToDto(existing.get());
        }

        String categoryName = item.path("category").asText("General");
        String categorySlug = generateSlug(categoryName);
        Category category = getOrCreateCategory(capitalize(categoryName), categorySlug);

        double usdPrice = item.path("price").asDouble(29.99);
        BigDecimal inrPrice = BigDecimal.valueOf(usdPrice * 83.0).setScale(0, RoundingMode.HALF_UP);
        double discountPct = item.path("discountPercentage").asDouble(15.0);
        BigDecimal discountPrice = inrPrice.multiply(BigDecimal.valueOf((100 - discountPct) / 100.0)).setScale(0, RoundingMode.HALF_UP);

        Product product = new Product();
        product.setName(title);
        product.setSlug(slug);
        product.setBrand(item.path("brand").asText("ShopSphere Select"));
        product.setSku("IMP-" + itemId + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        String desc = item.path("description").asText("Premium quality item with exceptional craftsmanship and design.");
        product.setDescription(desc);
        product.setShortDescription(desc.length() > 250 ? desc.substring(0, 250) + "..." : desc);
        product.setPrice(inrPrice);
        product.setDiscountPrice(discountPrice);
        product.setStockQuantity(item.path("stock").asInt(30));
        product.setRating(BigDecimal.valueOf(Math.min(item.path("rating").asDouble(4.5), 5.0)).setScale(2, RoundingMode.HALF_UP));
        product.setReviewCount(Math.max(15, (int) (item.path("rating").asDouble(4.5) * 20)));
        product.setFeatured(true);
        product.setActive(true);
        product.setCategory(category);
        product.setSpecifications("{\"Brand\": \"" + item.path("brand").asText("General") + "\", \"Rating\": \"" + item.path("rating").asDouble(4.5) + "\"}");

        // Images
        JsonNode imagesNode = item.path("images");
        String thumb = item.path("thumbnail").asText("");
        boolean hasPrimary = false;

        if (imagesNode.isArray() && imagesNode.size() > 0) {
            int order = 0;
            for (JsonNode imgUrlNode : imagesNode) {
                String imgUrl = imgUrlNode.asText("");
                if (!imgUrl.isBlank() && imgUrl.startsWith("http")) {
                    ProductImage pImg = new ProductImage(imgUrl, title, order == 0, order++);
                    product.addImage(pImg);
                    hasPrimary = true;
                }
            }
        }

        if (!hasPrimary && !thumb.isBlank()) {
            ProductImage pImg = new ProductImage(thumb, title, true, 0);
            product.addImage(pImg);
        }

        Product saved = productRepository.save(product);
        return productService.mapToDto(saved);
    }

    private synchronized Category getOrCreateCategory(String name, String slug) {
        Optional<Category> byName = categoryRepository.findByNameIgnoreCase(name);
        if (byName.isPresent()) {
            return byName.get();
        }
        Optional<Category> bySlug = categoryRepository.findBySlug(slug);
        if (bySlug.isPresent()) {
            return bySlug.get();
        }
        Category cat = new Category();
        cat.setName(name);
        cat.setSlug(slug);
        cat.setDescription("Imported " + name + " products");
        cat.setActive(true);
        return categoryRepository.save(cat);
    }

    private String generateSlug(String text) {
        String base = text.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
        if (base.length() > 60) {
            base = base.substring(0, 60);
        }
        return base;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private String extractMeta(String html, String propertyName, String propertyNameAlt, String regexFallback) {
        Pattern pattern = Pattern.compile("<meta[^>]+(?:property|name)=[\"'](" + Pattern.quote(propertyName) + "|" + Pattern.quote(propertyNameAlt) + ")[\"'][^>]+content=[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(html);
        if (matcher.find()) {
            return matcher.group(2).trim();
        }

        Pattern fallback = Pattern.compile(regexFallback, Pattern.CASE_INSENSITIVE);
        Matcher m2 = fallback.matcher(html);
        if (m2.find()) {
            return m2.group(1).trim();
        }
        return "";
    }

    private String extractPrice(String html) {
        Pattern p1 = Pattern.compile("<meta[^>]+property=[\"'](?:product:price:amount|og:price:amount)[\"'][^>]+content=[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);
        Matcher m1 = p1.matcher(html);
        if (m1.find()) {
            return m1.group(1);
        }

        Pattern p2 = Pattern.compile("(?:₹|Rs\\.?|INR|\\$)\\s*([0-9,]+(?:\\.[0-9]{2})?)", Pattern.CASE_INSENSITIVE);
        Matcher m2 = p2.matcher(html);
        if (m2.find()) {
            return m2.group(1);
        }
        return null;
    }
}
