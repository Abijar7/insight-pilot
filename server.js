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

/* =========================
   SUPABASE SETUP (FIXED)
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

/* =========================
   UPLOAD + ANALYZE ROUTE
========================= */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileData = fs.readFileSync(file.path);

    /* Upload to Supabase Storage */
    const { data, error } = await supabase.storage
      .from("datasets")
      .upload(`csv/${Date.now()}_${file.originalname}`, fileData);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/datasets/${data.path}`;

    /* Read CSV and analyze */
    let rows = [];

    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => {
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

/* =========================
   RENDER PORT FIX (IMPORTANT)
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});