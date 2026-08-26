const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", message: "Backend rodando!" }));
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Backend ouvindo na porta 3000");
});
