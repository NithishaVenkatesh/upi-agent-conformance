# UPI Compliance Gate - Hackathon Demo Script (4:30 MAX)

**⏱️ TIMING GUIDE: Read at natural pace with pauses. Total: 4:30**

---

## OPENING (0:00 - 0:15)

"Alright, so... um, this is a UPI compliance gate. Think about payment blocks as regulatory liability. Every single transaction through this system gets checked against seven strict rules from NPCI's OC-228 circular. And, like, the system is deterministic — you can trace exactly why a payment was allowed or refused. Let me show you."

[**Pause 2 seconds** - let it sink in]

---

## DASHBOARD (0:15 - 0:50)

[**Navigate to Overview tab** - left sidebar is already selected]

"Here's the dashboard. So you see these transactions? Green ones are *allowed*. Red ones — uh, those got refused. Let me walk through the logic. On the left, I'm looking at, like, five different transactions with different outcomes."

[**Point to first transaction: ₹2,499 - ALLOWED**]

"This one? ₹2,499. Allowed. Why? Because it passes all compliance checks — amount is within limits, customer has funds, no duplicate blocks, all good."

[**Point to second transaction: ₹3,899 - REFUSED**]

"But this one — ₹3,899 — refused. Why? Duplicate block. Customer already has an active block with this merchant. OC-228 explicitly says: no concurrent blocks from the same merchant to the same customer. Pretty strict."

"These aren't random decisions. Each one is — um, cryptographically signed and added to an immutable ledger. You can scroll down to the ledger tab and see the hash chain if you want, but for now..."

[**Pause 1 second**]

---

## CHECKOUT FLOW (0:50 - 2:45)

[**Click Checkout in sidebar**]

"Let me demonstrate a live transaction. I'm going to the Checkout page. You see three products here:"

[**Point to products**]

"Cotton tote — ₹2,499. Canvas backpack — ₹3,899. Laptop sleeve — ₹1,499."

[**Click Add on Cotton tote**]

"I'm adding the cotton tote to my cart. Now I have ₹2,499 in the cart. Let me add, uh, one more item. Adding the canvas backpack."

[**Click Add on Canvas backpack**]

"Alright, so now my cart is ₹2,499 plus ₹3,899... that's ₹6,398 total. Notice on the right side, the Cart Summary shows the subtotal and total. Everything is under the ₹10,000 cap mandated by NPCI."

[**Click "Proceed to Payment"**]

"Now I'm clicking 'Proceed to Payment'. This calls the backend's `create_checkout` MCP tool. The backend validates — does the customer exist? Are we issuing a valid block? — and returns a checkout session."

[**Wait for response - ~2 seconds**]

"Checkout created. See the session ID? Now comes the compliance gate. I'm clicking 'Process Payment'."

[**Click "Process Payment"**]

"This is where the magic happens. The frontend calls the `complete_checkout` MCP tool. The backend runs all seven compliance checks:"

[**Wait for response - ~3 seconds**]

[**Point to Decision Detail section - should show "✓ Allowed"**]

"Payment went through. The decision code is `authorised`. And look — the regulatory citation is right there. 'Issuer §3' from NPCI/UPI/OC No.228. The quote says, 'Issuer may set limits on UPI payment amounts within regulatory bounds.' That's literally from the NPCI circular. We extract this from the authoritative PDF and compare it to what the merchant claims to support."

[**Click to expand decision detail if needed**]

"You see the detail? 'Payment captured successfully.' This is deterministic. Same merchant, same customer, same amounts — you'll always get the same decision. That's the point. Regulators want certainty."

[**Pause 2 seconds**]

---

## DECISION GALLERY (2:45 - 4:15)

[**Click Showcase in sidebar**]

"Now, here's what makes this interesting. Let me show you all eight possible decision codes."

[**Scroll to show the 2-column grid**]

"We have eight outcomes. One allowed, seven refusal codes. Let me go through them:"

[**Point to each card as you narrate**]

"**Authorised** — um, transaction passes all checks. Amount is within ₹10,000 cap, customer has funds, everything good.

**Cap Exceeds Authority** — merchant tried to create a block for ₹15,000. OC-228 says blocks must be ≤ ₹10,000. Refused.

**Insufficient Balance** — customer tried a ₹10,000 block but only has ₹5,000 available. Refused immediately.

**Block Expired** — the block was created 91 days ago. Regulations say max is 90 days. Refused.

**Validity Exceeds Authority** — merchant requested a block valid for 120 days. OC-228 says 90 days max. Refused.

**Duplicate Block** — same merchant tried to create a second block for the same customer. No concurrent blocks allowed. Refused.

**Retry Not Permitted** — customer tried to retry after a *decline*. NPCI only allows retries on timeout failures. Refused.

**Retry Budget Exhausted** — customer already retried three times in 24 hours. Fourth retry? Over budget. Refused."

[**Pause 1 second**]

[**Scroll down to Coverage & Proof section**]

"Look at the coverage. Eight decision codes. One allowed. Seven refusal codes. All tied to two NPCI circulars — OC-228 is the primary one."

[**Pause 1 second**]

---

## CLOSING (4:15 - 4:30)

"So... what you're looking at is — uh — Razorpay's UPI compliance infrastructure. Every block is checked against these rules. Every decision is signed and recorded in an immutable ledger with SHA-256 hashing and tamper detection. Merchants can't claim they didn't know the rules. Customers can't dispute the decision — it's deterministic and auditable."

[**Pause 1 second**]

"This is production-ready. Deployed on Railway. Ready to handle real transactions through the UPI network. Questions?"

---

## TIMING BREAKDOWN

- Opening: 0:15
- Dashboard Demo: 0:35
- Checkout Flow: 1:55
- Decision Gallery: 1:30
- Closing: 0:15
- **Total: 4:30**

---

## KEY POINTS TO EMPHASIZE

1. **Determinism** — Same input = Same output, always
2. **Regulatory alignment** — Every decision cites OC-228
3. **Production-ready** — MCP protocol, idempotency keys, error handling
4. **Immutable audit trail** — Hash-chained ledger, tamper detection
5. **Real data** — Not mock, these are actual compliance checks

---

## THINGS TO AVOID

- Don't go into backend code details (gate/decide.py)
- Don't explain the PDF extraction pipeline
- Don't mention specific error codes unless asked
- Keep focus on WHAT the system does, not HOW internally
