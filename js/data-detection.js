/* Shield Force — content data: detection lab
   Split per page so each page downloads only what it renders. */
(function () {
  "use strict";
  const SF = (window.SF = window.SF || {});

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

  SF.signs = signs; SF.labExamples = labExamples;

})();
