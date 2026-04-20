/* =======================================================
   INSIGHT PILOT — FINAL PRODUCTION script.js
   Theme: Silicon Valley + Dark AI
   Upgraded: Interactive Buttons + Upload Status + Click Effects
   ======================================================= */

// =====================
// GLOBALS
// =====================
let dataset = [];
let numericColumn = null;

// =====================
// INIT APP
// =====================
document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initUploadZone();
  initEnterToSend();
  initButtons();
});

// =====================
// BUTTON CLICK EFFECTS
// =====================
function initButtons() {
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.add("clicked");

      setTimeout(() => {
        btn.classList.remove("clicked");
      }, 250);
    });
  });
}

// =====================
// SIDEBAR ACTIVE LINKS
// =====================
function initSidebar() {
  const links = document.querySelectorAll(".sidebar a");

  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

// =====================
// TOAST
// =====================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// =====================
// UPLOAD ZONE
// =====================
function initUploadZone() {
  const input = document.getElementById("fileInput");
  const zone = document.querySelector(".upload-dropzone");

  if (!input || !zone) return;

  input.addEventListener("change", handleFileSelect);

  zone.addEventListener("dragover", e => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("dragover");

    const files = e.dataTransfer.files;

    if (files.length) {
      input.files = files;
      handleFileSelect();
    }
  });
}

function handleFileSelect() {
  const input = document.getElementById("fileInput");
  const zone = document.querySelector(".upload-dropzone");

  const file = input.files[0];

  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    showToast("Only CSV files supported", "error");
    return;
  }

  zone.classList.add("uploaded");

  zone.innerHTML = `
    <input type="file" id="fileInput" hidden />
    <div class="upload-content">
      <div class="upload-icon">✅</div>
      <div class="upload-text">
        <strong>${file.name}</strong>
        <span>${(file.size / 1024).toFixed(1)} KB Uploaded</span>
      </div>
      <div class="upload-meta">
        File ready for analysis
      </div>
    </div>
  `;

  document.getElementById("fileInput").files = input.files;
  document
    .getElementById("fileInput")
    .addEventListener("change", handleFileSelect);

  showToast("Dataset uploaded successfully");
}

// =====================
// ANALYZE DATA
// =====================
async function uploadData() {
  const input = document.getElementById("fileInput");
  const output = document.getElementById("output");
  const btn = document.querySelectorAll(".btn")[0];

  if (!input.files.length) {
    showToast("Upload CSV file first", "error");
    return;
  }

  setButtonLoading(btn, "Analyzing...");

  output.textContent = "⏳ Uploading & analyzing dataset...";

  const formData = new FormData();
  formData.append("file", input.files[0]);

  try {
    const res = await fetch(
      "https://insight-pilot-ybu5.onrender.com/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (data.error) {
      output.textContent = "❌ " + data.error;
      showToast("Analysis failed", "error");
      resetButton(btn, "⚡ Analyze Data");
      return;
    }

    dataset = data.analysis.sample || [];

    detectNumericColumn();
    showInsights(data.analysis);
    renderAllCharts();

    btn.classList.add("success");
    btn.innerText = "✅ Completed";

    showToast("Analysis completed");

    setTimeout(() => {
      resetButton(btn, "⚡ Analyze Data");
    }, 2200);

  } catch (err) {
    output.textContent = "❌ Server error";
    showToast("Server connection failed", "error");
    resetButton(btn, "⚡ Analyze Data");
  }
}

// =====================
// BUTTON STATES
// =====================
function setButtonLoading(btn, text) {
  btn.disabled = true;
  btn.classList.add("loading");
  btn.innerText = text;
}

function resetButton(btn, text) {
  btn.disabled = false;
  btn.classList.remove("loading", "success");
  btn.innerText = text;
}

// =====================
// NUMERIC COLUMN
// =====================
function detectNumericColumn() {
  const keys = Object.keys(dataset[0] || {});
  numericColumn = keys.find(
    key => !isNaN(Number(dataset[0][key]))
  );
}

// =====================
// INSIGHTS
// =====================
function showInsights(analysis) {
  const values = dataset.map(
    row => Number(row[numericColumn]) || 0
  );

  const avg =
    values.reduce((a, b) => a + b, 0) / values.length;

  document.getElementById("output").textContent = `
📊 INSIGHT PILOT REPORT

📁 Rows: ${analysis.totalRows}
📊 Columns: ${analysis.columns.length}

🔢 Numeric Column: ${numericColumn}

📈 Max: ${Math.max(...values)}
📉 Min: ${Math.min(...values)}
📊 Average: ${avg.toFixed(2)}

✅ Analysis Completed Successfully
`;
}

// =====================
// CHARTS
// =====================
function renderAllCharts() {
  if (!dataset.length || !numericColumn) return;

  const x = dataset.map((_, i) => i + 1);
  const y = dataset.map(
    row => Number(row[numericColumn]) || 0
  );

  const theme = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#fff" }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot(
    "lineChart",
    [{ x, y, mode: "lines+markers" }],
    { ...theme, title: "Trend Analysis" },
    config
  );

  Plotly.newPlot(
    "barChart",
    [{ x, y, type: "bar" }],
    { ...theme, title: "Bar Chart" },
    config
  );

  Plotly.newPlot(
    "pieChart",
    [{
      values: y.slice(0, 5),
      labels: x.slice(0, 5),
      type: "pie"
    }],
    { ...theme, title: "Pie Chart" },
    config
  );
}

// =====================
// CHAT
// =====================
function initEnterToSend() {
  const input = document.getElementById("chatInput");

  if (!input) return;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") askAI();
  });
}

function askAI() {
  const input = document.getElementById("chatInput");
  const box = document.getElementById("chatBox");

  const text = input.value.trim();

  if (!text) return;

  box.innerHTML += `<p><b>You:</b> ${text}</p>`;
  box.innerHTML += `<p><b>AI:</b> Smart analysis ready.</p>`;

  box.scrollTop = box.scrollHeight;
  input.value = "";
}

// =====================
// EXPORT PDF
// =====================
async function exportPDF() {
  const btn = document.querySelectorAll(".btn")[1];

  if (!dataset.length) {
    showToast("Analyze data first", "error");
    return;
  }

  setButtonLoading(btn, "Exporting...");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Insight Pilot Report", 10, 10);
  doc.save("Insight-Pilot-Report.pdf");

  btn.classList.add("success");
  btn.innerText = "✅ Exported";

  showToast("PDF downloaded");

  setTimeout(() => {
    resetButton(btn, "📄 Export Report");
  }, 2200);
}