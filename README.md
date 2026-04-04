# Rural Council Revenue System

Production-ready monorepo scaffold for council revenue operations across API, mobile, and web platforms.

## Structure

- apps/api-server: Node.js + Express + TypeScript backend API
- apps/mobile-collector: Expo React Native + TypeScript mobile app
- apps/web-admin: Next.js + TypeScript admin dashboard
- packages/shared-types: Shared TypeScript types
- packages/shared-utils: Shared reusable utility functions
- packages/ui-config: Shared UI configuration
- packages/eslint-config: Centralized lint rules
- docs: Architecture, API, and database documentation

## Tooling

- pnpm workspaces for package management
- Turborepo for orchestration and caching

## Getting Started

1. Install dependencies:

   pnpm install

2. Start all dev targets:

   pnpm dev
