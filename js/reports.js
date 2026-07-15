/* Shield Force — reports: device-aware PDF downloads */
(function () {
  "use strict";

  /* device detection for the download hint */
  function detectDevice() {
    const ua = navigator.userAgent;
    const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) ||
      (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
      (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));
    const isPhone = !isTablet && /Mobi|Android|iPhone|iPod/i.test(ua);
    const os =
      /Android/i.test(ua) ? "Android" :
      /iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) ? "iOS/iPadOS" :
      /Windows/i.test(ua) ? "Windows" :
      /Macintosh/i.test(ua) ? "macOS" :
      /Linux/i.test(ua) ? "Linux" : "your system";
    const kind = isTablet ? "tablet" : isPhone ? "phone" : "laptop/desktop";
    const icon = isTablet ? "📱" : isPhone ? "📲" : "💻";
    const tip = isPhone || isTablet
      ? "files land in your Downloads / Files app"
      : "files save to your Downloads folder";
    return { kind, os, icon, tip };
  }

  const dev = detectDevice();
  document.getElementById("device-note").innerHTML =
    `${dev.icon} optimised for your ${dev.kind} (${dev.os}) — ${dev.tip}.`;

  /* report cards */
  document.getElementById("report-grid").innerHTML = SF.reports.map(r => `
    <div class="card card3d report-card rv">
      <div style="display:flex;gap:16px;align-items:flex-start">
        <div class="doc-ico">PDF</div>
        <div>
          <span class="tag tag-gold">${r.code}</span>
          <h3 style="margin-top:8px">${r.title}</h3>
        </div>
      </div>
      <p>${r.desc}</p>
      <div class="meta"><span>📄 ${r.pages}</span><span>🌐 English</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a class="btn btn-gold btn-sm" href="assets/reports/${r.file}" download="${r.file}">⬇ Download PDF</a>
        <a class="btn btn-ghost btn-sm" href="assets/reports/${r.file}" target="_blank" rel="noopener">👁 Preview</a>
      </div>
    </div>`).join("");

  /* download-all */
  document.getElementById("dl-all").addEventListener("click", () => {
    SFX.toast("⬇ Starting 5 downloads — allow multiple downloads if your browser asks.");
    SF.reports.forEach((r, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = "assets/reports/" + r.file;
        a.download = r.file;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, i * 650);
    });
  });

  SFX.reveal(); SFX.addGlares();
})();
