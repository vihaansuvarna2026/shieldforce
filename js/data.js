/* ============================================================
   SHIELD FORCE — content database
   All awareness content, quiz banks, map feeds and contacts.
   Incident feeds are simulated for training purposes.
   ============================================================ */
window.SF = (function () {
  "use strict";

  /* ---------------- SCAM INTEL (page 2 + detail) ---------------- */
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
  const schemes = [
    {
      id: "agif", abbr: "AGIF", name: "Army Group Insurance Fund",
      category: "Insurance",
      tagline: "Compulsory life insurance cover for all ranks with disability and survivor benefits.",
      benefits: [
        "High-value life cover for serving personnel at low group premiums deducted from pay.",
        "Disability cover for invalidment from service, plus maturity benefit on retirement.",
        "Extended insurance cover options after retirement for a defined period.",
        "House building and other loans to members at competitive rates."
      ],
      who: ["All serving Army personnel", "Families / nominees of the insured", "Retiring personnel (maturity benefit)"],
      risks: [
        "Fraud calls offering to 'update AGIF nominee online' to harvest OTPs and bank details.",
        "Fake 'AGIF bonus released — pay processing fee' messages to retirees.",
        "Bogus agents 'topping up' AGIF cover for cash — AGIF has no door-to-door or WhatsApp agents.",
        "Verify everything only via official AGIF channels and your record office."
      ]
    },
    {
      id: "dsop", abbr: "DSOP", name: "Defence Services Officers' / Personnel Provident Fund",
      category: "Savings",
      tagline: "The soldier's compounding engine — a government-backed provident fund on defence pay.",
      benefits: [
        "Government-guaranteed interest, compounded annually, free of market risk.",
        "Convenient subscriptions straight from monthly pay with flexible top-ups.",
        "Withdrawals/advances permitted for education, marriage, housing and medical needs.",
        "Tax benefits on contributions and exempt interest under prevailing rules."
      ],
      who: ["Serving officers and jawans", "Families relying on the retirement corpus"],
      risks: [
        "Ponzi pitches specifically target DSOP withdrawals ('double your DSOP in 90 days').",
        "Fraud 'financial advisors' circulate fake DSOP withdrawal forms to capture signatures and account data.",
        "Nobody outside the pay office needs your DSOP details — treat callers asking for balances as hostile.",
        "Route every withdrawal through your unit accounts section / PCDA(O) only."
      ]
    },
    {
      id: "sparsh", abbr: "SPARSH", name: "System for Pension Administration (Raksha)",
      category: "Pension",
      tagline: "Direct-credit digital pension system for defence pensioners and family pensioners.",
      benefits: [
        "Pension credited directly by PCDA without bank intermediaries — fewer delays.",
        "Self-service portal for pensioner data, PPO download and grievances.",
        "Annual identification possible digitally (Jeevan Pramaan) or at service centres (CSCs/DPDOs).",
        "Transparent entitlement and arrears computation visible to the pensioner."
      ],
      who: ["Defence pensioners", "Family pensioners / veer naris", "Next of kin managing elderly pensioners"],
      risks: [
        "The single most impersonated scheme: fake 'SPARSH officers' demand OTPs to 'prevent pension blockage'.",
        "Phishing links mimicking sparsh.defencepension.gov.in harvest login credentials.",
        "'Life certificate agents' on WhatsApp are fraud — use Jeevan Pramaan, banks or CSCs only.",
        "SPARSH never calls for OTPs, fees or account 'verification' — hang up and call your record office."
      ]
    },
    {
      id: "echs", abbr: "ECHS", name: "Ex-Servicemen Contributory Health Scheme",
      category: "Healthcare",
      tagline: "Cashless, comprehensive healthcare for ex-servicemen and dependents via polyclinics.",
      benefits: [
        "Cashless treatment at ECHS polyclinics and vast network of empanelled hospitals.",
        "Covers spouse and eligible dependents including dependent parents in defined cases.",
        "One-time contribution at retirement; no recurring premium thereafter.",
        "Medicines, diagnostics and specialist referrals through the polyclinic system."
      ],
      who: ["Ex-servicemen with pension", "Spouses and eligible dependents", "War widows / veer naris"],
      risks: [
        "Fake 'ECHS card renewal' calls collecting fees via UPI — card services are done at polyclinics/station HQ.",
        "Fraud 'empanelled hospital helpdesks' demanding online deposits before admission.",
        "Data phished from fake 'ECHS 64kb card upgrade' forms is reused for banking fraud.",
        "Pay nothing online for ECHS services except through official channels — when in doubt, ask the polyclinic OIC."
      ]
    },
    {
      id: "afbcwf", abbr: "AFBCWF", name: "Armed Forces Battle Casualties Welfare Fund",
      category: "Welfare",
      tagline: "Government fund giving financial assistance to battle casualties and their families.",
      benefits: [
        "Monetary grants to families of fatal battle casualties and to the severely disabled.",
        "Complements liberalised family pension, insurance and ex-gratia — not a replacement.",
        "Accepts voluntary citizen contributions through the official government portal.",
        "Administered by the Ministry of Defence with published, auditable channels."
      ],
      who: ["Families of battle casualties", "Severely disabled battle casualties", "Citizens who wish to contribute safely"],
      risks: [
        "The most abused NAME in charity fraud: fake pages collect 'martyr donations' into private UPI handles.",
        "Genuine contributions go only via the official MoD channel — never to name@bank UPI IDs.",
        "Families are sometimes charged 'file processing fees' by frauds to 'release' grants — grants are free.",
        "Verify every appeal with your Zila Sainik Welfare Office before donating."
      ]
    },
    {
      id: "pmss", abbr: "PMSS", name: "Prime Minister's Scholarship Scheme",
      category: "Education",
      tagline: "Scholarships for children and widows of ex-servicemen for professional education.",
      benefits: [
        "Monthly scholarship for professional degree courses (engineering, medical, management etc.).",
        "Separate, higher rates for girl students; wide course eligibility.",
        "Application through the Kendriya Sainik Board / ksb.gov.in portal.",
        "Direct benefit transfer to the student's bank account."
      ],
      who: ["Children of ex-servicemen / ex-Coast Guard", "Widows of ex-servicemen", "Wards of battle casualties (priority)"],
      risks: [
        "Fake 'scholarship facilitation agents' charge fees to file applications that are free on ksb.gov.in.",
        "Phishing mails announce 'PMSS selection — pay refundable caution deposit'.",
        "Portals mimicking KSB harvest student Aadhaar and bank data.",
        "KSB never asks for fees, OTPs or 'verification transfers' — applications are free and online."
      ]
    },
    {
      id: "awwa", abbr: "AWWA", name: "Army Wives Welfare Association",
      category: "Family Welfare",
      tagline: "Welfare, skilling and support network for army families, widows and differently-abled dependents.",
      benefits: [
        "Welfare and financial assistance programmes for widows and dependents.",
        "Skill development, education support and empowerment initiatives for spouses.",
        "Support infrastructure at stations: creches, family counselling, emergency assistance.",
        "Works alongside unit Family Welfare Organisations for outreach."
      ],
      who: ["Army spouses and families", "Veer naris and widows", "Differently-abled dependents"],
      risks: [
        "Fake 'AWWA membership renewal' QR codes circulated to families on WhatsApp.",
        "Fraud 'AWWA fund collections' after news events — AWWA does not crowd-fund via personal UPI.",
        "Imposters use AWWA's name to phish family details from newly posted-in spouses.",
        "Confirm any AWWA communication with your station's FWO before paying or sharing data."
      ]
    },
    {
      id: "csd", abbr: "CSD", name: "Canteen Stores Department Facilities",
      category: "Entitlement",
      tagline: "Subsidised goods for serving personnel, veterans and families through unit-run canteens.",
      benefits: [
        "Household goods, vehicles (via AFD portal) and consumables at concessional rates.",
        "Smart-card based entitlements for serving and retired personnel.",
        "Official AFD-CSD online portal (afd.csdindia.gov.in) for big-ticket items.",
        "Nationwide canteen network accessible on posting and after retirement."
      ],
      who: ["Serving personnel", "Ex-servicemen and their families", "Eligible defence civilians"],
      risks: [
        "'CSD quota for sale' on Facebook/WhatsApp is 100% fraud — entitlements are non-transferable.",
        "Fake AFD portals with lookalike URLs take 'booking deposits' for cars and bikes.",
        "Fraudsters posing as 'canteen managers' offer out-of-turn liquor/car quotas for advance fees.",
        "Use only afd.csdindia.gov.in typed by yourself, and pay only through the portal's own gateway."
      ]
    }
  ];

  /* ---------------- SEVEN SIGNS (page 6) ---------------- */
  const signs = [
    { t: "Manufactured urgency", d: "Deadlines in minutes or hours — 'account blocks today', 'offer expires now'. Real institutions give written notice and time." },
    { t: "Secrecy demands", d: "'Don't tell your bank/family/unit.' Isolation is a control tactic; genuine officials never forbid you from consulting others." },
    { t: "OTP / PIN / password requests", d: "No bank, army office, telecom company or portal ever needs your OTP, UPI PIN, CVV or password. This single sign settles it." },
    { t: "Pay to receive money", d: "Any flow where you must scan a QR, enter a PIN, or pay a 'fee' to RECEIVE funds is inverted — receiving never costs money." },
    { t: "Unverifiable identity", d: "Uniform photos, ID cards and letterheads on WhatsApp are props. Verification means calling official numbers YOU look up." },
    { t: "Too good to be true", d: "Guaranteed returns, 40% off canteen cars, lottery wins you never entered — pricing that beats the market exists to beat you." },
    { t: "Channel switching & links", d: "Being pushed from an app's chat to WhatsApp/Telegram, or sent shortened links and APK files, moves you where protections can't follow." }
  ];

  /* ---------------- DETECTION LAB examples (page 6) ---------------- */
  const labExamples = [
    {
      id: "sms-kyc", label: "Bank KYC SMS", from: "VM-KYCBNK",
      parts: [
        "Dear customer, your ", { t: "SBI YONO account will be BLOCKED in 24 hours", k: "urgency", why: "Manufactured deadline designed to cause panic-clicking. Banks send written notice and never block accounts over KYC by SMS." },
        ". Please update your PAN/KYC immediately by clicking ", { t: "http://sbi-kyc-update.xyz/verify", k: "link", why: "Non-bank domain (.xyz) impersonating SBI. Real bank links use the bank's own domain; better, type the address yourself." },
        " and confirm with the ", { t: "OTP you receive", k: "otp", why: "The OTP they ask you to 'confirm' is the transaction OTP authorising THEIR transfer from your account." },
        ". Failure will lead to ", { t: "permanent account suspension", k: "threat", why: "Escalating threat language. Institutions cite rules and give grievance channels; scripts threaten." }, "."
      ]
    },
    {
      id: "upi-buyer", label: "Army buyer on OLX", from: "+91 9x-xxxx-x1x2 (WhatsApp)",
      parts: [
        "Good morning sir. I am ", { t: "Major Vikram Rathore, 14 Rajput", k: "identity", why: "Unverifiable rank-and-unit identity — the classic trust prop. Real buyers don't need to flash rank to buy a sofa." },
        ", currently ", { t: "posted at border area so cannot come to meet", k: "meet", why: "Refusal to meet or inspect is the setup for online-payment tricks. Genuine buyers see the item first." },
        ". I will pay full amount now itself, no bargaining. Just ", { t: "scan this QR code and enter your UPI PIN", k: "qr", why: "Scanning a QR and entering a PIN sends money OUT of your account. Receiving money never needs a PIN — this is the theft moment." },
        " to receive advance. Do it fast, ", { t: "my duty starting in 10 minutes", k: "urgency", why: "The rush exists so you act before thinking or consulting anyone." }, "."
      ]
    },
    {
      id: "pension-call", label: "SPARSH 'officer' call script", from: "Caller claiming PCDA / SPARSH desk",
      parts: [
        "“I am calling from ", { t: "SPARSH pension cell, Allahabad office", k: "identity", why: "Institution name-dropping with real office locations. SPARSH/PCDA do not make outbound verification calls." },
        ". Your ", { t: "life certificate has failed and pension stops tonight", k: "urgency", why: "Fear of losing pension is the lever. Life certificate issues never cut pension the same day, and are fixed via official channels." },
        ". To keep it active, tell me the ", { t: "OTP that has just come on your mobile", k: "otp", why: "That OTP is authorising a transaction or SIM change. Reading it aloud hands over the account." },
        ", or pay a ", { t: "₹499 reactivation fee on this UPI number", k: "fee", why: "Government processes never charge 'reactivation fees' over UPI to personal numbers." }, ".”"
      ]
    }
  ];

  /* ---------------- FRAUD ANATOMY (page 5) ---------------- */
  const anatomy = [
    { icon: "🎯", phase: "Phase 1", t: "Target Selection", d: "Fraud networks buy or scrape data — pensioner lists, resale-app listings, social media posts revealing rank, unit and family events. Defence households are prized: predictable pay dates, postings that separate families, and a culture of trusting the fauj vocabulary.", shield: "Minimise your data shadow: no rank/unit/posting details on public profiles; watermark every ID copy you share." },
    { icon: "📞", phase: "Phase 2", t: "First Contact", d: "A call, SMS, WhatsApp or app chat opens with either fear (blocked account, police case) or reward (buyer at full price, arrears, lottery). The script is tested on thousands; the opening line is engineered to make you respond, not think.", shield: "Unknown number + money topic = end the conversation. Verify independently on official numbers you look up yourself." },
    { icon: "🤝", phase: "Phase 3", t: "Trust Engineering", d: "Props arrive: uniform photos, ID cards, letterheads, office background noise, your own leaked details read back to you ('your PPO number is...'). Authority, urgency and emotion are stacked until doubt feels rude.", shield: "Props are not proof. Knowing your data proves a leak, not legitimacy. Real officials welcome verification; scripts resist it." },
    { icon: "🪝", phase: "Phase 4", t: "The Hook", d: "The action request lands: share the OTP, scan the QR, install the app, pay the small 'fee'. It is deliberately small or 'refundable' — the point is to get the first compliance, which makes the second ask easier.", shield: "The hook always violates one rule: OTP/PIN out, QR-to-receive, fee-to-get-money, APK installs. One violation = fraud, full stop." },
    { icon: "💸", phase: "Phase 5", t: "Extraction & Escalation", d: "Money moves in minutes through layered mule accounts and crypto. 'Failed transactions', new 'taxes' and 'clearance fees' extract more. Victims are kept on the line so they can't consult anyone or call 1930.", shield: "The moment money leaves: disconnect, call 1930 inside the Golden Window, then bank + cybercrime.gov.in. Every minute matters." },
    { icon: "🌫️", phase: "Phase 6", t: "Vanish & Re-target", d: "SIMs die, handles rotate, pages vanish. Victim data is resold — including to 'recovery agents' who charge fees to recover the lost money and defraud victims a second time. Unreported cases keep the machinery invisible.", shield: "Report even attempts on cybercrime.gov.in. Never pay 'recovery agents'. Reporting is intelligence that protects the next family." }
  ];

  /* ---------------- QUIZ MODULES (page 8) ---------------- */
  const modules = [
    {
      id: "upi", icon: "📲", title: "UPI & QR Fraud Defence",
      desc: "Payment reversal tricks, collect requests and the QR trap on resale apps.",
      intel: "fake-upi",
      questions: [
        { q: "A buyer on OLX sends you a QR code and says 'scan it and enter your UPI PIN to receive the advance payment'. What is true?", o: ["Scanning + PIN will credit the advance to my account", "Receiving money never requires scanning a QR or entering a PIN", "It's safe if his profile photo shows an army uniform", "It's safe for amounts under ₹2,000"], a: 1, e: "A UPI PIN authorises money going OUT of your account. There is no flow in which receiving money needs your PIN — this single rule defeats the entire QR reversal scam." },
        { q: "You receive a UPI 'collect request' of ₹8,500 from 'CSD-REFUND@ybl'. You never asked for a refund. You should:", o: ["Approve it — refunds are credited this way", "Decline it and report the handle in your UPI app", "Approve but change your PIN afterwards", "Forward it to friends to check"], a: 1, e: "Approving a collect request PAYS the requester. Refunds arrive as credits without any approval or PIN. Decline, report the handle, and block." },
        { q: "The 'army officer' buyer says the first transfer failed and asks you to scan again 'to reverse it'. This pattern means:", o: ["A genuine network error", "The bank needs three attempts to settle", "Each scan is a fresh debit — it is the core of the scam", "UPI daily limits were hit"], a: 2, e: "The 'failed transaction, try again' line is scripted. Every repeat scan with PIN is another successful debit from your account." },
        { q: "The safest way to receive payment from an online buyer is:", o: ["Share your UPI QR/ID and wait for credit to appear in YOUR bank app", "Scan whatever QR the buyer sends", "Share OTP so the buyer can 'push' money", "Accept a payment screenshot as confirmation"], a: 0, e: "Give your UPI ID or QR and verify the credit inside your own banking app. Screenshots are trivially faked; OTPs and scanning their QR move money the wrong way." },
        { q: "Money just left your account in a QR scam. Your FIRST call should be to:", o: ["The buyer, demanding a reversal", "1930 — the national cyber fraud helpline", "Your relative who works in a bank", "The resale app's customer care"], a: 1, e: "1930 triggers the Citizen Financial Cyber Fraud Reporting System which can freeze funds while they are still in transit — that's why the first 60 minutes are the Golden Window." }
      ]
    },
    {
      id: "phishing", icon: "🔐", title: "OTP, KYC & Link Phishing",
      desc: "Fake KYC alerts, cloned portals, malicious APKs and SIM-swap attacks.",
      intel: "otp-phishing",
      questions: [
        { q: "An SMS says your bank KYC expires TODAY with a link to update. The genuinely safe action is:", o: ["Click the link but only fill non-financial fields", "Ignore links; open the bank's app or type its website yourself, or visit the branch", "Call the number in the SMS to confirm first", "Forward the link to family to check"], a: 1, e: "Never navigate from the message. Reaching your bank via its official app, a self-typed URL, or the branch bypasses every cloned page the scammer can build." },
        { q: "Which of these will your bank, SPARSH or telecom provider legitimately ask for on a call?", o: ["The OTP just sent to you", "Your UPI PIN 'for verification'", "Your net-banking password", "None of these — ever"], a: 3, e: "No legitimate institution asks for OTPs, PINs or passwords on any channel. The request itself is a complete fraud diagnosis." },
        { q: "A WhatsApp message offers an APK file: 'SBI-KYC-Update.apk'. Installing it would likely:", o: ["Update your KYC", "Give attackers access to your SMS (and thus OTPs)", "Only work on rooted phones", "Be blocked automatically by UPI apps"], a: 1, e: "Malicious APKs request SMS permissions to intercept OTPs, letting fraudsters complete transfers silently. Banks never distribute apps over chat." },
        { q: "Your phone suddenly shows 'No Service' for hours, and you weren't expecting it. In a fraud context this can indicate:", o: ["Normal tower maintenance, ignore it", "A possible SIM swap — contact your operator AND bank immediately", "Your phone needs a restart, nothing more", "Airplane mode toggled itself"], a: 1, e: "In a SIM-swap attack your number moves to the fraudster's SIM, and OTPs follow it. Rapid reporting to operator and bank can stop transfers." },
        { q: "The safest structure for a defence family's accounts is:", o: ["All money in one account for simplicity", "Salary/pension isolated; a separate small-balance account linked to UPI", "UPI linked to the pension account for convenience", "Sharing one UPI PIN across the family"], a: 1, e: "Compartmentalisation limits damage: if the UPI-linked account is compromised, the exposure is the small balance, not the salary or pension corpus." }
      ]
    },
    {
      id: "investment", icon: "📈", title: "Investment & Ponzi Awareness",
      desc: "Guaranteed-return apps, crypto 'mentors' and DSOP-targeting schemes.",
      intel: "investment",
      questions: [
        { q: "A Telegram 'mentor' offers 3% guaranteed DAILY returns on a trading app. 3% daily compounds to roughly:", o: ["About 36% a year — plausible", "About 3x a year — aggressive but possible", "Over 4,000,000% a year — mathematically a fraud", "Depends on the market"], a: 2, e: "(1.03)^365 ≈ 48,000x. Any 'guaranteed daily percentage' is arithmetic proof of a Ponzi — real markets cannot and do not pay this." },
        { q: "Your first small deposit in a new investment app 'earned' 40% and withdrawal worked. This most likely means:", o: ["The platform is genuine", "You got lucky timing", "It's the classic seeding phase — small payouts funded by other victims to bait a big deposit", "The app has low fees"], a: 2, e: "Letting early small withdrawals succeed is deliberate. It converts scepticism into confidence just before the victim commits serious money." },
        { q: "Before investing through any advisor or platform, the correct verification is:", o: ["Check their Telegram subscriber count", "Check SEBI registration (sebi.gov.in) / RBI lists for the entity", "Ask for profit screenshots", "Try a small amount first"], a: 1, e: "Registration with SEBI/RBI is verifiable in seconds on official sites. Subscriber counts, screenshots and 'test amounts' are all manufactured by the scam itself." },
        { q: "When you try to withdraw, the app demands 18% 'tax' paid separately first. You should:", o: ["Pay it — tax is normal on profits", "Negotiate a lower fee", "Stop paying entirely and report — fees to release your own money are always fraud", "Pay via a friend's account"], a: 2, e: "Real platforms deduct taxes/fees FROM your balance. Demanding fresh money to 'release' funds is the extraction phase — every rupee paid now is also lost." },
        { q: "The safest home for a retirement corpus (DSOP/AGIF maturity) is:", o: ["A crypto staking pool a course-mate vouches for", "Regulated instruments (bank FDs, government schemes, SEBI-regulated funds) after unit financial counselling", "A private 'army welfare investment club'", "An app with a military-themed name"], a: 1, e: "Regulated instruments carry deposit insurance, disclosure rules and legal recourse. Military-flavoured branding is a targeting technique, not a safety signal." }
      ]
    },
    {
      id: "impersonation", icon: "🎖️", title: "Impersonation & Digital Arrest",
      desc: "Fake officers, CSD quota fraud and video-call 'digital arrest' extortion.",
      intel: "impersonation",
      questions: [
        { q: "A Facebook page offers 'CSD quota Innova, 40% off, open to civilians, book with ₹25,000'. What's certain?", o: ["It's a genuine surplus sale", "It's fraud — CSD entitlements are non-transferable and never sold via social media", "It's real if they show a canteen smart card", "It's real if the page has many followers"], a: 1, e: "Canteen entitlements cannot legally be transferred or resold, and CSD/AFD sells vehicles only via its official portal to entitled personnel. Every social-media 'quota sale' is fraud." },
        { q: "A video caller in police uniform says you are under 'digital arrest' and must stay on camera. Under Indian law, digital arrest is:", o: ["A provision of the new criminal codes", "Used only by CBI for cyber offences", "Not a real legal concept at all — the phrase itself proves fraud", "Applicable only with a magistrate's order"], a: 2, e: "No Indian law provides for 'digital arrest'. No agency interrogates or detains people over video calls, and none takes money for 'verification'." },
        { q: "The 'CBI officer' says: transfer your savings to an 'RBI supervised account' to verify they're clean. Real agencies:", o: ["Do this for serious cases", "Use court-monitored accounts this way", "Never ask for money transfers — the demand itself is the crime happening", "Only do it with written notice"], a: 2, e: "No investigation in India involves transferring your money 'for verification'. That sentence is the extraction step of the scam." },
        { q: "The single most effective move when trapped in a digital-arrest call is:", o: ["Negotiate for time", "Demand their badge number", "Disconnect and immediately call a family member, your unit or 1930", "Record the call and keep listening"], a: 2, e: "The scam runs on isolation. Disconnecting breaks the spell; one call to family, unit or 1930 collapses the script instantly." },
        { q: "Someone is using a serving officer's photos to run deals online. Beyond warning contacts, the misuse should be reported to:", o: ["Only the social platform", "The platform, cybercrime.gov.in, and the unit's security/intelligence staff", "Nobody — it fades on its own", "The officer's bank"], a: 1, e: "Platform takedown stops the current page; NCRP creates a legal record; unit security staff can issue advisories protecting the wider community." }
      ]
    },
    {
      id: "pension", icon: "🧓", title: "Pension & Veteran Protection",
      desc: "SPARSH impersonation, arrears bait and life-certificate fraud against veterans.",
      intel: "pension",
      questions: [
        { q: "A caller quotes your exact PPO number and rank, claiming to be from SPARSH. Knowing your data proves:", o: ["He is a genuine PCDA official", "Your data has leaked — nothing more; verification still means calling official numbers yourself", "The call is safe if he doesn't ask for money", "SPARSH outsources verification calls"], a: 1, e: "Pensioner data circulates in fraud markets. Possession of your details establishes a leak, not legitimacy — SPARSH/PCDA make no outbound OTP or fee calls." },
        { q: "The legitimate ways to complete a pensioner's annual life certificate include:", o: ["Sharing OTP with a caller who files it for you", "A WhatsApp 'agent' who charges ₹300", "Jeevan Pramaan (digital), your bank branch, or authorised centres (CSC/DPDO)", "Emailing your Aadhaar and passbook photos"], a: 2, e: "Only official channels exist: Jeevan Pramaan digital certification, the bank, or authorised service centres. Anyone else offering to 'do it for you' remotely is phishing." },
        { q: "'OROP arrears of ₹2.8 lakh sanctioned — pay 2% processing fee to release.' Government arrears:", o: ["Sometimes need small processing fees", "Need fees only above ₹1 lakh", "Are credited directly with no fee, ever — the fee demand is the fraud", "Need fees unless you visit the office"], a: 2, e: "Entitlements are credited to the pension account directly. There is no fee, no UPI payment and no 'release charge' in any government arrears process." },
        { q: "A caller asks an elderly pensioner to install 'AnyDesk' to 'fix SPARSH profile'. That app would:", o: ["Update the profile faster", "Give the caller full remote view/control of the phone — including banking apps", "Work only on computers", "Be safe if deleted afterwards"], a: 1, e: "Screen-sharing tools hand over live control: the fraudster watches PINs being typed and operates banking apps. Legitimate support never requires them." },
        { q: "The best household protocol for pension-related calls is:", o: ["Engage and gather information about the caller", "Hang up; call back only on numbers from PPO/bank documents; involve a family member", "Answer only calls after 6 pm", "Give information but never OTPs"], a: 1, e: "A fixed drill removes in-the-moment judgement: disconnect, redial official numbers yourself, and loop in family. Even partial information (balances, PPO data) fuels the next attack." }
      ]
    },
    {
      id: "welfare", icon: "🤝", title: "Welfare Fund & Charity Fraud",
      desc: "Fake martyr donations, bogus membership renewals and mule-account appeals.",
      intel: "welfare",
      questions: [
        { q: "A viral appeal collects for a martyr's family into UPI ID 'rahulk1987@ybl'. The strongest fraud signal is:", o: ["The emotional language", "A personal name@bank UPI handle collecting institutional charity", "The soldier's photo quality", "The forward count"], a: 1, e: "Genuine funds (NDF, AFBCWF) use institutional government accounts with published details — never an individual's UPI handle. The handle type alone settles it." },
        { q: "The safe destination for contributions to battle casualty families is:", o: ["Any account a WhatsApp forward names", "The official government channel for AFBCWF / National Defence Fund", "A collection drive by an unknown NGO page", "Crypto donations for speed"], a: 1, e: "The Armed Forces Battle Casualties Welfare Fund and National Defence Fund publish official contribution channels on government portals. Everything else needs verification before a rupee moves." },
        { q: "Your spouse gets a WhatsApp QR to 'renew AWWA membership within 24 hours'. Reality check:", o: ["AWWA renews memberships only this way now", "Welfare associations don't demand QR payments on WhatsApp — verify with the station FWO first", "Paying small amounts is harmless", "It's fine if the QR shows the AWWA logo"], a: 1, e: "Logos and letterheads are trivially forged. Any welfare-body payment demand over chat is verified with the Family Welfare Organisation before any payment." },
        { q: "Why do charity fraudsters prefer thousands of small (₹100–₹500) donations?", o: ["Small amounts avoid bank scrutiny and victim suspicion while summing to lakhs", "UPI blocks large transfers", "Small donors don't file complaints", "Tax rules favour small amounts"], a: 0, e: "Micro-donations fly under fraud-monitoring thresholds and feel too small to report — but scaled across a viral forward they total lakhs, moved through mule accounts in hours." },
        { q: "Before forwarding any donation appeal to your contacts, the responsible step is:", o: ["Add a disclaimer and forward", "Verify the fund with official sources / unit welfare officer — an unverified forward makes you the scammer's distributor", "Forward only to family", "Donate a token amount first"], a: 1, e: "Every forward multiplies the fraud's reach with YOUR credibility attached. Verification before amplification is the discipline that starves these campaigns." }
      ]
    }
  ];

  /* ---------------- EMERGENCY (page 10) ---------------- */
  const contacts = [
    { who: "Everyone — first call", name: "National Cyber Crime Helpline", dial: "1930", tel: "1930", desc: "Reports financial cyber fraud to the Citizen Financial Cyber Fraud Reporting & Management System. Can freeze fraudulent transfers while money is still moving between mule accounts.", links: [["Report online", "https://cybercrime.gov.in"]] },
      { who: "Everyone — online filing", name: "National Cyber Crime Reporting Portal", dial: "cybercrime.gov.in", tel: null, desc: "File detailed complaints with evidence (screenshots, UPI IDs, numbers). Track status online. Works for financial fraud, impersonation, sextortion and social-media cases.", links: [["Open portal", "https://cybercrime.gov.in"], ["Track complaint", "https://cybercrime.gov.in"]] },
    { who: "Any emergency", name: "National Emergency Number", dial: "112", tel: "112", desc: "Police, fire and medical emergency. Use when there is a physical threat, ongoing extortion or a vulnerable family member under pressure from callers.", links: [] },
    { who: "Telecom fraud", name: "Sanchar Saathi / Chakshu", dial: "sancharsaathi.gov.in", tel: null, desc: "Report suspected fraud calls/SMS, check SIMs issued against your ID, and block lost handsets — Department of Telecommunications.", links: [["Report suspect calls", "https://sancharsaathi.gov.in"]] },
    { who: "Serving personnel", name: "Unit chain: Adjutant / FWO / Cyber cell", dial: "Unit lines", tel: null, desc: "Inform your Adjutant or unit security staff in parallel with 1930/NCRP — they issue station advisories, support evidence collection and protect others from the same campaign.", links: [] },
    { who: "Veterans & families", name: "Zila / Rajya Sainik Welfare Office", dial: "ZSWO", tel: null, desc: "Guidance for pension fraud, documentation help and welfare-scheme verification. Directory available through the Kendriya Sainik Board.", links: [["KSB portal", "https://ksb.gov.in"]] },
    { who: "Pension issues", name: "SPARSH / PCDA (Pensions)", dial: "Official portal", tel: null, desc: "Verify pension status, PPO and life-certificate issues ONLY on the official portal or through your record office / bank — never through callers.", links: [["SPARSH portal", "https://sparsh.defencepension.gov.in"]] },
    { who: "Banking fraud", name: "Your bank's 24×7 fraud line + RBI", dial: "Bank helpline", tel: null, desc: "Freeze cards/UPI instantly through the number on the back of your card or the bank app. Unresolved complaints escalate to the RBI Ombudsman (cms.rbi.org.in).", links: [["RBI complaints", "https://cms.rbi.org.in"], ["RBI Sachet", "https://sachet.rbi.org.in"]] }
  ];

  const goldenSteps = [
    ["Disconnect & freeze the moment", "Hang up / stop chatting. Do not act on 'one last instruction'. Note the time — the Golden Window has started."],
    ["Call 1930 immediately", "Report the transaction with amount, UPI ID/account, and time. This can hold funds at the next mule account before withdrawal."],
    ["Alert your bank on its official line", "Block cards, freeze UPI, dispute the transaction. Use the app or the number on your card — never a number the fraudster gave."],
    ["File on cybercrime.gov.in", "Upload screenshots, numbers, handles and receipts. Save the acknowledgement number for the bank and police."],
    ["Preserve every scrap of evidence", "Do not delete chats, call logs, SMS or receipts. Photograph QR codes. Evidence drives both recovery and prosecution."],
    ["Inform unit / ZSWO and family", "Parallel-report through your military channel and brief the family so the same script fails on its next attempt."]
  ];

  /* ---------------- REPORTS (page 9) ---------------- */
  const reports = [
    { file: "shieldforce-family-financial-safety.pdf", code: "SF-RPT-01", title: "Family Financial Safety Guide", desc: "Household security drills, the family code word protocol and response steps for spouses, parents and children of serving personnel.", pages: "Guide • A4" },
    { file: "shieldforce-red-flag-checklist.pdf", code: "SF-RPT-02", title: "Quick Red-Flag Checklist", desc: "A print-and-stick one-pager: ten red flags and the 3-line defence. Designed for the fridge, the notice board and the canteen wall.", pages: "Checklist • A4" },
    { file: "shieldforce-qr-scam-warning.pdf", code: "SF-RPT-03", title: "QR Code Scam Warning Notice", desc: "Advisory poster for family welfare meetings explaining the QR/UPI reversal trap and the field rules that defeat it.", pages: "Advisory • A4" },
    { file: "shieldforce-veteran-pension-fraud-alert.pdf", code: "SF-RPT-04", title: "Veteran Pension Fraud Alert", desc: "Active fraud patterns against pensioners and veer naris — SPARSH impersonation, life-certificate phishing and arrears bait — with safe practice rules.", pages: "Alert • A4" },
    { file: "shieldforce-fraud-awareness-summary.pdf", code: "SF-RPT-05", title: "Fraud Awareness Summary", desc: "One-briefing digest of the entire Shield Force programme: threat picture, eight scam families, core defences and the unit-level drill.", pages: "Digest • A4" }
  ];

  /* ---------------- STATS + TICKER (home) ---------------- */
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

  return {
    scams, cities, victims, sources, schemes, signs, labExamples,
    anatomy, modules, contacts, goldenSteps, reports, stats, ticker,
    caseTemplates, mulberry32,
    scamById: (id) => scams.find(s => s.id === id),
    schemeById: (id) => schemes.find(s => s.id === id),
    moduleById: (id) => modules.find(m => m.id === id)
  };
})();
