import { describe, expect, it } from "vitest";
import { ADMIN_GITHUB_IDS, isAdminGithubId, signInError } from "./admin";

describe("isAdminGithubId", () => {
  it("lets in Ty's GitHub account", () => {
    expect(ADMIN_GITHUB_IDS).toEqual(["80430068"]);
    expect(isAdminGithubId("80430068")).toBe(true);
  });

  it("accepts the id as the number GitHub sends", () => {
    expect(isAdminGithubId(80430068)).toBe(true);
  });

  it("turns away any other account", () => {
    expect(isAdminGithubId("1")).toBe(false);
    expect(isAdminGithubId(804300680)).toBe(false);
  });

  it("turns away a missing or malformed id", () => {
    expect(isAdminGithubId(undefined)).toBe(false);
    expect(isAdminGithubId(null)).toBe(false);
    expect(isAdminGithubId("")).toBe(false);
    expect(isAdminGithubId(["80430068"])).toBe(false);
  });

  it("checks against the allowlist it is given", () => {
    expect(isAdminGithubId("7", ["7"])).toBe(true);
    expect(isAdminGithubId("80430068", [])).toBe(false);
  });
});

describe("signInError", () => {
  it("says nothing when there is no error", () => {
    expect(signInError(undefined)).toBeUndefined();
  });

  it("explains that a refused account isn't allowed in", () => {
    expect(signInError("AccessDenied")).toBe("That GitHub account isn't allowed in.");
  });

  it("asks to try again for any other error", () => {
    expect(signInError("Configuration")).toBe("Sign-in didn't work. Try again.");
    expect(signInError(["x", "y"])).toBe("Sign-in didn't work. Try again.");
  });
});
