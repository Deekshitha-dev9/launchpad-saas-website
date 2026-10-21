const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "launchpad.db");
const SCHEMA_PATH = path.join(__dirname, "database", "schema.sql");
const PUBLIC_DIR = path.join(__dirname, "public");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_COMPANY = 120;
const MAX_MESSAGE = 2000;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);
const schema = fs.readFileSync(SCHEMA_PATH, "utf8");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function trimField(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateContact(body) {
  const name = trimField(body.name);
  const email = trimField(body.email);
  const company = trimField(body.company);
  const message = trimField(body.message);
  const errors = [];

  if (!name) {
    errors.push("Name is required.");
  } else if (name.length < 2) {
    errors.push("Name must be at least 2 characters.");
  } else if (name.length > MAX_NAME) {
    errors.push(`Name must be ${MAX_NAME} characters or fewer.`);
  }

  if (!email) {
    errors.push("Email is required.");
  } else if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL) {
    errors.push("Enter a valid email address.");
  }

  if (company.length > MAX_COMPANY) {
    errors.push(`Company must be ${MAX_COMPANY} characters or fewer.`);
  }

  if (!message) {
    errors.push("Message is required.");
  } else if (message.length < 10) {
    errors.push("Message must be at least 10 characters.");
  } else if (message.length > MAX_MESSAGE) {
    errors.push(`Message must be ${MAX_MESSAGE} characters or fewer.`);
  }

  return {
    errors,
    data: {
      name,
      email: email.toLowerCase(),
      company: company || null,
      message
    }
  };
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    res.status(400).json({ ok: false, error: "Invalid JSON body." });
    return;
  }
  next(err);
});
app.use(express.static(PUBLIC_DIR));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "LaunchPad API",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/contact", async (req, res) => {
  const { errors, data } = validateContact(req.body || {});

  if (errors.length > 0) {
    res.status(400).json({
      ok: false,
      error: "Validation failed.",
      details: errors
    });
    return;
  }

  try {
    const result = await run(
      `INSERT INTO contacts (name, email, company, message)
       VALUES (?, ?, ?, ?)`,
      [data.name, data.email, data.company, data.message]
    );

    res.status(201).json({
      ok: true,
      message: "Thanks for reaching out. We will get back to you shortly.",
      id: result.lastID
    });
  } catch (error) {
    console.error("Failed to save contact:", error);
    res.status(500).json({
      ok: false,
      error: "Unable to save your message. Please try again later."
    });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ ok: false, error: "Not found." });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

async function start() {
  try {
    await exec(schema);
    app.listen(PORT, () => {
      console.log(`LaunchPad is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

start();

process.on("SIGINT", () => {
  db.close(() => process.exit(0));
});
