import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { createCollectorHandler, getCollectorHandler, listCollectorsHandler, updateCollectorHandler } from "./collectors.controller";
import { createCollectorSchema, collectorIdParamSchema, listCollectorsQuerySchema, updateCollectorSchema } from "./collectors.validation";

export const collectorsRouter = Router();

collectorsRouter.get("/", requireRoles("admin", "finance_officer"), validateRequest(listCollectorsQuerySchema, "query"), listCollectorsHandler);
collectorsRouter.post("/", requireRoles("admin"), validateRequest(createCollectorSchema, "body"), createCollectorHandler);
collectorsRouter.get("/:id", requireRoles("admin", "finance_officer"), validateRequest(collectorIdParamSchema, "params"), getCollectorHandler);
collectorsRouter.patch("/:id", requireRoles("admin"), validateRequest(collectorIdParamSchema, "params"), validateRequest(updateCollectorSchema, "body"), updateCollectorHandler);
