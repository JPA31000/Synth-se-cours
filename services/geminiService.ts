import { GoogleGenAI, Type } from "@google/genai";
import type { SummaryData } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateSummaryFromFile = async (courseFile: File, tdFile: File | null): Promise<SummaryData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const courseFilePart = await fileToGenerativePart(courseFile);
  // FIX: Explicitly type `allParts` to allow both file parts (inlineData) and text parts.
  // This resolves the type error that occurs later when pushing the text prompt.
  const allParts: ({ inlineData: { data: string; mimeType: string; } } | { text: string; })[] = [courseFilePart];

  if (tdFile) {
    const tdFilePart = await fileToGenerativePart(tdFile);
    allParts.push(tdFilePart);
  }

  const prompt = `Tu es un assistant pédagogique spécialisé dans la création de fiches de révision. Tu analyseras un ou deux documents.
Le premier document est toujours le matériel de cours principal.
Le second document, s'il est fourni, est un document d'exercices (TD) ou d'activité complémentaire.

Ta tâche est d'analyser le matériel de cours. Si un document TD/activité est également fourni, utilise-le pour mieux comprendre les concepts clés, pour créer des questions de quiz plus pertinentes, et pour décrire le déroulement de l'activité. La fiche de synthèse doit se baser principalement sur le cours.

Extrais les informations suivantes du matériel de cours et retourne-les dans un objet JSON unique respectant le schéma fourni.
1. Titre: Le titre principal du contenu.
2. Points Clés: Un résumé des concepts principaux en 3 à 5 points.
3. Concepts et Définitions: Une liste des termes importants avec leurs définitions, basés sur le contenu.
4. Déroulement de l'Activité: Si un fichier TD/activité est fourni, fournis un résumé synthétique, étape par étape, du déroulement de l'activité ou des exercices. Si aucun fichier TD n'est fourni, retourne un tableau vide.
5. Quiz Interactif: Crée un quiz de 10 questions à choix multiples (QCM) pour tester la compréhension du contenu. Pour chaque question, fournis 3 options de réponse et indique la bonne réponse.`;
  
  allParts.push({ text: prompt });

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summaryPoints: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      keyConcepts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING }
          },
          required: ['term', 'definition']
        }
      },
      activityFlow: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Résumé étape par étape de l'activité du TD. Tableau vide si aucun TD n'est fourni."
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING }
          },
          required: ['question', 'options', 'correctAnswer']
        }
      }
    },
    required: ['title', 'summaryPoints', 'keyConcepts', 'activityFlow', 'quiz']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: allParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SummaryData;

  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate summary from Gemini API. Check console for details.");
  }
};

export const generateWelcomeImage = async (): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: 'A vibrant and modern flat illustration of a student at their desk. The student is focused, looking at a laptop which displays charts and graphs. Next to the laptop is a neatly organized summary sheet with key points highlighted. The background is clean and simple. The color palette is bright and engaging, using teals, oranges, and limes. The overall feeling is one of productivity and successful learning.',
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated by the API.");
        }
    } catch (error) {
        console.error("Error generating welcome image:", error);
        throw new Error("Failed to generate welcome image from Gemini API.");
    }
};