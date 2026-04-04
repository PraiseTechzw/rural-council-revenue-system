import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorMiddleware, notFound } from "./middleware/error.middleware";
import { registerRoutes } from "./routes";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
	cors({
		origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((value) => value.trim()),
		credentials: true
	})
);
app.use(morgan("combined", { stream: { write: (message: string) => logger.info(message.trim()) } }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

registerRoutes(app);

app.use(notFound);
app.use(errorMiddleware);
