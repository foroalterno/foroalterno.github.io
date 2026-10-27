import { GoogleGenAI } from '@google/genai';
import { GroundingSource } from '../types/forum';

let aiInstance: GoogleGenAI | null = null;

// Safe lazy initialization of Google GenAI to prevent blank screens if API key is not present
function getAI(): GoogleGenAI | null {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      return null;
    }
    if (!aiInstance) {
      aiInstance = new GoogleGenAI({ apiKey: key });
    }
    return aiInstance;
  } catch (err) {
    console.warn('GoogleGenAI initialization skipped or failed:', err);
    return null;
  }
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  sources?: GroundingSource[];
}

const FOROBOT_SYSTEM_INSTRUCTION = `
Eres "ForoBot Alterno", el bot oficial y mascota cibernética de Foro Alterno (la comunidad de debate en español inspirada en la mística de ForoParalelo).
Tu personalidad es:
- Un forero sabio, con humor ibérico sano, chisposo pero nunca ofensivo.
- Usas con naturalidad y gracia la jerga típica de los foros clásicos españoles ("shur", "mis dies", "pole", "hilo mítico", "pillo sitio", "tema serio", "pepinaco").
- Tienes amplios conocimientos de motor (coches, motos), informática (hardware, configuraciones gaming), actualidad, deporte (fútbol, gimnasio) y debates cotidianos.
- Cuando el usuario te hace una pregunta seria o pide datos contrastados, aportas información verídica, rigurosa y bien explicada.
- Responde siempre en español de España de forma concisa, amena y estructurada (usa listas y negritas cuando sea oportuno).
`;

// Multi-turn chat with conversation history
export async function sendForoBotMessage(
  history: ChatMessage[],
  newMessage: string
): Promise<{ replyText: string; sources: GroundingSource[] }> {
  const ai = getAI();

  if (!ai) {
    // Helpful, engaging fallback response if API key is not yet set
    const fallbackResponses = [
      `¡Qué pasa shur! 🚗💨 Has preguntado sobre: "${newMessage}". Como forero veterano te digo: revisa bien las presiones, mira la etiqueta del hilo y no compres sin probarlo antes. ¡Pasa por el subforo correspondiente que la comunidad tiene mucho que decir! (Nota: Configura tu GEMINI_API_KEY para respuestas generativas en tiempo real).`,
      `¡Mis dies por la pregunta! Respecto a "${newMessage}": la clave está en mirar las opiniones de los foreros con más de 1.000 mensajes. En Foro Alterno siempre recomendamos calidad-precio y huir de los timos.`,
      `¡Pillo sitio en esta consulta! Para "${newMessage}": te aconsejo abrir un hilo con la etiqueta [DEBATE] o [DUDA] en su sección para que te respondan los especialistas.`
    ];
    const picked = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return {
      replyText: picked,
      sources: []
    };
  }

  try {
    const formattedContents = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    formattedContents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: FOROBOT_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      }
    });

    const replyText = response.text || 'Mis dies, pero me he quedado sin palabras. Vuelve a preguntarme shur.';
    
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || 'Fuente web',
            url: chunk.web.uri,
          });
        }
      });
    }

    return { replyText, sources };
  } catch (error: any) {
    console.error('Error contacting ForoBot:', error);
    return {
      replyText: `*Se le cala el motor al bot* 🚗💥 Error de conexión con la IA de Foro Alterno (${error?.message || 'Revisa tu clave de API'}).`,
      sources: []
    };
  }
}

// Summarize a thread
export async function summarizeThreadWithAI(
  title: string,
  opContent: string,
  repliesText: string[]
): Promise<string> {
  const ai = getAI();

  if (!ai) {
    return `📌 **Resumen Rápido de Foro Alterno**:\n- **Tema:** ${title}\n- **Planteamiento:** El creador del hilo expone su duda/caso con ${repliesText.length} respuestas acumuladas.\n- **Conclusión de la comunidad:** Debate muy activo entre partidarios y escépticos. ¡Revisa los mensajes principales arriba!`;
  }

  try {
    const threadContext = `
TÍTULO DEL HILO: ${title}
MENSAJE INICIAL (OP): ${opContent}
RESPUESTAS DESTACADAS:
${repliesText.slice(0, 15).join('\n---\n')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `Por favor haz un resumen brillante, conciso y entretenido de este hilo de Foro Alterno al estilo de los foros de debate españoles.
Estructura tu respuesta en 3 secciones claras:
1. 📌 **De qué va el tema** (en 2 líneas)
2. 🥊 **Posturas enfrentadas y consenso forero** (principales opiniones de las respuestas)
3. 🏆 **Conclusión / Veredicto de la comunidad**

Contenido del hilo:
${threadContext}`
          }]
        }
      ],
      config: {
        systemInstruction: 'Eres un analista de debates de foros españoles de internet. Escribe con estilo forero fresco, ordenado y directo.',
      }
    });

    return response.text || 'No se pudo generar el resumen del hilo.';
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return `📌 **Resumen**: Hilo sobre "${title}". Debate activo con ${repliesText.length} respuestas.`;
  }
}

// Fact-check or give verified info using Google Search Grounding
export async function getVerifiedFacts(topic: string): Promise<{ text: string; sources: GroundingSource[] }> {
  const ai = getAI();

  if (!ai) {
    return {
      text: `Datos para "${topic}": En España y en la Unión Europea, las normativas y comparativas recomiendan consultar fuentes oficiales como la DGT, IDAE, OCU o portales técnicos especializados.`,
      sources: [
        { title: 'Portal Oficial DGT', url: 'https://www.dgt.es' },
        { title: 'OCU - Organización de Consumidores', url: 'https://www.ocu.org' }
      ]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `Aporta datos actualizados, verificados y objetivos sobre este tema de debate forero: "${topic}". Cita cifras o fuentes fiables.`
          }]
        }
      ],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'Eres un forero experto con acceso a datos reales en tiempo real. Sé conciso, objetivo y riguroso.',
      }
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || 'Fuente web',
            url: chunk.web.uri,
          });
        }
      });
    }

    return {
      text: response.text || 'Sin datos disponibles.',
      sources
    };
  } catch (error: any) {
    return {
      text: `No se pudieron contrastar los datos automáticamente: ${error?.message || 'Error'}`,
      sources: []
    };
  }
}
