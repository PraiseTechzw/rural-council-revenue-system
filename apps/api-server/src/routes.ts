import type { Express } from "express";
import { API_PREFIX, HEALTH_PATH } from "./config/constants";
import { success } from "./lib/api-response";
import { requireAuth } from "./middleware/auth.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { collectorsRouter } from "./modules/collectors/collectors.routes";
import { auditLogsRouter } from "./modules/audit-logs/auditLogs.routes";
import { paymentsRouter } from "./modules/payments/payments.routes";
import { payersRouter } from "./modules/payers/payers.routes";
import { receiptsRouter } from "./modules/receipts/receipts.routes";
import { reportsRouter } from "./modules/reports/reports.routes";
import { revenueSourcesRouter } from "./modules/revenue-sources/revenueSources.routes";
import { syncRouter } from "./modules/sync/sync.routes";
import { usersRouter } from "./modules/users/users.routes";
import { wardsRouter } from "./modules/wards/wards.routes";

export function registerRoutes(app: Express) {
  app.get(`${API_PREFIX}${HEALTH_PATH}`, (_req, res) => {
    res.json(
      success("Rural Council Revenue API is healthy", {
        service: "api-server",
        status: "ok"
      })
    );
  });

  app.use(`${API_PREFIX}/auth`, authRouter);
  app.use(`${API_PREFIX}/users`, requireAuth, usersRouter);
  app.use(`${API_PREFIX}/wards`, requireAuth, wardsRouter);
  app.use(`${API_PREFIX}/collectors`, requireAuth, collectorsRouter);
  app.use(`${API_PREFIX}/revenue-sources`, requireAuth, revenueSourcesRouter);
  app.use(`${API_PREFIX}/payers`, requireAuth, payersRouter);
  app.use(`${API_PREFIX}/payments`, requireAuth, paymentsRouter);
  app.use(`${API_PREFIX}/receipts`, requireAuth, receiptsRouter);
  app.use(`${API_PREFIX}/reports`, requireAuth, reportsRouter);
  app.use(`${API_PREFIX}/sync`, requireAuth, syncRouter);
  app.use(`${API_PREFIX}/audit-logs`, requireAuth, auditLogsRouter);
}