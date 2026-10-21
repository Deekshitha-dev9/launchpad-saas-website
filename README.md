# LaunchPad

LaunchPad is a professional, responsive SaaS marketing website with a vanilla HTML/CSS/JavaScript frontend, a Node.js and Express REST API, and SQLite storage for contact form submissions.

## Features

- Responsive landing page with features, workflow, pricing, and contact sections
- Working contact form that posts to `POST /api/contact`
- Input validation on the server
- Parameterized SQLite inserts
- Health check endpoint at `GET /api/health`

## Requirements

- Node.js 18 or later
- npm

## Installation

```bash
cd LaunchPad
npm install
```

## Run the application

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

For local development with automatic restarts on Node 18+:

```bash
npm run dev
```

The SQLite database is created at `data/launchpad.db` on first start. That folder is ignored by git.

## Test the API

Health check:

```bash
curl http://localhost:3000/api/health
```

Expected response includes `"status":"ok"`.

Valid contact submission:

```bash
curl -X POST http://localhost:3000/api/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Alex Rivera\",\"email\":\"alex@example.com\",\"company\":\"Northwind\",\"message\":\"We want a demo of LaunchPad for our next product launch.\"}"
```

On macOS or Linux, use:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Rivera","email":"alex@example.com","company":"Northwind","message":"We want a demo of LaunchPad for our next product launch."}'
```

A successful request returns HTTP 201 with `"ok": true`.

Invalid payload (should return HTTP 400):

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"not-an-email","message":"short"}'
```

You can also submit the contact form from the website and confirm a success message appears.

## Project structure

```text
LaunchPad/
  package.json
  server.js
  database/schema.sql
  public/index.html
  public/styles.css
  public/app.js
  README.md
  .gitignore
```

## Upload to GitHub

1. Create a new empty repository on GitHub (do not add a README there if this project already has one).
2. In the project folder, initialize git if needed, then commit and push:

```bash
git init
git add .
git commit -m "Add LaunchPad SaaS marketing site and contact API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/LaunchPad.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. If GitHub CLI is installed:

```bash
gh repo create LaunchPad --source=. --public --remote=origin --push
```

Do not commit `node_modules` or `data/launchpad.db`. Both are listed in `.gitignore`.
