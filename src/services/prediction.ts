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
    // Call the backend for Groq analysis
    const analyzeResponse = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    if (!analyzeResponse.ok) {
      const errorData = await analyzeResponse.json();
      throw new Error(errorData.error || "Failed to analyze mission risk using Groq AI");
    }

    const result = await analyzeResponse.json() as PredictionResult;

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
    }

    return result;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error(`Analysis Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
