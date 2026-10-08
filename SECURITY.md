# Security policy

## Supported versions

Only the latest release receives security fixes.

| Version | Supported |
|---|---|
| 0.1.x (latest) | ✅ |
| older | ❌ |

## Reporting a vulnerability

Please **do not open a public issue**. Report it privately through GitHub:
**Security › Report a vulnerability** on this repository
([private security advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)).

Include the version, a minimal plan (YAML) or the steps that reproduce the issue, and what an attacker gains (code
execution in the dashboard, a service called without confirmation, a request to another site…). You will get an answer
within a few days; a fix is released as soon as possible, and the advisory is published once the fix is out.

## Scope

Maquette runs in the Home Assistant frontend with the rights of the logged-in user. What it guarantees, and what the
card checks, is described in [Security](docs/reference.md#security):

- a plan (YAML, an imported file, a template or a draft) never runs code nor loads anything from another site;
- a sensitive service (unlock, disarm, open a garage door, a gate, a valve…) is always confirmed in a dialog that
  names the real action and entity;
- an import shows what the plan can control before it is applied.

A bypass of any of these is a vulnerability. Import plans only from people you trust: a plan can still contain buttons
calling safe services (lights, switches, scenes) on your entities.
