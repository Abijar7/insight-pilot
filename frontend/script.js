const API_URL = "https://insight-pilot-ybu5.onrender.com";

let dataset = [];
let numericColumn = null;

// =====================
// 🚀 UPLOAD TO BACKEND
// =====================
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
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

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

// =====================
// 🔍 DETECT NUMERIC COLUMN
// =====================
function detectNumericColumn() {
  const keys = Object.keys(dataset[0]);
  numericColumn = keys.find(k => !isNaN(dataset[0][k]));
}

// =====================
// 🤖 AI INSIGHTS
// =====================
function showInsights() {
  const values = dataset.map(d => Number(d[numericColumn]));

  const avg = values.reduce((a,b)=>a+b,0)/values.length;

  document.getElementById("output").innerText = `
📊 Rows: ${dataset.length}
📈 Avg: ${avg.toFixed(2)}
📊 Column: ${numericColumn}
  `;
}

// =====================
// 🔮 PREDICTION
// =====================
function predict(values, steps=10) {
  let n = values.length;
  let slope = (values[n-1] - values[0]) / n;

  return Array.from({length: steps}, (_, i) =>
    values[n-1] + slope * (i+1)
  );
}

// =====================
// 📊 HIGH-QUALITY CHARTS
// =====================
function renderAllCharts() {

  const x = dataset.map((_, i) => i);
  const y = dataset.map(d => Number(d[numericColumn]));

  const prediction = predict(y);
  const futureX = prediction.map((_, i) => y.length + i);

  const layout = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#e2e8f0" },
    autosize: true
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  // LINE (HD)
  Plotly.newPlot("lineChart", [
    { x, y, mode: "lines+markers", name: "Actual" },
    { x: futureX, y: prediction, mode: "lines", name: "Prediction", line:{dash:"dot"} }
  ], layout, config);

  // BAR
  Plotly.newPlot("barChart", [{
    x, y, type: "bar"
  }], layout, config);

  // PIE
  Plotly.newPlot("pieChart", [{
    values: y,
    labels: x,
    type: "pie"
  }], layout, config);

  // SCATTER
  Plotly.newPlot("scatterChart", [{
    x, y, mode: "markers"
  }], layout, config);

  // HISTOGRAM
  Plotly.newPlot("histogramChart", [{
    x: y,
    type: "histogram"
  }], layout, config);

  // BOX
  Plotly.newPlot("boxPlotChart", [{
    y, type: "box"
  }], layout, config);

  // HEATMAP
  Plotly.newPlot("heatmapChart", [{
    z: [y,y],
    type: "heatmap"
  }], layout, config);

  // GEO
  Plotly.newPlot("geoMap", [{
    type: "scattergeo",
    lat: [20],
    lon: [78]
  }], layout, config);
}

// =====================
// 🤖 CHAT
// =====================
function askAI() {
  const input = document.getElementById("chatInput").value;
  const box = document.getElementById("chatBox");

  box.innerHTML += `<p><b>You:</b> ${input}</p>`;
  box.innerHTML += `<p><b>AI:</b> Try: trend, average, max</p>`;
}

// =====================
// 📄 EXPORT PDF
// =====================
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Insight Pilot Report", 10, 10);
  doc.save("report.pdf");
}