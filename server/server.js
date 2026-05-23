require("dotenv").config();

const bcrypt = require("bcryptjs");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || "freshcart_dev_secret";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "freshcart_db",
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
      "https://cocoiudau.github.io",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
    expiresIn: "7d",
  });
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
  };
}

async function findCustomerByEmail(email) {
  const [rows] = await pool.execute(
    "SELECT id, name, email, password_hash, phone, address FROM customers WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0];
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Missing login token." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Login token is invalid or expired." });
  }
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "FreshCart API" });
});

app.post("/api/register", async (req, res) => {
  const { name, email, password, phone = "", address = "" } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existing = await findCustomerByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ message: "This email is already registered. Please login." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO customers (name, email, password_hash, phone, address) VALUES (?, ?, ?, ?, ?)",
      [
        name.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        phone.trim(),
        address.trim(),
      ],
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
    };

    return res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not register customer." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await findCustomerByEmail(email.trim().toLowerCase());
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    }

    return res.json({ user: publicUser(user), token: createToken(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not login." });
  }
});

app.get("/api/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, phone, address FROM customers WHERE id = ? LIMIT 1",
      [req.user.id],
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Customer no longer exists." });
    }

    return res.json({ user: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not load customer." });
  }
});

app.listen(port, () => {
  console.log(`FreshCart server running at http://localhost:${port}`);
});
