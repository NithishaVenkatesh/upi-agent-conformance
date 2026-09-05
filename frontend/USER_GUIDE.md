# in.razorpay.upi — Complete User Guide

## 🎯 What Is This Product?

Imagine you're a payment processor. Thousands of people want to send money through UPI (a mobile payment system in India). But you have rules:
- "Don't let anyone send more than ₹100,000 in a single payment"
- "Block duplicate attempts from the same person within 10 minutes"
- "Require the person to have enough balance"

**This system automatically checks every payment against your rules and issues a decision: "Allowed" or "Refused".**

Think of it like a security guard at a bank:
- Person tries to make a payment
- Guard checks the rulebook
- Guard says "Yes, go ahead" or "No, not today"
- Guard writes down what happened in a ledger (for proof)

That's what this system does. It's a **payment gate** — a set of automated checks that approve or block payments based on regulatory rules.

---

## 🏠 The Homepage (Landing Page)

When you first visit, you see:

### Left Side: The Rule
A quote from the regulatory authority (the bank's rules):
```
"The block created shall not be treated as the guarantee of payment."
```

This is a real rule from NPCI (the government body that runs UPI). It means: even if the system approves your payment, it's not guaranteed to succeed.

Below that:
- The rule number: `NPCI/UPI OC No.228, Acquirer §2`
- A claim merchants often make (crossed out): "Guaranteed Collection"
- Explanation: "Merchant terms say otherwise. This gate catches it."

**Why is this here?** To show what the system does: it catches the gap between what merchants promise and what regulations allow.

### Right Side: A Live Example
A "ruling" — a formal document showing what the system decided.

It shows:
- The decision: **Refused**
- The code: `counterparty_not_conformant`
- The reason: "Merchant claims otherwise"
- A quote explaining why

**Why is it designed like this?** Judges and regulators read formal documents. This looks like an official ruling (because it is). It's not a dashboard with colorful charts — it's a regulatory instrument.

### Bottom: Proof
Four stats:
- 195 tests (we've tested this thoroughly)
- 7 claims (7 regulatory rules we enforce)
- 8 codes (8 different refusal reasons)
- 0 LLM on money path (no AI making decisions about money — only logic)

**Why?** To build trust. This system is deterministic and auditable, not magical.

---

## 🔐 Logging In

Click "Open the dashboard" to go to the login screen.

**Pre-filled credentials:**
- Email: `judge@razorpay.dev`
- Password: `demo`

**Why "judge"?** Because this system issues rulings. A judge reviews cases and makes decisions. This is a demo role playing that persona.

**Why are credentials pre-filled?** This is a demo system. In production, you'd use your own credentials.

---

## 📋 The Decisions Page (Main Dashboard)

After login, you arrive at the core of the system: **Two panes side by side.**

### Left Pane: List of Decisions

A scrollable list showing every payment decision made:

```
14:32  ₹2,499    ✓
14:28  ₹3,899    ✘  ← most recent refusal (highlighted)
14:25  ₹1,299    ✓
14:20  ₹5,000    ✓
14:15  ₹6,000    ✘
```

**Each row shows:**
- **Time:** When the payment was attempted (14:32 = 2:32 PM)
- **Amount:** How much money in rupees
- **Verdict:** ✓ = Allowed, ✘ = Refused

**How to use:** Click any row to see the full ruling on the right.

**Why this design?**
- No cards, no colors except for the verdict (red/green means decision only)
- Ruled lines between rows (like a ledger)
- Minimum 44px height (easy to click on mobile)
- Shows timestamp in mono font (it's machine-generated data)

### Right Pane: Full Ruling

When you click a row, the right side shows a complete "ruling" — a formal decision document.

#### The Masthead (Top Bar)
```
Gate decision              OC-228
```
Gray background, plain text. This is metadata, not important info.

**Why gray?** To visually separate it from the actual decision below.

#### The Finding (The Decision)
```
Refused
duplicate_block…
```

Large, bold, in the verdict color (red for refused, green for allowed).

**Why Newsreader font?** It's the font regulatory documents use. It signals "this is official."

#### Facts Strip (4-Column Table)
```
Requested      Customer      Decided in     Status
₹2,499         OC-228        <1ms           Refused
```

These are the details: what was requested, who it was for, how fast the decision was made, and the final status.

**Why mono font for the code?** Codes are meant to be compared character-by-character. Mono makes that easy.

#### Regulatory Authority
```
NPCI/UPI OC No.228  Issuer §5
```

The circular (law) and clause (section) this decision came from. Every refusal cites the rule it violated.

**Why?** Transparency. If you disagree, you can look up the exact rule.

#### Quotation
```
"No concurrent blocks from the same merchant to the same customer."
```

The exact text from the regulation. Left-aligned with a 2px colored border.

**Why the border?** To show this is quoted text — it's from a real regulation, not an interpretation.

#### Seal
```
🔒 Sealed into ledger
Entry #1
```

This means the decision was written into an immutable ledger (a chain of records). If someone later asks "what decision was made on this payment?" you can look it up in the ledger.

**Why a lock icon?** It signals security and finality. Once sealed, it can't be changed.

---

## 🎮 How to Navigate

### Top Navigation Bar
On the left side of the screen, there's a permanent sidebar:

```
Decisions  ← You are here (highlighted)
Demo
─────────  ← separator
Rules      ← Reference section
Ledger
```

**Decisions:** The main page. See all payments and their rulings.

**Demo:** Try out the system with pre-made scenarios. Click "Run" to make a test payment and see the system decide.

**Rules:** See the regulatory constraints the system enforces. Compare what merchants claimed vs. what the regulations actually say.

**Ledger:** View the immutable chain of decisions. Verify that the system hasn't been tampered with.

### Top Bar Action
At the top right: **"Verify chain"** button.

This checks that all the decisions in the ledger are cryptographically valid (no one changed them after the fact).

---

## 💡 Why Everything Is Designed This Way

### No Colors Except for Decisions
You won't see blue, purple, or orange anywhere. Color is reserved exclusively for "Allowed" (green) and "Refused" (red).

**Why?** Color in UI usually means "category" or "status." Here, it means "regulatory outcome." Nothing else deserves that semantic weight.

### Plain Language
- "Decisions" not "Docket"
- "Run" not "Issue decision"
- "Rules" not "Constraints"

**Why?** A judge and a regulator use this system. They expect clear, plain language. No jargon hiding behind cute names.

### Mono Font for Machine Data
- Hashes: `a91f4c…c0d4`
- Timestamps: `1725356400`
- Customer IDs: `CUST-12345`

**Why?** Mono signals "this is generated, machine-readable." It makes people compare it character-by-character (which they should do with security-critical data).

### No Animations Except One
The only animation is on the transaction detail page — a 7-check sequence that illuminates one by one as the system evaluates your payment against each rule.

**Why?** Motion is expensive (battery, mental load). One orchestrated moment is enough to explain the process. Everything else is instant.

### Formal Typography
- Newsreader font for verdicts and quotes (regulatory authority)
- IBM Plex Sans for everything else (modern but institutional)
- IBM Plex Mono for machine data (precise, generated)

**Why?** Three fonts, each with a purpose. This makes the document scannable — you can tell at a glance what's regulation vs. UI vs. data.

### No Shadows or Decorations
- No drop shadows
- No gradients
- No rounded corners (except buttons)
- Max 1px borders (ruled lines only)

**Why?** This is a regulatory instrument, not a SaaS dashboard. Decoration distracts from what matters: the decision and the rule.

---

## 🔄 The Core Flow: How a Payment Gets Decided

1. **Someone tries to send money** via UPI
2. **The system checks the payment against 7 rules:**
   - Conformance: Does the merchant comply with regulations?
   - Cap limit: Is the amount under the daily cap?
   - Balance: Does the customer have enough balance?
   - Expiry: Is the payment block expired?
   - Validity: Is the payment block valid?
   - Retries: Have they exceeded retry limits?
   - Blocks: Are they on any blocklist?

3. **If all pass:** ✓ Allowed (payment goes through)
   **If any fails:** ✘ Refused (payment is blocked)

4. **The decision is sealed into the ledger** (an immutable record)

5. **It appears in the "Decisions" list** for you to review

---

## 🧮 Understanding the Components

### The Decisions List
- **Scrollable, independent:** You can scroll through decisions without affecting the right pane
- **Selected state:** Rows have a left border when selected (not a highlight, not a color background)
- **Hover:** Rows change background on hover so you know they're clickable

**Why this design?** 
- Separation of concerns (list and detail are independent)
- Visual clarity (you always know which one is selected)
- Mobile-friendly (tappable targets are 44px tall minimum)

### The Ruling Card
- **No shadow:** Relies on borders and color to define itself
- **Grid layout:** Facts are in a 4-column grid so you can scan them quickly
- **Masthead background color:** Slightly different from the body (internal hierarchy)

**Why?**
- Shadows are expensive and unnecessary
- Grids make data scannable
- Background variation guides your eye to sections

### Copy Button on Hashes
- **Starts as "Copy"**
- **On click: "✓" for 1.2 seconds**
- **Then back to "Copy"**

**Why?** Feedback. You know the hash was copied. The checkmark is instantly recognizable across cultures.

### The Rail Navigation
- **Primary section (Decisions, Demo):** What you do most
- **Reference section (Rules, Ledger):** What you look up occasionally
- **Separated by a thin line:** Visual grouping

**Why?** Information hierarchy. The most common tasks are prominent.

---

## 🎓 For First-Time Users: A Walkthrough

### Start Here
1. Go to `http://localhost:3000`
2. Read the quote on the left (it explains the why)
3. Look at the ruling on the right (it shows an example decision)
4. Click "Open the dashboard"

### Then Login
1. Credentials are pre-filled (just click Sign In)
2. You're in the "Decisions" page

### Then Explore
1. **Click different rows** on the left to see different rulings
2. **Notice the patterns:**
   - Refused decisions always cite a rule
   - Allowed decisions have a green quote
   - Refused decisions have a red quote
3. **Hover over the copy button** to see it reveal
4. **Click "Demo"** to run a test payment
5. **Click "Rules"** to see the rulebook
6. **Click "Ledger"** to see the chain of decisions

### Then Understand
- **Every decision is traceable** (you can see the rule, the reason, the timestamp)
- **Every decision is auditable** (it's in the ledger, cryptographically sealed)
- **Every decision is regulatory** (it's not arbitrary; it's law)

---

## 📞 Key Concepts Glossary

| Term | Means | Example |
|------|-------|---------|
| **Gate** | An automated system that approves or blocks payments | "Did it pass the gate?" = Did it get approved? |
| **Ruling** | A formal decision with explanation | "The ruling was: Refused, duplicate_block" |
| **Circular** | A regulation issued by the government (NPCI) | NPCI/UPI OC No.228 |
| **Clause** | A specific section within a circular | Issuer §3 |
| **Ledger** | An immutable record of all decisions | "Check the ledger to see what happened to that payment" |
| **Conformance** | Does the merchant follow the rules? | "Merchant claim doesn't conform to regulation" |
| **Block** | A temporary hold on a customer's funds | "We block ₹10,000 for this payment" |
| **Verdict** | The outcome: Allowed, Refused, or Undetermined | ✓ Allowed |
| **Seal** | Write to the immutable ledger | "Decision is sealed into ledger entry #5" |

---

## ⚡ Quick Facts

- **Zero LLM on money path:** Every decision is deterministic logic, not AI
- **Immutable ledger:** Once a decision is made, it's written in stone
- **Real regulations:** Every rule comes from NPCI or the Reserve Bank of India
- **Audit trail:** You can see exactly why every decision was made
- **Sub-1ms decisions:** The system is fast enough for payment processing
- **Typed system:** Everything is TypeScript strict mode (no surprises)

---

## 🚀 What's Next?

After you understand how payments are decided:

1. **Rules page:** Learn which constraints are enforced
2. **Ledger page:** See the cryptographic chain and verify it
3. **Demo page:** Issue your own test decisions
4. **Deep dive:** Read the code (it's all public and commented)

---

## 💬 Remember

This system treats payment decisions like a judge treats rulings:
- **Formal:** Written in regulatory language
- **Traceable:** Every decision cites its source
- **Auditable:** Every decision is sealed in a ledger
- **Transparent:** You can see the why, the how, and the proof

It's not a typical SaaS dashboard. It's a regulatory instrument. That's the whole point.

---

**Questions?** Every page and component is designed with intent. If something looks unusual, ask why. That's a feature, not a bug.
