---
domain: DevOps
technology: [Bash, Docker]
categories: [Scripts, Local Development]
related:
  - docker-compose.local.yml
---

# scripts

Utility scripts for local development setup.

## Files

| File | Purpose |
|---|---|
| `init-azurite-containers.js` | Creates local Azurite blob containers and sets public blob access for `player-photos`, `club-logos`, `coach-photos`, and `user-photos` |
| `setup-sqlserver-docker.sh` | Sets up SQL Server 2022 in Docker for local development (legacy — prefer Docker Compose) |
