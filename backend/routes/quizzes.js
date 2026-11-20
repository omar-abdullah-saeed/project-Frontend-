import { Router } from "express";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { generateJobSubjects, generateQuiz } from "../lib/gemini.js";
import { validateQuizQuestion } from "../utils/validation.js";

const router = Router();
const temporarilyUnavailableStatuses = new Set([429, 500, 502, 503, 504]);

const handleProviderError = (error, res, next) => {
  const status = Number(error?.status ?? error?.response?.status);
  if ([400, 401, 403].includes(status)) {
    return res.status(400).json({
      error: "Gemini rejected this API key or its access to the model. Check the key and try again.",
    });
  }
  if (temporarilyUnavailableStatuses.has(status)) {
    return res.status(503).json({ error: "The AI service is busy right now. Please try again shortly." });
  }
  return next(error);
};

const getUserApiKey = (body) => {
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
  if (apiKey && (apiKey.length > 256 || !/^[\x21-\x7E]+$/.test(apiKey))) {
    return null;
  }
  return apiKey || undefined;
};

router.post("/subjects", async (req, res, next) => {
  try {
    const jobType = typeof req.body?.jobType === "string" ? req.body.jobType.trim() : "";
    const apiKey = getUserApiKey(req.body);
    if (apiKey === null) {
      return res.status(400).json({ error: "Paste a valid Gemini API key without spaces or non-ASCII characters" });
    }
    if (!jobType || jobType.length > 100) {
      return res.status(400).json({ error: "Job type must be 1-100 characters" });
    }

    const generatedSubjects = await generateJobSubjects(jobType, apiKey);
    if (
      !Array.isArray(generatedSubjects) ||
      generatedSubjects.length < 3 ||
      generatedSubjects.length > 8 ||
      !generatedSubjects.every((subject) => typeof subject === "string" && subject.trim().length > 0 && subject.length <= 60)
    ) {
      return res.status(502).json({ error: "Quiz provider returned an invalid subject list" });
    }

    const subjects = [...new Set(generatedSubjects.map((subject) => subject.trim()))];
    if (subjects.length < 3) {
      return res.status(502).json({ error: "Quiz provider returned an invalid subject list" });
    }

    return res.json({ subjects });
  } catch (error) {
    return handleProviderError(error, res, next);
  }
});

router.post("/generate", async (req, res, next) => {
  try {
    const jobType = typeof req.body?.jobType === "string" ? req.body.jobType.trim() : "";
    const legacyTopic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";
    const apiKey = getUserApiKey(req.body);
    if (apiKey === null) {
      return res.status(400).json({ error: "Paste a valid Gemini API key without spaces or non-ASCII characters" });
    }
    const topic = jobType || legacyTopic;
    const maxTopicLength = jobType ? 100 : 200;
    if (!topic || topic.length > maxTopicLength) {
      return res.status(400).json({ error: `Job type or topic must be 1-${maxTopicLength} characters` });
    }

    const subjects = req.body?.subjects;
    if (
      subjects !== undefined &&
      (!Array.isArray(subjects) ||
        subjects.length < 1 ||
        subjects.length > 8 ||
        !subjects.every((subject) => typeof subject === "string" && subject.trim().length > 0 && subject.length <= 60))
    ) {
      return res.status(400).json({ error: "Choose between 1 and 8 valid subjects" });
    }

    const questionCount = req.body?.questionCount ?? 2;
    if (![2, 5, 10].includes(questionCount)) {
      return res.status(400).json({ error: "Question count must be 2, 5, or 10" });
    }

    const questions = await generateQuiz(topic, subjects ?? [], questionCount, apiKey);
    if (questions.length !== questionCount || !questions.every(validateQuizQuestion)) {
      return res.status(502).json({ error: "The AI could not create a valid quiz. Please try again." });
    }
    return res.json({
      topic: jobType ? `${jobType} interview prep` : legacyTopic,
      questions,
    });
  } catch (error) {
    return handleProviderError(error, res, next);
  }
});

router.post("/attempts", async (req, res, next) => {
  try {
    const { topic, questions, answers, score } = req.body ?? {};
    if (
      typeof topic !== "string" ||
      !topic.trim() ||
      !Array.isArray(questions) ||
      !questions.length ||
      !questions.every(validateQuizQuestion) ||
      !Array.isArray(answers) ||
      answers.length !== questions.length ||
      !answers.every((answer) => ["option1", "option2", "option3", "option4"].includes(answer)) ||
      !Number.isInteger(score) ||
      score < 0 ||
      score > questions.length
    ) {
      return res.status(400).json({ error: "Invalid quiz attempt" });
    }

    const attempt = await QuizAttempt.create({
      user: req.userId,
      topic: topic.trim(),
      questions,
      answers,
      score,
    });
    return res.status(201).json(attempt);
  } catch (error) {
    return next(error);
  }
});

router.get("/attempts", async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    return res.json(attempts);
  } catch (error) {
    return next(error);
  }
});

export default router;
