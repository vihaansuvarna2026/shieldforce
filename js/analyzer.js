/* Shield Force — heuristic fraud message scanner (fully on-device) */
(function () {
  "use strict";

  const EXEMPLARS = {
    upi: `Good morning sir. I am Major Vikram Rathore from 14 Rajput Rifles, currently posted at forward area so cannot come to meet you. I want to buy your sofa set at full price, no bargaining. I am sending advance through army payment system. Just scan this QR code and enter your UPI PIN to receive Rs 15,000 advance. Please do fast, my duty is starting in 10 minutes. Jai Hind.`,
    invest: `🚀 FAUJI WEALTH CLUB 🚀 Exclusive for defence brothers! Our SEBI-expert mentor is giving GUARANTEED 3% DAILY returns on defence-friendly crypto staking. Turn your DSOP withdrawal of ₹5 lakh into ₹15 lakh in 90 days — 100% guaranteed, zero risk! Yesterday Hav. Suresh withdrew ₹2.4 lakh profit (screenshot attached). Only 7 slots left, join fast: bit.ly/fauji-wealth. Pay joining amount to mentor UPI: wealthguru77@ybl`,
    welfare: `🙏 URGENT APPEAL 🙏 Brave shaheed Capt. Sharma left behind a 3-year-old daughter. Indian Army Welfare Trust is collecting for her education. Even ₹100 counts! Donate NOW on UPI: rahulk1987@ybl. Government will match every donation TODAY ONLY. Forward to 10 groups, don't let a martyr's family down. Do not verify, just donate from your heart. 🇮🇳`,
    pension: `ALERT: Dear pensioner, your SPARSH life certificate has FAILED verification. Your pension will be permanently BLOCKED tonight at 12 AM. To reactivate immediately, click http://sparsh-pension-update.xyz and confirm the OTP you receive on your mobile, or pay Rs 499 reactivation fee on UPI 9876543210@paytm. Do not share this with anyone, this is a confidential defence matter. — PCDA Pension Cell`,
    arrest: `This is Inspector Raghav Kumar, Mumbai Cyber Crime Branch, CBI referral case no. 337/2026. A parcel with your Aadhaar number contains illegal drugs and 4 passports. You are under DIGITAL ARREST from this moment. Stay on this video call, do not disconnect, do not inform anyone including your family. To verify your funds are not black money, immediately transfer your savings to the RBI supervised account IFSC UTIB0000993 A/c 92110034556677. If you disconnect, arrest warrant will be executed tonight.`,
    safe: `Dear Sir/Madam, this is a reminder from your unit's Family Welfare Organisation that the next fraud-awareness briefing is on Saturday at 1100h in the station auditorium. Families are requested to attend. For queries, contact the FWO office through the exchange. No payment or registration is required.`
  };

  /* signature bank: [regex, weight, flagTitle, explanation] */
  const SIGS = [
    [/\b(otp|one[- ]?time password)\b/i, 30, "OTP request or OTP-centric flow", "No bank, army office, SPARSH or telecom company ever asks for an OTP. An OTP mentioned as something to share/confirm is a decisive fraud marker."],
    [/\b(upi pin|mpin|atm pin|cvv|password)\b/i, 30, "Payment credential harvesting", "PINs, CVVs and passwords authorise outgoing transactions. Any message requesting them is fraud, full stop."],
    [/scan.{0,24}(qr|code)|qr.{0,16}(scan|code)/i, 24, "QR-scan payment flow", "Scanning a QR + entering a PIN sends money OUT. Receiving money never requires scanning anything."],
    [/\b(receive|get|collect).{0,32}(advance|payment|money|amount|refund)/i, 12, "'Receive money' framing", "Framing an outgoing action as 'receiving' payment is the core inversion of UPI reversal fraud."],
    [/\b(urgent|immediately|right now|within \d+ (min|hour)|fast|jaldi|today only|tonight|last chance|expires?)\b/i, 14, "Manufactured urgency", "Deadlines in minutes or hours exist to stop you thinking or consulting anyone. Real institutions give written notice and time."],
    [/\b(blocked?|suspend(ed)?|deactivat|freez|stopped|expire)\b/i, 12, "Threat of blocking / suspension", "'Account blocked today' is a fear lever. Banks and SPARSH never cut services the same day over a message."],
    [/\b(do not (tell|share|inform|disclose)|don'?t tell|confidential|secret|tell no one|do not verify)\b/i, 18, "Secrecy / isolation demand", "Forbidding you from consulting family, bank or unit is a control tactic used in digital-arrest and pension fraud."],
    [/\b(guarantee[d]?|assured|100%|zero risk|risk[- ]free|double your|no risk)\b/i, 18, "Guaranteed returns / zero risk", "Guaranteed profit claims are the arithmetic signature of Ponzi fraud — regulated products never promise this."],
    [/\b(\d+(\.\d+)?%\s*(daily|per day|weekly))\b/i, 20, "Impossible return rate", "Daily/weekly percentage returns compound to absurd annual figures — mathematical proof of a scam."],
    [/\b(lottery|jackpot|prize|winner|lucky draw|selected)\b/i, 16, "Unsolicited prize / lottery", "You cannot win a lottery you never entered. Prize bait exists to extract 'processing fees'."],
    [/\b(processing fee|registration fee|activation fee|reactivation fee|clearance|release fee|caution deposit|joining amount|gst refund|advance fee|court fee|bail)\b/i, 22, "Advance-fee demand", "Paying money to receive money (fees, deposits, charges) is the universal extraction pattern. Entitlements and refunds are always free."],
    [/(https?:\/\/|www\.)[^\s]*\.(xyz|top|club|online|site|buzz|icu|link|info)\b/i, 22, "Suspicious link domain", "Cheap throwaway domains impersonating institutions. Real portals use official government/bank domains — type them yourself."],
    [/\b(bit\.ly|tinyurl|t\.co|goo\.gl|cutt\.ly|rb\.gy)\b/i, 16, "Shortened link", "URL shorteners hide the real destination — a standard phishing wrapper."],
    [/\.apk\b/i, 26, "APK file installation", "Sideloaded APKs can read your SMS and intercept OTPs. Banks and government bodies never distribute apps over chat."],
    [/\b(anydesk|teamviewer|screen ?share|quick ?support)\b/i, 26, "Remote-access app request", "Screen-share tools give callers live control of your phone and visibility of your PINs. Legitimate support never needs them."],
    [/\b(major|colonel|captain|brigadier|jco|havildar|subedar)\b.{0,80}\b(posted|posting|border|forward area|field area|duty)\b/i, 18, "Military identity prop", "Rank-and-posting stories are the classic trust prop of army-impersonation fraud. Real buyers don't flash rank; real officials are verifiable on unit lines."],
    [/\b(cannot (come|meet)|can'?t meet|unable to meet|not able to come)\b/i, 12, "Refuses to meet in person", "Refusal to inspect goods or meet face-to-face sets up the online payment trick."],
    [/\b(army welfare|welfare (fund|trust)|shaheed|martyr|veer nari)\b/i, 12, "Welfare / martyr emotional bait", "Charity fraud borrows the credibility of soldier welfare. Genuine funds use institutional accounts, never personal UPI handles."],
    [/[a-z0-9._]{2,}@(ybl|paytm|okaxis|oksbi|okhdfcbank|okicici|apl|ibl|axl)\b/i, 14, "Personal UPI handle for institutional payment", "Institutions never collect via name@bank personal UPI IDs. A personal handle collecting 'official' money is a mule account."],
    [/\b(digital arrest|video call.{0,30}(police|cbi|interrogat)|stay on (the )?(call|camera|line))\b/i, 30, "'Digital arrest' script", "Digital arrest does not exist in Indian law. No agency detains or interrogates over video calls, and none takes money for 'verification'."],
    [/\b(cbi|police|customs|narcotics|ed|income tax)\b.{0,60}\b(case|warrant|arrest|parcel|laundering|illegal)\b/i, 18, "Law-enforcement intimidation", "Fear of police action is the opening move of extortion scripts. Real notices arrive in writing and are verifiable at a police station."],
    [/\b(rbi (supervised|approved) account|safe custody|verification (transfer|deposit)|transfer (all|your) (savings|funds|money))\b/i, 28, "'Verification transfer' demand", "No investigation involves moving your money anywhere. This demand IS the theft."],
    [/\b(kyc|know your customer)\b/i, 12, "KYC pretext", "'KYC expiry' is the most common phishing pretext in India. KYC is done through your bank's own app/branch, never via links or calls."],
    [/\b(aadhaar|pan card|account number|ifsc)\b.{0,40}\b(send|share|confirm|verify|update)\b/i, 14, "Identity data harvesting", "Collecting ID and account details over chat feeds identity theft and loan fraud."],
    [/\b(sparsh|pension|ppo|life certificate|jeevan pramaan)\b.{0,60}\b(block|stop|fail|expire|verify|update|otp|fee)\b/i, 20, "Pension-system impersonation", "SPARSH/PCDA never call or message for OTPs, fees or 'reactivation'. Pension processes are free and run through official portals."],
    [/\b(csd|canteen)\b.{0,50}\b(quota|discount|sale|offer|booking)\b/i, 16, "CSD quota bait", "Canteen entitlements are non-transferable and never sold through messages or social media."],
    [/\b(forward (this|to)|share (in|to) \d+ group)/i, 10, "Viral forwarding pressure", "Messages engineering their own spread recruit YOU as the scammer's distribution network."],
    [/\b(screenshot|payment proof)\b/i, 8, "Screenshot as payment proof", "Payment screenshots are trivially faked. Only a credit visible in your own bank app is proof."],
    [/\b(only \d+ (slots?|seats?)|limited (slots?|offer|period))\b/i, 10, "Artificial scarcity", "Fake scarcity ('7 slots left') manufactures the same rushed decision as a deadline."]
  ];

  const POSITIVE = [
    [/\b(no payment.{0,30}required|is free|free of (cost|charge))\b/i, "States that no payment is needed"],
    [/\b(through the exchange|official channels|record office|unit|fwo|adjutant)\b/i, "Routes via verifiable official channels"],
    [/\b(do not share (your )?otp|never share)\b/i, "Warns against sharing credentials"]
  ];

  const ta = document.getElementById("ai-text");
  const out = document.getElementById("ai-output");
  const idle = document.getElementById("ai-idle");
  const resultBox = document.getElementById("ai-result");

  document.querySelectorAll(".chip[data-ex]").forEach(btn => {
    btn.addEventListener("click", () => {
      ta.value = EXEMPLARS[btn.dataset.ex];
      ta.focus();
      SFX.toast("Exemplar loaded — hit <b>Run Shield Scan</b>");
    });
  });

  document.getElementById("ai-clear").addEventListener("click", () => {
    ta.value = "";
    out.style.display = "none";
    idle.style.display = "";
    ta.focus();
  });

  document.getElementById("ai-run").addEventListener("click", () => {
    const text = ta.value.trim();
    if (text.length < 12) { SFX.toast("⚠ Paste a message first (at least a sentence)."); return; }
    idle.style.display = "none";
    out.style.display = "none";
    resultBox.classList.add("scanning");
    setTimeout(() => {
      resultBox.classList.remove("scanning");
      render(analyze(text));
    }, 1150);
  });

  function analyze(text) {
    let score = 0;
    const flags = [];
    for (const [re, w, title, why] of SIGS) {
      const m = text.match(re);
      if (m) { score += w; flags.push({ title, why, sample: m[0] }); }
    }
    const good = [];
    for (const [re, note] of POSITIVE) {
      if (re.test(text)) { good.push(note); score -= 6; }
    }
    score = Math.max(2, Math.min(99, score));
    if (flags.length === 0) score = Math.min(score, 12);
    return { score, flags, good };
  }

  function render({ score, flags, good }) {
    const verdict = score >= 60 ? ["FRAUD — DO NOT ENGAGE", "v-danger", "#ff4d5e"]
      : score >= 30 ? ["SUSPICIOUS — VERIFY FIRST", "v-warn", "#ffa53e"]
      : ["NO KNOWN SIGNATURES", "v-safe", "#2ee6a8"];
    const C = 2 * Math.PI * 84;
    out.innerHTML = `
      <div class="gauge-wrap">
        <svg class="gauge" viewBox="0 0 200 130">
          <path class="track" d="M 16 116 A 84 84 0 0 1 184 116" fill="none" stroke-width="14"/>
          <path class="fill" id="g-fill" d="M 16 116 A 84 84 0 0 1 184 116" fill="none" stroke-width="14"
                stroke="${verdict[2]}" stroke-dasharray="${C / 2}" stroke-dashoffset="${C / 2}"/>
          <text x="100" y="98" text-anchor="middle" class="gauge-num" fill="${verdict[2]}" style="font-size:38px;font-weight:900">${score}</text>
          <text x="100" y="120" text-anchor="middle" fill="var(--mut)" style="font-size:11px">RISK SCORE / 100</text>
        </svg>
        <div class="gauge-verdict ${verdict[1]}">${verdict[0]}</div>
      </div>
      <div class="flag-list">
        ${flags.map((f, i) => `
          <div class="flag" style="animation-delay:${0.15 + i * 0.09}s">
            <span class="fi">🚩</span>
            <span><b>${f.title}</b>
            <span>Matched: “${escapeHtml(f.sample.slice(0, 60))}${f.sample.length > 60 ? "…" : ""}” — ${f.why}</span></span>
          </div>`).join("")}
        ${good.map((g, i) => `
          <div class="flag ok" style="animation-delay:${0.15 + (flags.length + i) * 0.09}s">
            <span class="fi">✅</span><span><b>${g}</b></span>
          </div>`).join("")}
        ${flags.length === 0 ? `
          <div class="flag ok"><span class="fi">✅</span>
          <span><b>No known fraud signatures matched</b>
          <span>Stay alert anyway: new scripts appear constantly. Verify sender identity via official channels before acting on any request involving money or data.</span></span></div>` : ""}
      </div>
      ${score >= 30 ? `
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">
          <a class="btn btn-red btn-sm" href="emergency.html">🚨 Emergency protocol</a>
          <a class="btn btn-ghost btn-sm" href="https://cybercrime.gov.in" target="_blank" rel="noopener">Report on cybercrime.gov.in ↗</a>
          <a class="btn btn-ghost btn-sm" href="tel:1930">📞 Call 1930</a>
        </div>` : ""}`;
    out.style.display = "block";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const fill = document.getElementById("g-fill");
      fill.style.strokeDashoffset = String((C / 2) * (1 - score / 100));
    }));
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  SFX.reveal(); SFX.addGlares();
})();
