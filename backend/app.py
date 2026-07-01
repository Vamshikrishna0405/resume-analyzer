from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz

app = Flask(__name__)
CORS(app)

skills_list = [
    "python",
    "java",
    "react",
    "javascript",
    "html",
    "css",
    "sql",
    "flask"
]


def extract_text_from_pdf(pdf_file):
    text = ""
    pdf = fitz.open(stream=pdf_file.read(), filetype="pdf")

    for page in pdf:
        text += page.get_text()

    return text.lower()


@app.route("/analyze", methods=["POST"])
def analyze_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files["resume"]
    job_description = request.form.get("job_description", "").lower()

    text = extract_text_from_pdf(file)

    found_skills = []
    missing_skills = []

    for skill in skills_list:
        if skill in text:
            found_skills.append(skill)
        else:
            missing_skills.append(skill)

    score = (len(found_skills) / len(skills_list)) * 100

    # Job Match Logic
    job_match = 0
    job_missing = []

    if job_description:
        jd_skills = []

        for skill in skills_list:
            if skill in job_description:
                jd_skills.append(skill)

        matched = [skill for skill in jd_skills if skill in found_skills]

        if len(jd_skills) > 0:
            job_match = (len(matched) / len(jd_skills)) * 100
            job_missing = [skill for skill in jd_skills if skill not in matched]

    # Role Prediction
    role = "Unknown"

    if (
        "react" in text
        or "javascript" in text
        or "html" in text
        or "css" in text
    ):
        role = "Frontend Developer"

    elif "flask" in text or "python" in text or "sql" in text:
        role = "Backend Developer"

    elif "machine learning" in text or "data science" in text:
        role = "ML Engineer"

    # Suggestions
    suggestions = []

    if score < 50:
        suggestions.append("Add more technical skills")

    if "project" not in text:
        suggestions.append("Add project section")

    if "internship" not in text:
        suggestions.append("Add internship experience")

    if "github" not in text:
        suggestions.append("Add GitHub profile")

    if "linkedin" not in text:
        suggestions.append("Add LinkedIn profile")

    return jsonify({
        "score": score,
        "found_skills": found_skills,
        "missing_skills": missing_skills,
        "job_match": job_match,
        "job_missing": job_missing,
        "role": role,
        "suggestions": suggestions
    })


if __name__ == "__main__":
    app.run(debug=True)