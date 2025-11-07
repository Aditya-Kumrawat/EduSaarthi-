import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleVapiProxy,
  handleVapiCall,
  handleVapiTest,
} from "./routes/vapi-proxy";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Vapi proxy routes to bypass client-side network restrictions
  app.get("/api/vapi/test", handleVapiTest);
  app.post("/api/vapi/call", handleVapiCall);
  app.all("/api/vapi/:endpoint", handleVapiProxy);

  return app;
}
