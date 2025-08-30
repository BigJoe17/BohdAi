 import Vapi from "@vapi-ai/web";

interface VapiCall {
  id: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  cost?: number;
  costBreakdown?: {
    llm: number;
    stt: number;
    tts: number;
    vapi: number;
    total: number;
  };
  messages?: any[];
  artifact?: any;
  assistant?: {
    id: string;
    name?: string;
  };
}

class VapiCallDataService {
  private apiKey: string;
  private baseUrl: string = "https://api.vapi.ai";

  constructor() {
    this.apiKey = process.env.VAPI_PRIVATE_API_KEY || "";
    if (!this.apiKey) {
      console.warn("VAPI_PRIVATE_API_KEY not found in environment variables");
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getAllCalls(): Promise<VapiCall[]> {
    try {
      const data = await this.makeRequest("/call");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching all calls:", error);
      throw error;
    }
  }

  async getRecentCalls(limit: number = 10): Promise<VapiCall[]> {
    try {
      const data = await this.makeRequest(`/call?limit=${limit}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching recent calls:", error);
      throw error;
    }
  }

  async getCall(callId: string): Promise<VapiCall> {
    try {
      const data = await this.makeRequest(`/call/${callId}`);
      return data;
    } catch (error) {
      console.error(`Error fetching call ${callId}:`, error);
      throw error;
    }
  }

  hasArtifactData(call: VapiCall): boolean {
    return !!(call.artifact && (
      call.artifact.messages ||
      call.artifact.transcript ||
      call.artifact.recordingUrl
    ));
  }

  extractCallInfo(call: VapiCall) {
    return {
      id: call.id,
      status: call.status,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      cost: call.cost,
      costBreakdown: call.costBreakdown,
      messageCount: call.artifact?.messages?.length || 0,
      hasTranscript: !!call.artifact?.transcript,
      hasRecording: !!call.artifact?.recordingUrl,
      assistantId: call.assistant?.id,
    };
  }
}

export const vapiCallDataService = new VapiCallDataService();
