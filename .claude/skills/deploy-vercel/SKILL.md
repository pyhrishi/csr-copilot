---
name: deploy-vercel
description: Deploy the CSR Copilot prototype to Vercel with a preview first, then production after the user confirms.
disable-model-invocation: true
argument-hint: "[preview|prod]"
---

# Deploy to Vercel ($ARGUMENTS)

Only run this after `/demo-ready` passes. Every `vercel` command asks for the user's permission; that's intentional.

1. Make sure the working tree is committed, and `npm run build` passes locally.
2. Check the Vercel CLI: `npx vercel --version`. If the user isn't logged in, ask them to run `npx vercel login` themselves in the terminal (`! npx vercel login`). Don't handle their credentials.
3. First deploy: `npx vercel link` (project name `csr-copilot-prototype`). Framework: Next.js; defaults are fine.
4. Environment variables:
   - None are required: Simulated AI mode needs no key.
   - Optional live mode: the user adds `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) in the Vercel dashboard or with `npx vercel env add`. Never echo or read the key.
   - Set `NEXT_PUBLIC_DEFAULT_MODE=simulated` so demos never depend on an API key.
5. **Preview:** `npx vercel` → share the preview URL and open it to smoke-test 3 routes: `/`, `/sections/12.2` and `/narratives`.
6. **Production** (only if the argument is `prod` and the user confirms): `npx vercel --prod`.
7. Report the URLs, the commit hash deployed, and whether live mode is configured.
8. Remind the user that the deployment is public by default. If it should be private, they can turn on Vercel Deployment Protection in project settings.
