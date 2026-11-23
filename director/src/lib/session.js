// 20 daqiqa (millisekundlarda: 20 * 60 * 1000 = 1,200,000 ms)
export const SESSION_TIMEOUT_MS = 20 * 60 * 1000;

/**
 * Sessiya muddati (20 daqiqa) tugaganligini tekshirish
 * @param {string} storageKey 
 * @returns {boolean}
 */
export function isSessionExpired(storageKey) {
  const lastActiveStr = localStorage.getItem(storageKey);
  if (!lastActiveStr) return false;
  const lastActive = parseInt(lastActiveStr, 10);
  if (isNaN(lastActive)) return false;
  return Date.now() - lastActive > SESSION_TIMEOUT_MS;
}

/**
 * Oxirgi faollik vaqtini yangilash
 * @param {string} storageKey 
 */
export function touchSession(storageKey) {
  localStorage.setItem(storageKey, String(Date.now()));
}

/**
 * Sessiya vaqtini tozalash
 * @param {string} storageKey 
 */
export function clearSession(storageKey) {
  localStorage.removeItem(storageKey);
}

/**
 * Foydalanuvchi faolligini, sahifa yopilishini va 20 daqiqa vaqtini kuzatuvchi funksiya
 * @param {string} storageKey 
 * @param {Function} onExpire 
 * @returns {Function} cleanup funksiyasi
 */
export function setupSessionHeartbeat(storageKey, onExpire) {
  // Sahifaga kirilganda faollikni yangilash
  touchSession(storageKey);

  // Sahifa ochiq turganda har 15 soniyada yangilab turish
  const intervalId = setInterval(() => {
    touchSession(storageKey);
  }, 15000);

  // Foydalanuvchi harakatlari (click, tugma bosish, scroll) - 5 soniyalik cheklov (throttle) bilan
  let lastThrottled = Date.now();
  const handleActivity = () => {
    const now = Date.now();
    if (now - lastThrottled > 5000) {
      lastThrottled = now;
      touchSession(storageKey);
    }
  };

  // Sahifa yopilayotganda (beforeunload) oxirgi soniyani saqlab qolish
  const handleBeforeUnload = () => {
    touchSession(storageKey);
  };

  // Sahifa minimizatsiya bo'lganda yoki boshqa vkladkaga o'tganda
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      touchSession(storageKey);
    } else if (document.visibilityState === 'visible') {
      // Qayta sahifaga qaytilganda 20 daqiqa o'tib ketgan bo'lsa darhol logout qilish
      if (isSessionExpired(storageKey)) {
        if (typeof onExpire === 'function') {
          onExpire();
        }
      } else {
        touchSession(storageKey);
      }
    }
  };

  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    clearInterval(intervalId);
    events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/**
 * Brauzer (Google Chrome / Password Manager) ga parolni saqlashni taklif qilish
 * @param {string} identifier 
 * @param {string} password 
 * @param {string} name 
 */
export async function saveCredentialToBrowser(identifier, password, name) {
  if (typeof window !== 'undefined' && window.PasswordCredential && navigator.credentials?.store) {
    try {
      const cred = new window.PasswordCredential({
        id: String(identifier).trim(),
        password: String(password).trim(),
        name: String(name || identifier).trim(),
      });
      await navigator.credentials.store(cred);
    } catch (e) {
      // Brauzer xavfsiz o'tkazib yuboradi
    }
  }
}
