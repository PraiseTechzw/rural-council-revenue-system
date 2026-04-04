import { Router } from "express";
import { requireRoles } from "../../middleware/role.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { createUserHandler, getUserHandler, listUsersHandler, updateUserHandler } from "./users.controller";
import { createUserSchema, listUsersQuerySchema, updateUserSchema, userIdParamSchema } from "./users.validation";

export const usersRouter = Router();

usersRouter.get("/", requireRoles("admin", "finance_officer"), validateRequest(listUsersQuerySchema, "query"), listUsersHandler);
usersRouter.post("/", requireRoles("admin"), validateRequest(createUserSchema, "body"), createUserHandler);
usersRouter.get("/:id", requireRoles("admin", "finance_officer"), validateRequest(userIdParamSchema, "params"), getUserHandler);
usersRouter.patch("/:id", requireRoles("admin"), validateRequest(userIdParamSchema, "params"), validateRequest(updateUserSchema, "body"), updateUserHandler);
