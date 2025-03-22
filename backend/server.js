const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();
const port = 3000;

// Update CORS configuration - place this before any routes
app.use(
  cors({
    origin: [
      "http://localhost:5175",
      "http://localhost:5173",
      "http://localhost:5179",
    ], // Your frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Example endpoint to get all students
app.get("/students", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM students");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching students:", err.stack); // Log full error stack
    res.status(500).json({ error: err.message });
  }
});

// Example endpoint to create a new student
app.post(
  "/students",
  [body("email").isEmail(), body("password").isLength({ min: 8 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array()); // Log validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query("INSERT INTO students (email, password) VALUES (?, ?)", [
        email,
        hashedPassword,
      ]);
      res.status(201).json({ message: "Student created" });
    } catch (err) {
      console.error("Error creating student:", err.stack); // Log full error stack
      res.status(500).json({ error: err.message });
    }
  }
);

// Example endpoint to get all admins
app.get("/admins", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM admins");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching students:", err.stack); // Log full error stack
    res.status(500).json({ error: err.message });
  }
});

// Example endpoint to create a new admin
app.post(
  "/admins",
  [body("email").isEmail(), body("password").isLength({ min: 8 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array()); // Log validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query("INSERT INTO admins (email, password) VALUES (?, ?)", [
        email,
        hashedPassword,
      ]);
      res.status(201).json({ message: "Student created" });
    } catch (err) {
      console.error("Error creating student:", err.stack); // Log full error stack
      res.status(500).json({ error: err.message });
    }
  }
);

// Example endpoint to get all employers
app.get("/employers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employers");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employers:", err.stack); // Log full error stack
    res.status(500).json({ error: err.message });
  }
});

// Example endpoint to create a new employer
app.post(
  "/employers",
  [body("email").isEmail(), body("password").isLength({ min: 8 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array()); // Log validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query("INSERT INTO employers (email, password) VALUES (?, ?)", [
        email,
        hashedPassword,
      ]);
      res.status(201).json({ message: "employer created" });
    } catch (err) {
      console.error("Error creating employer:", err.stack); // Log full error stack
      res.status(500).json({ error: err.message });
    }
  }
);

// Student login endpoint
app.post("/students/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query("SELECT * FROM students WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const student = rows[0];
    const validPassword = await bcrypt.compare(password, student.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      student: { id: student.id, email: student.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Student signup endpoint
app.post(
  "/students/signup",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      console.log("Received signup request for:", { name, email }); // Add logging

      // Check if email already exists
      const [existingUsers] = await db.query(
        "SELECT * FROM students WHERE email = ?",
        [email]
      );

      if (existingUsers.length > 0) {
        console.log("Email already exists:", email);
        return res
          .status(400)
          .json({ error: "A user with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the SQL query to match your database schema
      const result = await db.query(
        "INSERT INTO students (name, email, password, created_at) VALUES (?, ?, ?, NOW())",
        [name, email, hashedPassword]
      );

      console.log("Student created successfully:", result);
      res.status(201).json({
        message: "Student account created successfully",
        userId: result[0].insertId,
      });
    } catch (err) {
      console.error("Detailed error in signup:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });

      // Send more specific error messages
      if (err.code === "ER_NO_SUCH_TABLE") {
        res
          .status(500)
          .json({ error: "Database table not found. Please contact support." });
      } else if (err.code === "ER_BAD_FIELD_ERROR") {
        res
          .status(500)
          .json({ error: "Database schema mismatch. Please contact support." });
      } else {
        res.status(500).json({
          error: "Unable to create account. Please try again later.",
          details:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    }
  }
);

// Admin signup endpoint
app.post(
  "/admins/signup",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      console.log("Received admin signup request for:", { name, email });

      // Check if email already exists
      const [existingAdmins] = await db.query(
        "SELECT * FROM admins WHERE email = ?",
        [email]
      );

      if (existingAdmins.length > 0) {
        console.log("Email already exists:", email);
        return res
          .status(400)
          .json({ error: "An admin with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new admin with default role and status
      const result = await db.query(
        "INSERT INTO admins (name, email, password, created_at, role, status) VALUES (?, ?, ?, NOW(), 'admin', 'active')",
        [name, email, hashedPassword]
      );

      console.log("Admin created successfully:", result);
      res.status(201).json({
        message: "Admin account created successfully",
        adminId: result[0].insertId,
      });
    } catch (err) {
      console.error("Detailed error in admin signup:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });

      // Send more specific error messages
      if (err.code === "ER_NO_SUCH_TABLE") {
        res
          .status(500)
          .json({ error: "Database table not found. Please contact support." });
      } else if (err.code === "ER_BAD_FIELD_ERROR") {
        res
          .status(500)
          .json({ error: "Database schema mismatch. Please contact support." });
      } else {
        res.status(500).json({
          error: "Unable to create account. Please try again later.",
          details:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    }
  }
);

// Employer signup endpoint
app.post(
  "/employers/signup",
  [
    body("companyName").notEmpty(),
    body("contactName").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { companyName, contactName, email, password } = req.body;
      console.log("Received employer signup request for:", {
        companyName,
        contactName,
        email,
      });

      // Check if email already exists
      const [existingEmployers] = await db.query(
        "SELECT * FROM employers WHERE email = ?",
        [email]
      );

      if (existingEmployers.length > 0) {
        console.log("Email already exists:", email);
        return res
          .status(400)
          .json({ error: "An employer with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new employer
      const result = await db.query(
        "INSERT INTO employers (company_name, contact_name, email, password, created_at) VALUES (?, ?, ?, ?, NOW())",
        [companyName, contactName, email, hashedPassword]
      );

      console.log("Employer created successfully:", result);
      res.status(201).json({
        message: "Employer account created successfully",
        employerId: result[0].insertId,
      });
    } catch (err) {
      console.error("Detailed error in employer signup:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });

      // Send more specific error messages
      if (err.code === "ER_NO_SUCH_TABLE") {
        res
          .status(500)
          .json({ error: "Database table not found. Please contact support." });
      } else if (err.code === "ER_BAD_FIELD_ERROR") {
        res
          .status(500)
          .json({ error: "Database schema mismatch. Please contact support." });
      } else {
        res.status(500).json({
          error: "Unable to create account. Please try again later.",
          details:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    }
  }
);

// Admin login endpoint
app.post(
  "/admins/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log("Login attempt for admin:", email);

      // Find admin by email
      const [admins] = await db.query("SELECT * FROM admins WHERE email = ?", [
        email,
      ]);

      if (admins.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const admin = admins[0];

      // Compare password
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Don't send password in response
      const { password: _, ...adminWithoutPassword } = admin;

      console.log("Admin login successful:", email);
      res.json({
        message: "Login successful",
        user: adminWithoutPassword,
      });
    } catch (err) {
      console.error("Error in admin login:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Employer login endpoint
app.post(
  "/employers/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log("Login attempt for employer:", email);

      // Find employer by email
      const [employers] = await db.query(
        "SELECT * FROM employers WHERE email = ?",
        [email]
      );

      if (employers.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const employer = employers[0];

      // Compare password
      const isValidPassword = await bcrypt.compare(password, employer.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Don't send password in response
      const { password: _, ...employerWithoutPassword } = employer;

      console.log("Employer login successful:", email);
      res.json({
        message: "Login successful",
        user: employerWithoutPassword,
      });
    } catch (err) {
      console.error("Error in employer login:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
