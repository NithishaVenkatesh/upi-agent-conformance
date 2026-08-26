# Keystone evidence — read first-hand from the primary source

**NPCI/UPI/OC No.201/2024-25, dated 13 August 2024**, "Introduction of 'UPI Circle' – Delegated Payments for secondary users". Signed **Kunal Kalawatia, Chief of Products**.
Retrieved 2026-08-26 via Wayback snapshot `20240915064233`; SHA-256 `da9dcfbd7bdeca33…`; rendered from scan and read visually.
**Evidence class: FACT — read by this session from the document itself, not reported by an agent.**

## The limits, verbatim from the circular

> **7.** *"For full delegation, Members shall ensure a maximum **monthly limit of ₹15,000/- per delegation** and maximum **per transaction limit of ₹5000**"*
>
> **8.** *"Existing UPI limits shall be applicable in case of **partial delegation**"*
>
> **9.** *"Members shall ensure that during the cooling period – **first 24 hours, a daily transaction limit of ₹5000** shall be prescribed after successful linking of primary and their secondary user for both full and partial delegation"*
>
> **4.** *"A primary user can delegate to **up to 5 secondary users** and a secondary user can accept delegation from **only one primary user**"*
>
> **6.** *"Members shall ensure **limits control to be available for the primary to set usage controls** over their secondary users"*

**Definitions, verbatim:**
> *"**Full Delegation** – Primary user authorizes a secondary user to initiate and complete UPI transactions as per defined spend limits"*
> *"**Partial Delegation** – Primary user authorizes initiation of payment requests from secondary users, Primary user shall complete UPI transaction with UPI PIN"*

## Corrections this settles

| Claim | Status |
|---|---|
| Full delegation: ₹5,000/txn, ₹15,000/month | ✅ **CONFIRMED verbatim** |
| 5 delegates, one primary each | ✅ **CONFIRMED verbatim** |
| Partial delegation has no special cap | ✅ **CONFIRMED** — *"existing UPI limits shall be applicable"* |
| First-24h limit is ₹2,000 | ❌ **REFUTED.** The circular says **₹5,000 daily**. The ₹2,000 figure (from NPCI's product page) is **not** in the circular. Design to the circular; note the divergence. |
| MCC / merchant-category restrictions exist | ❌ **REFUTED** — the full circular was read end to end. **No category scoping of any kind appears.** Item 6 grants "usage controls" but specifies none. |

## ⚠️ Razorpay's SEP #216 error — now confirmed against the primary source

Razorpay's ACP pull request states, verbatim:

> *"**Why ₹15,000 Limit?** NPCI's UPI Circle specification imposes a **hard per-transaction limit**… it is a regulatory constraint from RBI/NPCI."*

**The circular, item 7, says ₹15,000 is the maximum *monthly* limit per delegation, and the per-transaction limit is ₹5,000.**

**The claim is wrong by 3×** — and the same PR separately asserts *"merchant category restrictions"*, which appear nowhere in the circular. Both its cited reference URLs return **HTTP 404**. It was reviewed by Stripe and Meta and has stood unchallenged since 2026-04-12.

## Why this is the keystone

**The naive extraction baseline — "take the first ₹ figure near the word 'limit'" — reads item 7 and returns ₹15,000. That is exactly the error that shipped.**

Getting it right requires resolving **value + unit + scope jointly**: ₹15,000 is *monthly*, *per delegation*, *full-delegation only*; ₹5,000 is *per transaction*; and a *different* ₹5,000 in item 9 is *daily, first 24 hours only, both delegation types*. **Three rupee figures, three different scopes, one paragraph.**

> That is the irreplaceable LLM job, demonstrated on the document where the failure actually occurred — not on a synthetic example we authored.

It also validates the pipeline end to end: NPCI 403s → Wayback → bot-page trap → un-rotate → render → read. Every step is a real obstacle, which is what makes the failure narrative genuine and unchosen.

## Still open
- **Reserve Pay / SBMD limits: `EVIDENCE NOT FOUND`.** OC-200's archived snapshots are bot-protection pages; OC-228 is not in the index. This matters because Reserve Pay — not Circle — is the rail Razorpay's MCP server implements.
