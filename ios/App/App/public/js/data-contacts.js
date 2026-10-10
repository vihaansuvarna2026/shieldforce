/* Shield Force — content data: emergency contacts & steps
   Split per page so each page downloads only what it renders. */
(function () {
  "use strict";
  const SF = (window.SF = window.SF || {});

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

  SF.contacts = contacts; SF.goldenSteps = goldenSteps;

})();
