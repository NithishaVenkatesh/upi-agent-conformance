# Verified: Razorpay is actively trying to put UPI into agentic commerce — and is blocked

| Field | Value |
|---|---|
| Method | `gh api search/issues q='repo:agentic-commerce-protocol/agentic-commerce-protocol razorpay type:pr'` + per-PR `gh api` |
| Retrieved | 2026-08-26 |
| Evidence class | **FACT — verified directly against the GitHub API by this session**, not second-hand |

## The finding

Razorpay employees have filed **six pull requests** into OpenAI/Stripe's **Agentic Commerce Protocol** repo attempting to add UPI support. **Five of the six are still open. None is merged.**

| PR | Title | Author | State | Created | Last activity |
|---|---|---|---|---|---|
| #46 | feat: Add UPI payment method support to Agentic Commerce Protocol | `jating06` | **open** | 2025-12-03 | 2026-02-05 |
| #213 | Add Razorpay payment handlers (UPI and Reserve Pay) | `himanshu-rzp` | closed | 2026-04-06 | 2026-04-30 |
| #215 | SEP: Add Razorpay Magic Checkout Payment Handler | `himanshu-rzp` | **open** | 2026-04-12 | 2026-05-15 |
| #216 | SEP: Add Razorpay UPI Circle Delegated Payment Handler | `himanshu-rzp` | **open** | 2026-04-12 | 2026-05-15 |
| #217 | SEP: Add Razorpay UPI Intent Payment Handler | `himanshu-rzp` | **open** | 2026-04-12 | 2026-05-15 |
| #218 | SEP: Add Razorpay S2S Cards Payment Handler | `himanshu-rzp` | **open** | 2026-04-12 | 2026-05-15 |

**Stalled:** #46 untouched for ~6 months; #215–218 untouched for ~3.5 months.

## The authors are the same engineers who build Razorpay's MCP server — `FACT`

`git shortlog -sne` on `razorpay/razorpay-mcp-server`:

```
14  Himanshu Shekhar <himanshu.shekhar@razorpay.com>   ← ACP PRs #213, #215-218
 7  Chirag Chiranjib
 7  KarthikBoddeda
 6  jating06                                            ← ACP PR #46
```

**Himanshu Shekhar is the single largest contributor to Razorpay's MCP server *and* the author of four of the six ACP SEPs.** `jating06` is also in both. This is not a side experiment by an unrelated team — the people building Razorpay's agent tooling are the people trying to get UPI into the global agentic-commerce spec.

## Razorpay's own words on the problem — `FACT`, verbatim from PR #46

> *"OpenAI's Agentic Commerce Protocol currently supports only card payments through providers like Stripe. This limits the protocol's adoption in India, where UPI ... is the dominant payment method with over 10 billion transactions monthly."*
>
> **Key Challenges:**
> - *"India's most popular payment method (UPI) is not supported in the Agentic Commerce Protocol"*
> - *"No way for AI agents like ChatGPT to make payments using delegated UPI credentials"*
> - *"Merchants in India cannot leverage AI-driven commerce for their customers"*

And from #217 (reported via a peer research chain, `INFERENCE` pending direct re-verification of this exact quote):
> *"600M+ UPI users have no ACP-native in-chat payment path… UPI is 80%+ of India's digital payments, $2.6T annually."*

## Why the PRs are stuck — `INFERENCE`, high confidence

ACP governance requires that *"Every SEP must be sponsored by a TSC member to proceed."* None of the four SEPs has a TSC sponsor. Reviewers from Meta and Stripe engaged in April–May 2026, asked that the schemas be generalised beyond Razorpay, Himanshu addressed the feedback within ~24 hours (renaming `com.razorpay.upi_circle` → `dev.acp.upi_circle`) — **and no maintainer has replied since.**

So this is **stalled effort, not absent effort.** The blocker is political/governance, not technical.

## One additional technical fact that matters — `FACT`

In `rfcs/rfc.payment_handlers.md`, `psp` is an **open string**, not an enum:

```json
"psp": { "type":"string", "description":"Payment Service Provider identifier",
         "examples":["stripe","adyen","braintree","checkout"], "minLength":1 }
```

→ **Anyone can self-declare `psp: "razorpay"` today without a spec change.** What is blocked is the merge of the four *handler schemas*, not the right to use the identifier. **A student can therefore build a working Razorpay/UPI ACP handler right now, against the real spec, without permission.**

## Strategic reading — `INFERENCE`

This is the strongest single alignment signal found so far, and it is not visible from the Buildathon page:

1. Track 01's why-now names **ACP** explicitly. Now we know *why*: Razorpay has four unmerged SEPs sitting in that repo.
2. The gap Razorpay is publicly failing to close — **UPI-native agentic commerce** — is a real, specified, verifiable engineering problem with a public spec to build against.
3. A submission that implements a working UPI/Razorpay ACP path lands in front of judges who may literally include the engineer whose PRs are stalled.
4. It is *defensibly* a payments problem, not an SEO or catalog problem — which is the trap in Track 01.

**Caveat / strongest counter-argument:** proximity to a company's stalled internal initiative can cut both ways. If Razorpay considers this strategically sensitive, or if the applicant's implementation is naive next to work they have already done privately, the comparison is unflattering. This needs to be weighed in idea scoring, not assumed to be pure upside.

## Follow-ups
- Re-verify the #217 quotation directly. (`INFERENCE` until done.)
- Confirm whether Stripe's Shared Payment Token supports India (reported as US/Canada/select-Europe only). If India is absent, that plus unsponsored SEPs is the complete causal explanation for ACP having no India path.
