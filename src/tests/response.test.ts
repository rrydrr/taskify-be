import { describe, expect, test } from "bun:test";
import { successResponse, errorResponse } from "../utils/response";

describe("response utilities", () => {
  describe("successResponse", () => {
    test("wraps data in success envelope", () => {
      const result = successResponse({ id: 1, title: "Test" });
      expect(result).toEqual({
        success: true,
        data: { id: 1, title: "Test" },
      });
    });

    test("success field is true", () => {
      const result = successResponse("hello");
      expect(result.success).toBe(true);
    });

    test("works with null data", () => {
      const result = successResponse(null);
      expect(result).toEqual({ success: true, data: null });
    });

    test("works with array data", () => {
      const result = successResponse([1, 2, 3]);
      expect(result).toEqual({ success: true, data: [1, 2, 3] });
    });
  });

  describe("errorResponse", () => {
    test("wraps error string in error envelope", () => {
      const result = errorResponse("task not found");
      expect(result).toEqual({
        success: false,
        error: "task not found",
      });
    });

    test("success field is false", () => {
      const result = errorResponse("unauthorized");
      expect(result.success).toBe(false);
    });

    test("preserves error message exactly", () => {
      const msg = "title must be between 1 and 255 characters";
      const result = errorResponse(msg);
      expect(result.error).toBe(msg);
    });
  });
});
