import "dotenv/config";
import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "./config/database.js";
import app from "./app.js";

const port = Number(process.env.PORT) || 8080;
const frontendDistPath = resolve(dirname(fileURLToPath(import.meta.url)), "../frontend/dist");

app.use(express.static(frontendDistPath));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
  res.sendFile(resolve(frontendDistPath, "index.html"), (error) => {
    if (error) next(error);
  });
});

const start = async () => {
  await connectDatabase();
  app.listen(port, () => console.log(`Server is listening on port ${port}`));
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  start().catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exitCode = 1;
  });
}

export default app;
