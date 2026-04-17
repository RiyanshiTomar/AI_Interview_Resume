const mongoose = require("mongoose");

/**
 * InterviewReport
 * Stores the full analysis Mistral produces for a (resume, JD) pair,
 * including ATS score, skill gaps, interview questions, and prep plan.
 */
const interviewReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Inputs
    jobTitle: { type: String, default: "" },
    company: { type: String, default: "" },
    jobDescription: { type: String, required: true },
    resumeText: { type: String, required: true },
    resumeFileName: { type: String, default: "" },

    // ATS
    atsScore: { type: Number, default: 0 },
    atsBreakdown: {
      keywordMatch: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 },
      sectionCompleteness: { type: Number, default: 0 },
      readability: { type: Number, default: 0 },
      experienceAlignment: { type: Number, default: 0 },
    },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    atsSuggestions: [{ type: String }],

    // Gap analysis
    matchPercentage: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    skillGaps: [
      {
        skill: String,
        importance: String, // "high" | "medium" | "low"
        reason: String,
        howToLearn: String,
      },
    ],

    // Interview questions (categorised)
    interviewQuestions: [
      {
        category: String, // "technical" | "behavioral" | "situational" | "role-specific"
        difficulty: String, // "easy" | "medium" | "hard"
        question: String,
        whatTheyLookFor: String,
        sampleAnswerOutline: String,
      },
    ],

    // Prep plan
    preparationPlan: {
      summary: String,
      weekByWeek: [
        {
          week: Number,
          focus: String,
          actions: [String],
          resources: [String],
        },
      ],
    },

    // Raw model output, kept for debugging
    rawModelOutput: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewReport", interviewReportSchema);
