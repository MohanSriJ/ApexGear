export const PRODUCTS = [
  {
    id: 'prod-001',
    title: 'Apex Pro 75 Wireless Mechanical Keyboard',
    brand: 'ApexGear',
    category: 'Keyboards & Mice',
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviewCount: 342,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    badge: 'Best Seller',
    stock: 24,
    description: 'Ultra-responsive 75% compact mechanical keyboard with hot-swappable tactile switches, per-key RGB, and triple-mode connectivity (Bluetooth 5.3, 2.4Ghz dongle, USB-C). Fully compatible with macOS and Windows.',
    highlights: [
      'Gateron Brown tactile pre-lubed switches',
      'Up to 200 hours battery life (RGB off)',
      'Dedicated macOS / Windows toggle switch',
      'Multi-device pairing (up to 3 devices)'
    ],
    specs: {
      connectivity: 'Bluetooth 5.3, 2.4GHz, USB-C',
      layout: '75% Compact (84 keys)',
      battery: '4000 mAh rechargeable',
      weight: '820g',
      os: 'macOS, Windows, iOS, Android'
    },
    tags: ['keyboard', 'mechanical', 'wireless', 'mac', 'bluetooth', 'typing', 'compact', 'rgb'],
    pairsWith: ['prod-005', 'prod-008']
  },
  {
    id: 'prod-002',
    title: 'NovaShield ANC Wireless Headphones',
    brand: 'AcoustiQ',
    category: 'Audio',
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.9,
    reviewCount: 521,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    badge: 'Editor Choice',
    stock: 18,
    description: 'Flagship hybrid active noise cancellation headphones with custom 40mm titanium drivers, ambient sound pass-through, and memory-foam acoustic ear cups engineered for long flights and deep work.',
    highlights: [
      'Hybrid Active Noise Cancellation (-42dB reduction)',
      '60-hour playtime with quick charge (10 min = 5 hrs)',
      'Multipoint Bluetooth connection',
      'Crystal-clear AI beamforming microphones for calls'
    ],
    specs: {
      battery: '60 hours (ANC on)',
      drivers: '40mm Titanium Dynamic',
      weight: '250g',
      charging: 'USB-C Fast Charging',
      noiseCancelling: 'Hybrid Active (-42dB)'
    },
    tags: ['headphones', 'anc', 'noise-cancelling', 'audio', 'travel', 'wireless', 'music', 'work', 'airplane'],
    pairsWith: ['prod-006', 'prod-009']
  },
  {
    id: 'prod-003',
    title: 'ErgoGlide Vertical Ergonomic Mouse',
    brand: 'ApexGear',
    category: 'Keyboards & Mice',
    price: 49.99,
    originalPrice: 64.99,
    rating: 4.7,
    reviewCount: 188,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    badge: 'Ergonomic Choice',
    stock: 35,
    description: 'Scientifically validated vertical angle (57 degrees) promotes a natural handshake wrist posture to reduce muscle strain and prevent carpal tunnel during long desk sessions.',
    highlights: [
      '57° ergonomic handshake posture',
      'Ultra-silent click switches',
      'Adjustable DPI sensor (800 / 1600 / 2400 / 4000)',
      'Rechargeable via USB-C (lasts 3 months per charge)'
    ],
    specs: {
      sensor: 'Optical 4000 DPI adjustable',
      angle: '57 degrees',
      battery: 'Rechargeable Li-ion (90 days)',
      connectivity: 'Dual Bluetooth + 2.4Ghz'
    },
    tags: ['mouse', 'ergonomic', 'wrist pain', 'wireless', 'desk', 'office', 'silent'],
    pairsWith: ['prod-001', 'prod-005']
  },
  {
    id: 'prod-004',
    title: 'Horizon Flow Pro Smart Fitness Watch',
    brand: 'Veloce',
    category: 'Wearables & Fitness',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.6,
    reviewCount: 279,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    badge: 'Popular',
    stock: 12,
    description: 'Sleek aerospace aluminum smartwatch with 1.43-inch Always-On AMOLED screen, dual-band GPS, continuous SpO2/heart rate tracking, and 100+ automated workout modes.',
    highlights: [
      '1.43" AMOLED 466x466 vibrant display',
      'Dual-band GNSS GPS for accurate running routes',
      '14-day battery life on a single charge',
      '5 ATM water resistance (safe for swimming)'
    ],
    specs: {
      display: '1.43" AMOLED (1000 nits)',
      waterproof: '5 ATM (50m depth)',
      battery: 'Up to 14 days',
      sensors: 'Heart rate, SpO2, Accelerometer, Sleep stage'
    },
    tags: ['smartwatch', 'fitness', 'running', 'health', 'heart rate', 'gps', 'waterproof', 'wearable', 'gift'],
    pairsWith: ['prod-007', 'prod-009']
  },
  {
    id: 'prod-005',
    title: 'CloudRest Ergonomic Memory Foam Desk Pad & Wrist Support',
    brand: 'ApexGear',
    category: 'Desk Setup',
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.8,
    reviewCount: 195,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    badge: 'Staff Pick',
    stock: 50,
    description: 'Premium slow-rebound memory foam wrist rest with cooling breathable mesh fabric cover and non-slip rubber base. Designed to align wrists effortlessly with mechanical keyboards.',
    highlights: [
      'High-density slow-rebound cooling memory foam',
      'Anti-slip textured natural rubber base',
      'Reinforced stitched edges for zero fraying',
      'Stain-resistant and easily wipeable'
    ],
    specs: {
      dimensions: '44 x 8 x 2.2 cm',
      material: 'Cooling gel memory foam + Lycra fabric',
      compatibility: 'Full-size and 75%/80% keyboards'
    },
    tags: ['wrist rest', 'desk pad', 'ergonomic', 'accessories', 'comfort', 'typing', 'desk setup'],
    pairsWith: ['prod-001', 'prod-003']
  },
  {
    id: 'prod-006',
    title: 'VoltPulse 100W GaN Travel Fast Charger',
    brand: 'VoltGear',
    category: 'Travel & Power',
    price: 45.99,
    originalPrice: 59.99,
    rating: 4.9,
    reviewCount: 410,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    badge: 'Travel Essential',
    stock: 40,
    description: 'Pocket-sized 100W Gallium Nitride (GaN III) fast charger with 3 USB-C and 1 USB-A ports. Powers a 16-inch MacBook Pro from 0 to 50% in just 30 minutes while simultaneously charging phone and earbuds.',
    highlights: [
      'GaN III technology runs 40% cooler than standard bricks',
      'Simultaneous 4-device smart power allocation',
      'Foldable US plug with international EU/UK adapters included',
      'Comprehensive surge and overheat protection'
    ],
    specs: {
      totalOutput: '100W Max',
      ports: '3x USB-C PD 3.0, 1x USB-A QC 4.0',
      dimensions: '65 x 65 x 32 mm',
      weight: '190g'
    },
    tags: ['charger', 'gan', 'fast charge', 'travel', 'usb-c', 'laptop', 'iphone', 'macbook'],
    pairsWith: ['prod-002', 'prod-009']
  },
  {
    id: 'prod-007',
    title: 'AuraLite RGB ScreenBar Monitor Light',
    brand: 'ApexGear',
    category: 'Desk Setup',
    price: 54.99,
    originalPrice: 69.99,
    rating: 4.8,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    badge: 'Eye Care',
    stock: 22,
    description: 'Asymmetric optical screenbar light that clamps securely onto any monitor. Casts warm or cool glare-free lighting directly onto your desk without reflecting off the screen, plus back-firing ambient bias RGB lights.',
    highlights: [
      'Zero screen glare with asymmetric optical design',
      'Auto-dimming ambient light sensor built-in',
      'Stepless color temperature (2700K - 6500K)',
      'Wireless magnetic desktop rotary control dial'
    ],
    specs: {
      power: 'USB-C 5V/2A',
      colorTemp: '2700K - 6500K',
      controls: 'Wireless 2.4G dial controller',
      fit: 'Flat or curved monitors (0.5 to 4.5 cm thick)'
    },
    tags: ['monitor light', 'desk setup', 'lamp', 'rgb', 'screenbar', 'eye comfort', 'work from home'],
    pairsWith: ['prod-001', 'prod-005']
  },
  {
    id: 'prod-008',
    title: 'SonicBuds Pro True Wireless Earbuds',
    brand: 'AcoustiQ',
    category: 'Audio',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviewCount: 388,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    badge: 'Waterproof IPX7',
    stock: 28,
    description: 'Compact IPX7 waterproof sport earbuds with spatial audio, transparency mode, and ergonomic wingtips that stay locked in during intense workouts or heavy rain.',
    highlights: [
      'IPX7 sweat and waterproof rating',
      'Active Noise Cancellation + Transparency pass-through',
      '8 hours per charge / 32 hours total with Qi wireless charging case',
      'Custom EQ mobile app presets'
    ],
    specs: {
      battery: '8h + 24h case',
      waterResistance: 'IPX7',
      bluetooth: '5.4 with aptX Adaptive',
      weight: '4.8g per earbud'
    },
    tags: ['earbuds', 'audio', 'sport', 'waterproof', 'wireless', 'gym', 'running'],
    pairsWith: ['prod-004', 'prod-006']
  },
  {
    id: 'prod-009',
    title: 'OmniTravel 25,000mAh Laptop Power Bank',
    brand: 'VoltGear',
    category: 'Travel & Power',
    price: 74.99,
    originalPrice: 99.99,
    rating: 4.9,
    reviewCount: 260,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80',
    badge: 'Airline Approved',
    stock: 15,
    description: 'TSA airline-safe 99.9Wh high-capacity battery pack with 65W bidirectional USB-C PD output. Charges a laptop, iPad, and phone multiple times on remote trips.',
    highlights: [
      'Airline flight-approved (under 100Wh TSA limit)',
      '65W high-speed output charges laptops at full speed',
      'Smart OLED real-time power display (wattage, %, time remaining)',
      'Recharges fully in under 1.5 hours'
    ],
    specs: {
      capacity: '25,000 mAh (92.5Wh)',
      maxOutput: '65W USB-C PD',
      display: 'OLED Digital Screen',
      weight: '440g'
    },
    tags: ['power bank', 'battery', 'travel', 'laptop', 'usb-c', 'portable charger', 'tsa'],
    pairsWith: ['prod-006', 'prod-002']
  }
];

export const STORE_POLICIES = {
  shipping: {
    freeThreshold: 50,
    standardTime: '2-4 business days (Free over $50, otherwise $4.99)',
    expressTime: '1-2 business days ($12.99)',
    international: 'Ships to over 40 countries within 6-10 business days.'
  },
  returns: {
    window: '30-day hassle-free return guarantee',
    condition: 'Items must be in original condition with packaging.',
    returnShipping: 'Free prepaid return label included on all orders.'
  },
  warranty: {
    duration: '2-year full manufacturer replacement warranty on all electronics.',
    support: '24/7 dedicated customer support line & chat.'
  },
  discounts: {
    activePromo: 'APEX10 (10% off entire order for first-time shoppers)',
    studentDiscount: '15% off with verified Student Beans account'
  }
};
