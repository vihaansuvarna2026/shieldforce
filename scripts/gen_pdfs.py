#!/usr/bin/env python3
"""Generate Shield Force PDF reports (pure Python, no dependencies).

Produces valid PDF 1.4 files with styled headers, body text, bullets and
footers into assets/reports/.
"""
import os
import zlib

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "reports")

PAGE_W, PAGE_H = 595.28, 841.89  # A4 portrait, points
MARGIN_X = 54
TOP_Y = PAGE_H - 120
BOTTOM_Y = 64

NAVY = (0.035, 0.070, 0.125)
GOLD = (1.0, 0.62, 0.20)
TEAL = (0.18, 0.90, 0.66)
RED = (1.0, 0.30, 0.37)
INK = (0.10, 0.13, 0.18)
MUTE = (0.38, 0.44, 0.52)

CHAR_W = {  # rough Helvetica widths (per 1pt font size)
    'i': 0.222, 'l': 0.222, 'j': 0.222, 't': 0.278, 'f': 0.278, 'r': 0.333,
    'I': 0.278, ' ': 0.278, '.': 0.278, ',': 0.278, ':': 0.278, ';': 0.278,
    'm': 0.833, 'w': 0.722, 'M': 0.833, 'W': 0.944,
}


def text_width(s, size):
    return sum(CHAR_W.get(c, 0.52) for c in s) * size


def wrap(s, size, width):
    words = s.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if text_width(trial, size) <= width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def esc(s):
    return s.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


class Pdf:
    def __init__(self, title, subtitle, accent=GOLD, doc_code="SF-RPT"):
        self.title = title
        self.subtitle = subtitle
        self.accent = accent
        self.doc_code = doc_code
        self.pages = []
        self._new_page()

    # ---- low-level ops -------------------------------------------------
    def _new_page(self):
        self.buf = []
        self.y = TOP_Y
        self.pages.append(self.buf)
        self._page_chrome()

    def _rect(self, x, y, w, h, rgb):
        self.buf.append("%.3f %.3f %.3f rg" % rgb)
        self.buf.append("%.2f %.2f %.2f %.2f re f" % (x, y, w, h))

    def _text(self, x, y, s, size=10.5, rgb=INK, font="F1"):
        self.buf.append("BT /%s %.1f Tf %.3f %.3f %.3f rg %.2f %.2f Td (%s) Tj ET"
                        % (font, size, rgb[0], rgb[1], rgb[2], x, y, esc(s)))

    def _page_chrome(self):
        # header band
        self._rect(0, PAGE_H - 86, PAGE_W, 86, NAVY)
        self._rect(0, PAGE_H - 90, PAGE_W, 4, self.accent)
        # shield mark
        self._rect(MARGIN_X, PAGE_H - 66, 26, 34, self.accent)
        self._rect(MARGIN_X + 4, PAGE_H - 62, 18, 26, NAVY)
        self._rect(MARGIN_X + 8, PAGE_H - 54, 10, 10, self.accent)
        self._text(MARGIN_X + 40, PAGE_H - 46, "SHIELD FORCE", 17,
                   (1, 1, 1), "F2")
        self._text(MARGIN_X + 40, PAGE_H - 62,
                   "Scam Defence Grid  |  Indian Armed Forces & Families",
                   8.5, (0.72, 0.78, 0.88))
        self._text(PAGE_W - MARGIN_X - text_width(self.doc_code, 9), PAGE_H - 46,
                   self.doc_code, 9, self.accent, "F2")
        # footer
        self._rect(0, 40, PAGE_W, 0.8, (0.80, 0.84, 0.88))
        self._text(MARGIN_X, 28,
                   "Helpline 1930  |  cybercrime.gov.in  |  Awareness material - "
                   "verify all figures with official channels", 7.5, MUTE)
        self._text(PAGE_W - MARGIN_X - 60, 28,
                   "Page %d" % len(self.pages), 7.5, MUTE)

    def _need(self, h):
        if self.y - h < BOTTOM_Y:
            self._new_page()

    # ---- high-level blocks ---------------------------------------------
    def title_block(self):
        self.y -= 8
        for ln in wrap(self.title, 21, PAGE_W - 2 * MARGIN_X):
            self._text(MARGIN_X, self.y, ln, 21, INK, "F2")
            self.y -= 26
        for ln in wrap(self.subtitle, 10.5, PAGE_W - 2 * MARGIN_X):
            self._text(MARGIN_X, self.y, ln, 10.5, MUTE)
            self.y -= 15
        self.y -= 10

    def heading(self, s):
        self._need(46)
        self.y -= 10
        self._rect(MARGIN_X, self.y - 3, 4, 14, self.accent)
        self._text(MARGIN_X + 12, self.y, s.upper(), 12.5, INK, "F2")
        self.y -= 20

    def para(self, s, size=10.5, rgb=INK):
        for ln in wrap(s, size, PAGE_W - 2 * MARGIN_X):
            self._need(16)
            self._text(MARGIN_X, self.y, ln, size, rgb)
            self.y -= size * 1.45
        self.y -= 4

    def bullet(self, s, marker="-", rgb=INK):
        lines = wrap(s, 10.5, PAGE_W - 2 * MARGIN_X - 18)
        self._need(15 * len(lines) + 4)
        self._text(MARGIN_X + 2, self.y, marker, 10.5, self.accent, "F2")
        for i, ln in enumerate(lines):
            self._text(MARGIN_X + 18, self.y, ln, 10.5, rgb)
            self.y -= 15
        self.y -= 2

    def numbered(self, idx, s):
        self.bullet(s, marker="%d." % idx)

    def callout(self, s, rgb=RED):
        lines = wrap(s, 10.5, PAGE_W - 2 * MARGIN_X - 28)
        h = 15 * len(lines) + 18
        self._need(h + 6)
        self._rect(MARGIN_X, self.y - h + 12, PAGE_W - 2 * MARGIN_X, h,
                   (0.97, 0.95, 0.92))
        self._rect(MARGIN_X, self.y - h + 12, 4, h, rgb)
        yy = self.y - 4
        for ln in lines:
            self._text(MARGIN_X + 16, yy, ln, 10.5, INK, "F2")
            yy -= 15
        self.y -= h + 4

    def gap(self, h=8):
        self.y -= h

    # ---- serialisation ---------------------------------------------------
    def save(self, path):
        objs = []

        def add(body):
            objs.append(body)
            return len(objs)

        font1 = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
        font2 = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
        content_ids, page_ids = [], []
        for buf in self.pages:
            stream = zlib.compress("\n".join(buf).encode("latin-1"))
            content_ids.append(add(
                b"<< /Length %d /Filter /FlateDecode >>\nstream\n" % len(stream)
                + stream + b"\nendstream"))
        pages_id = len(objs) + len(self.pages) + 1
        for cid in content_ids:
            page_ids.append(add((
                "<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.2f %.2f] "
                "/Resources << /Font << /F1 %d 0 R /F2 %d 0 R >> >> "
                "/Contents %d 0 R >>"
                % (pages_id, PAGE_W, PAGE_H, font1, font2, cid)).encode()))
        kids = " ".join("%d 0 R" % p for p in page_ids)
        add(("<< /Type /Pages /Kids [%s] /Count %d >>"
             % (kids, len(page_ids))).encode())
        catalog = add(("<< /Type /Catalog /Pages %d 0 R >>" % pages_id).encode())
        info = add(("<< /Title (%s) /Author (Shield Force) /Producer (Shield Force PDF Writer) >>"
                    % esc(self.title)).encode())

        out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        offsets = [0]
        for i, body in enumerate(objs, 1):
            offsets.append(len(out))
            out += ("%d 0 obj\n" % i).encode() + body + b"\nendobj\n"
        xref = len(out)
        out += ("xref\n0 %d\n" % (len(objs) + 1)).encode()
        out += b"0000000000 65535 f \n"
        for off in offsets[1:]:
            out += ("%010d 00000 n \n" % off).encode()
        out += ("trailer\n<< /Size %d /Root %d 0 R /Info %d 0 R >>\n"
                "startxref\n%d\n%%%%EOF\n"
                % (len(objs) + 1, catalog, info, xref)).encode()
        with open(path, "wb") as f:
            f.write(bytes(out))
        print("wrote", path, len(out), "bytes,", len(self.pages), "pages")


# ======================================================================
def family_financial_safety():
    p = Pdf("Family Financial Safety Guide",
            "A practical handbook for spouses, parents and children of serving "
            "personnel, veterans and defence civilians.",
            GOLD, "SF-RPT-01")
    p.title_block()
    p.heading("Why military families are targeted")
    p.para("Fraud networks deliberately profile defence families: postings keep "
           "the serving member away from home, pay and pension credits arrive on "
           "predictable dates, and families trust anyone who speaks the language "
           "of the fauj - unit names, ranks, CSD, ECHS and welfare funds. "
           "Scammers weaponise that trust.")
    p.callout("Golden rule: No bank, no army office, no welfare fund and no "
              "government portal will EVER ask for an OTP, UPI PIN, CVV or "
              "password on a call. The moment anyone asks - it is fraud.")
    p.heading("Household security drills")
    drills = [
        "Set a family code word. Any caller claiming an emergency involving your "
        "soldier must be verified with the code word and a call-back to the unit line.",
        "Keep the unit adjutant / record office numbers written next to the phone, "
        "not just saved in one mobile.",
        "Enable transaction alerts and daily limits on every family bank account and UPI app.",
        "Never scan a QR code to RECEIVE money. QR + PIN always means money is LEAVING.",
        "Review pension and salary account statements together on a fixed day every month.",
        "Do not share deployment details, rank, unit or family photos on public social media.",
        "Verify every 'army buyer' or 'army seller' on resale apps - refuse advance payments.",
    ]
    for i, d in enumerate(drills, 1):
        p.numbered(i, d)
    p.heading("If money leaves the account")
    steps = [
        "Call 1930 (National Cyber Crime Helpline) immediately - the first 60 "
        "minutes are the Golden Window while funds are still in transit.",
        "File a complaint on cybercrime.gov.in with screenshots, numbers and UPI IDs.",
        "Call the bank's official fraud line and freeze the card / UPI handle.",
        "Inform the serving member's unit and the local police (dial 112).",
        "Do not delete anything - messages, call logs and receipts are evidence.",
    ]
    for i, s in enumerate(steps, 1):
        p.numbered(i, s)
    p.heading("Talk about it")
    p.para("A large share of cases are never reported because victims feel "
           "embarrassed. Fraud is a crime committed against you, not a mistake "
           "you made. Reporting fast protects your money and protects the next "
           "family on the scammer's list.")
    return p


def red_flag_checklist():
    p = Pdf("Quick Red-Flag Checklist",
            "Print this page. Stick it near the phone. Ten seconds of checking "
            "beats ten months of recovery.", RED, "SF-RPT-02")
    p.title_block()
    p.heading("Stop and verify if you see any of these")
    flags = [
        "URGENCY - 'within 10 minutes', 'account will be blocked today', 'last chance'.",
        "SECRECY - 'do not tell anyone', 'this is a confidential defence matter'.",
        "OTP / PIN REQUEST - any request for OTP, UPI PIN, CVV, net-banking password.",
        "PAY TO RECEIVE - asked to send money, scan a QR or 'verify' to get money back.",
        "UNKNOWN LINKS - shortened links (bit.ly etc.), APK files, 'update KYC' links.",
        "TOO GOOD - guaranteed returns, lottery wins, jobs or plots at throwaway prices.",
        "AUTHORITY PRESSURE - fake police / CBI / army HQ officers, 'digital arrest' threats.",
        "IDENTITY PROPS - uniforms, ID cards, cantonment addresses used to build trust.",
        "CHANNEL SWITCH - pushed from the app or portal to WhatsApp / Telegram quickly.",
        "REFUSAL TO MEET - army buyer 'posted at border', can only pay in advance online.",
    ]
    for f in flags:
        p.bullet(f)
    p.heading("The 3-line defence")
    p.numbered(1, "PAUSE - genuine organisations never rush you.")
    p.numbered(2, "VERIFY - call back on the official number you find yourself, "
                  "never the number given by the caller.")
    p.numbered(3, "REPORT - 1930 and cybercrime.gov.in, even for attempts. "
                  "Every report weakens the network.")
    p.callout("Memory hook: 'OTP maanga? Matlab thug hai.' Anyone asking for an "
              "OTP is a thief - no exceptions.")
    return p


def qr_warning():
    p = Pdf("QR Code Scam Warning Notice",
            "Advisory for canteens, unit family welfare meetings and notice boards.",
            RED, "SF-RPT-03")
    p.title_block()
    p.heading("How the QR trap works")
    p.para("A fraudster posing as a buyer (often 'an army officer being posted "
           "out') agrees to buy your sofa, car or fridge on a resale app without "
           "bargaining. To 'send the advance', they share a QR code and insist "
           "you scan it and enter your UPI PIN. Scanning a QR and entering a PIN "
           "NEVER credits money - it debits your account. Victims are often made "
           "to repeat the process 'because the first transfer failed', losing "
           "money multiple times in minutes.")
    p.callout("Scanning a QR code + entering UPI PIN = MONEY LEAVES YOUR ACCOUNT. "
              "There is no such thing as a QR code that pays you.")
    p.heading("Field rules")
    rules = [
        "Receive money using only your UPI ID or account number - never via a QR sent to you.",
        "A PIN is needed only to PAY. If you are receiving, no PIN is ever required.",
        "Treat 'army officer' profiles on OLX-style apps as fake until they meet in person.",
        "Do not accept payment screenshots as proof - check your own bank app.",
        "Never approve unknown 'collect requests' in your UPI app.",
        "Report fake profiles in the app, then on cybercrime.gov.in.",
    ]
    for i, r in enumerate(rules, 1):
        p.numbered(i, r)
    p.heading("If you scanned and paid")
    p.numbered(1, "Call 1930 within the Golden Window (first 60 minutes).")
    p.numbered(2, "Raise a fraud complaint in the UPI app and with your bank.")
    p.numbered(3, "File on cybercrime.gov.in with the QR image, UPI reference "
                  "number and the fraudster's number.")
    p.numbered(4, "Inform unit security staff so the alert reaches other families.")
    return p


def pension_alert():
    p = Pdf("Veteran Pension Fraud Alert",
            "For veterans, veer naris and next of kin drawing pension through SPARSH / banks.",
            GOLD, "SF-RPT-04")
    p.title_block()
    p.heading("Active fraud patterns against pensioners")
    pats = [
        "Fake 'SPARSH / record office' calls demanding OTP or bank details to "
        "'stop your pension from being blocked'.",
        "Bogus 'life certificate update' links sent by SMS or WhatsApp that "
        "harvest banking credentials.",
        "'Arrears released - pay processing fee' letters and calls promising "
        "OROP or 7th CPC arrears against an advance payment.",
        "Fraudsters posing as ECHS staff collecting 'card renewal charges' online.",
        "'Digital arrest' video calls with fake police uniforms threatening "
        "elderly pensioners into transferring savings.",
    ]
    for pat in pats:
        p.bullet(pat)
    p.callout("SPARSH, record offices, ECHS and banks NEVER ask for OTPs, PINs, "
              "processing fees or 'verification transfers'. Pension is a right - "
              "nobody legitimate charges you to release it.")
    p.heading("Safe practice for pension accounts")
    rules = [
        "Do annual identification only through official channels: SPARSH portal, "
        "Jeevan Pramaan, your bank branch or authorised service centres.",
        "Type sparsh.defencepension.gov.in yourself - never follow SMS links.",
        "Keep the pension account free of UPI apps if the account holder is not "
        "confident using them; use a separate small-balance account for daily spends.",
        "Nominate a trusted family member to jointly review the passbook monthly.",
        "Any call about pension = hang up, call the record office / bank number "
        "from your PPO documents.",
    ]
    for i, r in enumerate(rules, 1):
        p.numbered(i, r)
    p.heading("Report")
    p.para("Helpline 1930 | cybercrime.gov.in | Nearest police station (112) | "
           "Your bank's fraud cell | Zila Sainik Welfare Office for guidance.")
    return p


def awareness_summary():
    p = Pdf("Fraud Awareness Summary",
            "One-briefing digest of the Shield Force programme: threats, defences and drills.",
            TEAL, "SF-RPT-05")
    p.title_block()
    p.heading("Threat picture")
    p.para("Financial fraud against defence personnel and families now runs "
           "across every channel: UPI collect requests, QR reversals, fake army "
           "buyer profiles, loan and investment apps, impersonation of CDA / "
           "record offices, welfare fund charity fraud, honey-trap led extortion "
           "and 'digital arrest' intimidation. Attackers study military life - "
           "pay days, postings, retirement dates - and script their calls around it.")
    p.heading("Eight scam families every soldier should know")
    fams = [
        "Fake UPI / QR payment reversal fraud on resale platforms.",
        "OTP and KYC phishing (bank, SIM, Aadhaar, SPARSH pretexts).",
        "Investment and crypto Ponzi pitches with 'guaranteed' returns.",
        "Impersonation of officers for advance-fee deals (vehicles, canteen goods).",
        "Pension, arrears and insurance fraud against veterans and widows.",
        "Fake welfare fund and martyr-charity donation drives.",
        "Loan app harassment and identity theft from leaked documents.",
        "Digital arrest / fake police video-call extortion.",
    ]
    for i, f in enumerate(fams, 1):
        p.numbered(i, f)
    p.heading("Core defences")
    defs_ = [
        "Never share OTP, PIN, CVV or passwords - with anyone, in any uniform.",
        "Verify identities through official numbers you look up yourself.",
        "Refuse urgency: real institutions give you time and paper trails.",
        "Separate accounts: one exposed account with small balance for UPI, "
        "salary and savings kept insulated.",
        "Report every attempt on 1930 / cybercrime.gov.in - attempts are intelligence.",
    ]
    for d in defs_:
        p.bullet(d)
    p.heading("Golden window")
    p.callout("First 60 minutes after a fraudulent transfer: call 1930, report on "
              "cybercrime.gov.in, freeze the channel with your bank. Acting inside "
              "this window gives the best chance of holding funds before they are "
              "layered across mule accounts.")
    p.heading("Unit-level drill")
    p.numbered(1, "Quarterly 30-minute fraud briefing for families (use Shield Force modules).")
    p.numbered(2, "Display the Quick Red-Flag Checklist at CSD canteens and unit gates.")
    p.numbered(3, "Nominate a unit cyber-buddy to help file 1930 / NCRP complaints fast.")
    p.numbered(4, "De-stigmatise reporting: brief that concealment, not the con, causes the loss.")
    return p


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    docs = {
        "shieldforce-family-financial-safety.pdf": family_financial_safety,
        "shieldforce-red-flag-checklist.pdf": red_flag_checklist,
        "shieldforce-qr-scam-warning.pdf": qr_warning,
        "shieldforce-veteran-pension-fraud-alert.pdf": pension_alert,
        "shieldforce-fraud-awareness-summary.pdf": awareness_summary,
    }
    for name, fn in docs.items():
        fn().save(os.path.join(OUT_DIR, name))


if __name__ == "__main__":
    main()
