// ===============================
// 🌐 BACKEND URL (RENDER)
// ===============================
const API_URL = "https://insight-pilot-ybu5.onrender.com/upload";

// ===============================
// 📦 GLOBAL VARIABLES
// ===============================
let dataset = [];
let numericColumn = null;

// ===============================
// 📂 FILE UPLOAD TO BACKEND
// ===============================
async function uploadData() {
  const fileInput = document.getElementById("fileInput");
  const output = document.getElementById("output");

  if (!fileInput.files.length) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  output.textContent = "⏳ Uploading & analyzing...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      output.textContent = "❌ " + data.error;
      return;
    }

    dataset = data.analysis.sample;

    detectNumericColumn();
    showInsights();
    renderAllCharts();

  } catch (err) {
    output.textContent = "❌ Server error: " + err.message;
  }
}

// ===============================
// 🔍 DETECT NUMERIC COLUMN
// ===============================
function detectNumericColumn() {
  const keys = Object.keys(dataset[0] || {});

  numericColumn = keys.find(key =>
    !isNaN(Number(dataset[0][key]))
  );
}

// ===============================
// 🤖 AI INSIGHTS
// ===============================
function showInsights() {
  const values = dataset.map(d => Number(d[numericColumn]) || 0);

  const trend =
    values[values.length - 1] > values[0]
      ? "Increasing 📈"
      : "Decreasing 📉";

  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  document.getElementById("output").innerText = `
📊 DATA ANALYSIS COMPLETE

Rows: ${dataset.length}
Numeric Column: ${numericColumn}

📈 Trend: ${trend}
📊 Average: ${avg.toFixed(2)}

🤖 AI Insight:
- Pattern detected
- Data processed successfully
- Predictions generated
`;
}

// ===============================
// 🔮 PREDICTION ENGINE
// ===============================
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

  let result = [];

  for (let i = 0; i < steps; i++) {
    result.push(slope * (n + i) + intercept);
  }

  return result;
}

// ===============================
// 📊 RENDER CHARTS (FIXED)
// ===============================
function renderAllCharts() {

  const x = dataset.map((_, i) => i);
  const y = dataset.map(d => Number(d[numericColumn]) || 0);

  const prediction = predict(y, 10);
  const futureX = prediction.map((_, i) => y.length + i);

  const layout = {
    autosize: true,
    margin: { t: 30, l: 40, r: 20, b: 40 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#e2e8f0" }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot("lineChart", [
    { x, y, mode: "lines+markers", name: "Actual" },
    { x: futureX, y: prediction, mode: "lines", name: "Prediction", line: { dash: "dot" } }
  ], layout, config);

  Plotly.newPlot("barChart", [{ x, y, type: "bar" }], layout, config);

  Plotly.newPlot("pieChart", [{
    values: y,
    labels: x,
    type: "pie"
  }], layout, config);

  Plotly.newPlot("scatterChart", [{
    x, y,
    mode: "markers",
    type: "scatter"
  }], layout, config);

  Plotly.newPlot("histogramChart", [{
    x: y,
    type: "histogram"
  }], layout, config);

  Plotly.newPlot("boxPlotChart", [{
    y,
    type: "box"
  }], layout, config);

  Plotly.newPlot("heatmapChart", [{
    z: [y, y],
    type: "heatmap"
  }], layout, config);

  Plotly.newPlot("geoMap", [{
    type: "scattergeo",
    mode: "markers",
    lat: [20.5937],
    lon: [78.9629]
  }], layout, config);

  Plotly.newPlot("waterfallChart", [{
    type: "waterfall",
    x: ["Start", "Growth", "Drop", "End"],
    y: [10, 25, -10, 40]
  }], layout, config);

  Plotly.newPlot("sankeyChart", [{
    type: "sankey",
    node: { label: ["A", "B", "C", "D"] },
    link: {
      source: [0, 1, 0],
      target: [1, 2, 3],
      value: [10, 20, 30]
    }
  }], layout, config);

  // 🔥 FIX RESIZE BUG
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 300);
}

// ===============================
// 🤖 AI CHAT
// ===============================
function askAI() {
  const input = document.getElementById("chatInput").value.toLowerCase();
  const box = document.getElementById("chatBox");

  if (!dataset.length) {
    box.innerHTML += `<p>⚠ Upload data first</p>`;
    return;
  }

  const values = dataset.map(d => Number(d[numericColumn]) || 0);

  let response = "";

  if (input.includes("trend")) {
    response =
      values[values.length - 1] > values[0]
        ? "📈 Increasing trend"
        : "📉 Decreasing trend";
  } else if (input.includes("max")) {
    response = `🔺 Max: ${Math.max(...values)}`;
  } else if (input.includes("min")) {
    response = `🔻 Min: ${Math.min(...values)}`;
  } else if (input.includes("average")) {
    const avg = values.reduce((a,b)=>a+b,0)/values.length;
    response = `📊 Average: ${avg.toFixed(2)}`;
  } else {
    response = "🤖 Try: trend, max, min, average";
  }

  box.innerHTML += `<p><b>You:</b> ${input}</p>`;
  box.innerHTML += `<p><b>AI:</b> ${response}</p>`;

  document.getElementById("chatInput").value = "";
}

// ===============================
// 📄 EXPORT PDF
// ===============================
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const values = dataset.map(d => Number(d[numericColumn]) || 0);
  const avg = values.reduce((a,b)=>a+b,0)/values.length;

  doc.text("Insight Pilot Report", 10, 10);
  doc.text(`Rows: ${dataset.length}`, 10, 20);
  doc.text(`Column: ${numericColumn}`, 10, 30);
  doc.text(`Max: ${Math.max(...values)}`, 10, 40);
  doc.text(`Min: ${Math.min(...values)}`, 10, 50);
  doc.text(`Avg: ${avg.toFixed(2)}`, 10, 60);

  doc.text(
    values[values.length - 1] > values[0]
      ? "Trend: Increasing"
      : "Trend: Decreasing",
    10,
    80
  );

  doc.save("Insight-Pilot-Report.pdf");
}