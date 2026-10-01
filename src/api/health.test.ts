import { describe, expect, it } from "vitest";
import { GET } from "../../app/api/health/route";

describe("health API endpoint", () => {
  it("returns status ok with 200", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("fairpy-sales-frontend");
    expect(typeof body.timestamp).toBe("string");
  });
});
