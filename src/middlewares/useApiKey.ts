import { Elysia } from "elysia";

const configuredKey = process.env.API_KEY;

if (!configuredKey) {
  throw new Error("API_KEY environment variable is not configured");
}

export const useApiKey = new Elysia({ name: "useApiKey" }).onBeforeHandle(
  { as: "global" },
  ({ request, set }) => {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey !== configuredKey) {
      set.status = 401;
      return { success: false, error: "unauthorized" };
    }
  },
);
