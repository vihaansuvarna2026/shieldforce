/* Shield Force — content data: scam intel
   Split per page so each page downloads only what it renders. */
(function () {
  "use strict";
  const SF = (window.SF = window.SF || {});

  const scams = [
    {
      id: "fake-upi",
      icon: "📲",
      name: "Fake UPI / QR Reversal Fraud",
      tagline: "“Scan this QR to receive your advance, sir.” Money never arrives — it leaves.",
      severity: "Critical",
      module: "upi",
      how: [
        ["Bait on resale apps", "You list a sofa, bike or car on OLX-type apps. A polite 'Army officer under posting' agrees to full price instantly — no bargaining, no inspection."],
        ["Identity props", "He sends a uniform photo, canteen card or fake Aadhaar to build trust, and claims he can only pay online 'from the unit'."],
        ["The QR switch", "To 'send the advance', he shares a QR code and tells you to scan it and enter your UPI PIN to receive money."],
        ["The drain", "Scanning + PIN authorises a payment OUT of your account. He claims it 'failed' and makes you repeat it with bigger amounts."],
        ["Vanish & recycle", "Numbers are switched off, profiles deleted; the same script is re-run on the next family from a new SIM."]
      ],
      cases: [
        { title: "Retired JCO loses savings selling furniture", meta: "Pune, Maharashtra • NCRP case pattern", text: "A retired JCO listed household furniture online before relocating. A 'Major on posting' sent an advance-payment QR. Over four scans the account was drained before the bank could be reached.", loss: "₹1.9 lakh" },
        { title: "Officer's spouse targeted during move", meta: "Ambala Cantt, Haryana • Cyber cell advisory", text: "During a posting move, a spouse selling a refrigerator was pushed through three 'failed' QR verifications, each debiting her account. The 1930 call within 40 minutes helped freeze part of the amount.", loss: "₹62,000 (partially recovered)" }
      ],
      protect: [
        "Receiving money NEVER needs a QR scan or UPI PIN — a PIN only authorises outgoing payments.",
        "Treat every 'army buyer who can't meet' as fraud. Genuine buyers inspect goods in person.",
        "Never accept payment screenshots as proof — verify credit in your own bank app.",
        "Decline unknown 'collect requests' in UPI apps; report the profile in-app and on cybercrime.gov.in.",
        "If drained: call 1930 inside the Golden Window (first 60 minutes)."
      ]
    },
    {
      id: "otp-phishing",
      icon: "🔐",
      name: "OTP, KYC & SIM-Swap Phishing",
      tagline: "“Your SPARSH / bank KYC expires today” — one OTP and the account is theirs.",
      severity: "Critical",
      module: "phishing",
      how: [
        ["Alarm SMS or call", "A message warns that your bank account, SIM or SPARSH pension profile 'will be blocked today' unless you verify KYC immediately."],
        ["Fake portal or APK", "The link opens a cloned bank/SPARSH page or asks you to install an APK 'update' that silently reads your SMS."],
        ["Credential harvest", "You enter your account number, PAN, Aadhaar and net-banking password on the fake page."],
        ["The OTP ask", "A 'verification OTP' arrives — it is actually the transaction OTP for a transfer or SIM swap the fraudster just initiated."],
        ["Account takeover", "With OTP or a swapped SIM, they empty the account and often take instant loans in your name."]
      ],
      cases: [
        { title: "Sepoy's salary account emptied via fake KYC link", meta: "Jhansi, Uttar Pradesh • Bank fraud cell pattern", text: "An SMS about 'PNB KYC suspension' led to a cloned page. The soldier entered credentials and one OTP; three transfers followed in six minutes while he was on duty.", loss: "₹84,000" },
        { title: "Veteran's SIM swapped after 'Jio verification' call", meta: "Kochi, Kerala • TRAI advisory pattern", text: "A caller posing as telecom staff got a veteran to forward an SMS 'to keep the SIM active'. His SIM deactivated that evening; by morning the pension account showed nine debits.", loss: "₹3.2 lakh" }
      ],
      protect: [
        "Banks, SPARSH, telecom operators and record offices never ask for OTP/PIN/passwords — ever.",
        "Type portal addresses yourself (e.g. sparsh.defencepension.gov.in). Never open KYC links from SMS/WhatsApp.",
        "Never install APK files sent on chat apps; use only official app stores.",
        "Sudden 'No Service' on your SIM? Contact your operator and bank immediately — possible SIM swap.",
        "Use a separate low-balance account for UPI; keep salary/pension accounts unlinked."
      ]
    },
    {
      id: "investment",
      icon: "📈",
      name: "Investment & Crypto Ponzi Pitches",
      tagline: "“Double your DSOP in 90 days” — guaranteed returns are guaranteed fraud.",
      severity: "High",
      module: "investment",
      how: [
        ["Warm entry", "A 'fauji brother', course-mate group forward or Telegram tipster shares screenshots of huge profits from a trading or crypto app."],
        ["Small win hook", "Your first small deposit 'earns' quickly and withdrawals work — this seed money is paid from other victims."],
        ["Escalation", "You are coached to invest DSOP withdrawals, retirement corpus or loans. A fake dashboard shows soaring profits."],
        ["The freeze", "When you try to withdraw, 'tax', 'processing fee' or 'account upgrade' payments are demanded — each one is lost too."],
        ["Collapse", "The app/site disappears with the corpus; groups dissolve; handlers reappear later with a 'recovery agent' scam."]
      ],
      cases: [
        { title: "Havildar invests retirement corpus in fake forex app", meta: "Secunderabad, Telangana • EOW case pattern", text: "Six months from retirement, a havildar moved his savings into a 'military friendly' forex app recommended in a veterans' group. The dashboard showed 240% growth until withdrawal day.", loss: "₹11 lakh" },
        { title: "Unit WhatsApp group seeded with crypto 'mentor'", meta: "Jodhpur, Rajasthan • Cyber PS pattern", text: "A mentor added to a station WhatsApp group signed up nine families for a staking scheme with 3% daily returns. Payouts stopped in week five.", loss: "₹23 lakh (combined)" }
      ],
      protect: [
        "No legitimate scheme guarantees fixed high returns. SEBI-registered products never promise 'daily profit'.",
        "Check any advisor at sebi.gov.in and any NBFC at rbi.org.in before paying a rupee.",
        "Never invest via APKs or links shared in chat groups; screenshots of profit are effortless to fake.",
        "Fees demanded to release your own money are always fraud — stop paying, start reporting.",
        "Keep DSOP/AGIF/retirement corpus in regulated instruments; consult your unit's financial counselling cell."
      ]
    },
    {
      id: "impersonation",
      icon: "🎖️",
      name: "Officer Impersonation & Advance-Fee Deals",
      tagline: "Fake Colonels selling cars, canteen liquor quotas and CSD goods at 'unit rates'.",
      severity: "High",
      module: "impersonation",
      how: [
        ["Stolen identity kit", "Fraudsters lift photos of real officers from social media and build convincing profiles with rank, unit and uniform."],
        ["Unbeatable offer", "They advertise 'CSD-rate' cars, bikes or liquor quotas, or pose as buyers/sellers on resale apps with military discipline in their language."],
        ["Fee ladder", "Token advance, then transport charge, gate pass fee, insurance, 'GST refund deposit' — each payment unlocks a new fee."],
        ["Pressure & props", "Fake gate passes, CSD invoices and ID cards arrive on WhatsApp; calls come from 'the MT office' urging quick payment."],
        ["Ghosting", "After the largest instalment, numbers go dead. Victims hesitate to report because they believed they were buying informally."]
      ],
      cases: [
        { title: "Teacher pays 'Colonel' for canteen car quota", meta: "Lucknow, Uttar Pradesh • Police FIR pattern", text: "A civilian teacher paid five instalments for a 'CSD Innova at 40% off' to a fraudster using a serving officer's photos. The real officer learned of it when police traced his misused identity.", loss: "₹4.6 lakh" },
        { title: "Naik's family pays advance for 'surplus auction' bike", meta: "Guwahati, Assam • Cyber cell pattern", text: "A page advertising 'army auction bikes' collected registration and delivery fees from dozens of families, including a naik's brother.", loss: "₹38,000" }
      ],
      protect: [
        "CSD/canteen facilities are non-transferable and never sold via WhatsApp or Facebook — every such offer is fraud.",
        "The Army never auctions vehicles through social media pages or OLX profiles.",
        "Video-call verification can be spoofed; verify through official unit lines, not numbers the seller gives.",
        "Advance-fee ladders (fee after fee to 'release' goods) are a certain fraud signature — stop at the first fee.",
        "Report identity misuse of serving personnel to unit intelligence staff and cybercrime.gov.in."
      ]
    },
    {
      id: "pension",
      icon: "🧓",
      name: "Pension, Arrears & SPARSH Fraud",
      tagline: "Fake 'record office' calls to veterans and veer naris about blocked pensions.",
      severity: "Critical",
      module: "pension",
      how: [
        ["Data-driven targeting", "Fraudsters use leaked pensioner lists to call veterans by name, rank and PPO number — instant credibility."],
        ["Fear script", "'Your pension stops today unless life certificate / KYC is updated now.' Elderly pensioners panic."],
        ["Remote capture", "Victims are talked into sharing OTPs, installing screen-share apps, or filling bank details on fake SPARSH pages."],
        ["Arrears variant", "'OROP arrears of ₹2.8 lakh sanctioned — pay 2% processing fee to release.' The fee is repeated and raised."],
        ["Silent drain", "Debits are spread across days so the pensioner notices late; embarrassment then delays reporting further."]
      ],
      cases: [
        { title: "Veer nari loses family pension to 'PCDA officer'", meta: "Patna, Bihar • DLSA-reported pattern", text: "A war widow received a call quoting her exact PPO details. Guided through 'verification' on a screen-share app, her family pension account was emptied over two evenings.", loss: "₹2.7 lakh" },
        { title: "Retired Subedar pays fees for phantom OROP arrears", meta: "Bhopal, Madhya Pradesh • Cyber PS pattern", text: "Promised ₹3.1 lakh arrears, he paid 'processing', 'GST' and 'RBI clearance' charges across three weeks before a bank manager intervened.", loss: "₹94,000" }
      ],
      protect: [
        "SPARSH/PCDA/record offices never call for OTPs, fees or bank passwords. Pension release never needs a payment.",
        "Do life certificates only via Jeevan Pramaan, your bank branch, or the SPARSH portal you typed yourself.",
        "Never install AnyDesk/TeamViewer-type apps at a caller's request.",
        "Set a family rule: any pension call = hang up, call back on numbers from your PPO/bank documents.",
        "Check the veteran pension fraud alert in our Reports section and share it in your ex-servicemen league."
      ]
    },
    {
      id: "welfare",
      icon: "🤝",
      name: "Fake Welfare Funds & Martyr Charity Fraud",
      tagline: "Emotional appeals in the name of shaheed families that never reach any family.",
      severity: "High",
      module: "welfare",
      how: [
        ["Emotional trigger", "After any incident in the news, fake pages appear collecting for 'martyr's daughter's education' or 'army welfare fund'."],
        ["Borrowed legitimacy", "They use real photos, tricolour branding, and names like 'Indian Army Welfare Trust' with UPI handles of private individuals."],
        ["Urgency & virality", "Donation appeals ride WhatsApp forwards; small amounts (₹100–₹500) from thousands of donors avoid suspicion."],
        ["Family-targeted variant", "Serving families are told their own welfare-fund 'membership lapsed' and renewal fees are due via UPI."],
        ["Disappearance", "Handles rotate every few weeks; money moves through mule accounts within hours."]
      ],
      cases: [
        { title: "Viral appeal for 'martyr's medical fund' traced to private mule account", meta: "New Delhi • I4C takedown pattern", text: "A widely forwarded appeal with a soldier's photo collected lakhs in micro-donations. The UPI handle belonged to a rented mule account; none of it reached any defence family.", loss: "₹17 lakh (crowd-sourced)" },
        { title: "Families billed for fake 'AWWA membership renewal'", meta: "Jalandhar, Punjab • Station advisory pattern", text: "Spouses received messages that their welfare association membership had lapsed, with a QR for renewal. Several paid before the station issued a denial.", loss: "₹1,200–₹5,000 per family" }
      ],
      protect: [
        "Donate only via official channels: the National Defence Fund and Armed Forces Battle Casualties Welfare Fund have government-published account details (kar sewa via ndf.gov.in / Ministry of Defence).",
        "Personal UPI IDs (name@bank) collecting 'welfare funds' are fraud — genuine funds use institutional accounts.",
        "Welfare associations never demand renewal via WhatsApp QR codes.",
        "Verify appeals with your unit's welfare officer before donating or forwarding.",
        "Report fake pages to the platform and on cybercrime.gov.in — takedowns stop the next thousand donors."
      ]
    },
    {
      id: "loan-identity",
      icon: "🪪",
      name: "Loan App Traps & Identity Theft",
      tagline: "Leaked ID documents become instant loans, extortion and harassment.",
      severity: "High",
      module: "phishing",
      how: [
        ["Document leakage", "ID copies given for SIMs, rentals or 'canteen offers' — or harvested by fake KYC apps — circulate in fraud markets."],
        ["Instant loan abuse", "Fraudsters take app-based loans in your name, or approve tiny loans TO you that balloon with hidden fees."],
        ["Permission hijack", "Predatory loan APKs read your contacts and gallery on install."],
        ["Extortion phase", "Recovery agents morph photos and threaten to shame you before your unit, family and contact list."],
        ["Credit wreckage", "Unpaid fraudulent loans surface years later as CIBIL defaults against your name."]
      ],
      cases: [
        { title: "Sepoy harassed over loan he never took", meta: "Meerut, Uttar Pradesh • Cyber PS pattern", text: "After his ID was misused, recovery agents began calling a sepoy's contacts with morphed images. The unit's cyber cell helped file NCRP and platform complaints.", loss: "Reputational + ₹15,000 extorted" },
        { title: "Instant-loan APK drains contacts of a defence family", meta: "Nagpur, Maharashtra • RBI advisory pattern", text: "A ₹3,000 'instant loan' app charged ₹9,400 'repayment' in a week and then threatened the family using stolen gallery photos.", loss: "₹9,400 + extortion attempts" }
      ],
      protect: [
        "Share ID copies only with 'For [purpose], [date]' written across them; never send originals on chat apps.",
        "Use only RBI-regulated lenders; check the RBI 'sachet' portal for registered entities.",
        "Never grant contacts/gallery permission to loan apps.",
        "Check your credit report (CIBIL/Experian) twice a year for loans you never took.",
        "Being blackmailed? Do not pay. Preserve evidence, report on cybercrime.gov.in and to unit security staff."
      ]
    },
    {
      id: "digital-arrest",
      icon: "🚨",
      name: "Digital Arrest & Fake Police Extortion",
      tagline: "Video calls from fake 'CBI officers': you are under digital arrest — stay on camera and pay.",
      severity: "Critical",
      module: "impersonation",
      how: [
        ["Fear opening", "A call claims your Aadhaar/parcel/bank account is linked to money-laundering or a drug parcel; the call 'transfers' to police or CBI."],
        ["Uniformed video call", "A fake officer in uniform, with station backdrop and forged ID, conducts an 'interrogation' on video."],
        ["Isolation order", "You are told you are under 'digital arrest': stay on camera, tell no one, don't disconnect — for hours or days."],
        ["Verification transfer", "To 'verify your funds are clean', you must transfer savings to a 'supervised RBI account' — money goes straight to mules."],
        ["Repeat squeeze", "More 'charges' surface until the victim breaks or funds end. Elderly parents of serving personnel are prime targets."]
      ],
      cases: [
        { title: "Serving officer's parents held on video for nine hours", meta: "Dehradun, Uttarakhand • I4C alert pattern", text: "Told their son's Aadhaar was linked to a laundering case, elderly parents transferred fixed deposits to 'safe custody' while kept on camera and forbidden from calling him.", loss: "₹28 lakh" },
        { title: "Nursing officer intimidated with fake CBI warrant", meta: "Bengaluru, Karnataka • Cyber PS pattern", text: "A forged 'CBI arrest warrant' PDF and a video interrogation pushed her to pay 'bail bond security' before a colleague intervened.", loss: "₹3.5 lakh" }
      ],
      protect: [
        "'Digital arrest' does not exist in Indian law. No agency arrests, interrogates or takes custody over video calls.",
        "Police/CBI/ED/customs never demand money transfers for 'verification' — that sentence alone confirms fraud.",
        "Break the isolation: hang up and call a family member, your unit, or 1930. Scripts collapse when you disconnect.",
        "Real notices arrive in writing and can be verified at the nearest police station.",
        "Brief elderly parents specifically — they are the primary targets of this scam."
      ]
    }
  ];

  /* ---------------- MAP: cities with SVG coordinates ---------------- */
  /* Coordinates map to the 620x700 viewBox of the India SVG on threat-map.html */

  SF.scams = scams;
  SF.scamById = (id) => scams.find(s => s.id === id);
  // titles only, kept in sync with data-modules.js — lets scam pages link to a
  // module by name without pulling in the whole quiz bank
  SF.moduleTitle = (id) => ({
    upi: "UPI & QR Fraud Defence",
    phishing: "OTP, KYC & Link Phishing",
    investment: "Investment & Ponzi Awareness",
    impersonation: "Impersonation & Digital Arrest",
    pension: "Pension & Veteran Protection",
    welfare: "Welfare Fund & Charity Fraud"
  }[id] || "Training");

})();
