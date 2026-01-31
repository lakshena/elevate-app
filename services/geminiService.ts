
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBulletPoints = async (title: string, description: string, context: 'project' | 'experience'): Promise<string[]> => {
  const prompt = `Act as a senior tech recruiter. Generate 3 professional, action-oriented, and ATS-friendly bullet points for a ${context} titled "${title}". 
  Original description: "${description}". 
  Focus on impact, specific technologies, and results. Use strong action verbs. Ensure it sounds impressive for a student with limited experience.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["bulletPoints"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.bulletPoints || [];
  } catch (error) {
    console.error("AI Generation Error:", error);
    return ["Developed a functional solution using relevant technologies.", "Collaborated on core features and improved performance.", "Implemented key modules to meet project requirements."];
  }
};

export const suggestSkills = async (projects: any[]): Promise<string[]> => {
  const projectContext = projects.map(p => p.title + ": " + p.technologies.join(', ')).join('; ');
  const prompt = `Based on these projects: "${projectContext}", suggest 8 relevant technical and soft skills for a student's resume.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["skills"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.skills || [];
  } catch (error) {
    return ["JavaScript", "React", "Node.js", "Problem Solving", "Teamwork"];
  }
};
