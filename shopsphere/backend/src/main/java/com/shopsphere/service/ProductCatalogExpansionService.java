package com.shopsphere.service;

import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.ProductImage;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductCatalogExpansionService {

    private static final Logger log = LoggerFactory.getLogger(ProductCatalogExpansionService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductCatalogExpansionService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStart() {
        try {
            seedGlobalBrandProducts();
        } catch (Exception e) {
            log.error("Failed to seed global brand products on startup: {}", e.getMessage());
        }
    }

    @Transactional
    public int seedGlobalBrandProducts() {
        Category smartphones = getOrCreateCategory("Smartphones", "smartphones", "Latest 5G smartphones, flagship devices and gaming phones");
        Category laptops = getOrCreateCategory("Laptops", "laptops", "High-performance ultrabooks, gaming laptops and workstation notebooks");
        Category electronics = getOrCreateCategory("Electronics", "electronics", "Premium headphones, smartwatches, gaming consoles and audio");
        Category fashion = getOrCreateCategory("Fashion & Apparel", "fashion", "Designer wear, sneakers, jackets, watches and accessories");

        List<ProductSeedData> items = new ArrayList<>();

        // ════════════════════════════════════════════════════════════════════
        // 1. SMARTPHONES: Apple iPhone
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Apple iPhone 16 Pro Max (256GB - Desert Titanium)",
                "Apple", "smartphones", smartphones, 144900, 134900,
                "A18 Pro chip, 48MP Fusion camera with 5x Telephoto, 6.9-inch Super Retina XDR display with ProMotion and innovative Camera Control.",
                "Desert Titanium • A18 Pro Chip • 48MP Fusion Camera • 5x Optical Zoom",
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
                "{\"Processor\":\"A18 Pro\",\"RAM\":\"8 GB\",\"Storage\":\"256 GB\",\"Display\":\"6.9-inch OLED 120Hz\",\"Camera\":\"48MP + 48MP + 12MP\",\"Battery\":\"4685 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Apple iPhone 16 (128GB - Ultramarine)",
                "Apple", "smartphones", smartphones, 79900, 74900,
                "A18 chip with 5-core GPU, 48MP Fusion camera with 2x Telephoto, Action Button, Camera Control, and durable colour-infused back glass.",
                "Ultramarine Blue • A18 Chip • 48MP Fusion Camera • Ceramic Shield",
                "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=80",
                "{\"Processor\":\"A18\",\"RAM\":\"8 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.1-inch Super Retina XDR\",\"Camera\":\"48MP + 12MP\",\"Battery\":\"3561 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Apple iPhone 15 Pro (128GB - Natural Titanium)",
                "Apple", "smartphones", smartphones, 119900, 109900,
                "Aerospace-grade titanium design, A17 Pro chip, customizable Action button, and 48MP main camera with multiple focal lengths.",
                "Natural Titanium • A17 Pro Chip • 48MP Pro Camera • USB-C 3.0",
                "https://images.unsplash.com/photo-1695048065057-de657e2a9b3a?w=600&q=80",
                "{\"Processor\":\"A17 Pro\",\"RAM\":\"8 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.1-inch OLED 120Hz\",\"Camera\":\"48MP + 12MP + 12MP\",\"Battery\":\"3274 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Apple iPhone 15 (128GB - Midnight Black)",
                "Apple", "smartphones", smartphones, 69900, 59999,
                "Dynamic Island bubbles up alerts and Live Activities. 48MP Main camera with 2x Telephoto for high-resolution portraits.",
                "Dynamic Island • 48MP Main Camera • A16 Bionic • USB-C",
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80",
                "{\"Processor\":\"A16 Bionic\",\"RAM\":\"6 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.1-inch Super Retina XDR\",\"Camera\":\"48MP + 12MP\",\"Battery\":\"3349 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Apple iPhone 14 (128GB - Starlight White)",
                "Apple", "smartphones", smartphones, 59900, 49999,
                "Super Retina XDR display, advanced dual-camera system for better photos in all lights, Cinematic mode in 4K Dolby Vision.",
                "Starlight White • A15 Bionic • Dual Camera • Ceramic Shield",
                "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80",
                "{\"Processor\":\"A15 Bionic\",\"RAM\":\"6 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.1-inch OLED\",\"Camera\":\"12MP + 12MP\",\"Battery\":\"3279 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Apple iPhone 13 (128GB - Midnight Blue)",
                "Apple", "smartphones", smartphones, 52900, 42999,
                "Lightning-fast A15 Bionic chip, durable flat-edge design, IP68 water resistance, and sensor-shift optical image stabilization.",
                "A15 Bionic • Cinematic Mode • Ceramic Shield • Sensor-Shift OIS",
                "https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=600&q=80",
                "{\"Processor\":\"A15 Bionic\",\"RAM\":\"4 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.1-inch Super Retina\",\"Camera\":\"12MP + 12MP\",\"Battery\":\"3240 mAh\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 2. SMARTPHONES: Redmi / Xiaomi
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Redmi Note 13 Pro+ 5G (Fusion Purple, 12GB RAM, 512GB)",
                "Redmi", "smartphones", smartphones, 35999, 29999,
                "Flagship 200MP OIS camera, 3D Curved 1.5K 120Hz AMOLED, 120W HyperCharge, IP68 dust and water resistance, MediaTek Dimensity 7200-Ultra.",
                "200MP OIS • 120W HyperCharge • Curved 1.5K AMOLED • IP68 Water Resistant",
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
                "{\"Processor\":\"Dimensity 7200 Ultra\",\"RAM\":\"12 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.67-inch 120Hz 1.5K Curved\",\"Camera\":\"200MP + 8MP + 2MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Redmi Note 13 5G (Prism Gold, 8GB RAM, 256GB)",
                "Redmi", "smartphones", smartphones, 20999, 16999,
                "Super-clear 108MP 3X in-sensor zoom camera, ultra-slim 120Hz AMOLED with minimal bezels, MediaTek Dimensity 6080 5G processor.",
                "108MP 3X Zoom Camera • 120Hz FHD+ AMOLED • 33W Fast Charging",
                "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
                "{\"Processor\":\"Dimensity 6080\",\"RAM\":\"8 GB\",\"Storage\":\"256 GB\",\"Display\":\"6.67-inch 120Hz AMOLED\",\"Camera\":\"108MP + 8MP + 2MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Redmi 13C 5G (Starlight Black, 6GB RAM, 128GB)",
                "Redmi", "smartphones", smartphones, 13999, 10499,
                "Smooth 90Hz 6.74-inch display, 50MP AI dual camera, MediaTek Dimensity 6100+ 5G, massive 5000mAh battery with 18W charging.",
                "Dimensity 6100+ 5G • 50MP AI Camera • 90Hz Display • 5000mAh Battery",
                "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80",
                "{\"Processor\":\"Dimensity 6100+\",\"RAM\":\"6 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.74-inch 90Hz\",\"Camera\":\"50MP AI\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Xiaomi 14 Ultra 5G (Titanium Black, 16GB RAM, 512GB)",
                "Xiaomi", "smartphones", smartphones, 99999, 89999,
                "Legendary Leica Quad 50MP camera system with stepless variable aperture, Snapdragon 8 Gen 3, 90W HyperCharge, 80W wireless charging.",
                "Leica Quad 50MP Cameras • 1-inch Sensor • Snapdragon 8 Gen 3 • 2K AMOLED",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8 Gen 3\",\"RAM\":\"16 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.73-inch 2K 120Hz LTPO\",\"Camera\":\"50MP + 50MP + 50MP + 50MP\",\"Battery\":\"5000 mAh\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 3. SMARTPHONES: Realme
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Realme GT 6 5G (Fluid Silver, 16GB RAM, 512GB)",
                "Realme", "smartphones", smartphones, 44999, 38999,
                "Flagship Snapdragon 8s Gen 3, Sony LYT-808 OIS camera with 2x Telephoto, 6000nits Ultra Bright 120Hz 8T LTPO Display, 120W charging.",
                "Snapdragon 8s Gen 3 • 6000nits LTPO Display • 120W Ultra Charge • Sony LYT-808",
                "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8s Gen 3\",\"RAM\":\"16 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.78-inch 120Hz 8T LTPO\",\"Camera\":\"50MP OIS + 50MP + 8MP\",\"Battery\":\"5500 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Realme 12 Pro+ 5G (Submarine Blue, 12GB RAM, 256GB)",
                "Realme", "smartphones", smartphones, 33999, 28999,
                "Periscope portrait camera with 3x optical zoom and 120x SuperZoom, premium luxury watch design crafted by Ollivier Saveo, 67W charge.",
                "64MP Periscope Portrait • Luxury Watch Vegan Leather • 120Hz Curved AMOLED",
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
                "{\"Processor\":\"Snapdragon 7s Gen 2\",\"RAM\":\"12 GB\",\"Storage\":\"256 GB\",\"Display\":\"6.7-inch 120Hz Curved AMOLED\",\"Camera\":\"64MP + 50MP + 8MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Realme Narzo 70 Pro 5G (Glass Green, 8GB RAM, 128GB)",
                "Realme", "smartphones", smartphones, 21999, 17999,
                "Flagship Sony IMX890 OIS camera, Air Gesture touch-less control, Horizon Glass design, 67W SUPERVOOC charging with 5000mAh battery.",
                "Sony IMX890 OIS • Air Gestures • 67W SUPERVOOC • 120Hz AMOLED",
                "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=600&q=80",
                "{\"Processor\":\"Dimensity 7050\",\"RAM\":\"8 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.67-inch 120Hz AMOLED\",\"Camera\":\"50MP Sony OIS + 8MP + 2MP\",\"Battery\":\"5000 mAh\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 4. SMARTPHONES: Poco
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Poco F6 5G (Titanium Silver, 12GB RAM, 512GB)",
                "Poco", "smartphones", smartphones, 33999, 27999,
                "Powerful Snapdragon 8s Gen 3 processor, WildBoost 3.0 optimization, 90W Turbo Charging, 50MP Sony OIS camera, 1.5K 120Hz AMOLED.",
                "Snapdragon 8s Gen 3 • 90W TurboCharge • 1.5K 120Hz AMOLED • WildBoost 3.0",
                "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8s Gen 3\",\"RAM\":\"12 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.67-inch 1.5K 120Hz AMOLED\",\"Camera\":\"50MP OIS + 8MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Poco X6 Pro 5G (Racing Yellow Leather, 12GB RAM, 512GB)",
                "Poco", "smartphones", smartphones, 28999, 23999,
                "MediaTek Dimensity 8300-Ultra with 1.46M+ AnTuTu score, 64MP triple camera with OIS, 67W sonic charging, CrystalRes 1.5K Flow AMOLED.",
                "Dimensity 8300 Ultra • Vegan Leather Back • 64MP OIS • 67W Sonic Charge",
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
                "{\"Processor\":\"Dimensity 8300 Ultra\",\"RAM\":\"12 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.67-inch 120Hz Flow AMOLED\",\"Camera\":\"64MP OIS + 8MP + 2MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Poco M6 Pro 5G (Power Black, 6GB RAM, 128GB)",
                "Poco", "smartphones", smartphones, 12999, 9999,
                "Snapdragon 4 Gen 2 4nm 5G processor, premium glass back design, 50MP dual AI camera, 90Hz FHD+ adaptive display with Gorilla Glass.",
                "Snapdragon 4 Gen 2 • Glass Back Design • 50MP AI Camera • 90Hz Display",
                "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80",
                "{\"Processor\":\"Snapdragon 4 Gen 2\",\"RAM\":\"6 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.79-inch 90Hz FHD+\",\"Camera\":\"50MP + 2MP\",\"Battery\":\"5000 mAh\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 5. SMARTPHONES: Motorola
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Motorola Edge 50 Ultra (Nordic Wood, 16GB RAM, 512GB)",
                "Motorola", "smartphones", smartphones, 59999, 49999,
                "Real Nordic Wood finish, Snapdragon 8s Gen 3, Pantone Validated 1.5K 144Hz pOLED, 125W TurboPower and 50W wireless charging, 50MP 3x Periscope.",
                "Real Wood Finish • 125W Charging • 50MP Periscope OIS • 144Hz pOLED",
                "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8s Gen 3\",\"RAM\":\"16 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.7-inch 144Hz 1.5K pOLED\",\"Camera\":\"50MP + 50MP + 64MP\",\"Battery\":\"4500 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Motorola Edge 50 Fusion (Marshmallow Blue, 12GB RAM, 256GB)",
                "Motorola", "smartphones", smartphones, 25999, 21999,
                "Sony LYTIA 700C OIS sensor with Ultra Pixel technology, IP68 underwater protection, 144Hz 3D curved pOLED display, 68W TurboPower.",
                "Sony LYTIA 700C • IP68 Underwater Protection • 144Hz Curved pOLED",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
                "{\"Processor\":\"Snapdragon 7s Gen 2\",\"RAM\":\"12 GB\",\"Storage\":\"256 GB\",\"Display\":\"6.7-inch 144Hz Curved\",\"Camera\":\"50MP OIS + 13MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Moto G85 5G (Olive Green Vegan Leather, 12GB RAM, 256GB)",
                "Motorola", "smartphones", smartphones, 20999, 16999,
                "First Moto G with 3D Curved pOLED screen, 50MP Sony LYTIA 600 OIS camera, Dolby Atmos stereo speakers, 5000mAh battery.",
                "3D Curved 120Hz pOLED • 50MP Sony LYTIA 600 • Vegan Leather",
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
                "{\"Processor\":\"Snapdragon 6s Gen 3\",\"RAM\":\"12 GB\",\"Storage\":\"256 GB\",\"Display\":\"6.67-inch 120Hz Curved pOLED\",\"Camera\":\"50MP OIS + 8MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Motorola Razr 50 Ultra (Peach Fuzz, 12GB RAM, 512GB)",
                "Motorola", "smartphones", smartphones, 99999, 84999,
                "Iconic flip phone with largest 4.0-inch external pOLED display, Snapdragon 8s Gen 3, dual 50MP cameras with telephoto, IPX8 water resistance.",
                "Flip Foldable • 4.0-inch External Screen • Dual 50MP Telephoto • Snapdragon 8s Gen 3",
                "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8s Gen 3\",\"RAM\":\"12 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.9-inch 165Hz Foldable OLED\",\"Camera\":\"50MP + 50MP\",\"Battery\":\"4000 mAh\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 6. SMARTPHONES: Vivo
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Vivo X100 Pro 5G (Asteroid Black, 16GB RAM, 512GB)",
                "Vivo", "smartphones", smartphones, 89999, 79999,
                "ZEISS 1-inch main camera with APO floating telephoto lens, Dimensity 9300 chipset, custom Vivo V3 imaging chip, 100W FlashCharge.",
                "ZEISS 1-inch Camera • Dimensity 9300 • Vivo V3 Chip • 100W FlashCharge",
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
                "{\"Processor\":\"Dimensity 9300\",\"RAM\":\"16 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.78-inch 120Hz LTPO AMOLED\",\"Camera\":\"50MP 1-inch + 50MP + 50MP\",\"Battery\":\"5400 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Vivo V30 Pro 5G (Andaman Blue, 12GB RAM, 512GB)",
                "Vivo", "smartphones", smartphones, 46999, 39999,
                "Co-engineered with ZEISS for studio-grade portrait photography, Smart Aura Light portrait system, 80W FlashCharge, ultra-slim 7.45mm body.",
                "ZEISS All-Main Camera • Studio Aura Light • 50MP Eye AF Selfie • 80W Charge",
                "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=600&q=80",
                "{\"Processor\":\"Dimensity 8200\",\"RAM\":\"12 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.78-inch 120Hz Curved AMOLED\",\"Camera\":\"50MP + 50MP + 50MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "Vivo T3 5G (Cosmic Blue, 8GB RAM, 128GB)",
                "Vivo", "smartphones", smartphones, 22999, 18999,
                "MediaTek Dimensity 7200 processor, 50MP Sony IMX882 OIS camera with 4K video recording, dual stereo speakers with 200% volume boost.",
                "Dimensity 7200 • 50MP Sony OIS • 120Hz AMOLED • 44W FlashCharge",
                "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80",
                "{\"Processor\":\"Dimensity 7200\",\"RAM\":\"8 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.67-inch 120Hz AMOLED\",\"Camera\":\"50MP Sony OIS + 2MP\",\"Battery\":\"5000 mAh\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 7. SMARTPHONES: iQOO
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "iQOO 12 5G (Legend White BMW Edition, 16GB RAM, 512GB)",
                "iQOO", "smartphones", smartphones, 57999, 49999,
                "Snapdragon 8 Gen 3 with dedicated Q1 Supercomputing chip, 50MP 1/1.3-inch Astrography Camera with 3x periscope, 120W FlashCharge.",
                "Snapdragon 8 Gen 3 • Q1 Chip • 120W FlashCharge • 3X Periscope Zoom",
                "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8 Gen 3\",\"RAM\":\"16 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.78-inch 144Hz 1.5K LTPO\",\"Camera\":\"50MP + 50MP + 64MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "iQOO Neo 9 Pro 5G (Fiery Red Leather, 12GB RAM, 256GB)",
                "iQOO", "smartphones", smartphones, 39999, 34999,
                "Flagship Snapdragon 8 Gen 2 with Q1 Supercomputing chip, 50MP Sony IMX920 OIS camera, dual-tone vegan leather design, 120W fast charging.",
                "Snapdragon 8 Gen 2 • Dual Tone Leather • 50MP Sony IMX920 • 120W Charge",
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8 Gen 2\",\"RAM\":\"12 GB\",\"Storage\":\"256 GB\",\"Display\":\"6.78-inch 144Hz AMOLED\",\"Camera\":\"50MP OIS + 8MP\",\"Battery\":\"5160 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "iQOO Z9 5G (Brushed Green, 8GB RAM, 128GB)",
                "iQOO", "smartphones", smartphones, 21999, 17499,
                "MediaTek Dimensity 7200 with segment-leading performance, 50MP Sony IMX882 camera with 4K recording, 120Hz ultra-bright AMOLED display.",
                "Dimensity 7200 • 50MP Sony OIS • 120Hz AMOLED • 44W FlashCharge",
                "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
                "{\"Processor\":\"Dimensity 7200\",\"RAM\":\"8 GB\",\"Storage\":\"128 GB\",\"Display\":\"6.67-inch 120Hz AMOLED\",\"Camera\":\"50MP OIS + 2MP\",\"Battery\":\"5000 mAh\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 8. SMARTPHONES: Samsung & OnePlus
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 512GB)",
                "Samsung", "smartphones", smartphones, 139999, 124999,
                "Galaxy AI features, built-in S Pen, Titanium frame, 200MP Quad Tele camera with 100x Space Zoom, Snapdragon 8 Gen 3 for Galaxy.",
                "Galaxy AI • Built-in S Pen • 200MP Quad Camera • Titanium Frame",
                "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8 Gen 3\",\"RAM\":\"12 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.8-inch QHD+ 120Hz AMOLED\",\"Camera\":\"200MP + 50MP + 12MP + 10MP\",\"Battery\":\"5000 mAh\"}"
        ));
        items.add(new ProductSeedData(
                "OnePlus 12 5G (Silky Black, 16GB RAM, 512GB)",
                "OnePlus", "smartphones", smartphones, 69999, 61999,
                "4th Gen Hasselblad Camera system, Snapdragon 8 Gen 3, 2K 120Hz ProXDR display with Aqua Touch, 100W SUPERVOOC and 50W AIRVOOC charging.",
                "Snapdragon 8 Gen 3 • Hasselblad Cameras • 100W SUPERVOOC • 2K 120Hz ProXDR",
                "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&q=80",
                "{\"Processor\":\"Snapdragon 8 Gen 3\",\"RAM\":\"16 GB\",\"Storage\":\"512 GB\",\"Display\":\"6.82-inch 2K 120Hz ProXDR\",\"Camera\":\"50MP + 64MP + 48MP\",\"Battery\":\"5400 mAh\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 9. LAPTOPS: Apple MacBook
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Apple MacBook Pro 16\" (M3 Max, 36GB RAM, 1TB SSD - Space Black)",
                "Apple", "laptops", laptops, 349900, 319900,
                "14-core CPU, 30-core GPU, Liquid Retina XDR display with 1600 nits peak brightness, hardware-accelerated ray tracing, up to 22 hours battery.",
                "M3 Max Chip • 36GB Unified Memory • 1TB SSD • Liquid Retina XDR • Space Black",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
                "{\"Processor\":\"Apple M3 Max\",\"RAM\":\"36 GB\",\"Storage\":\"1 TB SSD\",\"Display\":\"16.2-inch Liquid Retina XDR 120Hz\",\"Graphics\":\"30-core GPU\",\"Weight\":\"2.16 kg\"}"
        ));
        items.add(new ProductSeedData(
                "Apple MacBook Pro 14\" (M3 Pro, 18GB RAM, 512GB SSD - Space Black)",
                "Apple", "laptops", laptops, 199900, 184900,
                "M3 Pro chip with 11-core CPU and 14-core GPU, Liquid Retina XDR display with ProMotion, MagSafe 3 charging, three Thunderbolt 4 ports.",
                "M3 Pro Chip • 18GB RAM • 512GB SSD • Liquid Retina XDR • ProMotion 120Hz",
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80",
                "{\"Processor\":\"Apple M3 Pro\",\"RAM\":\"18 GB\",\"Storage\":\"512 GB SSD\",\"Display\":\"14.2-inch Liquid Retina XDR\",\"Graphics\":\"14-core GPU\",\"Weight\":\"1.61 kg\"}"
        ));
        items.add(new ProductSeedData(
                "Apple MacBook Air 15\" (M3 chip, 16GB RAM, 512GB SSD - Midnight)",
                "Apple", "laptops", laptops, 144900, 134900,
                "Impossibly thin 11.5mm design, gorgeous 15.3-inch Liquid Retina display, M3 chip with support for up to two external displays, 18-hour battery.",
                "M3 Chip • 16GB RAM • 512GB SSD • 15.3-inch Liquid Retina • Midnight Black",
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
                "{\"Processor\":\"Apple M3\",\"RAM\":\"16 GB\",\"Storage\":\"512 GB SSD\",\"Display\":\"15.3-inch Liquid Retina\",\"Graphics\":\"10-core GPU\",\"Weight\":\"1.51 kg\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 10. LAPTOPS: HP
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "HP OMEN 16 Gaming Laptop (Intel i7-14700HX, RTX 4070 8GB, 16GB, 1TB SSD)",
                "HP", "laptops", laptops, 145999, 129999,
                "14th Gen Intel Core i7-14700HX, NVIDIA GeForce RTX 4070 8GB, 16.1\" QHD 240Hz 3ms IPS display, OMEN Tempest Cooling, 4-zone RGB keyboard.",
                "Intel i7-14700HX • RTX 4070 8GB • 16GB DDR5 • 1TB SSD • 240Hz QHD Display",
                "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80",
                "{\"Processor\":\"Intel i7-14700HX\",\"RAM\":\"16 GB DDR5\",\"Storage\":\"1 TB Gen4 SSD\",\"Display\":\"16.1-inch QHD 240Hz\",\"Graphics\":\"RTX 4070 8GB\",\"Weight\":\"2.37 kg\"}"
        ));
        items.add(new ProductSeedData(
                "HP Spectre x360 2-in-1 14\" (Intel Core Ultra 7 155H, 32GB, 1TB SSD, 2.8K OLED)",
                "HP", "laptops", laptops, 169999, 154999,
                "Intel Evo Core Ultra 7 with Intel Arc Graphics, 2.8K 120Hz OLED Touchscreen with pen support, 9MP AI camera with night vision, 17-hour battery.",
                "Core Ultra 7 • 32GB RAM • 1TB SSD • 2.8K 120Hz OLED Touch • 2-in-1 Convertible",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
                "{\"Processor\":\"Intel Core Ultra 7 155H\",\"RAM\":\"32 GB LPDDR5x\",\"Storage\":\"1 TB SSD\",\"Display\":\"14-inch 2.8K OLED Touch\",\"Graphics\":\"Intel Arc\",\"Weight\":\"1.44 kg\"}"
        ));
        items.add(new ProductSeedData(
                "HP Pavilion 15 (AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD - Natural Silver)",
                "HP", "laptops", laptops, 68999, 56990,
                "AMD Ryzen 7 7730U 8-core processor, 15.6\" FHD Micro-Edge anti-glare display, Audio by B&O, Backlit keyboard with numeric keypad, Fast Charge.",
                "Ryzen 7 7730U • 16GB DDR4 • 512GB SSD • B&O Audio • Backlit Keyboard",
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
                "{\"Processor\":\"AMD Ryzen 7 7730U\",\"RAM\":\"16 GB\",\"Storage\":\"512 GB NVMe SSD\",\"Display\":\"15.6-inch FHD IPS\",\"Graphics\":\"AMD Radeon\",\"Weight\":\"1.75 kg\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 11. LAPTOPS: Dell
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Dell XPS 15 9530 (Intel Core i9-13900H, RTX 4070, 32GB RAM, 1TB SSD)",
                "Dell", "laptops", laptops, 279999, 249999,
                "Machined aluminum chassis with carbon-fiber palm rest, 15.6\" 3.5K OLED InfinityEdge touchscreen, studio-quality quad speakers with Waves Nx 3D audio.",
                "Core i9-13900H • RTX 4070 8GB • 32GB DDR5 • 1TB SSD • 3.5K OLED Touch",
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80",
                "{\"Processor\":\"Intel Core i9-13900H\",\"RAM\":\"32 GB DDR5\",\"Storage\":\"1 TB SSD\",\"Display\":\"15.6-inch 3.5K OLED Touch\",\"Graphics\":\"RTX 4070 8GB\",\"Weight\":\"1.92 kg\"}"
        ));
        items.add(new ProductSeedData(
                "Dell Alienware m16 R2 Gaming (Intel Core Ultra 9 185H, RTX 4080, 32GB, 1TB SSD)",
                "Dell", "laptops", laptops, 239999, 214999,
                "Alienware Cryo-tech cooling with vapor chamber, 16\" QHD+ 240Hz 3ms G-SYNC display, AlienFX per-key RGB keyboard, anodized aluminum chassis.",
                "Core Ultra 9 185H • RTX 4080 12GB • 32GB DDR5 • 1TB SSD • 240Hz QHD+",
                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80",
                "{\"Processor\":\"Intel Core Ultra 9 185H\",\"RAM\":\"32 GB DDR5\",\"Storage\":\"1 TB SSD\",\"Display\":\"16-inch QHD+ 240Hz\",\"Graphics\":\"RTX 4080 12GB\",\"Weight\":\"2.61 kg\"}"
        ));
        items.add(new ProductSeedData(
                "Dell G15 5530 Gaming (Intel i7-13650HX, RTX 4060 8GB, 16GB, 1TB SSD)",
                "Dell", "laptops", laptops, 112999, 96990,
                "Alienware-inspired thermal design, 15.6\" FHD 165Hz 100% sRGB display with G-SYNC, Game Shift technology key for instantaneous performance boost.",
                "Intel i7-13650HX • RTX 4060 8GB • 16GB RAM • 1TB SSD • 165Hz G-SYNC",
                "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&q=80",
                "{\"Processor\":\"Intel i7-13650HX\",\"RAM\":\"16 GB DDR5\",\"Storage\":\"1 TB SSD\",\"Display\":\"15.6-inch FHD 165Hz\",\"Graphics\":\"RTX 4060 8GB\",\"Weight\":\"2.65 kg\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 12. LAPTOPS: Lenovo
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Lenovo Legion Pro 5i (Intel Core i9-14900HX, RTX 4070 8GB, 32GB RAM, 1TB SSD)",
                "Lenovo", "laptops", laptops, 189999, 164990,
                "Lenovo AI Engine+ powered by LA1 AI Chip, 16\" WQXGA 240Hz 500 nits PureSight Gaming display, Legion ColdFront 5.0 vapor cooling technology.",
                "Core i9-14900HX • RTX 4070 8GB • 32GB DDR5 • 1TB SSD • 240Hz PureSight WQXGA",
                "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80",
                "{\"Processor\":\"Intel i9-14900HX\",\"RAM\":\"32 GB DDR5\",\"Storage\":\"1 TB SSD\",\"Display\":\"16-inch WQXGA 240Hz 500nits\",\"Graphics\":\"RTX 4070 8GB\",\"Weight\":\"2.5 kg\"}"
        ));
        items.add(new ProductSeedData(
                "Lenovo ThinkPad X1 Carbon Gen 12 (Intel Core Ultra 7 155H, 32GB, 1TB SSD, 2.8K OLED)",
                "Lenovo", "laptops", laptops, 224999, 198990,
                "Ultralight carbon fiber unibody, 14\" 2.8K 120Hz OLED display, legendary spill-resistant ThinkPad keyboard with TrackPoint, military-grade MIL-STD 810H durability.",
                "Core Ultra 7 • 32GB RAM • 1TB SSD • 2.8K 120Hz OLED • Carbon Fiber 1.09kg",
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
                "{\"Processor\":\"Intel Core Ultra 7 155H\",\"RAM\":\"32 GB LPDDR5x\",\"Storage\":\"1 TB SSD\",\"Display\":\"14-inch 2.8K OLED 120Hz\",\"Graphics\":\"Intel Arc\",\"Weight\":\"1.09 kg\"}"
        ));
        items.add(new ProductSeedData(
                "Lenovo IdeaPad Slim 5 (Intel Core Ultra 5 125H, 16GB, 1TB SSD, 14\" OLED)",
                "Lenovo", "laptops", laptops, 79999, 67990,
                "All-metal anodized aluminum body, 14\" WUXGA 100% DCI-P3 OLED screen, FHD IR camera with privacy shutter, Dolby Audio certified front speakers.",
                "Core Ultra 5 125H • 16GB LPDDR5x • 1TB SSD • 14\" WUXGA OLED • Cloud Grey",
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
                "{\"Processor\":\"Intel Core Ultra 5 125H\",\"RAM\":\"16 GB\",\"Storage\":\"1 TB SSD\",\"Display\":\"14-inch OLED 100% DCI-P3\",\"Graphics\":\"Intel Arc\",\"Weight\":\"1.46 kg\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 13. LAPTOPS: ASUS
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "ASUS ROG Zephyrus G16 (Intel Core Ultra 9 185H, RTX 4080 12GB, 32GB, 1TB SSD)",
                "Asus", "laptops", laptops, 269999, 239990,
                "CNC-machined aluminum chassis with Slash Lighting, 16\" 2.5K 240Hz ROG Nebula OLED display with 0.2ms response time, tri-fan cooling with liquid metal.",
                "Core Ultra 9 185H • RTX 4080 12GB • 32GB RAM • 1TB SSD • 2.5K 240Hz OLED",
                "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80",
                "{\"Processor\":\"Intel Core Ultra 9 185H\",\"RAM\":\"32 GB LPDDR5X\",\"Storage\":\"1 TB SSD\",\"Display\":\"16-inch 2.5K 240Hz OLED\",\"Graphics\":\"RTX 4080 12GB\",\"Weight\":\"1.85 kg\"}"
        ));
        items.add(new ProductSeedData(
                "ASUS Zenbook 14 OLED (Intel Core Ultra 7 155H, 16GB, 1TB SSD, 3K 120Hz)",
                "Asus", "laptops", laptops, 114999, 99990,
                "Ultrathin 14.9mm and 1.2kg light, 14\" 3K 120Hz ASUS Lumina OLED display with 500 nits HDR, super-linear speakers certified by Harman Kardon.",
                "Core Ultra 7 • 16GB RAM • 1TB SSD • 3K 120Hz Lumina OLED • 1.2kg Light",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
                "{\"Processor\":\"Intel Core Ultra 7 155H\",\"RAM\":\"16 GB\",\"Storage\":\"1 TB SSD\",\"Display\":\"14-inch 3K 120Hz OLED\",\"Graphics\":\"Intel Arc\",\"Weight\":\"1.2 kg\"}"
        ));
        items.add(new ProductSeedData(
                "ASUS TUF Gaming A15 (AMD Ryzen 7 7735HS, RTX 4060 8GB, 16GB, 1TB SSD)",
                "Asus", "laptops", laptops, 96999, 82990,
                "Military-grade MIL-STD-810H durability, 15.6\" FHD 144Hz 100% sRGB display with G-SYNC, 90Wh massive battery, Arc Flow fans with anti-dust channels.",
                "Ryzen 7 7735HS • RTX 4060 8GB • 16GB DDR5 • 1TB SSD • 144Hz FHD",
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80",
                "{\"Processor\":\"AMD Ryzen 7 7735HS\",\"RAM\":\"16 GB DDR5\",\"Storage\":\"1 TB SSD\",\"Display\":\"15.6-inch 144Hz IPS\",\"Graphics\":\"RTX 4060 8GB\",\"Weight\":\"2.2 kg\"}"
        ));

        // ════════════════════════════════════════════════════════════════════
        // 14. MORE ELECTRONICS & FASHION
        // ════════════════════════════════════════════════════════════════════
        items.add(new ProductSeedData(
                "Sony WH-1000XM5 Wireless Industry-Leading Noise Cancelling Headphones",
                "Sony", "electronics", electronics, 34990, 26990,
                "Two processors control 8 microphones for unprecedented noise cancellation. Auto NC Optimizer, 30-hour battery life with quick charging, crystal clear hands-free calling.",
                "Industry-Leading ANC • 30hr Battery • LDAC Hi-Res Audio • Multipoint Bluetooth",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
                "{\"Type\":\"Over-Ear Wireless\",\"Battery\":\"30 Hours\",\"ANC\":\"Dual Processor 8-Mic\",\"Codec\":\"LDAC / AAC / SBC\"}"
        ));
        items.add(new ProductSeedData(
                "Apple AirPods Pro (2nd Generation with MagSafe Case USB-C)",
                "Apple", "electronics", electronics, 24900, 20900,
                "Apple H2 headphone chip, up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalized Spatial Audio with dynamic head tracking.",
                "H2 Chip • 2x Active Noise Cancellation • Adaptive Audio • USB-C MagSafe",
                "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
                "{\"Chip\":\"Apple H2\",\"Battery\":\"6hr Earbuds (30hr with Case)\",\"Water Resistance\":\"IP54\",\"Connectivity\":\"Bluetooth 5.3\"}"
        ));
        items.add(new ProductSeedData(
                "Sony PlayStation 5 Slim Digital Edition (1TB SSD)",
                "Sony", "electronics", electronics, 49990, 44990,
                "Custom AMD Zen 2 CPU and RDNA 2 GPU with ray tracing, ultra-fast 1TB NVMe SSD, 4K 120Hz HDR gaming, Tempest 3D AudioTech, DualSense wireless controller.",
                "Ultra-Fast 1TB SSD • 4K 120Hz Gaming • Tempest 3D Audio • Ray Tracing",
                "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80",
                "{\"Storage\":\"1 TB Custom SSD\",\"Resolution\":\"4K 120Hz / 8K\",\"HDR\":\"HDR10\",\"Controller\":\"DualSense Haptic\"}"
        ));
        items.add(new ProductSeedData(
                "Apple Watch Ultra 2 (GPS + Cellular 49mm Titanium, Ocean Band)",
                "Apple", "electronics", electronics, 89900, 82900,
                "Corrosion-resistant titanium case, up to 3000 nits display, precision dual-frequency GPS, depth gauge and water temperature sensor, 36 hours normal battery.",
                "49mm Titanium Case • 3000 Nits Brightness • Precision Dual GPS • Cellular",
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
                "{\"Case\":\"49mm Aerospace Titanium\",\"Display\":\"Always-On OLED 3000 nits\",\"Water Resistance\":\"100m\",\"Battery\":\"36-72 Hours\"}"
        ));
        items.add(new ProductSeedData(
                "Nike Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
                "Nike", "fashion", fashion, 18995, 15495,
                "Iconic Chicago colorway with aged vintage aesthetic, cracked white leather, varsity red overlays, encapsulated Air-Sole cushioning and solid rubber outsole.",
                "Iconic Chicago Colorway • Premium Leather • Air-Sole Cushioning • OG Wings Logo",
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
                "{\"Material\":\"Genuine Leather\",\"Sole\":\"Rubber Cupsole with Air\",\"Style\":\"High Top\",\"Closure\":\"Lace-up\"}"
        ));
        items.add(new ProductSeedData(
                "Ray-Ban Aviator Classic Polarized Sunglasses (Gold Frame / Green Lens)",
                "Ray-Ban", "fashion", fashion, 11290, 8990,
                "Originally designed for U.S. aviators in 1937. Legendary gold metal frame with polarized G-15 crystal green lenses providing 100% UV protection and glare elimination.",
                "100% UV Protection • Polarized G-15 Crystal Green Lens • Gold Metal Frame",
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
                "{\"Frame\":\"Polished Gold Metal\",\"Lens\":\"Polarized G-15 Green\",\"Size\":\"58mm Standard\",\"UV Protection\":\"100% UV400\"}"
        ));
        items.add(new ProductSeedData(
                "Tommy Hilfiger Men's Genuine Lambskin Leather Biker Jacket",
                "Tommy Hilfiger", "fashion", fashion, 24999, 17499,
                "Crafted from 100% premium soft lambskin leather with a rich burnished finish, asymmetrical zip front closure, quilted shoulder detailing and signature striped lining.",
                "100% Genuine Soft Lambskin • Asymmetric Biker Zip • Quilted Shoulders",
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
                "{\"Material\":\"100% Lambskin Leather\",\"Lining\":\"Polyester with Signature Stripe\",\"Fit\":\"Slim Tailored\",\"Closure\":\"Heavy Duty Metal Zipper\"}"
        ));
        items.add(new ProductSeedData(
                "Michael Kors Jet Set Travel Medium Saffiano Leather Tote Bag",
                "Michael Kors", "fashion", fashion, 26500, 17990,
                "Durable scratch-resistant Saffiano leather, polished gold-tone hardware, top-zip closure, spacious interior with padded center compartment and dual flat handles.",
                "Scratch-Resistant Saffiano Leather • Gold Hardware • Top-Zip Closure",
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
                "{\"Material\":\"100% Saffiano Leather\",\"Hardware\":\"Gold-Tone Polished\",\"Dimensions\":\"15\\\"W X 10\\\"H X 4.5\\\"D\",\"Handle Drop\":\"9.5\\\"\"}"
        ));

        int addedCount = 0;
        for (ProductSeedData data : items) {
            String slug = generateSlug(data.name);
            Optional<Product> existing = productRepository.findBySlug(slug);
            if (existing.isPresent()) {
                continue;
            }

            Product product = new Product();
            product.setName(data.name);
            product.setSlug(slug);
            product.setBrand(data.brand);
            product.setSku("CAT-" + data.brand.substring(0, Math.min(3, data.brand.length())).toUpperCase() + "-" + (System.currentTimeMillis() % 1000000) + "-" + (addedCount + 1));
            product.setDescription(data.description);
            product.setShortDescription(data.shortDescription);
            product.setPrice(BigDecimal.valueOf(data.price));
            product.setDiscountPrice(BigDecimal.valueOf(data.discountPrice));
            product.setStockQuantity(25 + (addedCount % 20));
            product.setRating(BigDecimal.valueOf(4.5 + ((addedCount % 5) * 0.1)));
            product.setReviewCount(48 + (addedCount * 7));
            product.setFeatured(true);
            product.setActive(true);
            product.setCategory(data.category);
            product.setSpecifications(data.specifications);

            if (data.imageUrl != null && !data.imageUrl.isBlank()) {
                product.addImage(new ProductImage(data.imageUrl, data.name, true, 0));
            }

            productRepository.save(product);
            addedCount++;
        }

        log.info("Successfully seeded {} branded smartphones, laptops, electronics and fashion items into database!", addedCount);
        return addedCount;
    }

    private synchronized Category getOrCreateCategory(String name, String slug, String description) {
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
        cat.setDescription(description);
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

    private static class ProductSeedData {
        String name;
        String brand;
        String categorySlug;
        Category category;
        double price;
        double discountPrice;
        String description;
        String shortDescription;
        String imageUrl;
        String specifications;

        ProductSeedData(String name, String brand, String categorySlug, Category category,
                        double price, double discountPrice, String description,
                        String shortDescription, String imageUrl, String specifications) {
            this.name = name;
            this.brand = brand;
            this.categorySlug = categorySlug;
            this.category = category;
            this.price = price;
            this.discountPrice = discountPrice;
            this.description = description;
            this.shortDescription = shortDescription;
            this.imageUrl = imageUrl;
            this.specifications = specifications;
        }
    }
}
