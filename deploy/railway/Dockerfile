# Official Twenty image + the Virabha patch that makes the workspace cap configurable
# (see packages/twenty-server/src/engine/core-modules/auth/constants/
#  max-workspaces-without-organization-key.constant.ts). Used by both the Twenty
# server and worker services on Railway.
ARG TWENTY_VERSION=v2.57.1
FROM twentycrm/twenty:${TWENTY_VERSION}

USER root
# Fail the build if the compiled constant moves, so an upgrade can't silently drop the patch.
RUN set -e; \
    files=$(grep -rlE --include='*.js' 'MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY *= *5\b' /app/packages/twenty-server/dist || true); \
    if [ -z "$files" ]; then echo "workspace cap constant not found; update the patch" >&2; exit 1; fi; \
    sed -i -E 's/(MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY *= *)5\b/\1Number(process.env.MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY ?? 5)/' $files; \
    grep -c 'process.env.MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY' $files
USER 1000
