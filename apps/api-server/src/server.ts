import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { closeDatabaseConnection } from "./db";

const server = app.listen(env.PORT, () => {
  logger.info(`API server listening on port ${env.PORT}`);
});

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      closeDatabaseConnection()
        .then(() => resolve())
        .catch(reject);
    });
  });
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
