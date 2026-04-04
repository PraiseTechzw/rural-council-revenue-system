import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { changePasswordHandler, loginHandler, logoutHandler, meHandler, refreshHandler } from "./auth.controller";
import { changePasswordSchema, loginSchema, refreshSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post("/login", validateRequest(loginSchema, "body"), loginHandler);
authRouter.get("/me", requireAuth, meHandler);
authRouter.post("/change-password", requireAuth, validateRequest(changePasswordSchema, "body"), changePasswordHandler);
authRouter.post("/refresh", validateRequest(refreshSchema, "body"), refreshHandler);
authRouter.post("/logout", requireAuth, logoutHandler);
