import http from "node:http";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const url = process.env["DATABASE_URL"];
if (!url) throw new Error("DATABASE_URL não definida");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/health") {
      res.writeHead(200);
      res.end("ok");
      return;
    }
    if (req.url === "/agenda") {
      const itens = await prisma.agenda.findMany();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(itens));
      return;
    }
    res.writeHead(404);
    res.end("not found");
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end("erro");
  }
});

server.listen(3000, () => console.log("API na porta 3000"));