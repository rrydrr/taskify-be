import { describe, test, expect } from "bun:test";
import { Elysia } from "elysia";
import { useApiKey } from "../middlewares/useApiKey";

const API_KEY = process.env.API_KEY!;

const app = new Elysia()
  .use(useApiKey)
  .get("/test", () => ({ success: true, data: "hello" }));

describe("useApiKey middleware", () => {
  test("rejects request without x-api-key header with 401", async () => {
    const response = await app.handle(new Request("http://localhost/test"));
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: "unauthorized" });
  });

  test("rejects request with empty x-api-key header with 401", async () => {
    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-api-key": "" },
      }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: "unauthorized" });
  });

  test("rejects request with incorrect x-api-key header with 401", async () => {
    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-api-key": "wrong-key" },
      }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: "unauthorized" });
  });

  test("allows request with correct x-api-key header", async () => {
    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-api-key": API_KEY },
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true, data: "hello" });
  });

  test("performs case-sensitive comparison", async () => {
    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: {
          "x-api-key":
            API_KEY.toUpperCase() !== API_KEY
              ? API_KEY.toUpperCase()
              : API_KEY.toLowerCase(),
        },
      }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: "unauthorized" });
  });
});
