import express from "express";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";

const app = express();

// Third-party middleware
app.use(cors());
app.use(morgan("dev"));

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware
const logger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const log = `${req.method} ${req.url} ${res.statusCode} - ${duration}ms\n`;

    fs.appendFile("Server.log", log, (err) => {
      if (err) {
        console.error("Failed to write request log:", err);
      }
    });
  });

  next();
};

app.use(logger);

// Route-specific validation middleware
const validate = (req, res, next) => {
  const { name, gender, ward } = req.body;

  if (!name || !gender || !ward) {
    const err = new Error("Patient details are missing");
    err.statusCode = 400;
    return next(err);
  }

  next();
};

// Create patient
// POST http://localhost:6500/api/v1/patients
// Body: { "name": "Reethika", "gender": "Female", "ward": "ICU" }

app.post("/api/v1/patients", validate, (req, res) => {
  const { name, gender, ward } = req.body;

  res.status(201).json({
    message: "Patient added successfully",
    patient: {
      name,
      gender,
      ward,
    },
  });
});

// Read all patients
// GET http://localhost:6500/api/v1/patients
// GET http://localhost:6500/api/v1/patients?ward=ICU

app.get("/api/v1/patients", (req, res) => {
  const { ward } = req.query;

  if (ward) {
    return res
      .status(200)
      .send(`Patients of ${ward} ward fetched successfully`);
  }

  res.status(200).send("All patients fetched successfully");
});

// Read one patient
// GET http://localhost:6500/api/v1/patients/:id

app.get("/api/v1/patients/:id", (req, res) => {
  const { id } = req.params;

  res.status(200).send(`Patient with id ${id} fetched successfully`);
});

// Update one patient
// PUT http://localhost:6500/api/v1/patients/:id

app.put("/api/v1/patients/:id", (req, res) => {
  const { id } = req.params;

  res.status(200).send(`Patient with id ${id} updated successfully`);
});

// Delete one patient
// DELETE http://localhost:6500/api/v1/patients/:id

app.delete("/api/v1/patients/:id", (req, res) => {
  const { id } = req.params;

  res.status(200).send(`Patient with id ${id} deleted successfully`);
});

// 404 middleware
app.use((req, res) => {
  res.status(404).send("Resource not found");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).send(message);
});

// Start server
const PORT = 6500;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});