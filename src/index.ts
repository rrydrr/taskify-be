import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { useApiKey } from "./middlewares/useApiKey";
import { tasksModule } from "./modules/tasks";

// Startup validation: refuse to start if API_KEY is not set
if (!process.env.API_KEY) {
  console.error(
    "ERROR: API_KEY environment variable is not set. Refusing to start.",
  );
  process.exit(1);
}

const isLocal = process.env.NODE_ENV === "local";
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

let app = new Elysia();

if (isLocal) {
  const apiKey = process.env.API_KEY || "";

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
        // If there are multiple errors, join their messages
        if (parsed.errors?.length) {
          const messages = parsed.errors.map(
            (e: { path: string; message: string }) => `${e.path}: ${e.message}`,
          );
          return { success: false, error: messages.join("; ") };
        }
        return { success: false, error: parsed.message ?? "validation error" };
      } catch {
        // Fallback if message isn't JSON
        return { success: false, error: error.message };
      }
    }

    // Log internally, return generic message
    console.error("Internal error:", error);
    set.status = 500;
    return { success: false, error: "internal server error" };
  })
  .use(useApiKey)
  .use(tasksModule)
  .listen(port);

console.log(`Listening on ${app.server!.url}`);

export { app };
