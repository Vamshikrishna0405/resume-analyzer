import React, { useState } from "react";
import "./App.css";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a resume");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDescription);

    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
  };

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.text("AI Resume Analyzer Report", 20, 20);
    doc.text(`ATS Score: ${result.score}%`, 20, 40);
    doc.text(`Job Match Score: ${result.job_match}%`, 20, 50);
    doc.text(`Predicted Role: ${result.role}`, 20, 60);

    doc.text("Found Skills:", 20, 80);
    result.found_skills.forEach((skill, index) => {
      doc.text(`- ${skill}`, 30, 90 + index * 10);
    });

    let y = 130;

    doc.text("Missing Skills:", 20, y);
    result.missing_skills.forEach((skill, index) => {
      doc.text(`- ${skill}`, 30, y + 10 + index * 10);
    });

    y += 60;

    doc.text("Suggestions:", 20, y);
    result.suggestions.forEach((item, index) => {
      doc.text(`- ${item}`, 30, y + 10 + index * 10);
    });

    doc.save("Resume_Report.pdf");
  };

  const pieData = result
    ? {
        labels: ["Found Skills", "Missing Skills"],
        datasets: [
          {
            data: [
              result.found_skills.length,
              result.missing_skills.length,
            ],
            backgroundColor: ["green", "red"],
          },
        ],
      }
    : null;

  const barData = result
    ? {
        labels: ["ATS Score", "Job Match Score"],
        datasets: [
          {
            label: "Scores",
            data: [result.score, result.job_match],
            backgroundColor: ["blue", "orange"],
          },
        ],
      }
    : null;

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />

      <textarea
        placeholder="Paste Job Description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <br />

      <button onClick={handleUpload}>Analyze Resume</button>

      {result && (
        <div className="card">
          <h2>ATS Score: {result.score}%</h2>
          <h2>Job Match Score: {result.job_match}%</h2>
          <h2>Predicted Role: {result.role}</h2>

          <h3>Found Skills</h3>
          <ul>
            {result.found_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul>
            {result.missing_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Missing For Job</h3>
          <ul>
            {result.job_missing.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Suggestions</h3>
          <ul>
            {result.suggestions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <div style={{ width: "400px", margin: "20px auto" }}>
            <Pie data={pieData} />
          </div>

          <div style={{ width: "500px", margin: "20px auto" }}>
            <Bar data={barData} />
          </div>

          <button onClick={downloadReport}>Download Report</button>
        </div>
      )}
    </div>
  );
}

export default App;