# Vercel Deployment Troubleshooting Guide

## Overview

This document describes how to correctly deploy this Next.js application to Vercel and how to resolve common deployment issues.

---

## Manual Steps Required in Vercel Dashboard

The following steps **must be performed manually** in the Vercel Dashboard after merging this PR.

### 1. Remove Framework Override (Critical)

If the Vercel Dashboard shows "Vite" as the Framework Preset, it must be changed:

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings → General → Build & Development Settings**
3. Under **Framework Preset**, change from `Vite` to `Next.js` (or remove the override entirely)
4. Click **Save**

> ⚠️ If the Framework Preset is set to "Vite", Vercel will not detect Next.js even if `next` is listed in `package.json`.

### 2. Verify Production Branch

1. Go to **Settings → Git**
2. Ensure **Production Branch** is set to `main`
3. Save if needed

### 3. Trigger Clean Redeploy

After updating the Framework Preset:

1. Go to the **Deployments** tab
2. Click the latest deployment → **Redeploy**
3. ✅ Uncheck **"Use existing Build Cache"**
4. Click **Redeploy**

---

## Expected Build Output

After a successful deployment you should see in the build logs:

```
✓ Detected Next.js version: 15.x.x
✓ Compiled successfully
✓ Static pages generated
```

---

## Verification Checklist

- [ ] `package.json` contains `"next": "^15.1.6"`
- [ ] `vercel.json` exists at project root with `"framework": "nextjs"`
- [ ] Vercel Dashboard Framework Preset is set to `Next.js` (not Vite)
- [ ] Production Branch is set to `main`
- [ ] Clean redeploy triggered (no build cache)
- [ ] Build logs show Next.js version detected
- [ ] Open Graph meta tags render correctly (WhatsApp/Facebook previews work)

---

## Why This Matters

This application relies on **Server-Side Rendering (SSR)** via Next.js to generate Open Graph meta tags dynamically. These meta tags are required for:

- WhatsApp link previews
- Facebook link previews
- Other social media card previews

Without SSR, the meta tags are rendered client-side and social media crawlers cannot read them.
