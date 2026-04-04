import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email?: string;
        firstName?: string;
        lastName?: string;
      };
      auditContext?: {
        action: string;
        entityType: string;
        entityId?: string | null;
        metadata?: Record<string, unknown>;
      };
    }
  }
}

export {};
