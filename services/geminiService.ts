
import { GoogleGenAI, Type } from "@google/genai";
import { SceneConfig } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sceneSchema = {
  type: Type.OBJECT,
  properties: {
    objects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['box', 'sphere', 'torus', 'cylinder', 'plane', 'particleTree'] },
          position: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              z: { type: Type.NUMBER },
            },
            required: ['x', 'y', 'z']
          },
          rotation: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              z: { type: Type.NUMBER },
            },
            required: ['x', 'y', 'z']
          },
          scale: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              z: { type: Type.NUMBER },
            },
            required: ['x', 'y', 'z']
          },
          color: { type: Type.STRING, description: 'Hex color string' },
          wireframe: { type: Type.BOOLEAN },
          metalness: { type: Type.NUMBER },
          roughness: { type: Type.NUMBER },
          intensity: { type: Type.NUMBER, description: 'Brightness for particle systems' },
        },
        required: ['id', 'type', 'position', 'rotation', 'scale', 'color']
      }
    },
    ambientLightIntensity: { type: Type.NUMBER },
    pointLightColor: { type: Type.STRING },
    pointLightPosition: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        z: { type: Type.NUMBER },
      },
      required: ['x', 'y', 'z']
    },
    backgroundColor: { type: Type.STRING },
    showSnow: { type: Type.BOOLEAN }
  },
  required: ['objects', 'ambientLightIntensity', 'pointLightColor', 'pointLightPosition', 'backgroundColor']
};

export async function generateScene(prompt: string): Promise<{ text: string; config: SceneConfig }> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `You are a world-class Three.js and WebGL engineer. 
      Your task is to translate natural language descriptions into a valid 3D scene configuration. 
      Provide both a natural language explanation of your creative choices and a structured JSON configuration.
      The JSON should describe a visually stunning, harmonious 3D composition.
      When the user asks for a Christmas Tree, use the 'particleTree' type for a high-fidelity effect.
      Use 'showSnow: true' for holiday-themed or wintry scenes.
      Focus on aesthetics, color harmony, and creative geometry.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          config: sceneSchema
        },
        required: ['explanation', 'config']
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    text: result.explanation,
    config: result.config
  };
}
