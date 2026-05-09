import { describe, test, expect } from "bun:test";
import { Elysia, t } from "elysia";

interface ErrorResponse {
  success: boolean;
  error: string;
}

/**
 * Tests for the global error handler (onError hook).
 * We create a minimal Elysia app with the same onError logic to test in isolation.
 */

function createAppWithErrorHandler() {
  return new Elysia()
    .onError(({ code, error, set }) => {
      if (code === "VALIDATION") {
        set.status = 400;
        return { success: false, error: error.message };
      }

      console.error("Internal error:", error);
      set.status = 500;
      return { success: false, error: "internal server error" };
    })
    .post("/validated", ({ body }) => ({ success: true, data: body }), {
      body: t.Object({ name: t.String({ minLength: 1 }) }),
    })
    .get("/throw", () => {
      throw new Error("something broke internally");
    });
}

describe("Global Error Handler", () => {
  test("returns 400 with error message for validation errors", async () => {
    const app = createAppWithErrorHandler();

    const response = await app.handle(
      new Request("http://localhost/validated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      }),
    );

    expect(response.status).toBe(400);
    const json = (await response.json()) as ErrorResponse;
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
    expect(typeof json.error).toBe("string");
  });

  test("returns 400 for missing required fields", async () => {
    const app = createAppWithErrorHandler();

    const response = await app.handle(
      new Request("http://localhost/validated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    const json = (await response.json()) as ErrorResponse;
    expect(json.success).toBe(false);
    expect(json.error).toBeDefined();
  });

  test("returns 500 with generic message for unexpected errors", async () => {
    const app = createAppWithErrorHandler();

    const response = await app.handle(new Request("http://localhost/throw"));

    expect(response.status).toBe(500);
    const json = (await response.json()) as ErrorResponse;
    expect(json).toEqual({ success: false, error: "internal server error" });
  });

  test("does not expose stack traces in 500 responses", async () => {
    const app = createAppWithErrorHandler();

    const response = await app.handle(new Request("http://localhost/throw"));

    const json = (await response.json()) as ErrorResponse;
    expect(json.error).not.toContain("Error:");
    expect(json.error).not.toContain("at ");
    expect(json.error).not.toContain(".ts");
    expect(json.error).not.toContain(".js");
    expect(json.error).not.toContain("/src/");
  });

  test("does not expose internal details in 500 responses", async () => {
    const app = createAppWithErrorHandler();

    const response = await app.handle(new Request("http://localhost/throw"));

    const json = (await response.json()) as ErrorResponse;
    expect(json.error).toBe("internal server error");
    // Only two keys: success and error
    expect(Object.keys(json)).toEqual(["success", "error"]);
  });
});
