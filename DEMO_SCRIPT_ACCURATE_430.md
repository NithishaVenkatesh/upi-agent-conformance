# UPI Compliance Gate - Hackathon Demo Script (4:30 MAX)

**⏱️ TIMING GUIDE: Read at natural pace with pauses. Total: 4:30**

---

## PROBLEM SETUP (0:00 - 0:35)

"So, um, here's the thing with UPI payments. Banks can create payment blocks — like, a customer reserves ₹10,000 for a merchant, right? But NPCI has seven strict rules about these blocks. How much? ₹10,000 max. How long? 90 days max. No duplicate blocks. And if you violate these rules... there's huge regulatory liability."

[**Pause 1 second**]

"But here's the problem — there's *no deterministic gate* checking this automatically. It's scattered across different systems, inconsistent, and when something goes wrong — you have no audit trail. No proof. NPCI audits you? You're scrambling to explain what happened."

[**Pause 1 second**]

"So I built a compliance gate."

---

## SOLUTION (0:35 - 0:50)

"Every transaction gets checked against all seven rules from NPCI's OC-228 circular. And it's deterministic — same input, same output, always. Cryptographically signed. Immutable ledger. You can trace exactly why a payment was allowed or refused."

[**Pause 1 second**]

"Let me show you."

---

## DASHBOARD (0:50 - 1:25)

[**Navigate to Overview tab** - left sidebar]

"Here's the dashboard. These are real transactions running through the gate. Green ones? Allowed. Red ones — uh, those got refused."

[**Point to first transaction: ₹2,499 - ALLOWED**]

"This one — ₹2,499. Why allowed? Passes all seven checks. Amount is within the ₹10,000 cap, customer has funds, no duplicate blocks, validity under 90 days. All good."

[**Point to second transaction: ₹3,899 - REFUSED**]

"But this one — ₹3,899 — refused. Why? Duplicate block. Customer already has an active block with this merchant. OC-228 explicitly says: 'No concurrent blocks from the same merchant to the same customer.' That's literally from the circular. The gate caught it. Refused."

"Each decision is cryptographically signed and added to an immutable ledger. You can see the hash chain, see which rules were checked, everything."

[**Pause 1 second**]

---

## CHECKOUT FLOW (1:25 - 3:10)

[**Click Checkout in sidebar**]

"Now let me show you a live transaction. Going to the Checkout page. Three products:"

[**Point to products**]

"Cotton tote — ₹2,499. Canvas backpack — ₹3,899. Laptop sleeve — ₹1,499."

[**Click Add on Cotton tote**]

"Added to cart. Now let me add the canvas backpack."

[**Click Add on Canvas backpack**]

"Alright, both items in cart now. ₹2,499 plus ₹3,899 equals ₹6,398 total. Under the ₹10,000 NPCI cap. That's rule one checked."

[**Click "Proceed to Payment"**]

"Clicking 'Proceed to Payment'. The backend creates a checkout session."

[**Wait for response - ~2 seconds**]

"Done. Now — the compliance gate. Clicking 'Process Payment'."

[**Click "Process Payment"**]

"This is where all seven rules get checked:"

[**Pause 1 second**]

"One — block amount ≤ ₹10,000? Check.
Two — customer has funds? Check.
Three — duplicate block for this merchant? No, check.
Four — block expired? No, check.
Five — validity window ≤ 90 days? Check.
Six — is this a retry and is it allowed? Check.
Seven — retry budget exhausted? Check."

[**Wait for response - ~2 seconds**]

[**Point to Decision Detail section - "✓ Allowed"**]

"Payment authorized. Decision code: 'authorised'. Regulatory citation: 'Issuer §3' from NPCI/UPI/OC No.228. The actual quote: 'Issuer may set limits on UPI payment amounts within regulatory bounds.' Extracted directly from the NPCI PDF. We parse the authoritative document and compare."

"Same merchant, same customer, same amounts — you'll *always* get the same decision. That's the determinism the regulators want."

[**Pause 1 second**]

---

## DECISION GALLERY (3:10 - 4:10)

[**Click Showcase in sidebar**]

"Now, all eight possible decision codes. One allowed, seven refusal codes:"

[**Scroll to show the 2-column grid**]

[**Point to each card**]

"**Authorised** — passes all checks. Good.

**Cap Exceeds Authority** — ₹15,000 block? OC-228 says max ₹10,000. Refused.

**Insufficient Balance** — customer has ₹5,000, tried to block ₹10,000. Refused.

**Block Expired** — created 91 days ago. Max is 90 days. Refused.

**Validity Exceeds Authority** — 120-day validity requested. OC-228 says 90 max. Refused.

**Duplicate Block** — same merchant, second block for same customer. Refused.

**Retry Not Permitted** — retrying after a decline. Only timeout failures can retry. Refused.

**Retry Budget Exhausted** — fourth retry in 24 hours. Budget is three. Refused."

[**Scroll down to Coverage & Proof**]

"Eight decision codes. One allowed. Seven refusal codes. All traceable to NPCI/UPI/OC No.228."

[**Pause 1 second**]

---

## CLOSING (4:10 - 4:30)

"So what you're looking at is — um — a production-ready compliance infrastructure. Every block is checked deterministically. Every decision is cryptographically signed. Immutable, tamper-proof ledger with SHA-256 hashing."

[**Pause 1 second**]

"This solves the problem. Merchants have proof of compliance. Banks have audit trails. Regulators have certainty. When NPCI audits? You have deterministic, cryptographically signed evidence of every decision."

"Deployed on Railway. Ready to handle real UPI transactions. Questions?"

---

## TIMING BREAKDOWN

- Problem Setup: 0:35
- Solution Intro: 0:15
- Dashboard Demo: 0:35
- Checkout Flow: 1:45
- Decision Gallery: 1:00
- Closing: 0:20
- **Total: 4:30**

---

## KEY INSIGHT

Don't just show the tech. Show:
1. **The problem** (regulatory liability, audit risks, no deterministic proof)
2. **Why it matters** (banks face fines, compliance violations)
3. **The solution** (deterministic gate, immutable audit trail, cryptographic proof)
4. **The demo** (catches violations in real-time)

The judges want to hear: "I identified a real problem and built something that solves it."

---

## THINGS TO AVOID

- Don't go into backend code details (gate/decide.py)
- Don't explain the PDF extraction pipeline
- Don't mention specific error codes unless asked
- Keep focus on WHAT the system does, not HOW internally
