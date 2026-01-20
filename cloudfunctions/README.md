# Cloud Functions (云函数) for 行动派

This folder contains CloudBase (云开发) cloud functions used by the Mini Program.

## 1) Prerequisites

- Enable **云开发** for your Mini Program in WeChat DevTools.
- Create a **CloudBase environment** (环境) and note the **环境ID** (envId).
- Set envId in `miniprogram/env.js`.

## 2) Collections (Cloud Database)

The app expects these collections (created automatically on first write, but you should create them in console for clarity):

- `tasks`
- `projects`
- `contexts`
- `references`
- `aiAdvice` (optional cache)
- `usage` (AI usage/rate limit logs)

Common fields:
- `ownerOpenid`: string (required) — used for per-user scoping
- `createdAt`, `updatedAt`: ISO string

## 3) Security rules (recommended)

For robustness, keep **all writes in cloud functions**. In the database permission/rules UI, set collections to allow read to owner only (or disallow client access entirely).

Example principle:
- Client: **no direct DB write**
- Cloud Function: full access (server-side), enforces `ownerOpenid`

Exact rule syntax differs by CloudBase console version; implement as “only current user can read their own docs”.

## 4) Deploy

In WeChat DevTools:
- Cloud Functions panel → upload/deploy each function folder under `cloudfunctions/`

Functions expected by the Mini Program:
- `tasks`
- `projects`
- `contexts`
- `references`
- `initDefaultContexts`
- (later) `aiAdvice`, `aiChat`

