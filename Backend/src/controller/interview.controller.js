const InterviewReport = require("../models/interviewReport.model");
const aiService = require("../services/ai.service");
const resumeParser = require("../services/resumeParser.service");

/**
 * POST /api/interview/analyze
 * Body: multipart/form-data with `resume` file + { jobDescription, jobTitle, company, resumeText? }
 * OR JSON with { resumeText, jobDescription, jobTitle, company }
 */
const analyze = async (req, res) => {
  try {
    const { jobDescription, jobTitle = "", company = "" } = req.body;
    if (!jobDescription || jobDescription.trim().length < 30) {
      return res
        .status(400)
        .json({ message: "Job description is required (min 30 characters)" });
    }

    let resumeText = (req.body.resumeText || "").trim();
    let resumeFileName = "";

    if (req.file) {
      resumeText = await resumeParser.extractTextFromBuffer(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
      resumeFileName = req.file.originalname;
    }

    if (!resumeText || resumeText.length < 50) {
      return res
        .status(400)
        .json({ message: "Resume text is empty or too short. Upload a valid resume." });
    }

    const { analysis, raw } = await aiService.analyzeInterview({
      resumeText,
      jobDescription,
      jobTitle,
      company,
    });

    const report = await InterviewReport.create({
      user: req.userId,
      jobTitle,
      company,
      jobDescription,
      resumeText,
      resumeFileName,
      ...analysis,
      rawModelOutput: raw,
    });

    res.status(201).json({ message: "Analysis complete", report });
  } catch (error) {
    console.error("Interview analyze error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to analyze — please try again" });
  }
};

/** GET /api/interview/reports */
const listReports = async (req, res) => {
  try {
    const reports = await InterviewReport.find({ user: req.userId })
      .select(
        "jobTitle company atsScore matchPercentage createdAt resumeFileName"
      )
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reports });
  } catch (error) {
    console.error("List reports error:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

/** GET /api/interview/reports/:id */
const getReport = async (req, res) => {
  try {
    const report = await InterviewReport.findOne({
      _id: req.params.id,
      user: req.userId,
    }).lean();
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({ message: "Failed to fetch report" });
  }
};

/** DELETE /api/interview/reports/:id */
const deleteReport = async (req, res) => {
  try {
    const r = await InterviewReport.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!r) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted" });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({ message: "Failed to delete report" });
  }
};

module.exports = { analyze, listReports, getReport, deleteReport };
