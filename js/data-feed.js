/* Shield Force — content data: live feed (cities, victims, sources, stats, ticker)
   Split per page so each page downloads only what it renders. */
(function () {
  "use strict";
  const SF = (window.SF = window.SF || {});

  const cities = [
    { name: "Srinagar", state: "J&K", x: 213, y: 78 },
    { name: "Jammu", state: "J&K", x: 228, y: 108 },
    { name: "Amritsar", state: "Punjab", x: 218, y: 138 },
    { name: "Chandigarh", state: "Punjab", x: 252, y: 158 },
    { name: "Dehradun", state: "Uttarakhand", x: 285, y: 168 },
    { name: "New Delhi", state: "Delhi", x: 262, y: 196 },
    { name: "Jaipur", state: "Rajasthan", x: 228, y: 232 },
    { name: "Jodhpur", state: "Rajasthan", x: 185, y: 248 },
    { name: "Lucknow", state: "Uttar Pradesh", x: 330, y: 236 },
    { name: "Jhansi", state: "Uttar Pradesh", x: 292, y: 264 },
    { name: "Patna", state: "Bihar", x: 398, y: 258 },
    { name: "Kolkata", state: "West Bengal", x: 448, y: 310 },
    { name: "Guwahati", state: "Assam", x: 520, y: 258 },
    { name: "Ahmedabad", state: "Gujarat", x: 162, y: 306 },
    { name: "Bhopal", state: "Madhya Pradesh", x: 268, y: 310 },
    { name: "Nagpur", state: "Maharashtra", x: 300, y: 350 },
    { name: "Mumbai", state: "Maharashtra", x: 185, y: 380 },
    { name: "Pune", state: "Maharashtra", x: 202, y: 402 },
    { name: "Hyderabad", state: "Telangana", x: 285, y: 415 },
    { name: "Visakhapatnam", state: "Andhra Pradesh", x: 355, y: 408 },
    { name: "Bengaluru", state: "Karnataka", x: 262, y: 495 },
    { name: "Chennai", state: "Tamil Nadu", x: 315, y: 500 },
    { name: "Kochi", state: "Kerala", x: 245, y: 560 },
    { name: "Thiruvananthapuram", state: "Kerala", x: 258, y: 596 }
  ];

  const victims = [
    "Serving jawan", "Retired JCO", "Officer's spouse", "Veteran (Subedar retd.)",
    "Veer nari (family pension)", "Defence civilian employee", "Serving NCO's parent",
    "Agniveer trainee's family", "Retired officer", "Havildar's spouse"
  ];
  const sources = [
    "State Cyber Cell bulletin", "NCRP portal filing", "1930 helpline log",
    "Unit FWO alert", "I4C advisory", "Bank fraud-cell referral", "Station HQ circular"
  ];

  /* ---------------- FINANCIAL SCHEMES (page 7 + detail) ---------------- */
  const stats = [
    { ico: "🎯", end: 8437, fmt: "plus", lbl: "Military personnel & family members targeted this year", delta: "▲ 23% vs last year", dir: "up" },
    { ico: "💸", end: 142, fmt: "crore", lbl: "Total amount reported lost in 2026", delta: "▲ ₹31 Cr vs 2025", dir: "up" },
    { ico: "📉", end: 1.68, fmt: "lakh", lbl: "Average loss per reported case", delta: "▼ Faster 1930 reporting is cutting losses", dir: "down" },
    { ico: "🤐", end: 62, fmt: "pct", lbl: "Estimated cases never reported — out of embarrassment", delta: "Reporting is strength, not shame", dir: "down" }
  ];

  const ticker = [
    "QR 'advance payment' fraud active on resale apps — receiving money NEVER needs your PIN",
    "Fake SPARSH calls demanding OTPs from pensioners — SPARSH never calls for OTPs or fees",
    "'Digital arrest' video calls targeting parents of serving personnel — no such law exists",
    "Bogus CSD car-quota pages on social media — canteen entitlements are non-transferable",
    "Telegram 'mentors' promising daily returns on DSOP savings — guaranteed returns are guaranteed fraud",
    "Report every attempt: 1930 • cybercrime.gov.in — the first 60 minutes are the Golden Window"
  ];

  const caseTemplates = [
    { t: "QR reversal fraud on furniture sale", s: "fake-upi" },
    { t: "Fake SPARSH KYC call drains pension account", s: "pension" },
    { t: "'Digital arrest' video call extorts family", s: "digital-arrest" },
    { t: "Cloned bank page captures OTP, savings hit", s: "otp-phishing" },
    { t: "Crypto 'mentor' vanishes with unit group's corpus", s: "investment" },
    { t: "Fake Colonel sells phantom CSD car quota", s: "impersonation" },
    { t: "Martyr charity appeal traced to mule account", s: "welfare" },
    { t: "Loan APK extorts family with morphed photos", s: "loan-identity" },
    { t: "SIM swap follows fake telecom verification call", s: "otp-phishing" },
    { t: "'OROP arrears' processing-fee fraud on veteran", s: "pension" },
    { t: "Advance-fee trap on 'army auction' bikes page", s: "impersonation" },
    { t: "Collect-request fraud posed as canteen refund", s: "fake-upi" }
  ];
  /* Deterministic PRNG so 'live' feeds update on schedule but stay stable within the hour */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  SF.cities = cities; SF.victims = victims; SF.sources = sources;
  SF.stats = stats; SF.ticker = ticker; SF.caseTemplates = caseTemplates;
  SF.mulberry32 = mulberry32;

})();
