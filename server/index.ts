import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// O build coloca o app em dist/public e este servidor em dist/index.js.
const staticPath = path.resolve(__dirname, "public");

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.static(staticPath));

  // Rotas do cliente caem no index.html.
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Servidor em http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
