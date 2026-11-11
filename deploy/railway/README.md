# Railway deployment (Virabha)

Twenty server and worker run from `Dockerfile` here: the official image pinned to
`TWENTY_VERSION`, with the workspace cap made configurable.

Required variables on both services, besides Twenty's usual ones:

| Variable | Value |
| --- | --- |
| `SERVER_URL` | `https://crm.grotutor.in` |
| `IS_MULTIWORKSPACE_ENABLED` | `true` |
| `IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS` | `false` |
| `DEFAULT_SUBDOMAIN` | `app` |
| `TRUST_PROXY` | `1` (Railway's edge is one hop; without it logins fail with "Request origin is not allowed to receive a session cookie") |
| `MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY` | `Infinity` |

DNS: `crm` and `*.crm` CNAMEs plus `_acme-challenge.crm` as shown in Railway's domain settings.

To upgrade Twenty, bump `TWENTY_VERSION` and redeploy; the build fails if the patch no longer applies.
