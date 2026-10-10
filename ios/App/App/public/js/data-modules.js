/* Shield Force — content data: training quiz bank
   Split per page so each page downloads only what it renders. */
(function () {
  "use strict";
  const SF = (window.SF = window.SF || {});

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

  SF.modules = modules;
  SF.moduleById = (id) => modules.find(m => m.id === id);

})();
