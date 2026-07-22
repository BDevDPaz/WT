# Audit Status

## 2026-07-22

Initial repository security audit workflows were added and validated.

## GitHub Actions

- Gitleaks: passing
- Trivy filesystem scan: passing

## Notes

- The first Trivy run failed because the workflow referenced an unavailable action version.
- The workflow was fixed to use `aquasecurity/trivy-action@v0.36.0`.
- The corrected Trivy run passed.
