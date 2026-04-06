---
domain: DevOps, AI Assistance
technology: [GitHub Actions, GitHub Copilot]
categories: [CI/CD, Automation, Agent Configuration]
related:
  - .github/copilot-instructions.md
  - README.md
---

# .github

GitHub-specific configuration including CI/CD workflows, Copilot agent definitions, and prompt templates.

## Child Folders

| Folder | Purpose |
|---|---|
| `workflows/` | GitHub Actions CI/CD pipelines for build, test, deploy, and mutation testing |
| `agents/` | GitHub Copilot custom agent definitions (coder, designer, orchestrator, planner) |
| `prompts/` | Reusable prompt templates for Copilot-assisted development tasks |

## Key Files

- `copilot-instructions.md` — Repository-wide instructions loaded by GitHub Copilot for LLM context about the solution architecture, conventions, and development workflow
