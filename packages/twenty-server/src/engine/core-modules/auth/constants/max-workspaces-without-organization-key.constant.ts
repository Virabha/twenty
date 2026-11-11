// Virabha: self-hosted multi-org deployments set MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY
// (a number, or "Infinity") to raise the default cap of 5 workspaces.
export const MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY = Number(
  process.env.MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY ?? 5,
);
