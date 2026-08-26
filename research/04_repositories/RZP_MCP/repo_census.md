# Repo census: RZP_MCP

- source: https://github.com/razorpay/razorpay-mcp-server.git
- head: 7950d51
- last commit: 2026-03-26T15:22:36+05:30
- first commit: 2025-04-26T16:43:50+05:30
- commits (shallow 50): 58
- authors:     14	Himanshu Shekhar;    13	Chirag Chiranjib;     7	KarthikBoddeda;     6	jating06;     4	Alok Kumar Singh;     2	stuckinforloop;     2	vaibhavchopra-wq;     1	Ankit Choudhary;     1	Bryan Thompson;     1	Jayant (An Indian);
- tracked files: 94
- repo size: 448K

## Language mix (tracked, by file count)
  61 go
  12 md
   8 yml
   2 yaml
   1 sum
   1 out
   1 mod
   1 mdc

## Largest tracked source files
120	pkg/razorpay/payments_test.go
56	coverage.out
48	pkg/razorpay/integrations/mobile.go
40	pkg/razorpay/integrations/backend_node.go
36	pkg/razorpay/tools_params_test.go
32	pkg/razorpay/payments.go
32	pkg/razorpay/integrations/checkout_integration_test.go
32	pkg/razorpay/integrations/backend_python.go
32	pkg/mcpgo/tool_test.go
28	pkg/razorpay/orders_test.go
24	pkg/razorpay/tokens_test.go
24	pkg/razorpay/settlements_test.go
24	pkg/razorpay/qr_codes_test.go
24	pkg/razorpay/integrations/backend_other.go
20	README.md
20	pkg/razorpay/refunds_test.go
20	pkg/razorpay/payment_links.go
20	pkg/razorpay/payment_links_test.go
16	pkg/toolsets/toolsets_test.go
16	pkg/razorpay/tools_params.go
16	pkg/razorpay/README.md
16	pkg/razorpay/qr_codes.go
16	pkg/razorpay/orders.go
16	pkg/razorpay/integrations/backend_java.go
16	pkg/razorpay/integrations/backend_go.go
16	pkg/mcpgo/tool.go
16	AGENTS.md
16	.cursor/skills/razorpay-mcp-tool-gen/SKILL.md
16	.claude/skills/razorpay-mcp-tool-gen/SKILL.md
16	.agents/skills/razorpay-mcp-tool-gen/SKILL.md

## Signal files present
  PRESENT  README.md
  PRESENT  Dockerfile
  PRESENT  Makefile
  PRESENT  go.mod
  PRESENT  .github/workflows

## Directory tree (depth 3, excluding vendor/build)
.
.agents
.agents/skills
.agents/skills/razorpay-mcp-tool-gen
.claude
.claude/skills
.claude/skills/razorpay-mcp-tool-gen
.cursor
.cursor/rules
.cursor/skills
.cursor/skills/razorpay-mcp-tool-gen
cmd
cmd/razorpay-mcp-server
pkg
pkg/contextkey
pkg/log
pkg/mcpgo
pkg/observability
pkg/razorpay
pkg/razorpay/integrations
pkg/razorpay/mock
pkg/toolsets

## Heuristic signal grep (counts)
  openai\|anthropic\|gemini\|litellm\|langchain\|llamaindex\|crewai\|autogen 0
  prompt                                                  3
  retry\|backoff\|tenacity                                0
  audit                                                   0
  precision\|recall\|f1_score\|confusion                  0
  eval\b\|evaluate\|benchmark                             0
  webhook                                                 0
  razorpay\|stripe\|paypal\|adyen                         0
  try:\|except\|catch\s*(                                 0
  test_\|describe(\|it(                                   0
  TODO\|FIXME\|HACK                                       0
  demo_mode\|MOCK\|hardcod\|dummy\|sample_data            0
