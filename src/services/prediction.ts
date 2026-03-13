import { GoogleGenAI, Type } from "@google/genai";

export interface SatelliteData {
  name: string;
  tankPressure: number;
  tankTemperature: number;
  propellantMass: number;
  leakRate: number;
  propellantPurity: number;
  valveDutyCycle: number;
  valveResponseTime: number;
  regulatedPressure: number;
  valveCycles: number;
  igniterPulseDuration: number;
  catalystTemp: number;
  ignitionDelay: number;
  catalystAgeing: number;
  massFlowRate: number;
  injectorDeltaP: number;
  lineTemp: number;
  particulateLevel: number;
  nozzleTemp: number;
  thermalCycleRange: number;
  vibrationLevel: number;
  structuralIntegrityProxy: number;
  busVoltage: number;
  faultCodes: string;
  fdirThresholds: string;
  thrustLevel: number;
  isp: number;
  redundancyLevel: number;
  deltaVBudgetUsed: number;
}

export interface PredictionResult {
  estimatedLifespan: number;
  engineLifeRemaining: number;
  explosionRisk: number;
  failureProbability: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  risks: string[];
  recommendations: string[];
  summary: string;
}

export interface HistoryItem {
  id: number;
  name: string;
  risk_level: string;
  estimated_lifespan: number;
  failure_probability: number;
  summary: string;
  created_at: string;
}

export async function analyzeSatelliteRisk(data: SatelliteData): Promise<PredictionResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey });
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `
          Analyze the following detailed satellite propulsion and health data to predict mission longevity, engine life, explosion risk, and failure probability.
          
          Consider these common in-orbit satellite thruster failure modes in your analysis:
          1. Propellant issues: Micro-leaks in tanks/lines or misestimated fuel budget.
          2. Valve and regulator faults: Stuck closed (contamination/wear/cold-welding) or stuck open (continuous thrust).
          3. Ignition or catalyst failure: Degraded catalyst bed (sintering) or igniter malfunction.
          4. Blockages and contamination: Particles, frozen propellant, or manufacturing debris clogging injectors.
          5. Thermal and structural degradation: Cracking from hot/cold cycling or local overheating.
          6. Electronics and control anomalies: Driver electronics failure or faulty sensors/logic.
          7. Design/integration mistakes: Plume impingement or insufficient redundancy.

          Satellite Name: ${data.name}
          
          [Propellant/Tank]
          Pressure: ${data.tankPressure} bar, Temp: ${data.tankTemperature} K, Mass: ${data.propellantMass} kg, Leak Rate: ${data.leakRate} bar/day, Purity: ${data.propellantPurity}%
          
          [Valve/Regulator]
          Duty Cycle: ${data.valveDutyCycle}%, Response Time: ${data.valveResponseTime} ms, Regulated Pressure: ${data.regulatedPressure} bar, Cycles: ${data.valveCycles}
          
          [Ignition/Catalyst]
          Pulse Duration: ${data.igniterPulseDuration} ms, Catalyst Temp: ${data.catalystTemp} K, Delay: ${data.ignitionDelay} ms, Ageing Metric: ${data.catalystAgeing}
          
          [Flow/Contamination]
          Mass Flow: ${data.massFlowRate} g/s, Injector DeltaP: ${data.injectorDeltaP} bar, Line Temp: ${data.lineTemp} K, Particulate Level: ${data.particulateLevel} ppm
          
          [Thermal/Structural]
          Nozzle Temp: ${data.nozzleTemp} K, Thermal Cycle Range: ${data.thermalCycleRange} K, Vibration: ${data.vibrationLevel} g-rms, Structural Proxy: ${data.structuralIntegrityProxy}
          
          [Electronics/Control]
          Bus Voltage: ${data.busVoltage} V, Fault Codes: ${data.faultCodes}, FDIR Thresholds: ${data.fdirThresholds}
          
          [Guidance/Integration]
          Thrust Level: ${data.thrustLevel} N, Isp: ${data.isp} s, Redundancy: ${data.redundancyLevel} spares, Delta-V Used: ${data.deltaVBudgetUsed}%
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedLifespan: { type: Type.NUMBER },
              engineLifeRemaining: { type: Type.NUMBER },
              explosionRisk: { type: Type.NUMBER },
              failureProbability: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
              risks: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            },
            required: ["estimatedLifespan", "engineLifeRemaining", "explosionRisk", "failureProbability", "riskLevel", "risks", "recommendations", "summary"]
          }
        }
      });
    } catch (geminiError) {
      console.error("Gemini API Call Error:", geminiError);
      throw new Error(`Gemini API Error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
    }

    if (!response.text) {
      throw new Error("Gemini returned an empty response");
    }

    const result = JSON.parse(response.text) as PredictionResult;

    // Save to history via backend
    try {
      const saveResponse = await fetch("/api/save-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, ...result }),
      });
      if (!saveResponse.ok) {
        console.warn("Failed to save prediction to history, but analysis succeeded.");
      }
    } catch (saveError) {
      console.warn("Error saving prediction to history:", saveError);
      // We don't throw here because the analysis itself succeeded
    }

    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze mission risk using Gemini AI");
  }
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const response = await fetch("/api/history");
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

export async function deleteHistoryItem(id: number): Promise<void> {
  const response = await fetch(`/api/history/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete history item");
}
