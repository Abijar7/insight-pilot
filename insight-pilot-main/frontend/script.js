/* =======================================================
   INSIGHT PILOT — FINAL PRODUCTION script.js
   Theme: Silicon Valley + Dark AI
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
});

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
// TOAST NOTIFICATION
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
  }, 2800);
}

// =====================
// FILE UPLOAD ZONE
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
        <span>${(file.size / 1024).toFixed(1)} KB uploaded</span>
      </div>
      <div class="upload-meta">
        Ready for analysis
      </div>
    </div>
  `;

  // re-bind input
  document.getElementById("fileInput").files = input.files;
  document.getElementById("fileInput").addEventListener("change", handleFileSelect);

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
    const res = await fetch("https://insight-pilot-ybu5.onrender.com/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.error) {
      output.textContent = "❌ " + data.error;
      showToast("Analysis failed", "error");
      resetButton(btn, "⚡ Analyze Data");
      return;
    }

    dataset = data.analysis.sample || [];

    if (!dataset.length) {
      output.textContent = "❌ No rows returned";
      resetButton(btn, "⚡ Analyze Data");
      return;
    }

    detectNumericColumn();
    showInsights(data.analysis);
    renderAllCharts();

    btn.classList.remove("loading");
    btn.classList.add("success");
    btn.innerText = "✅ Completed";

    showToast("Analysis completed successfully");

    setTimeout(() => {
      resetButton(btn, "⚡ Analyze Data");
    }, 2500);

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
  numericColumn = keys.find(key => !isNaN(Number(dataset[0][key])));
}

// =====================
// AI INSIGHTS
// =====================
function showInsights(analysis) {
  if (!analysis || !dataset.length) return;

  const values = dataset.map(row => Number(row[numericColumn]) || 0);

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  const trend =
    values[values.length - 1] > values[0]
      ? "📈 Increasing"
      : "📉 Decreasing";

  document.getElementById("output").textContent = `
📊 INSIGHT PILOT REPORT

📁 Rows: ${analysis.totalRows}
📊 Columns: ${analysis.columns.length}

🔢 Numeric Column: ${numericColumn}

📈 Trend: ${trend}
📈 Max: ${max}
📉 Min: ${min}
📊 Average: ${avg.toFixed(2)}

🤖 AI Insights:
• Dataset processed successfully
• Trend pattern detected
• Visual charts generated
• Ready for forecasting
`;
}

// =====================
// PREDICTION ENGINE
// =====================
function predict(values, steps = 10) {
  const n = values.length;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let forecast = [];
  for (let i = 0; i < steps; i++) {
    forecast.push(slope * (n + i) + intercept);
  }

  return forecast;
}

// =====================
// CHARTS
// =====================
function renderAllCharts() {
  if (!dataset.length || !numericColumn) return;

  const x = dataset.map((_, i) => i + 1);
  const y = dataset.map(row => Number(row[numericColumn]) || 0);

  const futureY = predict(y, 10);
  const futureX = [...Array(10)].map((_, i) => y.length + i + 1);

  const theme = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#e8eefc" }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot("lineChart", [
    {
      x,
      y,
      mode: "lines+markers",
      name: "Actual"
    },
    {
      x: futureX,
      y: futureY,
      mode: "lines",
      line: { dash: "dot" },
      name: "Prediction"
    }
  ], {
    ...theme,
    title: "Trend & Forecast"
  }, config);

  Plotly.newPlot("barChart", [{
    x, y, type: "bar"
  }], {
    ...theme,
    title: "Bar Analysis"
  }, config);

  Plotly.newPlot("pieChart", [{
    values: y.slice(0, 6),
    labels: x.slice(0, 6),
    type: "pie"
  }], {
    ...theme,
    title: "Pie Overview"
  }, config);

  Plotly.newPlot("scatterChart", [{
    x, y, mode: "markers"
  }], {
    ...theme,
    title: "Scatter Plot"
  }, config);

  Plotly.newPlot("histogramChart", [{
    x: y,
    type: "histogram"
  }], {
    ...theme,
    title: "Distribution"
  }, config);

  Plotly.newPlot("boxPlotChart", [{
    y,
    type: "box"
  }], {
    ...theme,
    title: "Box Plot"
  }, config);

  Plotly.newPlot("heatmapChart", [{
    z: [y, y],
    type: "heatmap"
  }], {
    ...theme,
    title: "Heatmap"
  }, config);

  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 350);
}

// =====================
// AI CHAT
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

  const text = input.value.trim().toLowerCase();

  if (!text) return;

  if (!dataset.length) {
    box.innerHTML += `<p>⚠ Upload data first</p>`;
    return;
  }

  const values = dataset.map(row => Number(row[numericColumn]) || 0);

  let response = "";

  if (text.includes("trend")) {
    response =
      values.at(-1) > values[0]
        ? "📈 Trend is increasing"
        : "📉 Trend is decreasing";
  } else if (text.includes("max")) {
    response = `📈 Max value is ${Math.max(...values)}`;
  } else if (text.includes("min")) {
    response = `📉 Min value is ${Math.min(...values)}`;
  } else if (text.includes("average")) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    response = `📊 Average is ${avg.toFixed(2)}`;
  } else {
    response = "Try: trend, max, min, average";
  }

  box.innerHTML += `<p><b>You:</b> ${text}</p>`;
  box.innerHTML += `<p><b>AI:</b> ${response}</p>`;
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

  const values = dataset.map(row => Number(row[numericColumn]) || 0);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  doc.setFontSize(16);
  doc.text("Insight Pilot Report", 10, 12);

  doc.setFontSize(11);
  doc.text(`Rows: ${dataset.length}`, 10, 28);
  doc.text(`Column: ${numericColumn}`, 10, 38);
  doc.text(`Max: ${Math.max(...values)}`, 10, 48);
  doc.text(`Min: ${Math.min(...values)}`, 10, 58);
  doc.text(`Average: ${avg.toFixed(2)}`, 10, 68);

  try {
    const img = await Plotly.toImage(
      document.getElementById("lineChart"),
      {
        format: "png",
        width: 800,
        height: 400
      }
    );

    doc.addPage();
    doc.text("Trend Chart", 10, 10);
    doc.addImage(img, "PNG", 10, 20, 185, 95);

  } catch (e) {
    doc.text("Chart export unavailable", 10, 85);
  }

  doc.save("Insight-Pilot-Report.pdf");

  btn.classList.add("success");
  btn.innerText = "✅ Exported";

  showToast("PDF report downloaded");

  setTimeout(() => {
    resetButton(btn, "📄 Export Report");
  }, 2200);
}