const privateRobotsHeader =
  "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noodp, noydir, none, noai, noimageai, nocache";
const envValue = (key: string, fallback = "") => process.env[key] || fallback;
const configuredDbUrl = (process.env.NUXT_PUBLIC_FIREBASE_DATABASE_URL || "").replace(/\/+$/, "");

export default defineNuxtConfig({
  compatibilityDate: "2026-05-31",
  devtools: { enabled: false },
  css: ["~/styles/main.css"],
  runtimeConfig: {
    public: {
      firebase: {
        apiKey: envValue("NUXT_PUBLIC_FIREBASE_API_KEY"),
        authDomain: envValue("NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
        databaseURL: envValue("NUXT_PUBLIC_FIREBASE_DATABASE_URL"),
        projectId: envValue("NUXT_PUBLIC_FIREBASE_PROJECT_ID"),
        storageBucket: envValue("NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
        messagingSenderId: envValue("NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
        appId: envValue("NUXT_PUBLIC_FIREBASE_APP_ID"),
        measurementId: envValue("NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
        paths: {
          customers: envValue("NUXT_PUBLIC_FIREBASE_CUSTOMERS_PATH", "customers"),
          events: envValue("NUXT_PUBLIC_FIREBASE_EVENTS_PATH", "customerEvents"),
          dashboardAccounts: envValue("NUXT_PUBLIC_FIREBASE_DASHBOARD_ACCOUNTS_PATH", "dashboardAccounts"),
          dashboardUsers: envValue("NUXT_PUBLIC_FIREBASE_DASHBOARD_USERS_PATH", "dashboardUsers"),
        },
      },
    },
  },
  routeRules: {
    // حجب الفهرسة والأرشفة وكافة البوتات على كامل الموقع والمشروع
    "/**": {
      headers: {
        "X-Robots-Tag": privateRobotsHeader,
        "Referrer-Policy": "no-referrer",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store",
      },
    },
  },
  app: {
    head: {
      title: "",
      htmlAttrs: {
        lang: "ar",
        dir: "rtl",
      },
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
        // منع الفهرسة والزحف والأرشفة لكافة البوتات والمحركات بدون أي description أو keywords أو OpenGraph
        { name: "robots", content: privateRobotsHeader },
        { name: "googlebot", content: privateRobotsHeader },
        { name: "googlebot-news", content: privateRobotsHeader },
        { name: "googlebot-image", content: privateRobotsHeader },
        { name: "googlebot-video", content: privateRobotsHeader },
        { name: "google-inspectiontool", content: privateRobotsHeader },
        { name: "bingbot", content: privateRobotsHeader },
        { name: "slurp", content: privateRobotsHeader },
        { name: "baiduspider", content: privateRobotsHeader },
        { name: "yandex", content: privateRobotsHeader },
        { name: "duckduckbot", content: privateRobotsHeader },
        { name: "applebot", content: privateRobotsHeader },
        { name: "facebookexternalhit", content: privateRobotsHeader },
        { name: "facebot", content: privateRobotsHeader },
        { name: "twitterbot", content: privateRobotsHeader },
        { name: "ia_archiver", content: privateRobotsHeader },
        { name: "gptbot", content: privateRobotsHeader },
        { name: "chatgpt-user", content: privateRobotsHeader },
        { name: "claudebot", content: privateRobotsHeader },
        { name: "perplexitybot", content: privateRobotsHeader },
        { name: "ccbot", content: privateRobotsHeader },
        { name: "bytespider", content: privateRobotsHeader },
        { name: "referrer", content: "no-referrer" },
        { name: "format-detection", content: "telephone=no, date=no, email=no, address=no" },
        { name: "generator", content: "" },
        { "http-equiv": "Cache-Control", content: "no-cache, no-store, must-revalidate" },
        { "http-equiv": "Pragma", content: "no-cache" },
        { "http-equiv": "Expires", content: "0" },
        { "http-equiv": "X-Robots-Tag", content: privateRobotsHeader },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "shortcut icon", type: "image/png", href: "/favicon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" },
      ],
      style: [
        {
          id: "geo-guard-style",
          innerHTML: "html:not(.geo-passed) body { display: none !important; visibility: hidden !important; opacity: 0 !important; }",
        },
      ],
      script: [
        {
          innerHTML: `(function(){try{var p=window.location.pathname;if(p.indexOf('/admin')===0||p.indexOf('/blocked')===0){document.documentElement.classList.add('geo-passed');return;}var b=localStorage.getItem('gift_visitor_banned_until');if(b&&Date.now()<Number(b)){window.location.replace('/blocked');return;}var dbUrl="${configuredDbUrl}";var allowedCountries=['EG','JO'];var isAllowed=function(code){return allowedCountries.indexOf(code)!==-1;};fetch(dbUrl+'/settings/geoBlocking.json').then(function(r){return r.json();}).then(function(st){if(st&&st.enabled===false){document.documentElement.classList.add('geo-passed');return;}var c=sessionStorage.getItem('gift_visitor_country');if(c&&isAllowed(c)){document.documentElement.classList.add('geo-passed');return;}if(c&&!isAllowed(c)){window.location.replace('/blocked');return;}fetch('https://ipwho.is/?fields=country_code,success').then(function(res){return res.json();}).then(function(d){if(d&&d.success&&d.country_code){sessionStorage.setItem('gift_visitor_country',d.country_code);if(!isAllowed(d.country_code)){window.location.replace('/blocked');return;}}document.documentElement.classList.add('geo-passed');}).catch(function(){fetch('https://api.country.is/').then(function(res){return res.json();}).then(function(d){if(d&&d.country){sessionStorage.setItem('gift_visitor_country',d.country);if(!isAllowed(d.country)){window.location.replace('/blocked');return;}}document.documentElement.classList.add('geo-passed');}).catch(function(){document.documentElement.classList.add('geo-passed');});});}).catch(function(){document.documentElement.classList.add('geo-passed');});}catch(e){document.documentElement.classList.add('geo-passed');}})();`,
        },
      ],
    },
  },
});
