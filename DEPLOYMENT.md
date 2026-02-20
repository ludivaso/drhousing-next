# Vercel Deployment Guide

## Overview

This project is built with **Next.js (App Router)** and deployed via Vercel.

## Automated Configuration

The `vercel.json` file at the root of the repository configures the deployment:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Manual Vercel Dashboard Steps

The following settings must be configured manually in the Vercel Dashboard. Incorrect dashboard settings can cause "No Next.js version detected" errors even when `vercel.json` is correct.

### 1. Remove Production Framework Override

- Go to **Project Settings → General**
- Find the **"Build & Development Settings"** section
- Change **"Framework Preset"** from **"Vite"** to **"Next.js"** (or remove any override)
- Click **Save**

### 2. Verify Production Branch

- Go to **Project Settings → Git**
- Ensure **"Production Branch"** is set to `main`

### 3. Verify Root Directory

- Go to **Project Settings → General**
- Under **"Root Directory"**, ensure it is blank or set to `.`

### 4. Trigger a Redeploy

After updating the settings above:

1. Go to the **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Uncheck **"Use existing Build Cache"**
4. Click **"Redeploy"**

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `No Next.js version detected` | Framework Preset set to "Vite" in dashboard | Change Framework Preset to "Next.js" in Project Settings |
| Building old commit | Wrong production branch | Set Production Branch to `main` in Project Settings → Git |
| Build fails locally | Invalid `next` version in `package.json` | Ensure `"next": "^15.1.6"` is in dependencies |

## Local Development

```bash
npm install
npm run dev
```

## Local Production Build

```bash
npm run build
npm start
```
