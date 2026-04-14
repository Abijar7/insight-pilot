
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config({ path: "./.env" });

const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

/// Supabase setup
const supabase = createClient(
   "https://fxiksanjlmcggnpgkizr.supabase.co",
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aWtzYW5qbG1jZ2ducGdraXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTEwMDUsImV4cCI6MjA5MTcyNzAwNX0.2s1GX7okQoow2dZilBakT3YyQLqvpq5_ZjSaZX48I40"
);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Upload + Analyze route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileData = fs.readFileSync(file.path);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from("datasets")
      .upload(`csv/${Date.now()}_${file.originalname}`, fileData);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/datasets/${data.path}`;

    // Analyze CSV
    let rows = [];

    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        const analysis = {
          totalRows: rows.length,
          columns: Object.keys(rows[0] || {}),
          sample: rows.slice(0, 5),
        };

        res.json({
          message: "Upload successful ✅",
          fileUrl,
          analysis,
        });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000 🚀");
});