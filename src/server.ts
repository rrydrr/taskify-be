import { app } from "./index";

// Startup validation: refuse to start if API_KEY is not set
if (!process.env.API_KEY) {
  console.error(
    "ERROR: API_KEY environment variable is not set. Refusing to start.",
  );
  process.exit(1);
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.listen(port);

console.log(`Listening on ${app.server!.url}`);
