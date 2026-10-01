import { describe, expect, it } from "vitest";
import { groupsFromIdToken, isAdminFromGroups } from "./groups";

function token(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const b64 = btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `hdr.${b64}.sig`;
}

describe("groupsFromIdToken", () => {
  it("reads an array of groups", () => {
    expect(groupsFromIdToken(token({ "cognito:groups": ["Admin", "User"] }))).toEqual(["Admin", "User"]);
  });

  it("reads a single group string", () => {
    expect(groupsFromIdToken(token({ "cognito:groups": "Admin" }))).toEqual(["Admin"]);
  });

  it("returns empty for missing groups, bad jwt, or unreadable payload", () => {
    expect(groupsFromIdToken(token({}))).toEqual([]);
    expect(groupsFromIdToken("not-a-jwt")).toEqual([]);
    expect(groupsFromIdToken("a.%%% .c")).toEqual([]);
  });
});

describe("isAdminFromGroups", () => {
  it("is true only when Admin is present", () => {
    expect(isAdminFromGroups(["Admin"])).toBe(true);
    expect(isAdminFromGroups(["User"])).toBe(false);
    expect(isAdminFromGroups([])).toBe(false);
  });
});
