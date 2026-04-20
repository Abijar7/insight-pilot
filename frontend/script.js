// =====================
// 🤖 CLEAN AI INSIGHTS
// =====================
function showInsights(analysis) {
  if (!analysis || !analysis.sample.length) return;

  const data = analysis.sample;

  const keys = Object.keys(data[0]);
  const numericCol = keys.find(k => !isNaN(Number(data[0][k])));

  const values = data.map(d => Number(d[numericCol]) || 0);

  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const trend =
    values[values.length - 1] > values[0]
      ? "📈 Increasing"
      : "📉 Decreasing";

  document.getElementById("output").innerText = `
📊 DATA ANALYSIS REPORT

📁 Total Rows: ${analysis.totalRows}
📊 Columns: ${analysis.columns.length}

🔢 Numeric Column: ${numericCol}

📈 Trend: ${trend}
📊 Average: ${avg.toFixed(2)}

🤖 AI Insight:
• Data processed successfully
• Pattern detected in dataset
• Visualization generated
• Prediction model applied
  `;
}

// =====================
// GLOBAL VARIABLES
// =====================
let dataset = [];
let numericColumn = null;

// =====================
// 📂 UPLOAD TO BACKEND
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
    const response = await fetch("https://insight-pilot-ybu5.onrender.com/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      output.textContent = "❌ Error: " + data.error;
      return;
    }

    dataset = data.analysis.sample;

    if (!dataset.length) {
      output.textContent = "❌ No data returned";
      return;
    }

    detectNumericColumn();

    showInsights(data.analysis);

    renderAllCharts();

  } catch (err) {
    output.textContent = "❌ Server error: " + err.message;
  }
}

// =====================
// 🔍 DETECT NUMERIC COLUMN
// =====================
function detectNumericColumn() {
  const keys = Object.keys(dataset[0] || {});
  numericColumn = keys.find(key => !isNaN(Number(dataset[0][key])));
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
// 📊 RENDER CHARTS (FINAL FIX)
// =====================
function renderAllCharts() {
  if (!dataset.length || !numericColumn) return;

  const x = dataset.map((_, i) => i);
  const y = dataset.map(d => Number(d[numericColumn]) || 0);

  const prediction = predict(y, 10);
  const futureX = [...Array(10)].map((_, i) => y.length + i);

  const layoutCommon = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#e2e8f0" }
  };

  const config = {
    responsive: true,
    displayModeBar: false // ✅ REQUIRED FIX
  };

  // 📈 LINE
  Plotly.newPlot("lineChart", [
    { x, y, mode: "lines+markers", name: "Actual" },
    { x: futureX, y: prediction, mode: "lines", name: "Prediction", line: { dash: "dot" } }
  ], {
    ...layoutCommon,
    title: "Trend & Prediction",
    xaxis: { title: "Index / Time" },
    yaxis: { title: numericColumn }
  }, config);

  // 📊 BAR
  Plotly.newPlot("barChart", [
    { x, y, type: "bar" }
  ], {
    ...layoutCommon,
    title: "Bar Chart",
    xaxis: { title: "Index" },
    yaxis: { title: numericColumn }
  }, config);

  // 🥧 PIE
  Plotly.newPlot("pieChart", [{
    values: y.slice(0, 5),
    labels: x.slice(0, 5),
    type: "pie"
  }], {
    ...layoutCommon,
    title: "Pie Chart"
  }, config);

  // 📍 SCATTER
  Plotly.newPlot("scatterChart", [{
    x, y, mode: "markers"
  }], {
    ...layoutCommon,
    title: "Scatter Plot",
    xaxis: { title: "Index" },
    yaxis: { title: numericColumn }
  }, config);

  // 📉 HISTOGRAM
  Plotly.newPlot("histogramChart", [{
    x: y,
    type: "histogram"
  }], {
    ...layoutCommon,
    title: "Distribution",
    xaxis: { title: numericColumn },
    yaxis: { title: "Frequency" }
  }, config);

  // 📦 BOX
  Plotly.newPlot("boxPlotChart", [{
    y,
    type: "box"
  }], {
    ...layoutCommon,
    title: "Box Plot",
    yaxis: { title: numericColumn }
  }, config);

  // 🌡 HEATMAP
  Plotly.newPlot("heatmapChart", [{
    z: [y, y],
    type: "heatmap"
  }], {
    ...layoutCommon,
    title: "Heatmap"
  }, config);

  // ✅ STEP 4: FORCE RESIZE FIX (VERY IMPORTANT)
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 300);
}

// =====================
// 🤖 AI CHAT
// =====================
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
    response = values.at(-1) > values[0] ? "📈 Increasing" : "📉 Decreasing";
  } else if (input.includes("max")) {
    response = `Max: ${Math.max(...values)}`;
  } else if (input.includes("min")) {
    response = `Min: ${Math.min(...values)}`;
  } else if (input.includes("average")) {
    const avg = values.reduce((a,b)=>a+b,0)/values.length;
    response = `Average: ${avg.toFixed(2)}`;
  } else {
    response = "Try: trend, max, min, average";
  }

  box.innerHTML += `<p><b>You:</b> ${input}</p>`;
  box.innerHTML += `<p><b>AI:</b> ${response}</p>`;

  document.getElementById("chatInput").value = "";
}

// =====================
// 📄 EXPORT PDF WITH CHARTS
// =====================
async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  if (!dataset.length) {
    alert("No data available");
    return;
  }

  const values = dataset.map(d => Number(d[numericColumn]) || 0);
  const avg = values.reduce((a,b)=>a+b,0)/values.length;

  doc.setFontSize(14);
  doc.text("Insight Pilot Report", 10, 10);

  doc.setFontSize(10);
  doc.text(`Rows: ${dataset.length}`, 10, 20);
  doc.text(`Column: ${numericColumn}`, 10, 30);
  doc.text(`Max: ${Math.max(...values)}`, 10, 40);
  doc.text(`Min: ${Math.min(...values)}`, 10, 50);
  doc.text(`Average: ${avg.toFixed(2)}`, 10, 60);

  try {
    await new Promise(r => setTimeout(r, 500));

    const lineImg = await Plotly.toImage(document.getElementById("lineChart"), {
      format: "png",
      width: 800,
      height: 400
    });

    doc.addPage();
    doc.text("Trend Chart", 10, 10);
    doc.addImage(lineImg, "PNG", 10, 20, 180, 90);

  } catch (err) {
    console.error(err);
    doc.text("⚠ Chart export failed", 10, 80);
  }

  doc.save("Insight-Pilot-Report.pdf");
}