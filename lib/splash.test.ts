import { describe, expect, it } from "vitest";
import { channels, inkOn, splashColor } from "./splash";

const svg = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 852"><clipPath id="logo"><rect x="96" y="326" width="200" height="200" rx="0"/></clipPath>` +
  `<rect width="100%" height="100%" fill="${fill}"/><image href="data:image/png;base64,AAAA" x="96" y="326" width="200" height="200"/></svg>`;

describe("splashColor", () => {
  it("reads the fill of the rect that covers the whole splash, skipping the logo's clip rect", () => {
    expect(splashColor(svg("#1b3a2f"))).toBe("#1b3a2f");
  });

  it("accepts short hex and rgb() colors", () => {
    expect(splashColor(svg("#fff"))).toBe("#fff");
    expect(splashColor(svg("rgb(233, 236, 234)"))).toBe("rgb(233, 236, 234)");
  });

  it("refuses anything that isn't a plain color, so the value is safe to put in a style", () => {
    expect(splashColor(svg("red;background:url(x)"))).toBeNull();
    expect(splashColor(svg("url(#g)"))).toBeNull();
  });

  it("is null for an SVG with no full-size rect", () => {
    expect(splashColor("<svg><rect width=\"10\" height=\"10\" fill=\"#000\"/></svg>")).toBeNull();
    expect(splashColor("not an svg")).toBeNull();
  });
});

describe("channels", () => {
  it("splits hex and rgb() colors into red, green and blue", () => {
    expect(channels("#1b3a2f")).toEqual([27, 58, 47]);
    expect(channels("#abc")).toEqual([170, 187, 204]);
    expect(channels("rgb(1, 2, 3)")).toEqual([1, 2, 3]);
  });

  it("is null for values out of range or in other formats", () => {
    expect(channels("rgb(300, 0, 0)")).toBeNull();
    expect(channels("#12345")).toBeNull();
    expect(channels("green")).toBeNull();
  });
});

describe("inkOn", () => {
  it("picks light text on a dark splash and dark text on a light one", () => {
    expect(inkOn("#1b3a2f")).toBe("light");
    expect(inkOn("rgb(233, 236, 234)")).toBe("dark");
    expect(inkOn("#ffffff")).toBe("dark");
    expect(inkOn("#000")).toBe("light");
  });
});
