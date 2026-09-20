/**
 * Fix My Speaker - Intelligent Language Detection & Redirection Engine
 * Supports: en, es, id, ar, hi, pt, fr, de, ru, ja, zh, it, tr, vi, ko
 */

(function () {
  const SUPPORTED_LANGS = [
    'en', 'es', 'id', 'ar', 'hi', 'pt', 'fr', 'de', 'ru', 'ja', 'zh', 'it', 'tr', 'vi', 'ko'
  ];

  // Helper to save explicit language preference
  window.setUserLanguage = function (langCode, targetUrl) {
    if (SUPPORTED_LANGS.includes(langCode)) {
      try {
        localStorage.setItem('user_lang_pref', langCode);
      } catch (e) {}
    }
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  // Only perform automatic redirection on the root / default English landing page
  const pathname = window.location.pathname;
  const isRoot = pathname === '/' || pathname.endsWith('/index.html') && !pathname.includes('/es/') && !pathname.includes('/id/') && !pathname.includes('/ar/') && !pathname.includes('/hi/') && !pathname.includes('/pt/') && !pathname.includes('/fr/') && !pathname.includes('/de/') && !pathname.includes('/ru/') && !pathname.includes('/ja/') && !pathname.includes('/zh/') && !pathname.includes('/it/') && !pathname.includes('/tr/') && !pathname.includes('/vi/') && !pathname.includes('/ko/');

  if (!isRoot) {
    return;
  }

  // Check URL parameters for explicit bypass (e.g., ?noredirect=1)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('noredirect') || urlParams.has('stay')) {
    return;
  }

  // 1. Search Engine Bot Check - Never redirect web crawlers
  const botPattern = /bot|googlebot|crawler|spider|robot|crawling|bingbot|yandex|baidu|duckduck|slurp|facebookexternalhit|twitterbot/i;
  if (botPattern.test(navigator.userAgent || '')) {
    return;
  }

  // 2. User Explicit Preference Check
  let savedPref = null;
  try {
    savedPref = localStorage.getItem('user_lang_pref');
  } catch (e) {}

  if (savedPref) {
    if (savedPref === 'en') {
      return; // Explicitly wants English root
    }
    if (SUPPORTED_LANGS.includes(savedPref)) {
      redirectToLanguage(savedPref);
      return;
    }
  }

  // 3. Browser Language Detection (navigator.languages / navigator.language)
  const userLangs = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || ''];

  let matchedLang = null;

  for (let i = 0; i < userLangs.length; i++) {
    const raw = (userLangs[i] || '').toLowerCase().trim();
    if (!raw) continue;
    const primary = raw.split('-')[0];

    if (primary === 'es') { matchedLang = 'es'; break; }
    if (primary === 'id' || primary === 'in') { matchedLang = 'id'; break; }
    if (primary === 'ar') { matchedLang = 'ar'; break; }
    if (primary === 'hi') { matchedLang = 'hi'; break; }
    if (primary === 'pt') { matchedLang = 'pt'; break; }
    if (primary === 'fr') { matchedLang = 'fr'; break; }
    if (primary === 'de') { matchedLang = 'de'; break; }
    if (primary === 'ru' || primary === 'uk' || primary === 'be' || primary === 'kk') { matchedLang = 'ru'; break; }
    if (primary === 'ja') { matchedLang = 'ja'; break; }
    if (primary === 'zh') { matchedLang = 'zh'; break; }
    if (primary === 'it') { matchedLang = 'it'; break; }
    if (primary === 'tr') { matchedLang = 'tr'; break; }
    if (primary === 'vi') { matchedLang = 'vi'; break; }
    if (primary === 'ko') { matchedLang = 'ko'; break; }
    if (primary === 'en') {
      // User explicitly has English as higher priority
      matchedLang = 'en';
      break;
    }
  }

  // If browser explicitly matched a non-English supported language, redirect
  if (matchedLang && matchedLang !== 'en') {
    redirectToLanguage(matchedLang);
    return;
  }

  // 4. Geographic Timezone Heuristic (for users with English phone OS in foreign regions)
  if (!matchedLang || matchedLang === 'en') {
    try {
      const timeZone = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      let tzLang = null;

      // India (Hindi)
      if (timeZone.includes('kolkata') || timeZone.includes('calcutta')) {
        tzLang = 'hi';
      }
      // Indonesia
      else if (timeZone.includes('jakarta') || timeZone.includes('pontianak') || timeZone.includes('makassar') || timeZone.includes('jayapura')) {
        tzLang = 'id';
      }
      // Arabic Middle East & North Africa
      else if (timeZone.includes('riyadh') || timeZone.includes('cairo') || timeZone.includes('dubai') || timeZone.includes('baghdad') || timeZone.includes('amman') || timeZone.includes('casablanca') || timeZone.includes('algiers') || timeZone.includes('tunis') || timeZone.includes('kuwait') || timeZone.includes('qatar')) {
        tzLang = 'ar';
      }
      // Spanish speaking Americas & Spain
      else if (timeZone.includes('madrid') || timeZone.includes('mexico') || timeZone.includes('bogota') || timeZone.includes('lima') || timeZone.includes('buenos_aires') || timeZone.includes('santiago') || timeZone.includes('caracas') || timeZone.includes('montevideo')) {
        tzLang = 'es';
      }
      // Brazil & Portugal
      else if (timeZone.includes('sao_paulo') || timeZone.includes('recife') || timeZone.includes('manaus') || timeZone.includes('lisbon')) {
        tzLang = 'pt';
      }
      // France
      else if (timeZone.includes('paris')) {
        tzLang = 'fr';
      }
      // Germany / Austria / Switzerland
      else if (timeZone.includes('berlin') || timeZone.includes('vienna') || timeZone.includes('zurich')) {
        tzLang = 'de';
      }
      // Russia
      else if (timeZone.includes('moscow') || timeZone.includes('novosibirsk') || timeZone.includes('vladivostok') || timeZone.includes('yekaterinburg')) {
        tzLang = 'ru';
      }
      // Japan
      else if (timeZone.includes('tokyo')) {
        tzLang = 'ja';
      }
      // China
      else if (timeZone.includes('shanghai') || timeZone.includes('chongqing') || timeZone.includes('hong_kong') || timeZone.includes('taipei')) {
        tzLang = 'zh';
      }
      // Italy
      else if (timeZone.includes('rome')) {
        tzLang = 'it';
      }
      // Turkey
      else if (timeZone.includes('istanbul')) {
        tzLang = 'tr';
      }
      // Vietnam
      else if (timeZone.includes('ho_chi_minh') || timeZone.includes('saigon')) {
        tzLang = 'vi';
      }
      // Korea
      else if (timeZone.includes('seoul')) {
        tzLang = 'ko';
      }

      if (tzLang) {
        redirectToLanguage(tzLang);
        return;
      }
    } catch (e) {}
  }

  function redirectToLanguage(lang) {
    if (!lang || lang === 'en') return;
    const base = window.location.origin;
    const target = base + '/' + lang + '/' + window.location.search;
    window.location.replace(target);
  }
})();
