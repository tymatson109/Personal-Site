import { describe, expect, it } from "vitest";
import { insertAt, moveItem, removeAt, replaceAt } from "./list-ops";

const LIST = ["a", "b", "c"];

describe("list edits", () => {
  it("inserts items at a position", () => {
    expect(insertAt(LIST, 1, "x", "y")).toEqual(["a", "x", "y", "b", "c"]);
  });

  it("removes the item at a position", () => {
    expect(removeAt(LIST, 0)).toEqual(["b", "c"]);
  });

  it("replaces the item at a position", () => {
    expect(replaceAt(LIST, 2, "z")).toEqual(["a", "b", "z"]);
  });

  it("moves an item up or down", () => {
    expect(moveItem(LIST, 2, 0)).toEqual(["c", "a", "b"]);
    expect(moveItem(LIST, 0, 1)).toEqual(["b", "a", "c"]);
  });

  it("leaves the list alone for a move past either end", () => {
    expect(moveItem(LIST, 0, -1)).toEqual(LIST);
    expect(moveItem(LIST, 2, 3)).toEqual(LIST);
  });

  it("never changes the list it was given", () => {
    moveItem(LIST, 0, 2);
    removeAt(LIST, 1);
    expect(LIST).toEqual(["a", "b", "c"]);
  });
});
