# Contributing to AIOS

Thank you for your interest in contributing to AIOS.

AIOS is being developed as an open-source project exploring an AI-native operating environment.

## Development Philosophy

AIOS is developed incrementally. Contributions should fit the current architecture and roadmap rather than introducing unrelated functionality.

Before starting a significant feature, open an issue to discuss:

* The problem
* Proposed solution
* Architectural impact
* Security implications
* Testing requirements

## Workflow

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Add or update tests where appropriate.
5. Update documentation when architecture or behavior changes.
6. Open a pull request.

Example:

```bash
git checkout -b feat/your-feature
```

After making changes:

```bash
git status
git add .
git commit -m "feat: describe your change"
git push origin feat/your-feature
```

## Commit Convention

Use concise conventional commits where practical.

Examples:

```text
feat: add project manager
fix: handle failed process startup
docs: update architecture
test: add process lifecycle tests
refactor: simplify model provider interface
chore: update development tooling
```

## Pull Requests

Pull requests should explain:

* What changed
* Why it changed
* How it was tested
* Any architectural consequences

Keep pull requests focused. Large architectural changes should be discussed before implementation.

## Security

Do not submit vulnerabilities through public issues.

See [`SECURITY.md`](SECURITY.md).

## Code of Conduct

Contributors are expected to communicate respectfully and constructively.

AIOS is intended to be an open project where technical disagreements can be discussed openly and resolved through evidence and experimentation.
