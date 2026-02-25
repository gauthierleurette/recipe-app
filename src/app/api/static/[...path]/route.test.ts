// @vitest-environment node
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}));

import { GET } from "./route";
import { readFile } from "fs/promises";
import { NextRequest } from "next/server";

describe("GET /api/static/[...path]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("serves file with image/jpeg for .jpg", async () => {
    vi.mocked(readFile).mockResolvedValue(Buffer.from("jpg-data") as never);
    const res = await GET(new NextRequest("http://localhost/api/static/r1/img.jpg"), {
      params: { path: ["r1", "img.jpg"] },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
  });

  it("serves file with image/png for .png", async () => {
    vi.mocked(readFile).mockResolvedValue(Buffer.from("png-data") as never);
    const res = await GET(new NextRequest("http://localhost/api/static/r1/img.png"), {
      params: { path: ["r1", "img.png"] },
    });
    expect(res.headers.get("Content-Type")).toBe("image/png");
  });

  it("serves file with image/webp for .webp", async () => {
    vi.mocked(readFile).mockResolvedValue(Buffer.from("webp-data") as never);
    const res = await GET(new NextRequest("http://localhost/api/static/r1/img.webp"), {
      params: { path: ["r1", "img.webp"] },
    });
    expect(res.headers.get("Content-Type")).toBe("image/webp");
  });

  it("returns 404 when file not found", async () => {
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
    const res = await GET(new NextRequest("http://localhost/api/static/r1/nope.jpg"), {
      params: { path: ["r1", "nope.jpg"] },
    });
    expect(res.status).toBe(404);
  });

  it("returns 403 for path traversal attempt", async () => {
    const res = await GET(new NextRequest("http://localhost/api/static/../../etc/passwd"), {
      params: { path: ["..", "..", "etc", "passwd"] },
    });
    expect(res.status).toBe(403);
  });
});
