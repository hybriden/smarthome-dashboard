import fs from "fs";
import { createServer } from "http";

const DATA_DIR = process.env.DATA_DIR || "/data";
const SETTINGS_FILE = `${DATA_DIR}/settings.json`;
const PORT = process.env.PORT || 3001;

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url !== "/api/settings") {
    res.writeHead(404);
    return res.end("Not Found");
  }

  if (req.method === "GET") {
    const content = fs.existsSync(SETTINGS_FILE)
      ? fs.readFileSync(SETTINGS_FILE, "utf-8")
      : "{}";
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(content);
  }

  if (req.method === "PUT") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(parsed, null, 2));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"status":"saved"}');
      } catch {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
    return;
  }

  res.writeHead(405);
  res.end("Method Not Allowed");
});

server.listen(PORT, () => console.log(`Settings server on port ${PORT}`));
