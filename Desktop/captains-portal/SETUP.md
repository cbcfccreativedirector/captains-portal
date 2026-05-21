# ⚓ CB Captains FC — Player Portal Setup Guide

> **ADHD mode on.** One step at a time. Each step has a clear goal and expected result.  
> Bookmark this. Come back whenever you need it.

---

## 🗺️ What We're Building

| URL | What It Is |
|-----|-----------|
| `yoursite.com/join` | Public form — players fill this out |
| `yoursite.com/admin` | Password-protected login |
| `yoursite.com/admin/dashboard` | Dashboard — view, edit, delete, export |

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] Node.js 18+ installed → [download here](https://nodejs.org)
- [ ] A Google account (Gmail)
- [ ] A Vercel account (free) → [vercel.com](https://vercel.com)
- [ ] Git installed → [git-scm.com](https://git-scm.com)
- [ ] A terminal (Mac: Terminal.app | Windows: PowerShell or Windows Terminal)

---

## 🪜 PHASE 1 — Get the Code Running Locally

### Step 1 — Put the code in a folder

Put all the files from this project into a folder called `captains-portal` on your computer.

**Expected result:** You have a folder with `package.json` in it.

---

### Step 2 — Install dependencies

Open your terminal, navigate to the folder, and run:

```bash
cd captains-portal
npm install
```

**Expected result:** A `node_modules` folder appears. Takes 1–2 minutes.

**If this breaks:** Make sure you have Node.js installed. Run `node --version` — it should say v18 or higher.

---

### Step 3 — Create your `.env.local` file

```bash
cp .env.local.example .env.local
```

Now open `.env.local` in a text editor. You'll fill in the values in the next phases.

---

## 🪜 PHASE 2 — Google Cloud Setup (Do This Once)

> **Goal:** Get a "service account" that lets the app write to Google Sheets automatically.

### Step 1 — Go to Google Cloud Console

👉 Open: [console.cloud.google.com](https://console.cloud.google.com)

Sign in with your Google account.

---

### Step 2 — Create a project

1. Click the dropdown at the top of the page (it might say "Select a project")
2. Click **"New Project"**
3. Name it: `captains-fc-portal`
4. Click **"Create"**
5. Wait a few seconds, then select your new project from the dropdown

**Expected result:** You're now inside the `captains-fc-portal` project.

---

### Step 3 — Enable the Google Sheets API

1. Click the **hamburger menu** (☰) in the top-left
2. Go to: **APIs & Services → Library**
3. Search for: `Google Sheets API`
4. Click on it
5. Click **"Enable"**

**Expected result:** The button now says "Manage" instead of "Enable."

---

### Step 4 — Create a Service Account

1. Go to: **APIs & Services → Credentials**
2. Click **"+ Create Credentials"** at the top
3. Choose **"Service Account"**
4. Name it: `captains-sheets-writer`
5. Click **"Create and Continue"**
6. For the role, choose: **Basic → Editor**
7. Click **"Continue"** then **"Done"**

**Expected result:** You see your new service account in the list.

---

### Step 5 — Download the key

1. Click on your service account in the list
2. Go to the **"Keys"** tab
3. Click **"Add Key" → "Create new key"**
4. Choose **JSON**
5. Click **"Create"**

A JSON file will download to your computer.

**Expected result:** You have a `.json` file with "private_key" inside it.

---

### Step 6 — Copy credentials to .env.local

Open the downloaded JSON file. Find these two values:

- `"client_email"` → copy the value → paste into `.env.local` as `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `"private_key"` → copy the ENTIRE value (including `-----BEGIN PRIVATE KEY-----` etc.)

For the private key, it has `\n` characters in it. That's fine — paste it as-is wrapped in quotes:

```
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOURKEYHERE\n-----END PRIVATE KEY-----\n"
```

---

## 🪜 PHASE 3 — Google Sheets Setup

### Step 1 — Create the spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **"+ New spreadsheet"** (the big plus button)
3. Name the first tab: `Players` (click on "Sheet1" at the bottom and rename it)
4. Name the spreadsheet itself: `Captains FC — Player Roster 2026`

---

### Step 2 — Share with the service account

1. Click **"Share"** (top right, blue button)
2. In the email field, paste your service account email (from `.env.local`)
3. Set permission to **"Editor"**
4. Click **"Send"**
5. Click **"Share anyway"** if it warns you about external accounts

---

### Step 3 — Get the Spreadsheet ID

Look at the URL of your spreadsheet. It looks like:
```
https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
```

Copy that ID and paste it into `.env.local` as `GOOGLE_SHEET_ID`.

---

## 🪜 PHASE 4 — Auth Setup

### Step 1 — Generate a secret

In your terminal, run:

```bash
openssl rand -base64 32
```

Copy the output and paste it into `.env.local` as `NEXTAUTH_SECRET`.

---

### Step 2 — Set your admin password

In `.env.local`, set `ADMIN_PASSWORD` to whatever password you want club officials to use.

Make it strong: at least 12 characters, mix of letters/numbers/symbols.

Example:
```
ADMIN_PASSWORD=Captains2026!Missouri
```

---

## 🪜 PHASE 5 — Test Locally

### Step 1 — Start the dev server

```bash
npm run dev
```

**Expected result:** Terminal says "Ready — started server on http://localhost:3000"

---

### Step 2 — Test the form

Open: [http://localhost:3000/join](http://localhost:3000/join)

Fill out the form and submit. Check your Google Sheet — a new row should appear!

---

### Step 3 — Test the admin

Open: [http://localhost:3000/admin](http://localhost:3000/admin)

Enter your admin password. You should see the dashboard with the test submission.

---

## 🪜 PHASE 6 — Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Captains FC Player Portal"
```

Then create a new repo on [github.com](https://github.com) and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/captains-portal.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import"** next to your GitHub repo
4. Vercel will auto-detect Next.js — click **"Deploy"**

---

### Step 3 — Add environment variables

In Vercel:
1. Go to your project → **Settings → Environment Variables**
2. Add each variable from your `.env.local`:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_SECRET` | (your generated secret) |
| `NEXTAUTH_URL` | `https://your-vercel-url.vercel.app` |
| `ADMIN_PASSWORD` | (your admin password) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | (from JSON file) |
| `GOOGLE_PRIVATE_KEY` | (from JSON file — full key with newlines) |
| `GOOGLE_SHEET_ID` | (from spreadsheet URL) |
| `GOOGLE_SHEET_NAME` | `Players` |

> ⚠️ **Important for the private key:** In Vercel, paste it exactly as it appears in the JSON file. Vercel handles the newlines correctly.

---

### Step 4 — Redeploy

After adding env variables, go to **Deployments** and click **"Redeploy"** on the latest deployment.

---

### Step 5 — Test production

Visit your Vercel URL + `/join` and submit a test form. Check your Sheet!

---

## 🔗 Add to Existing Captains FC Site

Add these links anywhere on captainsfc.com:

```html
<!-- Player signup link -->
<a href="https://your-vercel-url.vercel.app/join">Join the Crew</a>

<!-- Admin login (keep this private — for staff only) -->
<a href="https://your-vercel-url.vercel.app/admin">Staff Login</a>
```

Or use a **custom subdomain** if you have one:
- `portal.captainsfc.com/join`
- `portal.captainsfc.com/admin`

To do this in Vercel: **Settings → Domains → Add domain → `portal.captainsfc.com`**

Then in your DNS provider, add a CNAME record:
```
portal → cname.vercel-dns.com
```

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| Form submits but nothing appears in Sheet | Double-check you shared the Sheet with the service account email |
| "Unauthorized" on admin dashboard | Check `NEXTAUTH_SECRET` and `ADMIN_PASSWORD` are set in Vercel |
| Build fails on Vercel | Make sure all env variables are added before deploying |
| Private key error | Make sure the key includes `-----BEGIN PRIVATE KEY-----` and has `\n` between lines |
| "Sheet not found" error | Make sure the tab is named exactly `Players` (capital P) |

---

## ✅ You're Done!

Your player portal is live. Here's what you built:

- ⚓ **Public form** at `/join` — players submit info
- 🧭 **Admin dashboard** at `/admin/dashboard` — you view, edit, delete, export
- 📊 **Google Sheets** — auto-populates as submissions come in
- 🔒 **Protected** — no one can access the dashboard without your password

**Share the signup link with your squad:** `your-url.vercel.app/join`

---

*Made for CB Captains FC — Council Bluffs, Iowa · #SailOn*
