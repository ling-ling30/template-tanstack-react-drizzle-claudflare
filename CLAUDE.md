## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Engineering rules

Before changing code, read `docs/RULEBOOK.md` (the engineering contract) and `docs/STANDARDS.md` (TypeScript, styling, forms, i18n, a11y). Key non-negotiables: no hardcoded UI strings (use `t()`), no hardcoded colors (use theme tokens), gate every mutating server function on auth, all DB access in `packages/data-ops/src/queries/`, and normalize failures to `AppError`.
