// Minimal stub to fix import errors and allow backend-api to build
export async function checkSupabaseHealth() {
  // TODO: Implement real health check logic
  return { status: "ok", details: "Stub health check" };
}
