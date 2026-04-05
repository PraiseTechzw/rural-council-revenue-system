# mobile-collector

Expo React Native application for rural council revenue collectors.

## Stack

- Expo React Native
- TypeScript
- Expo Router
- Axios
- Zustand
- TanStack Query

## Scripts

- pnpm dev
- pnpm android
- pnpm ios
- pnpm web
- pnpm typecheck
- pnpm build:apk

## Test APK Setup

- The app reads `EXPO_PUBLIC_API_BASE_URL` from `.env` and falls back to the hosted API at `https://rural-council-revenue-system.onrender.com/api/v1`.
- For a local backend during device testing, point `EXPO_PUBLIC_API_BASE_URL` at your reachable LAN IP and keep the API server bound to `0.0.0.0`.
- Build an Android test APK with `pnpm build:apk` from `apps/mobile-collector` (or `npm --prefix apps/mobile-collector run build:apk` from the monorepo root).
