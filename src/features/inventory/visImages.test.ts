import { describe, expect, it } from "vitest";
import { expandVisImages, VIS_SLOT_COUNT } from "./visImages";

const WITH_SET =
  "https://vis.iaai.com/resizer?imageKeys=46638579~SID~B443~S1~I1~RW2576~H1932~TH0&width=161&height=120";
const NO_SET = "https://vis.iaai.com/resizer?imageKeys=38261905~SID~I1&width=400&height=300";

function keyOf(src: string): string {
  return new URL(src).searchParams.get("imageKeys") || "";
}

describe("expandVisImages", () => {
  it("builds the slot list from a stored S1 photo and tries that set first", () => {
    const shots = expandVisImages(WITH_SET);
    expect(VIS_SLOT_COUNT).toBe(16);
    expect(keyOf(shots[0].thumb)).toBe("46638579~SID~B443~S1~I1~RW2576~H1932~TH0");
    expect(shots.filter((shot) => shot.index === 1).map((shot) => shot.set)).toEqual(["S1", "S0"]);
    expect(shots.filter((shot) => shot.index === 7).map((shot) => shot.set)).toEqual(["S0"]);
    expect(shots.filter((shot) => shot.index === 9).map((shot) => shot.set)).toEqual(["S0"]);
    expect(shots.filter((shot) => shot.index === 10).map((shot) => shot.set)).toEqual(["S0"]);
    expect(shots.filter((shot) => shot.index === 118).map((shot) => shot.set)).toEqual(["S0"]);
    expect(shots.filter((shot) => [7, 9, 10, 118].includes(shot.index) && shot.set === "S1")).toEqual([]);
    expect(new URL(shots[0].thumb).searchParams.get("width")).toBe("161");
    expect(new URL(shots[0].large).searchParams.get("width")).toBe("960");
    expect(new URL(shots[0].large).searchParams.get("height")).toBe("720");
    expect(keyOf(shots[0].large)).toContain("~SID~");
  });

  it("tries S0 first when the stored photo uses S0", () => {
    const shots = expandVisImages(WITH_SET.replace("~S1~", "~S0~"));
    expect(shots.filter((shot) => shot.index === 5).map((shot) => shot.set)).toEqual(["S0", "S1"]);
  });

  it("keeps one link per index when the key has no S token", () => {
    const shots = expandVisImages(NO_SET);
    expect(shots).toHaveLength(VIS_SLOT_COUNT);
    expect(shots.map((shot) => shot.set)).toEqual(Array(VIS_SLOT_COUNT).fill(null));
    expect(keyOf(shots[0].thumb)).toBe("38261905~SID~I1");
    expect(keyOf(shots.find((shot) => shot.index === 119)?.thumb || "")).toBe("38261905~SID~I119");
    expect(shots.every((shot) => !/~S\d+/.test(keyOf(shot.thumb)))).toBe(true);
    expect(new URL(shots[0].thumb).searchParams.get("width")).toBe("400");
  });

  it("returns nothing for a link that is not a vis key", () => {
    expect(expandVisImages("https://example.com/photo.jpg")).toEqual([]);
    expect(expandVisImages("not a url")).toEqual([]);
  });
});
