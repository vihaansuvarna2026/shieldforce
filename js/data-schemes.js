/* Shield Force — content data: defence financial schemes
   Split per page so each page downloads only what it renders. */
(function () {
  "use strict";
  const SF = (window.SF = window.SF || {});

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

  SF.schemes = schemes;
  SF.schemeById = (id) => schemes.find(s => s.id === id);

})();
