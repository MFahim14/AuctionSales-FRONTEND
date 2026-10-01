export function groupsFromIdToken(token: string): string[] {
  const parts = token.split(".");
  if (parts.length < 2) {
    return [];
  }
  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  try {
    const json = JSON.parse(atob(padded)) as { "cognito:groups"?: string | string[] };
    const groups = json["cognito:groups"];
    if (Array.isArray(groups)) {
      return groups;
    }
    if (typeof groups === "string" && groups) {
      return [groups];
    }
    return [];
  } catch {
    return [];
  }
}

export function isAdminFromGroups(groups: string[]): boolean {
  return groups.includes("Admin");
}
