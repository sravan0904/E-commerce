-- ==============================================================================
-- SHOPSPHERE ENTERPRISE SAMPLE DATA INITIALIZATION
-- ==============================================================================

USE shopsphere_db;

-- ROLES
INSERT INTO roles (id, name) VALUES 
(1, 'ROLE_CUSTOMER'),
(2, 'ROLE_ADMIN')
ON DUPLICATE KEY UPDATE name=name;

-- CATEGORIES
INSERT INTO categories (id, name, slug, description, image_url, active, display_order) VALUES
(1, 'Electronics', 'electronics', 'High performance gadgets, audio, laptops and smartphones', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80', TRUE, 1),
(2, 'Fashion & Apparel', 'fashion', 'Contemporary streetwear, formal fashion and designer accessories', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80', TRUE, 2),
(3, 'Home & Living', 'home-living', 'Modern Scandinavian furniture, artisanal decor and lighting', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', TRUE, 3),
(4, 'Beauty & Wellness', 'beauty-wellness', 'Clean skincare, botanical fragrances and grooming kits', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80', TRUE, 4),
(5, 'Sports & Fitness', 'sports-fitness', 'Ergonomic fitness gear, smart apparel and accessories', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', TRUE, 5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- PRODUCTS
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, discount_price, stock_quantity, rating, review_count, is_featured, is_active, specifications) VALUES
(1, 1, 'Aura Ultra ANC Wireless Headphones', 'aura-ultra-anc-wireless-headphones', 'SoundAura', 'AU-HP-001', 
 'Experience breathtaking acoustic clarity with active noise cancellation, custom 40mm beryllium drivers, and 45-hour battery life. Designed with memory foam protein leather earcups and aircraft-grade aluminum hinges.',
 'Premium noise-canceling over-ear wireless headphones with 45-hour playback.',
 24999.00, 19999.00, 45, 4.85, 128, TRUE, TRUE, 
 '{"Connectivity": "Bluetooth 5.3, 3.5mm AUX, USB-C", "Battery": "45 Hours", "Weight": "250g", "Driver": "40mm Beryllium", "Warranty": "2 Years"}'),

(2, 1, 'Chronos Elite Pro Smartwatch', 'chronos-elite-pro-smartwatch', 'Chronos', 'CH-SW-002', 
 'Aerospace titanium casing with sapphire crystal glass, continuous ECG monitoring, dual-frequency GPS, and 14-day ultra endurance battery life. Water resistant up to 100 meters.',
 'Titanium smart timepiece with sapphire glass and medical-grade sensors.',
 32999.00, 27499.00, 28, 4.90, 94, TRUE, TRUE,
 '{"Display": "1.43 AMOLED 1000nits", "Case": "Grade 5 Titanium", "WaterResistance": "10 ATM", "Battery": "Up to 14 days", "Sensors": "ECG, SpO2, HeartRate"}'),

(3, 1, 'Vortex Minimalist Mechanical Keyboard', 'vortex-minimalist-mechanical-keyboard', 'VortexKey', 'VK-KB-003',
 'Compact 75% hot-swappable mechanical keyboard with lubricated tactile switches, solid CNC aluminum chassis, sound dampening silicone gaskets, and RGB backlighting.',
 '75% CNC aluminum gasket-mounted hot-swappable mechanical keyboard.',
 12499.00, 9999.00, 60, 4.75, 76, FALSE, TRUE,
 '{"Layout": "75% ANSI", "Switches": "Pre-lubed Tactile Brown", "Keycaps": "Double-shot PBT", "Connection": "Tri-mode (BT/2.4G/USB-C)"}'),

(4, 2, 'Merino Wool Minimalist Trench Coat', 'merino-wool-minimalist-trench-coat', 'Atelier Mode', 'AM-TC-004',
 'Expertly tailored from 100% fine Australian Merino wool with water-resistant storm flap, horn buttons, and a clean contemporary silhouette suitable for all seasons.',
 'Handcrafted 100% Merino wool timeless overcoat.',
 18999.00, 15499.00, 22, 4.80, 52, TRUE, TRUE,
 '{"Material": "100% Merino Wool", "Lining": "Cupro Bemberg", "Fit": "Modern Tailored", "Care": "Dry Clean Only"}'),

(5, 2, 'Heritage Full-Grain Leather Briefcase', 'heritage-full-grain-leather-briefcase', 'Vanguard', 'VG-BG-005',
 'Handcrafted vegetable-tanned full-grain Italian leather with dedicated 16-inch laptop compartment, solid brass hardware, and detachable shoulder strap that patinas gracefully.',
 'Artisanal Italian vegetable-tanned leather work briefcase.',
 16499.00, 13999.00, 18, 4.92, 41, TRUE, TRUE,
 '{"Material": "Italian Full-Grain Vegetable Leather", "Capacity": "16 inch Laptop + Documents", "Hardware": "Solid Brushed Brass"}'),

(6, 3, 'Nordic Ergonomic Solid Oak Armchair', 'nordic-ergonomic-solid-oak-armchair', 'Lumina Living', 'LL-CH-006',
 'Sculpted solid white oak frame with natural wax finish, paired with high-resilience foam and stain-resistant woven boucle upholstery for supreme comfort.',
 'Sculptural solid oak lounge chair with premium boucle upholstery.',
 28999.00, 24500.00, 12, 4.78, 33, TRUE, TRUE,
 '{"Frame": "FSC Certified White Oak", "Fabric": "Textured Boucle", "Dimensions": "78cm x 82cm x 75cm", "MaxWeight": "150kg"}'),

(7, 3, 'Aroma Ultrasonic Stone Mist Diffuser', 'aroma-ultrasonic-stone-mist-diffuser', 'Lumina Living', 'LL-DF-007',
 'Hand-poured porcelain ceramic cover with whisper-quiet ultrasonic atomization, ambient warm LED glow, and automatic waterless shut-off feature.',
 'Artisanal ceramic ultrasonic aromatherapy stone diffuser.',
 4499.00, 3499.00, 85, 4.65, 88, FALSE, TRUE,
 '{"Material": "Handmade Matte Ceramic", "Capacity": "180ml", "Coverage": "Up to 500 sq ft", "Timer": "Continuous, 2h, 4h, 8h"}'),

(8, 4, 'Botanical Radiance Youth Face Elixir', 'botanical-radiance-youth-face-elixir', 'PureNectar', 'PN-SR-008',
 'Infused with cold-pressed rosehip seed, squalane, marula oil, and bio-retinol alternatives to intensely hydrate, soothe, and rejuvenate the skin barrier without greasiness.',
 'Luxury botanical active facial oil with plant squalane and rosehip.',
 3299.00, 2699.00, 110, 4.88, 145, TRUE, TRUE,
 '{"Volume": "30ml / 1.0 fl oz", "SkinType": "All Skin Types", "Certifications": "Cruelty-Free, Vegan, Organic", "Origin": "France"}'),

(9, 5, 'Apex Smart Adjustable Dumbbell Set', 'apex-smart-adjustable-dumbbell-set', 'ApexFit', 'AF-DB-009',
 'Replace 15 pairs of traditional weights with one quick-turn dial system adjusting smoothly from 2.5kg to 24kg per dumbbell. Heavy-duty steel knurled grip.',
 'Space-saving rapid adjustment dumbbell pair (2.5kg - 24kg).',
 21999.00, 18499.00, 15, 4.82, 67, TRUE, TRUE,
 '{"WeightRange": "2.5kg - 24kg per dumbbell", "Plates": "Cast Iron Laser Cut", "Tray": "High-impact polymer"}'),

(10, 1, 'StudioStream 4K Ultra Webcam', 'studiostream-4k-ultra-webcam', 'SoundAura', 'AU-WC-010',
 'Sony STARVIS CMOS sensor delivering crystal clear 4K HDR at 60fps, AI auto-framing, dual noise-canceling stereo mics, and integrated physical privacy shutter.',
 'Professional 4K 60fps streaming webcam with AI auto framing.',
 14999.00, 11999.00, 35, 4.70, 58, FALSE, TRUE,
 '{"Resolution": "4K UHD @ 60 FPS", "Sensor": "Sony STARVIS", "FieldOfView": "65/78/90 degrees adjustable", "Mount": "Tripod / Monitor clamp"}')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- PRODUCT IMAGES
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'Aura Wireless Headphones Angle 1', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', 'Aura Wireless Headphones Lifestyle', FALSE, 2),
(2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'Chronos Smartwatch Front', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', 'Chronos Smartwatch Angle', FALSE, 2),
(3, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 'Mechanical Keyboard Top', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&q=80', 'Merino Wool Trench Coat', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'Leather Briefcase Front', TRUE, 1),
(6, 'https://images.unsplash.com/photo-1580481077190-7361456dd06f?w=800&q=80', 'Nordic Oak Armchair', TRUE, 1),
(7, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', 'Stone Mist Diffuser', TRUE, 1),
(8, 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&q=80', 'Radiance Face Elixir', TRUE, 1),
(9, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80', 'Apex Adjustable Dumbbell', TRUE, 1),
(10, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 'StudioStream Webcam', TRUE, 1);

-- COUPONS
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_count, valid_from, valid_until, active) VALUES
(1, 'WELCOME20', '20% off on your first order up to ₹2000', 'PERCENTAGE', 20.00, 1000.00, 2000.00, 500, 24, '2025-01-01 00:00:00', '2028-12-31 23:59:59', TRUE),
(2, 'SAVE1000', 'Flat ₹1000 discount on orders above ₹5000', 'FIXED', 1000.00, 5000.00, 1000.00, 300, 42, '2025-01-01 00:00:00', '2028-12-31 23:59:59', TRUE),
(3, 'FESTIVE50', 'Mega 50% discount up to ₹3000', 'PERCENTAGE', 50.00, 2000.00, 3000.00, 100, 89, '2025-01-01 00:00:00', '2028-12-31 23:59:59', TRUE)
ON DUPLICATE KEY UPDATE code=VALUES(code);
