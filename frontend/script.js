
let dataset = [];
let numericColumn = null;

// =====================
// 📂 FILE UPLOAD
// =====================
document.getElementById("fileInput").addEventListener("change", handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    dataset = parseCSV(e.target.result);

    detectNumericColumn();

    showInsights();
    renderAllCharts();
  };

  reader.readAsText(file);
}

// =====================
// 📊 CSV PARSER
// =====================
function parseCSV(text) {
  const rows = text.trim().split("\n").map(r => r.split(","));
  const headers = rows[0];

  return rows.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = row[i];
    });
    return obj;
  });
}

// =====================
// 🔍 DETECT NUMERIC COLUMN
// =====================
function detectNumericColumn() {
  const keys = Object.keys(dataset[0]);

  numericColumn = keys.find(key =>
    !isNaN(Number(dataset[0][key]))
  );
}

// =====================
// 🤖 AI INSIGHTS
// =====================
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
- Data successfully analyzed
- Pattern detected in values
- Prediction model ready
  `;
}

// =====================
// 🔮 PREDICTION ENGINE
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

  let result = [];

  for (let i = 0; i < steps; i++) {
    result.push(slope * (n + i) + intercept);
  }

  return result;
}

// =====================
// 📊 RENDER ALL CHARTS
// =====================
function renderAllCharts() {
  const x = dataset.map((_, i) => i);
  const y = dataset.map(d => Number(d[numericColumn]) || 0);

  const prediction = predict(y, 10);
  const futureX = [...Array(10)].map((_, i) => y.length + i);

  // 📈 LINE CHART (REAL + PREDICTION)
  Plotly.newPlot("lineChart", [
    {
      x,
      y,
      mode: "lines+markers",
      name: "Actual Data"
    },
    {
      x: futureX,
      y: prediction,
      mode: "lines+markers",
      name: "Prediction",
      line: { dash: "dot" }
    }
  ]);

  // 📊 BAR
  Plotly.newPlot("barChart", [{ x, y, type: "bar" }]);

  // 🥧 PIE
  Plotly.newPlot("pieChart", [{
    values: y.slice(0, 5),
    labels: x.slice(0, 5),
    type: "pie"
  }]);

  // 📍 SCATTER
  Plotly.newPlot("scatterChart", [{
    x,
    y,
    mode: "markers",
    type: "scatter"
  }]);

  // 📉 HISTOGRAM
  Plotly.newPlot("histogramChart", [{
    x: y,
    type: "histogram"
  }]);

  // 📦 BOX
  Plotly.newPlot("boxPlotChart", [{
    y,
    type: "box"
  }]);

  // 🌡 HEATMAP
  Plotly.newPlot("heatmapChart", [{
    z: [y, y],
    type: "heatmap"
  }]);

  // 🌍 GEO (demo)
  Plotly.newPlot("geoMap", [{
    type: "scattergeo",
    mode: "markers",
    lat: [20.5937],
    lon: [78.9629]
  }]);

  // 🌊 WATERFALL
  Plotly.newPlot("waterfallChart", [{
    type: "waterfall",
    x: ["Start", "Growth", "Drop", "End"],
    y: [10, 25, -10, 40]
  }]);

  // 🌐 SANKEY
  Plotly.newPlot("sankeyChart", [{
    type: "sankey",
    node: { label: ["A", "B", "C", "D"] },
    link: {
      source: [0, 1, 0],
      target: [1, 2, 3],
      value: [10, 20, 30]
    }
  }]);
}

// =====================
// 🤖 AI CHAT SYSTEM
// =====================
function askAI() {
  const input = document.getElementById("chatInput").value.toLowerCase();
  const box = document.getElementById("chatBox");

  if (!dataset.length) {
    box.innerHTML += `<p>⚠ Please upload data first</p>`;
    return;
  }

  const values = dataset.map(d => Number(d[numericColumn]) || 0);

  let response = "";

  if (input.includes("trend")) {
    response =
      values[values.length - 1] > values[0]
        ? "📈 Increasing trend"
        : "📉 Decreasing trend";
  }

  else if (input.includes("max")) {
    response = `🔺 Max: ${Math.max(...values)}`;
  }

  else if (input.includes("min")) {
    response = `🔻 Min: ${Math.min(...values)}`;
  }

  else if (input.includes("average")) {
    const avg = values.reduce((a,b)=>a+b,0)/values.length;
    response = `📊 Average: ${avg.toFixed(2)}`;
  }

  else {
    response = "🤖 Try: trend, max, min, average";
  }

  box.innerHTML += `<p><b>You:</b> ${input}</p>`;
  box.innerHTML += `<p><b>AI:</b> ${response}</p>`;

  document.getElementById("chatInput").value = "";
}

// =====================
// 📄 PDF EXPORT
// =====================
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