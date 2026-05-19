import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { useApiKey } from "./middlewares/useApiKey";
import { tasksModule } from "./modules/tasks";

const isLocal = process.env.NODE_ENV === "local";

let app = new Elysia().use(cors());

if (isLocal) {
  app = app.use(
    swagger({
      documentation: {
        info: {
          title: "Taskify API",
          version: "1.0.0",
          description: "Task management API",
        },
        components: {
          securitySchemes: {
            apiKey: {
              type: "apiKey",
              in: "header",
              name: "x-api-key",
            },
          },
        },
        security: [{ apiKey: [] }],
      },
    }),
  );
}

app
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.errors?.length) {
          const messages = parsed.errors.map(
            (e: { path: string; message: string }) => `${e.path}: ${e.message}`,
          );
          return { success: false, error: messages.join("; ") };
        }
        return { success: false, error: parsed.message ?? "validation error" };
      } catch {
        return { success: false, error: error.message };
      }
    }

    console.error("Internal error:", error);
    set.status = 500;
    return { success: false, error: "internal server error" };
  })
  .use(useApiKey)
  .use(tasksModule);

export { app };
export default app;
