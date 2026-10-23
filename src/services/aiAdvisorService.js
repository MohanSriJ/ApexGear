import { PRODUCTS, STORE_POLICIES } from '../data/products.js';
import { 
  getUserMemory, 
  updateMemoryFromChat, 
  formatMemoryForSystemPrompt,
  saveUserMemory
} from './userMemoryService.js';

// Matcher mappings for accurate catalog product extraction
const PRODUCT_MAP = [
  { id: 'prod-001', matchers: ['apex pro 75', 'apex pro', 'prod-001', '75 wireless mechanical keyboard'] },
  { id: 'prod-002', matchers: ['novashield', 'novashield anc', 'prod-002', 'anc wireless headphones'] },
  { id: 'prod-003', matchers: ['ergoglide', 'ergonomic vertical mouse', 'vertical mouse', 'prod-003'] },
  { id: 'prod-004', matchers: ['horizon flow', 'horizon flow pro', 'prod-004', 'smart fitness watch'] },
  { id: 'prod-005', matchers: ['cloudrest', 'cloudrest wrist rest', 'memory foam desk pad', 'prod-005'] },
  { id: 'prod-006', matchers: ['voltpulse', 'voltpulse 100w', '100w gan travel', 'prod-006'] },
  { id: 'prod-007', matchers: ['auralite', 'auralite rgb', 'auralite screenbar', 'screenbar monitor light', 'prod-007'] },
  { id: 'prod-008', matchers: ['sonicbuds', 'sonicbuds pro', 'true wireless earbuds', 'prod-008'] },
  { id: 'prod-009', matchers: ['omnitravel', 'omnitravel 25', 'omnitravel 25k', 'laptop power bank', 'prod-009'] }
];

// Intelligent Typo & Misspelling Normalizer for Common-Man Queries
export function normalizeUserInput(rawText) {
  if (!rawText) return '';
  let str = rawText.toLowerCase();

  const TYPO_MAP = [
    { regex: /\b(recoment|recommand|recomnd|recomended|reccommend|recommed|recomends|recomending|recommnd)\b/g, rep: 'recommend' },
    { regex: /\b(sugest|sugges|sugjest|sugestions|sugestion)\b/g, rep: 'suggest' },
    { regex: /\b(laptap|laptp|lapotp|labtop|notbook)\b/g, rep: 'laptop' },
    { regex: /\b(kyboard|keybord|keybard|kayboard|keybaord|kebord)\b/g, rep: 'keyboard' },
    { regex: /\b(hedphone|headfone|hedphones|headphon|headphine|headfones)\b/g, rep: 'headphones' },
    { regex: /\b(earfone|earphon|erbuds|earbds|ear buds|ear fone)\b/g, rep: 'earbuds' },
    { regex: /\b(mose|muose|mouce)\b/g, rep: 'mouse' },
    { regex: /\b(chargr|chager|fastcharg|charching|chargers)\b/g, rep: 'charger' },
    { regex: /\b(powrbank|powerbnk|pwerbank|pwr bank)\b/g, rep: 'power bank' },
    { regex: /\b(batry|batery|baterry)\b/g, rep: 'battery' },
    { regex: /\b(erogonomic|ergonimic|ergonmic)\b/g, rep: 'ergonomic' },
    { regex: /\b(moniter|scren|screne|screnbar)\b/g, rep: 'monitor' },
    { regex: /\b(discont|dicount|discnt|dicsount)\b/g, rep: 'discount' },
    { regex: /\b(cupon|copon|copun|promocode)\b/g, rep: 'coupon' },
    { regex: /\b(studnt|studet|studen|colege|universty)\b/g, rep: 'student' },
    { regex: /\b(alphabit|alphabits|alphbet|alhabet)\b/g, rep: 'alphabet' },
    { regex: /\b(leter|leters)\b/g, rep: 'letters' },
    { regex: /\b(motercycle|motocycle|motobike|motercyle)\b/g, rep: 'motorcycle' },
    { regex: /\b(shippin|shiping|dilivary|delivry|delvery)\b/g, rep: 'shipping' },
    { regex: /\b(retrn|retun)\b/g, rep: 'return' },
    { regex: /\b(refnd|refun)\b/g, rep: 'refund' },
    { regex: /\b(waranty|warenty|warrenty|guarntee|garantee)\b/g, rep: 'warranty' }
  ];

  for (const { regex, rep } of TYPO_MAP) {
    str = str.replace(regex, rep);
  }

  return str;
}

// Helper to extract catalog products ONLY when explicitly recommended and wanted
export function extractProducts(fullText, userQuery = '') {
  if (!fullText) return [];

  const textLower = fullText.toLowerCase();
  const qLower = normalizeUserInput(userQuery || '').trim();

  // Strict guard: Never attach product cards to greetings, farewells, off-topic trivia, or general conversational queries
  const isNonProductIntent = 
    /^(hi|hello|hey|yo|greetings|good\s*(morning|afternoon|evening)|sup|howdy|thank|ok|cool|great|bye|yes|no)\b/i.test(qLower) ||
    qLower === 'hi' || qLower === 'hello' || qLower === 'hey' ||
    qLower.includes('discount') || qLower.includes('coupon') || qLower.includes('student') ||
    qLower.includes('generate image') || qLower.includes('dalle') ||
    qLower.includes('alphabet') || qLower.includes('letter') ||
    qLower.includes('joke') || qLower.includes('weather') || qLower.includes('math') ||
    qLower.includes('who is') || qLower.includes('what is the capital') || qLower.includes('date today') ||
    qLower === 'what are those' || qLower === 'what are they' || qLower === 'why' || qLower === 'tell me more';

  const hasExplicitProductIntent =
    qLower.includes('keyboard') || qLower.includes('headphone') || qLower.includes('earbud') ||
    qLower.includes('mouse') || qLower.includes('charger') || qLower.includes('light') ||
    qLower.includes('watch') || qLower.includes('wrist') || qLower.includes('gear') ||
    qLower.includes('laptop') || qLower.includes('macbook') || qLower.includes('computer') ||
    qLower.includes('catalog') || qLower.includes('buy') || qLower.includes('recommend') ||
    qLower.includes('suggest') || qLower.includes('price') || qLower.includes('under $') ||
    qLower.includes('specs');

  if (isNonProductIntent && !hasExplicitProductIntent) {
    return [];
  }

  // Identify products explicitly referenced in the response text
  const matchedIds = new Set();
  for (const item of PRODUCT_MAP) {
    for (const phrase of item.matchers) {
      if (textLower.includes(phrase)) {
        // NEGATIVE MENTION CHECK:
        // If the product was only mentioned as an unavailable contrast (e.g. "we do not stock 10k mAh, our OmniTravel 25k is..."):
        if (item.id === 'prod-009' && (qLower.includes('10k') || qLower.includes('10,000') || qLower.includes('5k') || qLower.includes('smaller'))) {
          continue; // User wanted 10k, do not attach 25k card!
        }
        if (textLower.includes(`do not stock`) || textLower.includes(`don't stock`) || textLower.includes(`do not carry`) || textLower.includes(`recommend looking elsewhere`)) {
          if (item.id === 'prod-009' && qLower.includes('10k')) continue;
        }

        matchedIds.add(item.id);
        break;
      }
    }
  }

  const matched = PRODUCTS.filter(p => matchedIds.has(p.id));
  return matched.slice(0, 3);
}

// Dynamic Contextual Chip Suggestions Generator
export function generateContextualChips(userQuery = '', replyText = '') {
  const q = normalizeUserInput(userQuery || '');
  const r = (replyText || '').toLowerCase();
  const memory = getUserMemory();

  // 1. Discount / Student context
  if (q.includes('student') || q.includes('discount') || q.includes('coupon') || q.includes('promo') || q.includes('code') || r.includes('student15') || r.includes('apex10')) {
    return [
      "How do I apply code STUDENT15?",
      "Show tech gear under $100 for students",
      "Explain your 30-day return policy"
    ];
  }

  // 1.2 Laptop & Mobile Workstation context
  if (q.includes('laptop') || q.includes('macbook') || r.includes('laptop') || r.includes('macbook')) {
    return [
      "VoltPulse 100W GaN Travel Charger",
      "ErgoGlide vertical mouse for laptop",
      "OmniTravel 25k laptop power bank"
    ];
  }

  // 1.5 Alphabet & Language Trivia Context
  if (q.includes('alphabet') || q.includes('letter') || r.includes('26 letters')) {
    return [
      "Show wireless mechanical keyboards",
      "Ergonomic desk accessories",
      "Active discount codes"
    ];
  }

  // 2. Image generation context
  if (q.includes('image') || q.includes('picture') || q.includes('generate') || r.includes('![') || r.includes('pollinations')) {
    return [
      "Generate an ergonomic desk setup visual",
      "Show minimalist workspace concept",
      "Active discount codes for students"
    ];
  }

  // 3. Power bank / Battery / Chargers
  if (q.includes('powerbank') || q.includes('power bank') || q.includes('battery') || q.includes('charger') || q.includes('10k') || q.includes('25k') || q.includes('mah')) {
    return [
      "Tell me about TSA airline battery rules",
      "VoltPulse 100W GaN Travel Charger",
      "Do you have any discount codes?"
    ];
  }

  // 4. Keyboards & Switches
  if (q.includes('keyboard') || q.includes('switch') || q.includes('typing') || q.includes('gateron')) {
    return [
      "Difference between Red, Brown, Blue switches",
      "Is Apex Pro 75 good for Mac?",
      "Add CloudRest memory foam wrist rest"
    ];
  }

  // 5. Headphones & Audio
  if (q.includes('headphone') || q.includes('earbud') || q.includes('anc') || q.includes('sound') || q.includes('audio') || q.includes('flight')) {
    return [
      "How does NovaShield ANC block airplane noise?",
      "SonicBuds Pro waterproof earbuds",
      "How fast is shipping?"
    ];
  }

  // 6. Ergonomics & Desk Setup
  if (q.includes('mouse') || q.includes('wrist') || q.includes('ergonomic') || q.includes('desk') || q.includes('light')) {
    return [
      "How does 57° vertical angle help wrist pain?",
      "AuraLite RGB ScreenBar monitor light",
      "Show accessories under $50"
    ];
  }

  // 7. General Greetings / Initial State
  return [
    memory.isStudent ? "How do I apply code STUDENT15?" : "Active discount codes",
    "Wireless mechanical keyboard under $100",
    "Best headphones for long flights"
  ];
}

// Built-in Dynamic Consultative Advisor (Local & Context-Aware Multi-turn Engine)
export function runLocalShoppingAgent(userMessage, conversationHistory = [], cartItems = []) {
  const text = normalizeUserInput(userMessage || '').trim();
  const fullHistoryText = normalizeUserInput(conversationHistory.map(m => m.content || '').join(' '));
  const lastAssistantMsg = [...conversationHistory].reverse().find(m => m.role === 'assistant')?.content?.toLowerCase() || '';
  const memory = getUserMemory();

  // 1. Image Generation Requests (Handled with Real Visual Render via Pollinations)
  if (text.includes('generate') && (text.includes('image') || text.includes('picture') || text.includes('photo') || text.includes('visual'))) {
    const promptStr = text.replace(/generate|image|picture|photo|visual|can you|please|of a|a/gi, '').trim() || 'minimalist smartphone back with single camera';
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptStr)}?width=600&height=400&nologo=true`;

    return {
      reply: `Here is the visual concept for **${promptStr}**:\n\n![${promptStr}](${imgUrl})\n\n**Concept Highlights:**\n- Designed with a clean, functional layout.\n- Minimalist materials with soft studio lighting.\n\n${memory.isStudent ? "Remember: as a student, you can use code **STUDENT15** for 15% off our workspace gear!" : "Use code **APEX10** for 10% off our store accessories!"}`,
      recommendedProducts: []
    };
  }

  // 1.5 Alphabet & General Knowledge Questions (Accurate, direct, zero product spam)
  if (text.includes('alphab') || (text.includes('how many') && text.includes('letter'))) {
    return {
      reply: `There are **26 letters** in the English alphabet (5 vowels: A, E, I, O, U, and 21 consonants).`,
      recommendedProducts: []
    };
  }

  // 1.6 Contextual Follow-ups: "what are those" / "what are they"
  if (text === 'what are those' || text === 'what are they' || text.includes('which letters') || text.includes('list the letters')) {
    if (fullHistoryText.includes('alphabet') || fullHistoryText.includes('26 letter')) {
      return {
        reply: `The 26 letters of the English alphabet are:\n\n**A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z**\n\n- **Vowels (5):** A, E, I, O, U\n- **Consonants (21):** B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z`,
        recommendedProducts: []
      };
    }
    if (fullHistoryText.includes('switch') || fullHistoryText.includes('red') || fullHistoryText.includes('brown')) {
      return {
        reply: `Those refer to mechanical keyboard switch types:\n\n- **Linear (Red):** Smooth keypress without a tactile bump.\n- **Tactile (Brown):** Noticeable gentle bump at the actuation point.\n- **Clicky (Blue):** Sharp bump with an audible click sound.`,
        recommendedProducts: []
      };
    }
  }

  // 1.7 Laptop & Mobile Workstation Gear (Handles "recommend gear for my laptop", "recoment gear for my laptop", etc.)
  if (text.includes('laptop') || text.includes('macbook') || text.includes('notebook')) {
    const charger = PRODUCTS.find(p => p.id === 'prod-006'); // VoltPulse 100W
    const pb = PRODUCTS.find(p => p.id === 'prod-009'); // OmniTravel 25k
    const mouse = PRODUCTS.find(p => p.id === 'prod-003'); // ErgoGlide
    const wrist = PRODUCTS.find(p => p.id === 'prod-005'); // CloudRest
    const hp = PRODUCTS.find(p => p.id === 'prod-002'); // NovaShield ANC

    return {
      reply: `Here are our top high-performance workspace essentials for laptop users:\n\n1. **For Power & Travel:** The **[VoltPulse 100W]** GaN travel fast charger powers your laptop and phone simultaneously, while the **[OmniTravel 25k]** laptop power bank gives you 65W fast charging on the go (TSA airline approved).\n2. **For Ergonomic Comfort:** Avoid trackpad wrist strain with the **[ErgoGlide]** vertical mouse and **[CloudRest]** memory foam wrist support.\n3. **For Deep Work:** The **[NovaShield ANC]** wireless headphones isolate background distractions with -42dB noise cancellation.\n\nAre you looking more for mobile travel charging, or a comfortable desk setup for your laptop?`,
      recommendedProducts: [charger, pb, mouse].filter(Boolean)
    };
  }

  // 2. Natural Human Greetings (Instant & Zero product spam)
  if (/^(hi|hello|hey|yo|greetings|good\s*(morning|afternoon|evening)|sup|howdy)\b/i.test(text) || text === 'hi' || text === 'hello') {
    const studentNote = memory.isStudent ? " (15% student discount **STUDENT15** ready)" : " (10% off with **APEX10**)";
    return {
      reply: `Hello! 👋 Welcome back to ApexGear. I'm your AI Personal Shopper & Tech Advisor.\n\nI can help you with:\n- **Gear Recommendations** (mechanical keyboards, noise-cancelling audio, vertical mice, GaN chargers)\n- **Tech Advice & Comparisons** (switches, monitors, phones, laptops, setups)\n- **Active Discounts**${studentNote}\n- **Store Policies** (free shipping over $50, 30-day free returns)\n\nWhat kind of gear or question can I help you with today?`,
      recommendedProducts: []
    };
  }

  // 3. Gratitude & Closing
  if (text.includes('thank') || text === 'ok' || text === 'cool' || text === 'great' || text === 'bye') {
    return {
      reply: `You're very welcome! 😊 Feel free to ask anytime if you need help with specs, compatibility, or recommendations. Happy shopping!`,
      recommendedProducts: []
    };
  }

  // 4. Name & Identity
  if (text.includes('your name') || text.includes('who are you') || text === 'whats your name' || text === 'what is your name') {
    return {
      reply: `I am **ApexAI**, your consultative AI Shopping & Tech Advisor here at ApexGear! 🚀\n\nI specialize in helping you discover the ideal workspace gear, mechanical keyboards, ergonomic accessories, audio equipment, and travel chargers. How can I help you elevate your setup today?`,
      recommendedProducts: []
    };
  }

  // 5. Current Date & Time Inquiry (Real-Time Grounding: Friday, October 23, 2026)
  if (text.includes('date today') || text.includes('what is the date') || text.includes('what date is') || text.includes('today date') || text.includes('current year')) {
    return {
      reply: `Today is **Friday, October 23, 2026**! 📅\n\nAll my tech recommendations, mobile comparisons (like Pixel 8 vs Pixel 11 and iPhone 17), and catalog pricing are fully grounded in current late-2026 hardware.\n\n${memory.isStudent ? "As a verified student, you can apply code **STUDENT15** for 15% off your entire order!" : "Feel free to use code **APEX10** for 10% off your purchase!"}`,
      recommendedProducts: []
    };
  }

  // 6. Student Status & Student Discount Follow-ups (MULTI-TURN & MEMORY AWARE)
  const isStudentMention = text.includes('student') || text.includes('college') || text.includes('university') || text.includes('school') || text.includes('campus');
  const wasDiscountDiscussed = lastAssistantMsg.includes('student') || lastAssistantMsg.includes('discount') || fullHistoryText.includes('student') || memory.isStudent;

  if (isStudentMention || (wasDiscountDiscussed && (text.includes('extra 5') || text.includes('15%') || text.includes('how to get') || text.includes('apply')))) {
    return {
      reply: `🎓 **Awesome! We love supporting students and educators!**\n\nAs a student, you qualify for our top **15% off discount** (an extra 5% off our standard 10% promo):\n\n- **Promo Code:** \`STUDENT15\`\n- **Discount:** **15% off** your entire order\n- **How to apply:** Simply enter code **STUDENT15** into the discount code box in your Cart Drawer and click Apply!\n- **Verification:** You can also link your verified Student Beans account at checkout.\n\nWhat gear are you shopping for to power your studies or desk setup?`,
      recommendedProducts: []
    };
  }

  // 7. Higher Discounts / Coupon Questions
  if (text.includes('discount') || text.includes('coupon') || text.includes('promo') || text.includes('code') || text.includes('deal') || text.includes('higher discount') || text.includes('more off')) {
    return {
      reply: `🎉 Here are all active discount codes for ApexGear today:\n\n1. **Standard Welcome Code:** **APEX10** gives **10% off** your entire order for all shoppers.\n2. **Student & Educator Discount:** **STUDENT15** gives **15% off** for verified students and teachers via Student Beans!\n3. **Free Express Shipping:** Orders over **$50** automatically qualify for **FREE 2-4 day shipping**.\n\nIf you're a student, enter code **STUDENT15** in your cart to claim the full 15% off! What gear are you shopping for?`,
      recommendedProducts: []
    };
  }

  // 8. Specific Power Bank Capacity Query (e.g. 10,000mAh vs 25,000mAh)
  if ((text.includes('power') || text.includes('battery')) && (text.includes('10k') || text.includes('10,000') || text.includes('smaller'))) {
    const charger = PRODUCTS.find(p => p.id === 'prod-006');
    return {
      reply: `While our **[OmniTravel 25k]** is our high-capacity 25,000mAh laptop flagship, we currently do not manufacture an in-house 10,000mAh pocket battery pack.\n\nIf you need a reliable 10,000mAh model, the **Anker 533 Power Bank (30W)** or **Baseus Blade 10k** are great compact third-party choices.\n\nHowever, if your goal is compact travel charging, our **[VoltPulse 100W] GaN Wall Charger** is pocket-sized and powers both laptops and phones simultaneously with folding worldwide travel prongs!`,
      recommendedProducts: [charger].filter(Boolean)
    };
  }

  // 9. Store Policies & FAQ
  if (text.includes('return') || text.includes('refund') || text.includes('exchange')) {
    return {
      reply: `We offer a **30-day hassle-free return guarantee**! ✨\n\n- Every order includes a prepaid return label in the box.\n- Items must be in original condition with packaging.\n- Full refund credited back to your original payment method within 3-5 business days.`,
      recommendedProducts: []
    };
  }

  if (text.includes('shipping') || text.includes('delivery') || text.includes('how fast')) {
    return {
      reply: `Here are our shipping details:\n\n- **Standard Shipping:** FREE on all orders over $50 (2-4 business days), otherwise $4.99.\n- **Express Shipping:** $12.99 for 1-2 business day delivery.\n- **International:** Ships worldwide to 40+ countries in 6-10 business days.\n\nAll orders ship within 24 hours with live tracking provided.`,
      recommendedProducts: []
    };
  }

  if (text.includes('warranty') || text.includes('guarantee')) {
    return {
      reply: `Every ApexGear product is covered by our **2-Year Full Manufacturer Replacement Warranty**. This includes hardware malfunctions, switch defects, and battery health issues with 24/7 dedicated support.`,
      recommendedProducts: []
    };
  }

  // 10. Keyboard Switches & Mechanical Keyboards
  if (text.includes('switch') || (text.includes('red') && text.includes('blue')) || text.includes('tactile') || text.includes('linear')) {
    const kb = PRODUCTS.find(p => p.id === 'prod-001');
    const wrist = PRODUCTS.find(p => p.id === 'prod-005');
    return {
      reply: `Here is the difference between primary mechanical switch types:\n\n- **Linear (Red):** Smooth, quiet keypress with no tactile bump. Ideal for fast gaming and shared offices.\n- **Tactile (Brown):** Noticeable gentle bump at the actuation point. Perfect for programming and typing without excessive noise.\n- **Clicky (Blue):** Sharp tactile bump paired with an audible "click". Very satisfying, but loud.\n\nOur **[Apex Pro 75]** features pre-lubed Gateron Brown tactile switches and a hot-swappable PCB so you can swap switches anytime!`,
      recommendedProducts: [kb, wrist].filter(Boolean)
    };
  }

  if (text.includes('keyboard') || text.includes('typing') || text.includes('coding keyboard')) {
    const kb = PRODUCTS.find(p => p.id === 'prod-001');
    const wrist = PRODUCTS.find(p => p.id === 'prod-005');
    return {
      reply: `For programming and daily typing, I recommend the **[Apex Pro 75] Wireless Mechanical Keyboard**:\n\n- **75% Compact Form Factor:** Saves desk space while keeping dedicated arrow and function keys.\n- **Gateron Brown Tactile Switches:** Satisfying actuation bump that reduces typing fatigue.\n- **Triple-Mode Connectivity:** Instant switching between Mac and Windows over Bluetooth 5.3, 2.4GHz USB dongle, or USB-C.\n\nPair it with our **[CloudRest] Memory Foam Wrist Rest** for all-day comfort!`,
      recommendedProducts: [kb, wrist].filter(Boolean)
    };
  }

  // 11. Audio, Headphones & Earbuds
  if (text.includes('headphone') || text.includes('anc') || text.includes('noise cancel') || text.includes('flight')) {
    const hp = PRODUCTS.find(p => p.id === 'prod-002');
    return {
      reply: `For flights and deep work, the **[NovaShield ANC] Wireless Headphones** are our top recommendation:\n\n- **Hybrid Active Noise Cancellation:** -42dB ambient sound reduction to eliminate engine drone.\n- **60-Hour Battery Playtime:** Up to 5 hours on a 10-minute quick charge.\n- **Memory Foam Comfort:** Designed for comfortable long-wear with glasses.`,
      recommendedProducts: [hp].filter(Boolean)
    };
  }

  // 12. Eye Strain & Monitor Reading Lights (Seniors & Desk Workers)
  if (text.includes('eye') || text.includes('screenbar') || text.includes('monitor light') || text.includes('glare') || text.includes('lamp')) {
    const lamp = PRODUCTS.find(p => p.id === 'prod-007');
    return {
      reply: `For eye strain when reading or working on a computer screen, our **[AuraLite ScreenBar] RGB Monitor Light** helps dramatically:\n\n- **Zero Screen Glare:** Uses asymmetric optics to shine light down directly onto your desk without bouncing reflections off the monitor into your eyes.\n- **Adjustable Warmth (2700K - 6500K):** Switch to gentle warm amber light in the evening to reduce blue-light fatigue.\n- **Space-Saving:** Clamps securely atop your monitor with no desk footprint!`,
      recommendedProducts: [lamp].filter(Boolean)
    };
  }

  // 13. Wrist Pain, Carpal Tunnel & Ergonomic Mouse
  if (text.includes('wrist') || text.includes('carpal') || text.includes('handshake') || text.includes('vertical mouse') || text.includes('hand pain')) {
    const mouse = PRODUCTS.find(p => p.id === 'prod-003');
    const wrist = PRODUCTS.find(p => p.id === 'prod-005');
    return {
      reply: `For wrist fatigue and carpal tunnel relief, we recommend the **[ErgoGlide] Vertical Ergonomic Mouse**:\n\n- **Natural 57° Handshake Posture:** Holds your forearm in a relaxed handshake position, taking direct pressure off the median nerve.\n- **Ultra-Quiet Clicks:** Silent buttons that are easy to press without finger tension.\n\nPair it with our **[CloudRest] Memory Foam Wrist Support** to keep your wrist properly cushioned and level with your desk!`,
      recommendedProducts: [mouse, wrist].filter(Boolean)
    };
  }

  // 14. What does Mechanical Keyboard mean? Is it loud like a typewriter? (Senior / Layman Question)
  if (text.includes('typewriter') || (text.includes('what is') && text.includes('mechanical keyboard')) || (text.includes('is it loud') && text.includes('keyboard'))) {
    const kb = PRODUCTS.find(p => p.id === 'prod-001');
    return {
      reply: `Unlike vintage typewriters, modern mechanical keyboards like our **[Apex Pro 75]** are designed to be smooth, gentle, and quiet:\n\n- **Individual Cushion Springs:** Every key has a high-quality physical switch underneath instead of a stiff flat sheet, requiring less finger pressure to register words.\n- **Quiet Tactile Brown Switches:** Our switches give a gentle, soft bump when pressed without loud clacking sounds, making them ideal for home or office use.\n- **Cushioned Typing:** It's much easier on joints and stiff fingers for long daily typing sessions!`,
      recommendedProducts: [kb].filter(Boolean)
    };
  }

  // 15. What is GaN? Why is it better? (Beginner / Common Man Question)
  if (text.includes('what is gan') || text.includes('explain gan') || (text.includes('gan') && text.includes('better'))) {
    const charger = PRODUCTS.find(p => p.id === 'prod-006');
    return {
      reply: `**GaN stands for Gallium Nitride**—a modern material that replaces traditional silicon in power adapters:\n\n- **Stays Cooler:** GaN conducts electricity with 40% less wasted heat, so the charger stays cool to the touch.\n- **Much Smaller Size:** Our **[VoltPulse 100W]** packs 100 Watts (enough to charge a 16" laptop plus 3 phones simultaneously) into a pocket-sized plug.\n- **Replaces Multiple Bricks:** One charger handles your laptop, phone, tablet, and watch with smart power distribution!`,
      recommendedProducts: [charger].filter(Boolean)
    };
  }

  // 16. TSA & Flight Carry-on Battery Rules (Travelers & Commuters)
  if (text.includes('tsa') || text.includes('airplane') || text.includes('airline') || text.includes('carry on') || text.includes('flight rule')) {
    const pb = PRODUCTS.find(p => p.id === 'prod-009');
    return {
      reply: `Here are the official TSA and airline battery guidelines:\n\n- **Under 100Wh Limit:** Airlines allow power banks under 100 Watt-hours without special approval. Our **[OmniTravel 25k]** is rated at **92.5Wh**, making it 100% TSA and flight-approved!\n- **Carry-On Only:** FAA regulations require all lithium power banks to be packed in your carry-on bag (never in checked luggage).\n- **High Capacity:** It packs 25,000mAh with 65W USB-C output to recharge laptops and phones at 35,000 feet.`,
      recommendedProducts: [pb].filter(Boolean)
    };
  }

  // 17. Zoom & Conference Call Microphone Clarity (Remote Workers)
  if (text.includes('zoom') || text.includes('microphone') || text.includes('call') || text.includes('teams') || text.includes('meeting')) {
    const hp = PRODUCTS.find(p => p.id === 'prod-002');
    return {
      reply: `For crystal-clear Zoom, Teams, and phone meetings, our **[NovaShield ANC] Wireless Headphones** excel:\n\n- **AI Beamforming Microphones:** Isolates your voice while filtering out background room noise and typing sounds.\n- **Active Noise Cancellation (-42dB):** Keeps you focused by silencing barking dogs, family noise, or office chatter.\n- **Multipoint Bluetooth:** Automatically switches between your work laptop meeting and your phone when a call rings!`,
      recommendedProducts: [hp].filter(Boolean)
    };
  }

  // 18. Fitness, Gym & Running in Rain (Young Active Adults)
  if (text.includes('gym') || text.includes('workout') || text.includes('running') || text.includes('sweat') || text.includes('rain')) {
    const buds = PRODUCTS.find(p => p.id === 'prod-008');
    const watch = PRODUCTS.find(p => p.id === 'prod-004');
    return {
      reply: `For workouts and running in any weather, we recommend:\n\n1. **[SonicBuds Pro] Earbuds:** IPX7 waterproof rating (handles heavy sweat and downpours) with secure wingtips that stay locked in your ears.\n2. **[Horizon Flow Pro] Smartwatch:** 5 ATM water-resistant (swimming pool safe) with dual-band GPS to accurately track outdoor running routes without carrying your phone!`,
      recommendedProducts: [buds, watch].filter(Boolean)
    };
  }

  // 19. Payment Methods & Currency
  if (text.includes('payment') || text.includes('apple pay') || text.includes('credit card') || text.includes('paypal') || text.includes('currency') || text.includes('dollar')) {
    return {
      reply: `We accept all major secure payment methods at checkout:\n\n- **Cards:** Visa, Mastercard, American Express, Discover\n- **Digital Wallets:** Apple Pay, Google Pay, PayPal\n- **Currency:** All prices are in USD ($)\n- **Security:** 256-bit bank-grade SSL encrypted checkout with instant order confirmation and tracking.`,
      recommendedProducts: []
    };
  }

  // 20. Gift Shopping (Parents, Spouses & Friends)
  if (text.includes('gift') || text.includes('present') || text.includes('for my son') || text.includes('for my daughter') || text.includes('for my husband') || text.includes('for my wife')) {
    const kb = PRODUCTS.find(p => p.id === 'prod-001');
    const hp = PRODUCTS.find(p => p.id === 'prod-002');
    return {
      reply: `For a memorable and practical gift, here are our two most popular choices:\n\n1. **[Apex Pro 75] Keyboard ($89.99):** Works with Mac, Windows, and iPads. Perfect for students, programmers, and desk workers.\n2. **[NovaShield ANC] Headphones ($149.99):** Premium sound with 60-hour battery life and travel pouch included.\n\n🎁 **Gift Guarantee:** All orders include our 30-day return policy with a prepaid return label inside the box, so they can easily exchange if needed!`,
      recommendedProducts: [kb, hp].filter(Boolean)
    };
  }

  // 21. Dual Mac & Windows Switching (Professionals)
  if ((text.includes('mac') && text.includes('windows')) || text.includes('two computers') || text.includes('switch between')) {
    const kb = PRODUCTS.find(p => p.id === 'prod-001');
    return {
      reply: `Our **[Apex Pro 75] Mechanical Keyboard** is built specifically for dual-system setups:\n\n- **Dedicated Hardware Switch:** Instantly toggle the top row between Mac (Command/Option) and Windows (Ctrl/Win) key mappings.\n- **3-Device Bluetooth Memory:** Pair with your work laptop on slot 1, personal PC on slot 2, and iPad on slot 3—switch between them in 1 second using \`Fn + 1/2/3\`!\n- **2.4GHz USB Dongle:** Included for zero-latency desktop computing.`,
      recommendedProducts: [kb].filter(Boolean)
    };
  }

  // 22. Budget Gear Under $50 (Students & Frugal Shoppers)
  if (text.includes('under $50') || text.includes('under 50') || text.includes('budget') || text.includes('affordable')) {
    const wrist = PRODUCTS.find(p => p.id === 'prod-005');
    const charger = PRODUCTS.find(p => p.id === 'prod-006');
    const mouse = PRODUCTS.find(p => p.id === 'prod-003');
    return {
      reply: `Here are our top high-performance items under $50:\n\n1. **[CloudRest] Memory Foam Wrist Support ($29.99):** Cooling gel foam for all-day keyboard comfort.\n2. **[VoltPulse 100W] GaN Fast Charger ($45.99):** 4-port fast charger for phone, laptop, and tablet.\n3. **[ErgoGlide] Vertical Mouse ($49.99):** 57° ergonomic handshake grip to relieve wrist strain.\n\nUse code **APEX10** (or **STUDENT15** if you are a student) for extra savings!`,
      recommendedProducts: [wrist, charger, mouse].filter(Boolean)
    };
  }

  // 23. General Tech Inquiries
  return {
    reply: `I'd be glad to help you with that! At ApexGear, we specialize in high-performance workspace gear, mechanical keyboards, ergonomic accessories, audio, and travel charging.\n\nCould you specify your budget, preferred device compatibility, or what setup you are building? In the meantime, feel free to use code **APEX10** (or **STUDENT15** if you are a student) for exclusive savings on our catalog!`,
    recommendedProducts: []
  };
}

// Clean up any raw tool-call hallucinations (e.g. dalle.text2im) into proper friendly markdown
function sanitizeToolOutput(rawText) {
  if (!rawText) return '';
  let text = rawText;

  if (text.includes('dalle.text2im') || text.includes('action_input')) {
    try {
      const match = text.match(/\{[\s\S]*"action":\s*"dalle\.text2im"[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        let promptText = '';
        if (typeof parsed.action_input === 'string') {
          try {
            const inner = JSON.parse(parsed.action_input);
            promptText = inner.prompt || parsed.action_input;
          } catch {
            promptText = parsed.action_input;
          }
        } else if (parsed.action_input?.prompt) {
          promptText = parsed.action_input.prompt;
        }

        const cleanPrompt = promptText || 'minimalist smartphone with single back camera';
        const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=600&height=400&nologo=true`;
        text = `Here is the visual concept design for **${cleanPrompt}**:\n\n![${cleanPrompt}](${imgUrl})\n\n**Visual Details:**\n- Minimalist rear chassis with a single precision lens in the upper corner.\n- Clean matte finish with soft studio lighting.\n\nLet me know if you would like me to adjust the styling or explore related accessories!`;
      }
    } catch (e) {
      // If parsing fails, fall back to clean text
    }
  }

  return text;
}

// Single model requester with timeout
async function fetchModel(model, cleanKey, formattedContents, systemPrompt, signal) {
  const endpoint = `/api/gemini/v1beta/models/${model}:generateContent?key=${cleanKey}`;
  const directEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

  const payload = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: formattedContents,
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 320
    }
  });

  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': cleanKey
  };

  for (const url of [endpoint, directEndpoint]) {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: payload, signal });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) return sanitizeToolOutput(text);
      }
    } catch (e) {
      if (signal?.aborted) throw e;
    }
  }

  throw new Error(`Model ${model} returned no content`);
}

// Ultra-fast streaming typewriter animation (3 words per tick every 8ms = ~350ms total)
async function fastStreamText(fullText, onChunk) {
  const words = fullText.split(' ');
  const batchSize = 3;
  let running = '';

  for (let i = 0; i < words.length; i += batchSize) {
    const nextWords = words.slice(i, i + batchSize).join(' ');
    running += (running ? ' ' : '') + nextWords;
    onChunk(running);
    await new Promise(r => setTimeout(r, 8));
  }

  onChunk(fullText);
}

// Check if query is an immediate simple greeting (zero network lag needed)
function isInstantGreeting(text) {
  const t = (text || '').toLowerCase().trim();
  return (
    /^(hi|hello|hey|yo|greetings|good\s*(morning|afternoon|evening)|sup|howdy)\b/i.test(t) ||
    t === 'hi' || t === 'hello' || t === 'hey' ||
    t === 'thank you' || t === 'thanks' || t === 'ok' || t === 'cool' || t === 'great' || t === 'bye'
  );
}

// REALTIME STREAMING ENGINE: High-Speed Response with Multi-turn Context, Dynamic Memory & Intelligent Fallback
export async function streamAdvisorResponse({ apiKey, messages, cartItems = [], onChunk }) {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const cleanKey = (apiKey || '').replace(/['"\s]/g, '').trim();

  // 1. UPDATE USER MEMORY AUTOMATICALLY FROM THE LATEST USER MESSAGE
  updateMemoryFromChat(lastUserMsg);
  const userMemory = getUserMemory();

  // SPEED OPTIMIZATION 1: Instant Greetings (< 80ms)
  if (isInstantGreeting(lastUserMsg)) {
    const localResult = runLocalShoppingAgent(lastUserMsg, messages, cartItems);
    await fastStreamText(localResult.reply, onChunk);
    return {
      ...localResult,
      suggestedChips: generateContextualChips(lastUserMsg, localResult.reply)
    };
  }

  // SPEED OPTIMIZATION 2: Live Gemini Parallel Fast-Race with Real-Time Temporal & Memory Grounding
  if (cleanKey.length > 15) {
    const memoryInjection = formatMemoryForSystemPrompt(userMemory);

    const systemPrompt = `You are "ApexAI", the consultative AI Shopping & Tech Advisor for ApexGear (workspace hardware, ergonomics, audio, and travel tech).

CRITICAL DIRECTIVES FOR NATURAL & RELEVANT CONVERSATION:
1. STRICT RELEVANCE & CONVERSATIONAL CONTEXT:
   - Always answer the user's ACTUAL question accurately.
   - Pay close attention to conversational context and pronoun references (e.g. if the previous topic was the 26 letters of the alphabet and the user asks "what are those", answer what those 26 letters are: A through Z, vowels and consonants!).
   - NEVER lose track of the topic or derail into an unsolicited sales pitch.
   - NEVER repeat an identical product sales pitch if the user asks for clarification or follow-up.

2. GENERAL KNOWLEDGE, TRIVIA & CASUAL QUESTIONS:
   - When the user asks general knowledge, trivia, language, math, science, or casual off-topic questions (e.g. "how many letters in alphabet", "tell me a joke", "what is 15 * 8", "what is the capital of France"):
     * Answer DIRECTLY and ACCURATELY in 1-2 clear sentences.
     * DO NOT FORCE APEXGEAR PRODUCTS INTO THE ANSWER! Do NOT say "to type them out buy [Apex Pro 75]" or "listen on [NovaShield ANC]".
     * DO NOT blurt out promo codes or dates unless the user asked about them.
     * Keep it natural, friendly, and helpful.

3. REAL-TIME TEMPORAL GROUNDING:
   - Current Year: 2026 (Today is Friday, October 23, 2026).
   - ONLY mention the date or year if the user explicitly asks about the current date, year, or product release timelines. Do NOT blurt out the date in unrelated replies.
   - Google Pixel 8 is an older 3-year-old phone (2023). Pixel 11 and iPhone 17 are current in late 2026.

4. USER MEMORY & DISCOUNTS:
${memoryInjection}
   - Only mention discounts (e.g. STUDENT15 or APEX10) when the user is asking about prices, discounts, coupons, or actively shopping for gear. Do not append promo codes to trivia or general knowledge answers.

5. WHEN TO RECOMMEND APEXGEAR PRODUCTS:
   - ONLY recommend and bracket store products (e.g. [Apex Pro 75], [NovaShield ANC]) when the user is:
     * Asking for product recommendations, workspace tech, keyboards, audio, mice, desk setups, chargers, or travel gear.
     * Asking what ApexGear sells or how to upgrade their setup.

STORE CATALOG (ApexGear Products):
1. [Apex Pro 75] Wireless Mechanical Keyboard ($89.99, reg $119.99) - 75% compact, pre-lubed Gateron Brown tactile switches, hot-swappable PCB, per-key RGB, Bluetooth 5.3 / 2.4GHz / USB-C, Mac & Windows.
2. [NovaShield ANC] Wireless Headphones ($149.99, reg $199.99) - Hybrid Active Noise Cancellation (-42dB), 40mm titanium drivers, 60-hour battery, multipoint Bluetooth.
3. [ErgoGlide] Vertical Ergonomic Mouse ($49.99, reg $64.99) - 57° natural handshake posture, silent click switches, 4000 DPI optical sensor, rechargeable.
4. [Horizon Flow Pro] Smart Fitness Watch ($129.99, reg $159.99) - 1.43" AMOLED display, dual-band GPS, 5 ATM waterproof, 14-day battery, 100+ workout modes.
5. [CloudRest] Memory Foam Wrist Rest ($29.99, reg $39.99) - Slow-rebound cooling gel foam, non-slip base, fits 75% and full-size keyboards.
6. [VoltPulse 100W] GaN Travel Fast Charger ($45.99, reg $59.99) - 3x USB-C + 1x USB-A, GaN III cool tech, charges 16" MacBook Pro and phones, travel adapters included.
7. [AuraLite ScreenBar] RGB Monitor Light ($54.99, reg $69.99) - Asymmetric optical glare-free design, wireless rotary dial, 2700K-6500K color temp, RGB back ambient lighting.
8. [SonicBuds Pro] True Wireless Earbuds ($79.99, reg $99.99) - IPX7 waterproof, ANC + transparency mode, 32h playtime with wireless charging case.
9. [OmniTravel 25k] Laptop Power Bank ($74.99, reg $99.99) - TSA airline approved (92.5Wh), 65W USB-C PD fast charge for laptops and phones, smart OLED status display.

STORE POLICIES & PROMO CODES:
- Welcome Code: APEX10 gives 10% off entire order for all shoppers.
- Student Discount: STUDENT15 gives 15% off for verified students (an extra 5% off) via Student Beans or code STUDENT15 at cart checkout.
- Shipping: FREE on orders over $50 (2-4 business days), otherwise $4.99. Express 1-2 day: $12.99.
- Returns: 30-day hassle-free return guarantee with prepaid shipping label included.
- Warranty: 2-year full manufacturer replacement warranty on all electronics.

BEHAVIOR & CONVERSATION RULES:
1. RELEVANCE & CONVERSATIONAL MEMORY: If the user says "actually i am student" or asks about higher discounts, celebrate their student status, give code STUDENT15 for 15% off, and explain how to apply it in their cart.
2. ADAPT TO USER STYLE: If the user requests "common man" explanations, speak in plain, approachable English with zero corporate or engineering jargon.
3. OUT-OF-CATALOG QUESTIONS: If asked about items we don't sell (e.g. 10k mAh power banks, motorcycles, TVs, smartphones), recommend top market models. Do NOT bracket our own product names if they don't meet the user's specific spec (e.g. don't push 25k when user wants 10k).
4. IN-CATALOG RECOMMENDATIONS: When recommending products from our store, use bracketed names (e.g. [Apex Pro 75], [NovaShield ANC], [CloudRest]).
5. IMAGE GENERATION: DO NOT output raw JSON tool calls like {"action": "dalle.text2im", ...}. If the customer asks you to generate, draw, or visualize an image, embed a live markdown image using: ![Description](https://image.pollinations.ai/prompt/<url-encoded-description>?width=600&height=400&nologo=true)
6. FORMATTING & BREVITY: Keep answers concise, natural, and conversational (under 130 words). Use bold terms and clean bullet points.
7. CUSTOMER DEMOGRAPHICS & AGE GROUP ADAPTATION:
   - Older Adults / Non-Tech Shoppers (Seniors & Beginners):
     * Tone: Extremely patient, warm, encouraging, respectful.
     * Translate jargon into everyday terms:
       - "GaN Charger": Modern, cool-running plug that safely charges laptops and phones fast without a heavy brick.
       - "Mechanical Keyboard": Each key has a soft physical spring cushion underneath—making typing gentler on stiff fingers without the loud clatter of vintage typewriters.
       - "Vertical Mouse": Held like a relaxed handshake to stop wrist pain and carpal tunnel pressure.
       - "ScreenBar": Sits gently atop a monitor and shines light down on papers/desk without glare in the eyes.
   - Teens & College Students (Gen Z):
     * Focus on study setups, note-taking on iPads/tablets, casual gaming with lag-free 2.4GHz wireless, dorm noise cancellation, and the 15% student discount (code STUDENT15).
   - Remote Working Professionals & Parents/Gift Shoppers:
     * Focus on Zoom microphone clarity, instant Mac/PC dual switching, TSA airline carry-on battery compliance (under 100Wh), and risk-free gifting with 30-day free returns.
8. SPELLING & TYPO TOLERANCE:
   - Customers frequently make typos or misspellings (e.g. "recoment", "recomnd", "laptap", "keybord", "hedphone", "chargr", "mose", "alphabit", "motercycle", "discont", "studnt").
   - Intelligently understand their true intent without commenting on their spelling or acting confused.
   - If someone asks "recoment gear for my laptop", immediately provide top laptop gear recommendations ([VoltPulse 100W], [OmniTravel 25k], [ErgoGlide], [NovaShield ANC]).`;

    // Build multi-turn context starting with 'user'
    const firstUserIdx = messages.findIndex(m => m.role === 'user');
    const relevantMessages = firstUserIdx !== -1 ? messages.slice(firstUserIdx) : messages;

    const formattedContents = [];
    for (const m of relevantMessages) {
      if (!m.content || !m.content.trim()) continue;
      const role = m.role === 'assistant' ? 'model' : 'user';

      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
        formattedContents[formattedContents.length - 1].parts[0].text += `\n${m.content}`;
      } else {
        formattedContents.push({
          role,
          parts: [{ text: m.content }]
        });
      }
    }

    if (formattedContents.length > 0) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);

      try {
        const textOutput = await Promise.any([
          fetchModel('gemini-3.1-flash-lite', cleanKey, formattedContents, systemPrompt, controller.signal),
          fetchModel('gemini-3.5-flash-lite', cleanKey, formattedContents, systemPrompt, controller.signal)
        ]);

        clearTimeout(timeoutId);
        controller.abort();

        if (textOutput && textOutput.trim().length > 0) {
          updateMemoryFromChat(lastUserMsg, textOutput);
          await fastStreamText(textOutput, onChunk);
          return {
            reply: textOutput,
            recommendedProducts: extractProducts(textOutput, lastUserMsg),
            suggestedChips: generateContextualChips(lastUserMsg, textOutput)
          };
        }
      } catch (err) {
        clearTimeout(timeoutId);
      }
    }
  }

  // SPEED OPTIMIZATION 3: Guaranteed Multi-turn Local Fallback
  const localResult = runLocalShoppingAgent(lastUserMsg, messages, cartItems);
  updateMemoryFromChat(lastUserMsg, localResult.reply);
  await fastStreamText(localResult.reply, onChunk);
  return {
    ...localResult,
    suggestedChips: generateContextualChips(lastUserMsg, localResult.reply)
  };
}
