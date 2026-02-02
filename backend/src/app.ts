import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import setupRoutes from "./routes/setupRoutes";
import statusRoutes from "./routes/statusRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import stockInRoutes from "./routes/stockInRoutes";
import salesRoutes from "./routes/salesRoutes";
import reportsRoutes from "./routes/reportsRoutes";
import backupRoutes from "./routes/backupRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import exportRoutes from "./routes/exportRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { createSwaggerSpec } from "./swagger";
import swaggerUi from "swagger-ui-express";
import { logger } from "./utils/logger";

const app = express();

const allowedOrigins = ["http://localhost", "http://127.0.0.1"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (origin === "null" || origin.startsWith("file://")) {
        return callback(null, true);
      }
      if (allowedOrigins.some((base) => origin.startsWith(base))) {
        return callback(null, true);
      }
      return callback(new Error("cors-not-allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/setup", setupRoutes);
app.use("/status", statusRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/stock-in", stockInRoutes);
app.use("/sales", salesRoutes);
app.use("/reports", reportsRoutes);
app.use("/backup", backupRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/export", exportRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(createSwaggerSpec()));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

export default app;
