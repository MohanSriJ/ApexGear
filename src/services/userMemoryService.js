// Persistent User Memory & Personalization Store
const MEMORY_STORAGE_KEY = 'apex_user_memory';

export const DEFAULT_USER_MEMORY = {
  isStudent: false,
  preferredDiscount: 'APEX10 (10% off)',
  devices: [],
  interests: [],
  tone: 'friendly & consultative',
  learnedFacts: []
};

// Retrieve memory from localStorage
export function getUserMemory() {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_MEMORY };
    return { ...DEFAULT_USER_MEMORY, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_USER_MEMORY };
  }
}

// Save memory updates
export function saveUserMemory(updates) {
  try {
    const current = getUserMemory();
    const updated = { ...current, ...updates };
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return getUserMemory();
  }
}

// Reset memory
export function clearUserMemory() {
  try {
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  } catch (e) {}
  return { ...DEFAULT_USER_MEMORY };
}

// Intelligently scan conversation to learn new user facts
export function updateMemoryFromChat(userText = '', assistantText = '') {
  const u = (userText || '').toLowerCase();
  const memory = getUserMemory();
  let changed = false;

  // 1. Detect Student Status
  if (
    u.includes('i am student') ||
    u.includes('i am a student') ||
    u.includes('actually i am student') ||
    u.includes('im a student') ||
    u.includes('college student') ||
    u.includes('university') ||
    u.includes('school') ||
    u.includes('student beans') ||
    u.includes('student discount') ||
    u.includes('extra 5 percent') ||
    u.includes('15% off')
  ) {
    if (!memory.isStudent) {
      memory.isStudent = true;
      memory.preferredDiscount = 'STUDENT15 (15% off)';
      if (!memory.learnedFacts.includes('Verified student (Eligible for 15% off via STUDENT15)')) {
        memory.learnedFacts.push('Verified student (Eligible for 15% off via STUDENT15)');
      }
      changed = true;
    }
  }

  // 2. Detect User Devices
  if (u.includes('pixel 8') || u.includes('my pixel')) {
    if (!memory.devices.includes('Google Pixel 8')) {
      memory.devices.push('Google Pixel 8');
      memory.learnedFacts.push('Owns a Google Pixel 8');
      changed = true;
    }
  } else if (u.includes('pixel 9')) {
    if (!memory.devices.includes('Google Pixel 9')) {
      memory.devices.push('Google Pixel 9');
      changed = true;
    }
  } else if (u.includes('iphone 16') || u.includes('iphone 17')) {
    const dev = u.includes('iphone 17') ? 'iPhone 17' : 'iPhone 16';
    if (!memory.devices.includes(dev)) {
      memory.devices.push(dev);
      changed = true;
    }
  } else if (u.includes('macbook')) {
    if (!memory.devices.includes('MacBook')) {
      memory.devices.push('MacBook');
      changed = true;
    }
  }

  // 3. Detect Preferences & Style
  if (u.includes('common man') || u.includes('simple words') || u.includes('easy words') || u.includes('layman')) {
    if (memory.tone !== 'common-man / plain English') {
      memory.tone = 'common-man / plain English';
      if (!memory.learnedFacts.includes('Prefers common-man, simple explanations without technical jargon')) {
        memory.learnedFacts.push('Prefers common-man, simple explanations without technical jargon');
      }
      changed = true;
    }
  }

  // 3.5 Detect Senior / Non-Tech Background
  if (
    u.includes('senior') ||
    u.includes('older person') ||
    u.includes('retired') ||
    u.includes('grandparent') ||
    u.includes('not good with tech') ||
    u.includes('not tech savvy') ||
    u.includes('elderly') ||
    u.includes('arthritis')
  ) {
    if (!memory.learnedFacts.includes('Values patient, simple plain-English explanations without confusing tech jargon')) {
      memory.learnedFacts.push('Values patient, simple plain-English explanations without confusing tech jargon');
      memory.tone = 'patient, warm & beginner-friendly';
      changed = true;
    }
  }

  // 3.6 Detect Parent / Gift Shopper
  if (
    u.includes('for my son') ||
    u.includes('for my daughter') ||
    u.includes('for my kid') ||
    u.includes('for my husband') ||
    u.includes('for my wife') ||
    u.includes('gift for') ||
    u.includes('birthday present')
  ) {
    if (!memory.learnedFacts.includes('Shopping for a gift; values gift suitability, durability, and hassle-free returns')) {
      memory.learnedFacts.push('Shopping for a gift; values gift suitability, durability, and hassle-free returns');
      changed = true;
    }
  }

  // 4. Detect Gear Preferences (e.g. 10k vs 25k)
  if (u.includes('10k') || u.includes('10,000') || u.includes('10000mah') || u.includes('smaller powerbank')) {
    const fact = 'Prefers compact 10,000mAh portable charger over heavy 25k';
    if (!memory.learnedFacts.includes(fact)) {
      memory.learnedFacts.push(fact);
      changed = true;
    }
  }

  // 5. Detect Motorcycle Interest
  if (u.includes('motorcycle') || u.includes('bike') || u.includes('motercycle')) {
    if (!memory.interests.includes('Motorcycles')) {
      memory.interests.push('Motorcycles');
      changed = true;
    }
  }

  if (changed) {
    saveUserMemory(memory);
  }

  return memory;
}

// Generate prompt injection based on current memory
export function formatMemoryForSystemPrompt(memory) {
  const parts = [];

  if (memory.isStudent) {
    parts.push(`- USER STATUS: Confirmed Student. Eligible for 15% off with code STUDENT15. When discussing products, pricing, discounts, or checkout, ensure they get this 15% student rate. Never repeat promo codes on unrelated casual, language, or trivia questions.`);
  }

  if (memory.devices && memory.devices.length > 0) {
    parts.push(`- USER DEVICES: ${memory.devices.join(', ')}. When giving recommendations (e.g. chargers, keyboards, cases), ensure compatibility with these devices.`);
  }

  if (memory.tone && memory.tone.includes('common-man')) {
    parts.push(`- TONE PREFERENCE: User requested "common man" style. Use friendly, plain-English, straightforward explanations with zero dense technical jargon.`);
  }

  if (memory.learnedFacts && memory.learnedFacts.length > 0) {
    parts.push(`- KEY REMEMBERED FACTS: ${memory.learnedFacts.join('; ')}.`);
  }

  if (parts.length === 0) {
    return 'No prior user profile memory established.';
  }

  return parts.join('\n');
}
