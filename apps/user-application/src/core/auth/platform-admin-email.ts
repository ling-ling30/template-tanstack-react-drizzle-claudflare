/** Pure allow-list check behind `requirePlatformAdmin` (kept runtime-free for tests). */
export function isPlatformAdminEmail(
  email: string,
  allowList: string
): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return allowList
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .some((entry) => entry === normalized);
}
