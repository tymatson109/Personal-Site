import { describe, expect, it } from "vitest";
import { demoSrc, isDemoUrl } from "./demos";

describe("isDemoUrl", () => {
  it("accepts an https address, trimming spaces around it", () => {
    expect(isDemoUrl("https://roomwise-demo.vercel.app")).toBe(true);
    expect(isDemoUrl("  https://roomwise-demo.vercel.app/  ")).toBe(true);
  });

  it("rejects http, scripts, logins in the address, plain words and non-strings", () => {
    expect(isDemoUrl("http://roomwise-demo.vercel.app")).toBe(false);
    expect(isDemoUrl("javascript:alert(1)")).toBe(false);
    expect(isDemoUrl("https://ty:secret@example.com")).toBe(false);
    expect(isDemoUrl("Roomwise")).toBe(false);
    expect(isDemoUrl(null)).toBe(false);
  });
});

describe("demoSrc", () => {
  it("gives a demo block's address", () => {
    expect(demoSrc({ type: "demo", text: " https://roomwise-demo.vercel.app " })).toBe("https://roomwise-demo.vercel.app");
  });

  it("gives nothing for a demo without an address or for another kind of block", () => {
    expect(demoSrc({ type: "demo", text: "Roomwise" })).toBeNull();
    expect(demoSrc({ type: "p", text: "https://example.com" })).toBeNull();
  });
});
