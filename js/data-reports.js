/* Shield Force — content data: downloadable reports
   Split per page so each page downloads only what it renders. */
(function () {
  "use strict";
  const SF = (window.SF = window.SF || {});

  const reports = [
    { file: "shieldforce-family-financial-safety.pdf", code: "SF-RPT-01", title: "Family Financial Safety Guide", desc: "Household security drills, the family code word protocol and response steps for spouses, parents and children of serving personnel.", pages: "Guide • A4" },
    { file: "shieldforce-red-flag-checklist.pdf", code: "SF-RPT-02", title: "Quick Red-Flag Checklist", desc: "A print-and-stick one-pager: ten red flags and the 3-line defence. Designed for the fridge, the notice board and the canteen wall.", pages: "Checklist • A4" },
    { file: "shieldforce-qr-scam-warning.pdf", code: "SF-RPT-03", title: "QR Code Scam Warning Notice", desc: "Advisory poster for family welfare meetings explaining the QR/UPI reversal trap and the field rules that defeat it.", pages: "Advisory • A4" },
    { file: "shieldforce-veteran-pension-fraud-alert.pdf", code: "SF-RPT-04", title: "Veteran Pension Fraud Alert", desc: "Active fraud patterns against pensioners and veer naris — SPARSH impersonation, life-certificate phishing and arrears bait — with safe practice rules.", pages: "Alert • A4" },
    { file: "shieldforce-fraud-awareness-summary.pdf", code: "SF-RPT-05", title: "Fraud Awareness Summary", desc: "One-briefing digest of the entire Shield Force programme: threat picture, eight scam families, core defences and the unit-level drill.", pages: "Digest • A4" }
  ];

  /* ---------------- STATS + TICKER (home) ---------------- */

  SF.reports = reports;

})();
