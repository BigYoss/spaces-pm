---
name: ship
description: Ship a change to the Spaces site safely in one command - production build, QA of every page under the real production headers (CSP, errors, broken assets, reflow at 1280/375/320px, axe accessibility), commit, push, and wait for the Vercel deployment of that exact commit. Use whenever the user says ship, deploy, push live, publish, release, "make it live" or "push it", and after finishing any change to this repo that should go out. Also use with --qa to check work before showing it.
---

# Ship

`scripts/ship.mjs` replaces the manual loop (build → serve with headers → regression → commit → push → poll Vercel). It stops at the first failure, so nothing that fails the build or QA reaches GitHub.

## Commands

```bash
node scripts/ship.mjs --qa                 # build + QA only; use before showing work
node scripts/ship.mjs -m "Commit message"  # full ship of the current branch
```

Options: `--no-wait` (skip waiting for Vercel), `--widths 1280,375` (custom QA widths).

## Which branch

- **`main`** deploys to production. Ship to `main` for changes the user asked to go live.
- **Any other branch** gets a Vercel preview. Use a branch (`feat/...`, `fix/...`) and open a draft PR when the change needs the user's check first: anything that changes what visitors can submit, legal pages, prices or copy the user has not seen, or anything depending on an external service the user still has to configure.

## Commit message

A short subject line, a blank line, then bullets saying what changed and why. End with the session's attribution lines (`Co-Authored-By:` and `Claude-Session:` as given in the conversation). The script commits with the GitHub no-reply identity; never pass a personal email.

## When it stops

- **Build failed:** read the tail it prints. A `[TO CONFIRM: ...]` placeholder means legal facts are missing; ask the user, never set `ALLOW_TODO` to get past it.
- **QA failed:** fix the cause and ship again. Never remove a page from QA, skip widths or relax the CSP to get green. A CSP violation means a new third party needs adding to `vercel.json` **and** `/privacy`.
- **Push rejected:** run the fetch and merge it suggests, then ship again. Never force-push.
- **Deployment ERROR:** the script prints the build log tail. Fix and ship again. Note that Vercel scopes env vars per environment (Production vs Preview).
- **Vercel API unreachable:** the push still happened; tell the user to check the dashboard.

## Reporting to the user

Lead with the outcome: live or preview URL, commit SHA, and the QA line (pages × widths, clean). Mention anything the script could not verify, such as live third-party behaviour (Google Apps Script, maps), which this container may not reach.

## Requirements

Playwright with Chromium (preinstalled in Claude cloud sessions; otherwise `npm i -D playwright && npx playwright install chromium`), `axe-core` (devDependency), network access to api.vercel.com with a token for the deployment step.
