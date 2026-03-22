# env-clinic Demo — Recording Script

> This folder is a fake "my-api" project set up to demonstrate env-clinic.
> Follow the steps below in order. Each step is a scene for your video.

---

## Setup (before you hit record)

1. Open your terminal and navigate to this folder:
   ```bash
   cd test-project
   ```
2. Make sure you can see the `.env` and `.env.example` files.
3. Have a split view or clear terminal ready.

---

## Scene 1 — The Basic Audit

**What to say:** "I just cloned a repo. Let me check my environment."

```bash
npx env-clinic
```

**What the output will show:**
- `DATABASE_URL` — present
- `JWT_SECRET` — present
- `STRIPE_PUBLIC_KEY` — present
- `STRIPE_SECRET_KEY` — **MISSING**
- `PORT` — present
- `DEBUG_MODE` — **EMPTY**

**What to say after:** "One missing, one empty. That would have crashed my app."

---

## Scene 2 — Fix Mode with Defaults

**What to say:** "Instead of manually editing my .env, I can fix it right here."

```bash
npx env-clinic --fix
```

**What happens:**
- It prompts: `❌ STRIPE_SECRET_KEY [default: sk_your_secret_key] =`
- Press Enter to use the default, or type your own value.
- It appends the variable to `.env` automatically.

**What to say after:** "It even reads the suggested value from .env.example."

---

## Scene 3 — JSON Output (for automation fans)

**What to say:** "If you're piping this into a script or CI system, use --json."

```bash
npx env-clinic --json
```

**What the output shows:** Clean JSON with present, missing, extra, and empty arrays.

---

## Scene 4 — CI Mode

**What to say:** "In a GitHub Actions pipeline, use --ci for plain text output."

```bash
npx env-clinic --ci
```

**What the output shows:** No colors, no emojis. Just `[PASS]`, `[FAIL]`, `[WARN]` for log-friendly output.

---

## Scene 5 — Prune Mode (v1.1.0 feature)

**Before this scene:** Manually add a fake extra key to `.env`:
```
OLD_REDIS_URL=redis://localhost:6379
```

**What to say:** "I've got an old variable that's no longer in my example file. Let me clean it up."

```bash
npx env-clinic --prune
```

**What happens:**
- It shows: `⚠️  OLD_REDIS_URL — remove? [y/N]`
- Type `y` and press Enter.
- It rewrites `.env` without that key.

**What to say after:** "No more copy-pasting. It rewrites the file cleanly."

---

## Scene 6 — The Install (optional closing shot)

**What to say:** "No install needed with npx, but if you want it globally:"

```bash
npm install -g env-clinic
env-clinic
```

---

## Links to show on screen at the end

- npm: https://www.npmjs.com/package/env-clinic
- github: https://github.com/ChloeVPin/env-clinic
