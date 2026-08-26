# MCP — verified spec reference, focused on money movement

| Field | Value |
|---|---|
| Current revision | **`2026-07-28`** (`/specification/latest` 307-redirects to it) |
| Published set | `2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25`, `2026-07-28`, `draft` |
| Authoritative schema | `schema/2026-07-28/schema.ts` |
| Retrieved | 2026-08-26 |
| Evidence class | **FACT** — from `curl` of modelcontextprotocol.io `.md` endpoints + authenticated `gh` |

> Method note worth reusing: **appending `.md` to any Mintlify docs URL** (`modelcontextprotocol.io/PATH.md`) returns raw markdown. Faster and more reliable than search snippets.

---

## 1. Breaking changes in `2026-07-28` that will bite a build

- **MCP is now stateless.** The `initialize` / `notifications/initialized` handshake is **removed**. Every request carries `_meta` keys `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities`. (SEP-2575)
- **`Mcp-Session-Id` and protocol-level sessions REMOVED** (SEP-2567). Cross-call state = **server-minted handles passed as ordinary tool arguments.** → *This matters enormously for carts.*
- New `server/discover` RPC — servers **MUST** implement it.
- **MRTR (Multi Round-Trip Requests)** replaces server-initiated requests: server returns `InputRequiredResult` (`resultType: "input_required"`) with `inputRequests`; client retries the **original** request with `inputResponses`. All results now carry a required `resultType` (`"complete"` | `"input_required"`).
- Removed: `ping`, `logging/setLevel`, `notifications/roots/list_changed`, SSE resumability (`Last-Event-ID`).
- Tasks moved out of core into extension `io.modelcontextprotocol/tasks`.
- **Roots, Sampling and Logging DEPRECATED** (SEP-2577, Final). Verbatim: *"The Sampling feature is deprecated as of protocol version `2026-07-28`… New implementations **SHOULD NOT** adopt it; existing implementations **SHOULD** migrate to integrating directly with LLM provider APIs."* 12-month minimum removal window.
- Client→server features are now effectively **just Elicitation**.

## 2. Authorization

Normative standards: OAuth 2.1 (`draft-ietf-oauth-v2-1-13`), RFC6750, RFC8414, RFC7591, RFC8707, RFC9728, RFC9207, `draft-ietf-oauth-client-id-metadata-document-00`, OIDC Discovery 1.0 + DCR 1.0.

Key requirements:
- Authorization is **OPTIONAL** overall; HTTP transports **SHOULD** conform; STDIO **SHOULD NOT** (use env credentials).
- **RFC7591 Dynamic Client Registration is now DEPRECATED** (PR #2858) — *"retained for backwards compatibility with authorization servers that do not support Client ID Metadata Documents."* → **do not build on DCR.** Prefer **CIMD**.
- Servers **MUST** implement **RFC9728 Protected Resource Metadata**; clients **MUST** use it for AS discovery.
- **RFC8707 `resource` parameter: clients MUST include it in BOTH authorization and token requests**, using the canonical URI, **regardless of AS support**. Servers **MUST** validate token audience and **MUST NOT** accept or transit other tokens.
- PKCE `S256` **MUST**; clients **MUST** refuse to proceed if `code_challenge_methods_supported` is absent.
- RFC9207 `iss`: clients **MUST** validate a present `iss` by exact string comparison before redeeming the code.
- Step-up: `403` + `WWW-Authenticate: Bearer error="insufficient_scope", scope="…", resource_metadata="…"`; re-auth with the **union** of prior + challenged scopes.
- Confused-deputy: proxies with static client IDs **MUST** obtain per-client user consent before forwarding.

## 3. ⚠️ HUMAN-IN-THE-LOOP IS NOT ENFORCED — the sharpest finding

**The "must get consent" language is non-normative prose; the RFC-2119 language is only SHOULD.**

- `/specification/2026-07-28` Security and Trust & Safety uses lowercase, non-RFC2119 *must*: *"Hosts **must** obtain explicit user consent before invoking any tool"* — then immediately: *"While MCP itself cannot enforce these security principles at the protocol level, implementors **SHOULD**: 1. Build robust consent and authorization flows…"*
- `/server/tools` Warning verbatim: *"there **SHOULD** always be a human in the loop with the ability to deny tool invocations."*
- Verbatim: *"the protocol itself does not mandate any specific user interaction model."*

> `INFERENCE:` **There is NO protocol-level enforcement of pre-purchase approval.** Any "a human approved this buy" guarantee must be built by the host/client, or by the server via URL-mode elicitation. **This is a real gap and a legitimate thesis.**

### Tool annotations are untrusted hints

`ToolAnnotations` (schema.ts 1912–1954): `title?`, `readOnlyHint?` (default **false**), `destructiveHint?` (default **true**, meaningful only when `readOnlyHint == false`), `idempotentHint?` (default **false**), `openWorldHint?` (default **true**).

Verbatim: *"all properties in `ToolAnnotations` are **hints**… Clients should never make tool use decisions based on `ToolAnnotations` received from untrusted servers."* And: *"clients **MUST** consider tool annotations to be untrusted unless they come from trusted servers."*

→ **`destructiveHint: true` on `capture_payment` obligates nothing.** A Tool Annotations Interest Group exists to assess whether four hints suffice (repo `modelcontextprotocol/experimental-ext-tool-annotations`).

## 4. Elicitation — the one payment-blessed primitive

Two modes: `form` (structured JSON-Schema, flat objects, primitive props, **exposed to client**) and `url` (out-of-band, data **not** exposed to client). Defaults to `form`.

**Verbatim, directly on point:**
> *"Servers **MUST NOT** use form mode elicitation to request sensitive information such as passwords, API keys, access tokens, or **payment credentials**. Servers **MUST** use URL mode for interactions involving such sensitive information."*

URL mode (new in `2025-11-25`) verbatim: *"essential for auth flows, **payment processing**, and other sensitive or secure operations."* Params `{mode:"url", message, url}`. Response actions `accept | decline | cancel` — **`accept` means consent to open, NOT completion**; the server correlates via its own `requestState` on retry (MRTR). `notifications/elicitation/complete` and `elicitationId` were removed in 2026-07-28.

Clients **MUST** show which server is asking, provide decline/cancel, and *"For URL mode, clearly display the target domain/host and gather user consent before navigation."*

> **This is the single most useful MCP primitive for a Razorpay build: URL-mode elicitation is the spec-blessed way to hand off to a hosted Razorpay checkout / UPI page mid-tool-call.**

## 5. Payments in MCP — nothing in core, and the proposal is dead

- **SEP-2007 "Add MCP Payment Support Specification"** (author `shivankgoel`, sponsor `LucaButBoring`, created 2025-12-23) proposed a `payment` capability (`{"protocols":["x402"]}`), payment info in `tools/list`, and JSON-RPC error **`-32402`** as the challenge. **CLOSED UNMERGED 2026-06-24.** Maintainer `localden`, verbatim: *"This SEP has not received a sponsor in the past 6 months and is considered dormant."* Companions #2008, #2009 also closed.
- **Issue #3229** "RFC: Native Token Metering, Session Budgets, and Payment Tracking (x402) for MCP" — opened 2026-08-11, **closed 2026-08-23**. Not adopted.
- `gh search issues "monetiz"` in the spec repo → **0 results**.
- **No payments/commerce Working Group.** The nearest is the **Financial Services Interest Group** (facilitator Sambhav Kothari, Bloomberg) — scope is compliance, auditability, data lineage, attestation, policy enforcement. **Payments are explicitly out of scope.**
- Related open, unmerged: **SEP-2752** HTTP Message Signing (RFC 9421 proof-of-possession); **SEP-2127** MCP Server Cards (`.well-known/ai-catalog.json`).

> **Note the pattern:** MCP's payment SEP died for lack of a sponsor. Razorpay's four ACP SEPs are stalled for lack of a sponsor. **Both of the obvious standards routes to agent payments are governance-blocked.**

## 6. x402 — the real de-facto binding, and why it doesn't work for INR

Canonical repo is **`x402-foundation/x402`** (★6,542, pushed 2026-08-25) — **not** `coinbase/x402` (★147). It ships a formal normative MCP transport spec at `specs/transports-v2/mcp.md`.

Mechanism, verbatim:
1. Client calls a paid tool with no payment.
2. Server returns a tool result with **`isError: true`** containing `PaymentRequired`, in **both** `structuredContent` and `content[0].text`. *(Uses `isError`, not a JSON-RPC error code.)*
3. Client retries `tools/call` with payment in **`_meta["x402/payment"]`**.
4. Server settles and returns settlement info in **`_meta["x402/payment-response"]`**.

Constants (`python/x402/mcp/types.py`): `MCP_PAYMENT_REQUIRED_CODE = 402`, `MCP_PAYMENT_META_KEY = "x402/payment"`, `MCP_PAYMENT_RESPONSE_META_KEY = "x402/payment-response"`. Go equivalent at `go/mcp/`; `cloudflare/agents` ships `examples/x402-mcp`.

Schemes: `exact`, `upto`, `auth-capture`, `batch-settlement`. Extensions: `bazaar` (tool discovery/cataloging, **explicitly covering MCP tools**, `input.type: "mcp"`), `extension-offer-and-receipt` (**signed offers + signed receipts for dispute evidence**, EIP-712 or JWS), `payment_identifier`, `sign-in-with-x`, `http-message-signatures`.

> **CRITICAL CAVEAT:** x402 settles **on-chain** (USDC on Base `eip155:84532`). The **pattern** — 402 challenge → signed authorization → verify → execute → settle — transfers cleanly to INR/UPI. The **implementation does not.**
>
> `INFERENCE:` building a **fiat/UPI scheme under the x402 v2 scheme abstraction, or an MCP-native equivalent, is an open and defensible slot.**

Agent identity already lives here: `specs/extensions/http-message-signatures.md`, verbatim — *"establishes the **identity** of the paying agent through cryptographic signatures (**RFC 9421**)"*, with `tags: ["web-bot-auth", "agent-browser-auth"]`.

## 7. Other surfaces relevant to commerce

- **MCP Apps** (`io.modelcontextprotocol/apps`, repo `ext-apps`): tool declares `_meta.ui.resourceUri` → `ui://` resource → host renders HTML in a **sandboxed iframe**; `_meta.ui.csp` controls origins, `_meta.ui.permissions` requests capabilities; bidirectional (the app can call tools back). → viable in-conversation cart/checkout UI, **but PCI-sensitive fields still belong in URL-mode elicitation.**
- **Tasks extension** (`ext-tasks`): `tasks/get` polling, `tasks/update` for client→server input, durable handles. Owned by the Agents Working Group, chartered to promote Tasks into core.
- **Official MCP registry** (`registry.modelcontextprotocol.io/v0/servers`): searching `razorpay` returns exactly **one** entry — `io.github.indiamcp/razorpay` (npm `@indiamcp/razorpay-mcp` 0.1.0, stdio), published 2026-05-21. **Razorpay's own official server is NOT in the registry.**

## 8. Why this matters for Track 01

Track 01's bar: *"Every money action explainable, **bounded and gated**. Show the **audit trail** and one failure handled gracefully."*

Cross-referencing this document with `acp_spec_reference.md`, the state of the world is:

| Capability | ACP | MCP | x402 |
|---|---|---|---|
| Express spend limit | `Allowance`: one merchant × one session × max amount × expiry, **single use only** | **nothing** | scheme-level, on-chain |
| Recurring / per-period budget | ❌ | ❌ | partial |
| Multi-merchant / category (MCC) limits | ❌ | ❌ | ❌ |
| Velocity rules | ❌ | ❌ | ❌ |
| Enforced human approval | ❌ | **SHOULD only, unenforced** | ❌ |
| Agent identity | ❌ | ❌ | RFC 9421 (extension) |
| Dispute evidence surface | ❌ (data only, no endpoint) | ❌ | `offer-and-receipt` extension |
| Works on Indian rails (UPI) | ❌ (SPT excludes India; 4 SEPs stalled) | n/a | ❌ (crypto) |

> **Every cell that matters for India is empty.** `INFERENCE:` the unoccupied, defensible ground is **expressing and enforcing bounded, auditable spend authority for an agent buying on Indian rails** — which is close to a restatement of Track 01's bar.

## Evidence index
modelcontextprotocol.io `.md` endpoints: /specification/latest · /2026-07-28 · /changelog · /basic/authorization · /basic/authorization/security-considerations · /basic/patterns/mrtr · /server/tools · /server/resources · /client/elicitation · /client/sampling · /extensions/overview · /extensions/apps/overview · /seps/2577 · /community/interest-groups/{financial-services,tool-annotations} · /community/working-groups/agents · /llms.txt
GitHub (`gh api`): modelcontextprotocol/modelcontextprotocol (schema.ts, docs/specification, PRs/issues 2007/2008/2009/2752/2127/3229) · x402-foundation/x402 (specs/transports-v2/mcp.md, x402-specification-v2.md, extensions/*, python/x402/mcp/*) · razorpay/razorpay-mcp-server · google-agentic-commerce/a2a-x402 · cloudflare/agents
Registry: registry.modelcontextprotocol.io/v0/servers?search=razorpay
