/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_REASONING = 'gemini-3-pro-preview';

export interface Question {
  id: number;
  text: string;
}

export interface Trait {
  label: string;
  score: number; // 0-100
  description: string;
}

export interface PersonalityResult {
  archetype: string;
  summary: string;
  traits: Trait[];
  detailedAnalysis: string;
}

export interface CompatibilityResult {
  compatibilityScore: number;
  relationshipArchetype: string;
  synergyAnalysis: string;
  challenges: string;
  dimensions: {
    label: string;
    scoreUser1: number;
    scoreUser2: number;
    insight: string;
  }[];
}

// Schema for Questions
const questionsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          text: { type: Type.STRING },
        },
        required: ["id", "text"],
      },
    },
  },
  required: ["questions"],
};

// Schema for Individual Analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    archetype: { type: Type.STRING, description: "A creative name for their personality type" },
    summary: { type: Type.STRING, description: "A 2-3 sentence summary" },
    traits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "e.g., Openness, Emotional Stability" },
          score: { type: Type.INTEGER, description: "0 to 100" },
          description: { type: Type.STRING, description: "Short description of this score" },
        },
        required: ["label", "score", "description"],
      },
    },
    detailedAnalysis: { type: Type.STRING, description: "A few paragraphs describing the personality in depth." },
  },
  required: ["archetype", "summary", "traits", "detailedAnalysis"],
};

// Schema for Compatibility
const compatibilitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    compatibilityScore: { type: Type.INTEGER, description: "0-100 overall match" },
    relationshipArchetype: { type: Type.STRING, description: "A creative name for this pairing" },
    synergyAnalysis: { type: Type.STRING, description: "Detailed analysis of why they work well together" },
    challenges: { type: Type.STRING, description: "Potential friction points" },
    dimensions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Trait being compared" },
          scoreUser1: { type: Type.INTEGER },
          scoreUser2: { type: Type.INTEGER },
          insight: { type: Type.STRING, description: "Insight on this specific difference/similarity" }
        },
        required: ["label", "scoreUser1", "scoreUser2", "insight"]
      }
    }
  },
  required: ["compatibilityScore", "relationshipArchetype", "synergyAnalysis", "challenges", "dimensions"]
};

export async function generateQuestions(name: string, age: string, sex: string): Promise<Question[]> {
  const prompt = `Generate 15 psychological personality assessment questions tailored for a ${age} year old ${sex} named ${name}. 
  The questions should be suitable for determining "Big 5" personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) and general outlook.
  Phrase them as statements that the user can agree or disagree with.`;

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: questionsSchema,
    },
  });

  const data = JSON.parse(response.text || "{}");
  return data.questions || [];
}

export async function analyzePersonality(
  name: string,
  age: string,
  sex: string,
  questions: Question[],
  answers: Record<number, number>
): Promise<PersonalityResult> {
  // Convert answers (1-5) to text for the model
  const answerText = questions.map(q => {
    const val = answers[q.id];
    let label = "Neutral";
    if (val === 1) label = "Strongly Disagree";
    if (val === 2) label = "Disagree";
    if (val === 4) label = "Agree";
    if (val === 5) label = "Strongly Agree";
    return `Q: ${q.text} | A: ${label}`;
  }).join("\n");

  const prompt = `Analyze the personality of ${name} (${age}, ${sex}) based on these self-assessment responses:\n\n${answerText}\n\n
  Provide a psychological profile including an Archetype name, a summary, 5-6 key personality traits scored 0-100, and a detailed analysis.`;

  const response = await ai.models.generateContent({
    model: MODEL_REASONING,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    },
  });

  return JSON.parse(response.text || "{}") as PersonalityResult;
}

export async function analyzeCompatibility(
  u1: { name: string, age: string, sex: string },
  u1Answers: { questions: Question[], answers: Record<number, number> },
  u2: { name: string, age: string, sex: string },
  u2Answers: { questions: Question[], answers: Record<number, number> }
): Promise<CompatibilityResult> {
  
  const formatAnswers = (qs: Question[], as: Record<number, number>) => qs.map(q => {
    const val = as[q.id];
    let label = ["", "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"][val] || "Neutral";
    return `"${q.text}": ${label}`;
  }).join("\n");

  const prompt = `Perform a compatibility analysis between two people based on their personality assessment.
  
  Person 1: ${u1.name} (${u1.age}, ${u1.sex})
  Responses:
  ${formatAnswers(u1Answers.questions, u1Answers.answers)}

  Person 2: ${u2.name} (${u2.age}, ${u2.sex})
  Responses:
  ${formatAnswers(u2Answers.questions, u2Answers.answers)}

  Determine their compatibility score (0-100), give them a Relationship Archetype name, explain the synergy, potential challenges, and compare them across 5 key dimensions.`;

  const response = await ai.models.generateContent({
    model: MODEL_REASONING,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: compatibilitySchema,
    },
  });

  return JSON.parse(response.text || "{}") as CompatibilityResult;
}
