// Minimal stub to fix import errors and allow backend-api to build
export const healthMonitor = {
  getLastHealth: () => ({ status: "ok", checkedAt: new Date().toISOString() }),
};
