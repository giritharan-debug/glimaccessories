import { Category, Product, Review, Coupon, SiteSettings } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-chains',
    name: 'Anti Tarnish Chains',
    slug: 'anti-tarnish-chains',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    sort_order: 1,
    is_hidden: false,
  },
  {
    id: 'cat-kadas',
    name: 'Anti Tarnish Kadas',
    slug: 'anti-tarnish-kadas',
    image: 'https://images.unsplash.com/photo-1611591475155-42e472621434?w=600&auto=format&fit=crop&q=80',
    sort_order: 2,
    is_hidden: false,
  },
  {
    id: 'cat-earrings',
    name: 'Anti Tarnish Earrings',
    slug: 'anti-tarnish-earrings',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
    sort_order: 3,
    is_hidden: false,
  },
  {
    id: 'cat-clips',
    name: 'Clips',
    slug: 'clips',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
    sort_order: 4,
    is_hidden: false,
  },
  {
    id: 'cat-keychains',
    name: 'Keychains',
    slug: 'keychains',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80',
    sort_order: 5,
    is_hidden: false,
  },
  {
    id: 'cat-rings',
    name: 'Rings',
    slug: 'rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    sort_order: 6,
    is_hidden: false,
  },
  {
    id: 'cat-second-studs',
    name: 'Second Studs',
    slug: 'second-studs',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    sort_order: 7,
    is_hidden: false,
  },
  {
    id: 'cat-bracelets',
    name: 'Anti Tarnish Bracelets',
    slug: 'anti-tarnish-bracelets',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=80',
    sort_order: 8,
    is_hidden: false,
  },
  {
    id: 'cat-korean',
    name: 'Korean Earrings',
    slug: 'korean-earrings',
    image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&auto=format&fit=crop&q=80',
    sort_order: 9,
    is_hidden: false,
  },
  {
    id: 'cat-mens-chains',
    name: "Men's Chains",
    slug: 'mens-chains',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&auto=format&fit=crop&q=80',
    sort_order: 10,
    is_hidden: false,
  },
  {
    id: 'cat-mens-earrings',
    name: "Men's Earrings",
    slug: 'mens-earrings',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80',
    sort_order: 11,
    is_hidden: false,
  },
  {
    id: 'cat-mens-rings',
    name: "Men's Rings",
    slug: 'mens-rings',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
    sort_order: 12,
    is_hidden: false,
  },
  {
    id: 'cat-jhumkas',
    name: 'Jhumkas',
    slug: 'jhumkas',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
    sort_order: 13,
    is_hidden: false,
  },
  {
    id: 'cat-ear-cuffs',
    name: 'Ear Cuffs',
    slug: 'ear-cuffs',
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&auto=format&fit=crop&q=80',
    sort_order: 14,
    is_hidden: false,
  },
  {
    id: 'cat-watches',
    name: 'Watches',
    slug: 'watches',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    sort_order: 15,
    is_hidden: false,
  },
  {
    id: 'cat-scrunchies',
    name: 'Scrunchies & Bows',
    slug: 'scrunchies-and-bows',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&auto=format&fit=crop&q=80',
    sort_order: 16,
    is_hidden: false,
  },
  {
    id: 'cat-combos',
    name: 'Combos & Hampers',
    slug: 'combos-and-hampers',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&auto=format&fit=crop&q=80',
    sort_order: 17,
    is_hidden: false,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Chains
  {
    id: 'prod-1',
    name: 'Aesthetic Heart Pendant Chain (Anti-Tarnish)',
    slug: 'aesthetic-heart-pendant-chain',
    description: '18K gold plated stainless steel aesthetic puffy heart pendant. 100% waterproof, sweatproof, and anti-tarnish designed for everyday elegance.',
    category_id: 'cat-chains',
    category_name: 'Anti Tarnish Chains',
    price: 199,
    old_price: 399,
    stock: 5,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v1', name: 'Color', options: ['18K Gold', 'Silver Plated'] },
      { id: 'v2', name: 'Length', options: ['16 inch', '18 inch', '20 inch'] }
    ],
    size_guide_type: 'chain',
    instagram_reel_url: 'https://instagram.com/p/glim_chain_demo',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Classic Snake Bone Sleek Chain',
    slug: 'classic-snake-bone-sleek-chain',
    description: 'Minimalist sleek liquid snake chain that rests flat against your collarbone. Perfect alone or layered with our dainty pendants.',
    category_id: 'cat-chains',
    category_name: 'Anti Tarnish Chains',
    price: 149,
    old_price: 299,
    stock: 2, // "Only 2 left"
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Color', options: ['Gold', 'Silver'] },
      { id: 'v2', name: 'Length', options: ['16 inch', '18 inch'] }
    ],
    size_guide_type: 'chain',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Dainty Clover Waterproof Chain',
    slug: 'dainty-clover-waterproof-chain',
    description: 'Iconic four-leaf clover motif crafted in premium anti-tarnish titanium steel. Black onyx & mother of pearl finish reversible pendant.',
    category_id: 'cat-chains',
    category_name: 'Anti Tarnish Chains',
    price: 249,
    old_price: 499,
    stock: 0, // Sold out to demonstrate "Notify me"
    is_anti_tarnish: true,
    is_available: false,
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Motif Color', options: ['Black Onyx', 'Pearl White', 'Forest Green'] }
    ],
    size_guide_type: 'chain',
    created_at: new Date().toISOString(),
  },

  // Kadas & Bracelets
  {
    id: 'prod-4',
    name: 'Roman Numerical Luxe Kada (Anti-Tarnish)',
    slug: 'roman-numerical-luxe-kada',
    description: 'Designer inspired Roman numeral engraved sleek oval cuff kada with safety buckle clasp. Resistant to water, perfume and daily wear.',
    category_id: 'cat-kadas',
    category_name: 'Anti Tarnish Kadas',
    price: 299,
    old_price: 599,
    stock: 8,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1611591475155-42e472621434?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Finish', options: ['Yellow Gold', 'Rose Gold', 'Silver'] },
      { id: 'v2', name: 'Wrist Size', options: ['Small (2.2 / 5.5cm)', 'Medium (2.4 / 6.0cm)', 'Large (2.6 / 6.5cm)'] }
    ],
    size_guide_type: 'kada',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Evil Eye Delicate Pearl Bracelet',
    slug: 'evil-eye-delicate-pearl-bracelet',
    description: 'Handmade protective blue glass evil eye linked with genuine mini freshwater pearls and non-tarnishing gold bead extension.',
    category_id: 'cat-bracelets',
    category_name: 'Anti Tarnish Bracelets',
    price: 189,
    old_price: 349,
    stock: 3, // "Only 3 left"
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Size', options: ['Adjustable (6" + 2" extension)'] }
    ],
    size_guide_type: 'kada',
    created_at: new Date().toISOString(),
  },

  // Earrings & Korean
  {
    id: 'prod-6',
    name: 'Chunky Teardrop Gold Hoops (Waterproof)',
    slug: 'chunky-teardrop-gold-hoops',
    description: 'Celebrity viral hollow lightweight droplet hoops. Ultra-comfortable for sensitive ears, 18k thick PVD gold coated.',
    category_id: 'cat-earrings',
    category_name: 'Anti Tarnish Earrings',
    price: 179,
    old_price: 399,
    stock: 12,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Color', options: ['Gold', 'Silver'] },
      { id: 'v2', name: 'Size', options: ['Small (20mm)', 'Medium (30mm)'] }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Pastel Dream Floral Korean Huggies',
    slug: 'pastel-dream-floral-korean-huggies',
    description: 'Aesthetic translucent acrylic floral drop earrings with rhinestone center. Korean drama soft girl aesthetic look.',
    category_id: 'cat-korean',
    category_name: 'Korean Earrings',
    price: 99,
    old_price: 199,
    stock: 6,
    is_anti_tarnish: false,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Color', options: ['Blush Pink', 'Lilac Violet', 'Butter Yellow'] }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Sparkle Star Ear Cuffs (No Piercing Needed)',
    slug: 'sparkle-star-ear-cuffs',
    description: 'Slip-on ear cuff studded with micro cubic zirconia stars. Clips comfortably over your cartilage without any ear piercing.',
    category_id: 'cat-ear-cuffs',
    category_name: 'Ear Cuffs',
    price: 89,
    old_price: 179,
    stock: 15,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Ear Side', options: ['Single Right', 'Single Left', 'Pair (Both)'] }
    ],
    created_at: new Date().toISOString(),
  },

  // Rings
  {
    id: 'prod-9',
    name: 'Croissant Dome Statement Ring (Waterproof)',
    slug: 'croissant-dome-statement-ring',
    description: 'French ribbed twist dome ring. Heavy 18K gold layer over stainless steel that will not turn your finger green.',
    category_id: 'cat-rings',
    category_name: 'Rings',
    price: 159,
    old_price: 320,
    stock: 7,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Ring Size', options: ['US 6 (16.5mm)', 'US 7 (17.3mm)', 'US 8 (18.1mm)'] }
    ],
    size_guide_type: 'ring',
    created_at: new Date().toISOString(),
  },

  // Clips & Scrunchies
  {
    id: 'prod-10',
    name: 'Sunset Pearlized Pastel Hair Claw Set',
    slug: 'sunset-pearlized-pastel-hair-claw-set',
    description: 'Set of 2 sturdy matte cellulose acetate hair claws. Strong steel springs that hold thick hair gracefully all day.',
    category_id: 'cat-clips',
    category_name: 'Clips',
    price: 89,
    old_price: 180,
    stock: 20,
    is_anti_tarnish: false,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Pack Style', options: ['Blush Pink + Latte', 'Mint + Cream', 'Peach + Sky Blue'] }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-11',
    name: 'Silk Mulberry Oversized Scrunchie & Bow Pair',
    slug: 'silk-mulberry-oversized-scrunchie-bow-pair',
    description: 'Pure Mulberry satin finish scrunchie with detachable coquette bow. Zero hair breakage and frizz-free elegance.',
    category_id: 'cat-scrunchies',
    category_name: 'Scrunchies & Bows',
    price: 79,
    old_price: 150,
    stock: 14,
    is_anti_tarnish: false,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Shade', options: ['Dusty Rose', 'Champagne Pearl', 'Burgundy Wine'] }
    ],
    created_at: new Date().toISOString(),
  },

  // Men's Section
  {
    id: 'prod-12',
    name: "Men's Cuban Curb Link Heavy Chain (Silver/Black)",
    slug: 'mens-cuban-curb-link-heavy-chain',
    description: 'Solid 6mm diamond cut bevelled curb Cuban chain for men. Hypoallergenic 316L stainless steel that endures workouts, showers and daily wear.',
    category_id: 'cat-mens-chains',
    category_name: "Men's Chains",
    price: 249,
    old_price: 499,
    stock: 10,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Color', options: ['Mirror Silver', 'Matte Black', 'Royal Gold'] },
      { id: 'v2', name: 'Length', options: ['20 inch', '22 inch', '24 inch'] }
    ],
    size_guide_type: 'chain',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-13',
    name: "Men's Matte Black Titanium Signet Ring",
    slug: 'mens-matte-black-titanium-signet-ring',
    description: 'Bold rectangular brushed signet ring with smooth comfort fit interior. Scratch-resistant industrial grade titanium steel.',
    category_id: 'cat-mens-rings',
    category_name: "Men's Rings",
    price: 169,
    old_price: 349,
    stock: 8,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Ring Size', options: ['US 8 (18.1mm)', 'US 9 (18.9mm)', 'US 10 (19.8mm)', 'US 11 (20.6mm)'] }
    ],
    size_guide_type: 'ring',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-14',
    name: "Men's Minimalist Roman Dial Mesh Watch",
    slug: 'mens-minimalist-roman-dial-mesh-watch',
    description: 'Ultra-thin case with clean black dial, rose indices and breathable stainless steel mesh strap. Quartz precision movement with water splash resistance.',
    category_id: 'cat-watches',
    category_name: 'Watches',
    price: 499,
    old_price: 999,
    stock: 4,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Strap Color', options: ['All Black Mesh', 'Silver Mesh', 'Brown Genuine Leather'] }
    ],
    created_at: new Date().toISOString(),
  },

  // Combos & Hampers
  {
    id: 'prod-15',
    name: 'Aesthetic Birthday Pink Hamper Box with Fairy Lights',
    slug: 'aesthetic-birthday-pink-hamper-box',
    description: 'Curated luxury gift box including: 1x Anti-tarnish chain, 1x Pair of crystal huggies, 2x Satin silk scrunchies, 1x Floral hair claw, and warm fairy lights in a pastel pink keepsake magnetic box.',
    category_id: 'cat-combos',
    category_name: 'Combos & Hampers',
    price: 499,
    old_price: 999,
    stock: 9,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'v1', name: 'Occasion Card', options: ['Happy Birthday', 'Bestie Forever', 'Anniversary Love', 'Thank You'] }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-16',
    name: 'Bestie BFF Matching Heart Chain Duo Hamper',
    slug: 'bestie-bff-matching-heart-chain-duo-hamper',
    description: 'Set of two interlocking magnetic half-heart chains with custom handwritten wish card and cute gift envelopes.',
    category_id: 'cat-combos',
    category_name: 'Combos & Hampers',
    price: 349,
    old_price: 699,
    stock: 1, // "Only 1 left"
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Tone Pair', options: ['Gold + Silver Duo', 'Dual Gold', 'Dual Silver'] }
    ],
    size_guide_type: 'chain',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-17',
    name: 'Traditional Meenakari Lotus Jhumkas',
    slug: 'traditional-meenakari-lotus-jhumkas',
    description: 'Hand-painted pastel pink and mint Meenakari lotus top with tiny pearl drop bells. Lightweight festive statement earring.',
    category_id: 'cat-jhumkas',
    category_name: 'Jhumkas',
    price: 139,
    old_price: 280,
    stock: 12,
    is_anti_tarnish: false,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Color', options: ['Baby Pink', 'Sky Blue', 'Mint Green'] }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-18',
    name: 'Coquette Tulip Enamel Keychain & Bag Charm',
    slug: 'coquette-tulip-enamel-keychain',
    description: 'Gold-rimmed enameled pastel tulip flower charm with mini heart clasp and pearlized bead ribbon.',
    category_id: 'cat-keychains',
    category_name: 'Keychains',
    price: 69,
    old_price: 139,
    stock: 25,
    is_anti_tarnish: false,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Flower Shade', options: ['Pink Tulip', 'Yellow Daffodil', 'Red Rose'] }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-19',
    name: 'Mini Crystal Star Second Studs Trio Set',
    slug: 'mini-crystal-star-second-studs-trio-set',
    description: 'Set of 3 pairs of surgical steel mini studs: Star, Moon, and 2mm Solitaire. Completely hypoallergenic for upper lobe and helix piercings.',
    category_id: 'cat-second-studs',
    category_name: 'Second Studs',
    price: 119,
    old_price: 240,
    stock: 16,
    is_anti_tarnish: true,
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Tone', options: ['Yellow Gold', 'Silver Plated'] }
    ],
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customer_name: 'Asliya M.',
    city: 'Cuddalore, Tamil Nadu',
    rating: 5,
    review_text: 'Sis vandhurchi na expect pannadha vida idhu romba azhaga Iruku sis adhuvum yen bestie ki ulladhu sollave vena andha alavuku romba azhaga Iruku thank you so much 🖤🖤 packaging is so sweet and neat!',
    product_name: 'Aesthetic Heart Pendant Chain',
    photo_url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&auto=format&fit=crop&q=80',
    is_hidden: false,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rev-2',
    customer_name: 'Kavitha R.',
    city: 'Pondicherry (Local Pickup)',
    rating: 5,
    review_text: 'Visited the store opp Dune Cafe directly on Romand Rolland street. The anti-tarnish chains are 100% genuine! I wear my snake chain to the beach daily in Pondy humidity and no color change at all. Highly recommend!',
    product_name: 'Classic Snake Bone Sleek Chain',
    photo_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80',
    is_hidden: false,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rev-3',
    customer_name: 'Divya & Sneha',
    city: 'Chennai, Tamil Nadu',
    rating: 5,
    review_text: 'Ordered the Birthday Hamper Box for my roommate. The fairy lights, greeting note and anti-tarnish earrings made her cry happy tears! Quality is top notch and dispatch was super fast.',
    product_name: 'Aesthetic Birthday Pink Hamper Box',
    photo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80',
    is_hidden: false,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rev-4',
    customer_name: 'Karthik S.',
    city: 'Bengaluru, Karnataka',
    rating: 5,
    review_text: "Got the Men's Cuban chain and titanium signet ring. Really solid weight and looks way more expensive than ₹249. Delivery reached in 3 days with neat packing proof video.",
    product_name: "Men's Cuban Curb Link Heavy Chain",
    photo_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&auto=format&fit=crop&q=80',
    is_hidden: false,
    sort_order: 4,
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-welcome',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 299,
    max_discount: 100,
    times_used: 18,
    is_active: true,
  },
  {
    id: 'cpn-festive',
    code: 'GLIM50',
    discount_type: 'flat',
    discount_value: 50,
    min_order_value: 499,
    times_used: 42,
    is_active: true,
  },
  {
    id: 'cpn-vip',
    code: 'GLIMVIP',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_value: 799,
    max_discount: 200,
    times_used: 9,
    is_active: true,
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  id: 'primary_settings',
  announcement_bar_text: 'Free shipping above Rs.999 📦 | No COD • No Returns • No Refunds',
  free_shipping_threshold: 999,
  flat_shipping_fee: 60,
  whatsapp_number: '+918523996310',
  instagram_url: 'https://instagram.com/glim_accessories_',
  store_address: 'Romand Rolland St, opp. Dune Cafe, Pondicherry',
  google_maps_url: 'https://maps.google.com/?q=Romand+Rolland+St,+opp.+Dune+Cafe,+Pondicherry',
  buy2_get10_enabled: true,
  buy2_qty: 2,
  buy2_percent: 10,
  hero_banners: [
    {
      id: 'banner-1',
      title: 'Waterproof Anti-Tarnish Jewellery',
      subtitle: 'Handpicked daily luxury crafted to endure water, perfume & coastal humidity. Starting at just ₹149.',
      tag: 'NEW COLLECTION 2026',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop&q=85',
      link: '/products',
      button_text: 'Shop Anti-Tarnish',
    },
    {
      id: 'banner-2',
      title: 'Aesthetic Gift Hampers & Combos',
      subtitle: 'Complete with fairy lights, personalized handwritten notes & romantic packaging for someone special.',
      tag: 'BESTSELLING GIFTS',
      image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1600&auto=format&fit=crop&q=85',
      link: '/gifts',
      button_text: 'Explore Gift Hampers',
    }
  ],
  payment_gateways: [
    {
      id: 'phonepe',
      name: 'PhonePe UPI',
      upi_id: 'glimaccessories@ybl',
      qr_image: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=glimaccessories@ybl&pn=Glim%20Accessories&mc=0000&mode=02&purpose=00',
      is_enabled: true,
    },
    {
      id: 'gpay',
      name: 'Google Pay (GPay)',
      upi_id: 'glimaccessories@okhdfcbank',
      qr_image: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=glimaccessories@okhdfcbank&pn=Glim%20Accessories&mc=0000&mode=02&purpose=00',
      is_enabled: true,
    },
    {
      id: 'paytm',
      name: 'Paytm UPI',
      upi_id: '8523996310@paytm',
      qr_image: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=8523996310@paytm&pn=Glim%20Accessories&mc=0000&mode=02&purpose=00',
      is_enabled: true,
    }
  ],
  updated_at: new Date().toISOString(),
};
