import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Note: In a real app, ensure API_KEY is set in environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export interface DeliveryEstimate {
  estimatedDistanceKm: number;
  deliveryFee: number;
  zone: string;
  reasoning: string;
}

/**
 * Uses Gemini to simulate a Matrix API calculation.
 * In a real-world scenario with the Google Maps Tool enabled, 
 * we would use the toolConfig to actually query distance.
 * Here, we demonstrate structural extraction and logic application.
 */
export const calculateDeliveryFee = async (address: string): Promise<DeliveryEstimate> => {
  if (!process.env.API_KEY) {
    // Fallback if no key provided for demo
    return {
      estimatedDistanceKm: 5.2,
      deliveryFee: 15.50,
      zone: "Zona Sul (Estimada)",
      reasoning: "Chave de API não configurada. Usando valores de demonstração."
    };
  }

  const model = "gemini-3-flash-preview";

  const prompt = `
    Você é um gerente de logística de uma confeitaria localizada no centro de São Paulo (Marco Zero).
    Analise o endereço fornecido pelo cliente e estime a distância e a taxa de entrega.
    
    Regras de Negócio:
    - Até 5km: R$ 10,00 fixo.
    - 5km a 10km: R$ 10,00 + R$ 1,50 por km adicional.
    - Acima de 10km: R$ 20,00 + R$ 2,00 por km adicional.
    
    Endereço do Cliente: "${address}"
    
    Retorne APENAS um JSON seguindo o schema especificado.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedDistanceKm: { type: Type.NUMBER, description: "Distância estimada em KM" },
            deliveryFee: { type: Type.NUMBER, description: "Valor final da entrega em Reais" },
            zone: { type: Type.STRING, description: "Nome da zona ou bairro identificado" },
            reasoning: { type: Type.STRING, description: "Breve explicação do cálculo" }
          },
          required: ["estimatedDistanceKm", "deliveryFee", "zone", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DeliveryEstimate;

  } catch (error) {
    console.error("Erro ao calcular entrega:", error);
    // Fallback seguro
    return {
      estimatedDistanceKm: 0,
      deliveryFee: 0,
      zone: "Erro ao calcular",
      reasoning: "Não foi possível conectar ao serviço de mapas inteligente."
    };
  }
};