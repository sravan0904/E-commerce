package com.shopsphere.config;

import com.shopsphere.entity.*;
import com.shopsphere.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final ProductReviewRepository productReviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           AddressRepository addressRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           CouponRepository couponRepository,
                           ProductReviewRepository productReviewRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.productReviewRepository = productReviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Roles
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_CUSTOMER")));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));

        // 2. Admin User
        if (!userRepository.existsByEmail("admin@shopsphere.com")) {
            User admin = new User();
            admin.setEmail("admin@shopsphere.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setFirstName("ShopSphere");
            admin.setLastName("Admin");
            admin.setPhone("9876543210");
            admin.setEnabled(true);
            Set<Role> roles = new HashSet<>();
            roles.add(customerRole);
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
        }

        // 3. Customer User
        User customer = null;
        if (!userRepository.existsByEmail("customer@shopsphere.com")) {
            customer = new User();
            customer.setEmail("customer@shopsphere.com");
            customer.setPassword(passwordEncoder.encode("Customer@123"));
            customer.setFirstName("John");
            customer.setLastName("Doe");
            customer.setPhone("9123456789");
            customer.setEnabled(true);
            customer.setRoles(Collections.singleton(customerRole));
            customer = userRepository.save(customer);

            Address address = new Address();
            address.setUser(customer);
            address.setRecipientName("John Doe");
            address.setPhone("9123456789");
            address.setStreetAddress("42 Marina Boulevard, Suite 500");
            address.setApartment("Tower 2, Apt 14B");
            address.setCity("Mumbai");
            address.setState("Maharashtra");
            address.setPostalCode("400001");
            address.setCountry("India");
            address.setDefault(true);
            addressRepository.save(address);
        } else {
            customer = userRepository.findByEmail("customer@shopsphere.com").orElse(null);
        }

        // 4. Categories
        Category electronics = categoryRepository.findBySlug("electronics")
                .orElseGet(() -> categoryRepository.save(createCat("Electronics", "electronics", "High performance audio, gadgets and tech accessories", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80", 1)));

        Category fashion = categoryRepository.findBySlug("fashion")
                .orElseGet(() -> categoryRepository.save(createCat("Fashion & Apparel", "fashion", "Luxury outerwear, contemporary streetwear and designer bags", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80", 2)));

        Category home = categoryRepository.findBySlug("home-living")
                .orElseGet(() -> categoryRepository.save(createCat("Home & Living", "home-living", "Artisanal furniture, stone diffusers and warm minimalist accents", "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80", 3)));

        Category beauty = categoryRepository.findBySlug("beauty-wellness")
                .orElseGet(() -> categoryRepository.save(createCat("Beauty & Wellness", "beauty-wellness", "Botanical facial oils, clean skincare and sensory fragrances", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80", 4)));

        Category sports = categoryRepository.findBySlug("sports-fitness")
                .orElseGet(() -> categoryRepository.save(createCat("Sports & Fitness", "sports-fitness", "Ergonomic workout hardware, weights and performance gear", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80", 5)));

        // 5. Products
        if (productRepository.count() == 0) {
            Product p1 = new Product();
            p1.setCategory(electronics);
            p1.setName("Aura Ultra ANC Wireless Headphones");
            p1.setSlug("aura-ultra-anc-wireless-headphones");
            p1.setBrand("SoundAura");
            p1.setSku("AU-HP-001");
            p1.setDescription("Experience breathtaking acoustic clarity with active noise cancellation, custom 40mm beryllium drivers, and 45-hour battery life. Designed with memory foam protein leather earcups and aircraft-grade aluminum hinges for marathon listening sessions.");
            p1.setShortDescription("Premium noise-canceling over-ear wireless headphones with 45-hour playback.");
            p1.setPrice(BigDecimal.valueOf(24999.00));
            p1.setDiscountPrice(BigDecimal.valueOf(19999.00));
            p1.setStockQuantity(45);
            p1.setRating(BigDecimal.valueOf(4.85));
            p1.setReviewCount(128);
            p1.setFeatured(true);
            p1.setActive(true);
            p1.setSpecifications("{\"Connectivity\": \"Bluetooth 5.3, 3.5mm AUX, USB-C\", \"Battery\": \"45 Hours\", \"Weight\": \"250g\", \"Driver\": \"40mm Beryllium\", \"Warranty\": \"2 Years\"}");
            p1.addImage(new ProductImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", "Aura Headphone Angle 1", true, 1));
            p1.addImage(new ProductImage("https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80", "Aura Headphone Lifestyle", false, 2));
            productRepository.save(p1);

            Product p2 = new Product();
            p2.setCategory(electronics);
            p2.setName("Chronos Elite Pro Smartwatch");
            p2.setSlug("chronos-elite-pro-smartwatch");
            p2.setBrand("Chronos");
            p2.setSku("CH-SW-002");
            p2.setDescription("Aerospace titanium casing with sapphire crystal glass, continuous ECG monitoring, dual-frequency GPS, and 14-day ultra endurance battery life. Water resistant up to 100 meters.");
            p2.setShortDescription("Titanium smart timepiece with sapphire glass and medical-grade sensors.");
            p2.setPrice(BigDecimal.valueOf(32999.00));
            p2.setDiscountPrice(BigDecimal.valueOf(27499.00));
            p2.setStockQuantity(28);
            p2.setRating(BigDecimal.valueOf(4.90));
            p2.setReviewCount(94);
            p2.setFeatured(true);
            p2.setActive(true);
            p2.setSpecifications("{\"Display\": \"1.43 AMOLED 1000nits\", \"Case\": \"Grade 5 Titanium\", \"WaterResistance\": \"10 ATM\", \"Battery\": \"Up to 14 days\"}");
            p2.addImage(new ProductImage("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", "Chronos Watch Front", true, 1));
            p2.addImage(new ProductImage("https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80", "Chronos Watch Lifestyle", false, 2));
            productRepository.save(p2);

            Product p3 = new Product();
            p3.setCategory(electronics);
            p3.setName("Vortex Minimalist Mechanical Keyboard");
            p3.setSlug("vortex-minimalist-mechanical-keyboard");
            p3.setBrand("VortexKey");
            p3.setSku("VK-KB-003");
            p3.setDescription("Compact 75% hot-swappable mechanical keyboard with lubricated tactile switches, solid CNC aluminum chassis, sound dampening silicone gaskets, and RGB backlighting.");
            p3.setShortDescription("75% CNC aluminum gasket-mounted hot-swappable mechanical keyboard.");
            p3.setPrice(BigDecimal.valueOf(12499.00));
            p3.setDiscountPrice(BigDecimal.valueOf(9999.00));
            p3.setStockQuantity(60);
            p3.setRating(BigDecimal.valueOf(4.75));
            p3.setReviewCount(76);
            p3.setFeatured(false);
            p3.setActive(true);
            p3.setSpecifications("{\"Layout\": \"75% ANSI\", \"Switches\": \"Pre-lubed Tactile Brown\", \"Keycaps\": \"Double-shot PBT\"}");
            p3.addImage(new ProductImage("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80", "Vortex Keyboard", true, 1));
            productRepository.save(p3);

            Product p4 = new Product();
            p4.setCategory(fashion);
            p4.setName("Merino Wool Minimalist Trench Coat");
            p4.setSlug("merino-wool-minimalist-trench-coat");
            p4.setBrand("Atelier Mode");
            p4.setSku("AM-TC-004");
            p4.setDescription("Expertly tailored from 100% fine Australian Merino wool with water-resistant storm flap, horn buttons, and a clean contemporary silhouette suitable for all seasons.");
            p4.setShortDescription("Handcrafted 100% Merino wool timeless overcoat.");
            p4.setPrice(BigDecimal.valueOf(18999.00));
            p4.setDiscountPrice(BigDecimal.valueOf(15499.00));
            p4.setStockQuantity(22);
            p4.setRating(BigDecimal.valueOf(4.80));
            p4.setReviewCount(52);
            p4.setFeatured(true);
            p4.setActive(true);
            p4.setSpecifications("{\"Material\": \"100% Merino Wool\", \"Lining\": \"Cupro Bemberg\", \"Fit\": \"Modern Tailored\"}");
            p4.addImage(new ProductImage("https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&q=80", "Trench Coat", true, 1));
            productRepository.save(p4);

            Product p5 = new Product();
            p5.setCategory(fashion);
            p5.setName("Heritage Full-Grain Leather Briefcase");
            p5.setSlug("heritage-full-grain-leather-briefcase");
            p5.setBrand("Vanguard");
            p5.setSku("VG-BG-005");
            p5.setDescription("Handcrafted vegetable-tanned full-grain Italian leather with dedicated 16-inch laptop compartment, solid brass hardware, and detachable shoulder strap that patinas gracefully.");
            p5.setShortDescription("Artisanal Italian vegetable-tanned leather work briefcase.");
            p5.setPrice(BigDecimal.valueOf(16499.00));
            p5.setDiscountPrice(BigDecimal.valueOf(13999.00));
            p5.setStockQuantity(18);
            p5.setRating(BigDecimal.valueOf(4.92));
            p5.setReviewCount(41);
            p5.setFeatured(true);
            p5.setActive(true);
            p5.setSpecifications("{\"Material\": \"Italian Full-Grain Leather\", \"Capacity\": \"16-inch Laptop\"}");
            p5.addImage(new ProductImage("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", "Leather Briefcase", true, 1));
            productRepository.save(p5);

            Product p6 = new Product();
            p6.setCategory(home);
            p6.setName("Nordic Ergonomic Solid Oak Armchair");
            p6.setSlug("nordic-ergonomic-solid-oak-armchair");
            p6.setBrand("Lumina Living");
            p6.setSku("LL-CH-006");
            p6.setDescription("Sculpted solid white oak frame with natural wax finish, paired with high-resilience foam and stain-resistant woven boucle upholstery for supreme comfort.");
            p6.setShortDescription("Sculptural solid oak lounge chair with premium boucle upholstery.");
            p6.setPrice(BigDecimal.valueOf(28999.00));
            p6.setDiscountPrice(BigDecimal.valueOf(24500.00));
            p6.setStockQuantity(12);
            p6.setRating(BigDecimal.valueOf(4.78));
            p6.setReviewCount(33);
            p6.setFeatured(true);
            p6.setActive(true);
            p6.setSpecifications("{\"Frame\": \"Solid White Oak\", \"Fabric\": \"Textured Boucle\", \"MaxWeight\": \"150kg\"}");
            p6.addImage(new ProductImage("https://images.unsplash.com/photo-1580481077190-7361456dd06f?w=800&q=80", "Nordic Armchair", true, 1));
            productRepository.save(p6);

            Product p7 = new Product();
            p7.setCategory(home);
            p7.setName("Aroma Ultrasonic Stone Mist Diffuser");
            p7.setSlug("aroma-ultrasonic-stone-mist-diffuser");
            p7.setBrand("Lumina Living");
            p7.setSku("LL-DF-007");
            p7.setDescription("Hand-poured porcelain ceramic cover with whisper-quiet ultrasonic atomization, ambient warm LED glow, and automatic waterless shut-off feature.");
            p7.setShortDescription("Artisanal ceramic ultrasonic aromatherapy stone diffuser.");
            p7.setPrice(BigDecimal.valueOf(4499.00));
            p7.setDiscountPrice(BigDecimal.valueOf(3499.00));
            p7.setStockQuantity(85);
            p7.setRating(BigDecimal.valueOf(4.65));
            p7.setReviewCount(88);
            p7.setFeatured(false);
            p7.setActive(true);
            p7.setSpecifications("{\"Capacity\": \"180ml\", \"Coverage\": \"500 sq ft\", \"Timer\": \"2h, 4h, 8h\"}");
            p7.addImage(new ProductImage("https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80", "Stone Diffuser", true, 1));
            productRepository.save(p7);

            Product p8 = new Product();
            p8.setCategory(beauty);
            p8.setName("Botanical Radiance Youth Face Elixir");
            p8.setSlug("botanical-radiance-youth-face-elixir");
            p8.setBrand("PureNectar");
            p8.setSku("PN-SR-008");
            p8.setDescription("Infused with cold-pressed rosehip seed, squalane, marula oil, and bio-retinol alternatives to intensely hydrate, soothe, and rejuvenate the skin barrier without greasiness.");
            p8.setShortDescription("Luxury botanical active facial oil with plant squalane and rosehip.");
            p8.setPrice(BigDecimal.valueOf(3299.00));
            p8.setDiscountPrice(BigDecimal.valueOf(2699.00));
            p8.setStockQuantity(110);
            p8.setRating(BigDecimal.valueOf(4.88));
            p8.setReviewCount(145);
            p8.setFeatured(true);
            p8.setActive(true);
            p8.setSpecifications("{\"Volume\": \"30ml\", \"SkinType\": \"All Skin Types\", \"Certifications\": \"Organic, Vegan\"}");
            p8.addImage(new ProductImage("https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&q=80", "Face Elixir", true, 1));
            productRepository.save(p8);

            Product p9 = new Product();
            p9.setCategory(sports);
            p9.setName("Apex Smart Adjustable Dumbbell Set");
            p9.setSlug("apex-smart-adjustable-dumbbell-set");
            p9.setBrand("ApexFit");
            p9.setSku("AF-DB-009");
            p9.setDescription("Replace 15 pairs of traditional weights with one quick-turn dial system adjusting smoothly from 2.5kg to 24kg per dumbbell. Heavy-duty steel knurled grip.");
            p9.setShortDescription("Space-saving rapid adjustment dumbbell pair (2.5kg - 24kg).");
            p9.setPrice(BigDecimal.valueOf(21999.00));
            p9.setDiscountPrice(BigDecimal.valueOf(18499.00));
            p9.setStockQuantity(15);
            p9.setRating(BigDecimal.valueOf(4.82));
            p9.setReviewCount(67);
            p9.setFeatured(true);
            p9.setActive(true);
            p9.setSpecifications("{\"WeightRange\": \"2.5kg - 24kg per dumbbell\", \"Plates\": \"Laser cut steel\"}");
            p9.addImage(new ProductImage("https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80", "Apex Dumbbell", true, 1));
            productRepository.save(p9);

            // Add sample reviews
            if (customer != null) {
                ProductReview review = new ProductReview();
                review.setProduct(p1);
                review.setUser(customer);
                review.setRating(5);
                review.setTitle("Phenomenal sound stage and build quality");
                review.setComment("The soundstage on these headphones is unlike anything I've heard in wireless gear. The ANC cuts out subway hum entirely, and the battery simply lasts forever.");
                review.setVerifiedPurchase(true);
                review.setStatus("APPROVED");
                productReviewRepository.save(review);
            }
        }

        // 6. Coupons
        if (couponRepository.count() == 0) {
            Coupon c1 = new Coupon();
            c1.setCode("WELCOME20");
            c1.setDescription("20% off on your first order up to ₹2000");
            c1.setDiscountType("PERCENTAGE");
            c1.setDiscountValue(BigDecimal.valueOf(20.00));
            c1.setMinOrderAmount(BigDecimal.valueOf(1000.00));
            c1.setMaxDiscountAmount(BigDecimal.valueOf(2000.00));
            c1.setUsageLimit(500);
            c1.setValidFrom(LocalDateTime.now().minusDays(1));
            c1.setValidUntil(LocalDateTime.now().plusYears(2));
            c1.setActive(true);
            couponRepository.save(c1);

            Coupon c2 = new Coupon();
            c2.setCode("SAVE1000");
            c2.setDescription("Flat ₹1000 off on orders above ₹5000");
            c2.setDiscountType("FIXED");
            c2.setDiscountValue(BigDecimal.valueOf(1000.00));
            c2.setMinOrderAmount(BigDecimal.valueOf(5000.00));
            c2.setMaxDiscountAmount(BigDecimal.valueOf(1000.00));
            c2.setUsageLimit(300);
            c2.setValidFrom(LocalDateTime.now().minusDays(1));
            c2.setValidUntil(LocalDateTime.now().plusYears(2));
            c2.setActive(true);
            couponRepository.save(c2);
        }
    }

    private Category createCat(String name, String slug, String desc, String img, int order) {
        Category c = new Category();
        c.setName(name);
        c.setSlug(slug);
        c.setDescription(desc);
        c.setImageUrl(img);
        c.setActive(true);
        c.setDisplayOrder(order);
        return c;
    }
}
