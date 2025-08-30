"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AudioPlayer from "@/components/AudioPlayer";

interface CallDetails {
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
    analysisCostBreakdown?: any;
  };
  messages?: any[];
  artifact?: {
    recordingUrl?: string;
    stereoRecordingUrl?: string;
    recording?: {
      stereoUrl?: string;
      mono?: {
        combinedUrl?: string;
        assistantUrl?: string;
        customerUrl?: string;
      };
    };
    messages?: any[];
    transcript?: string;
    performanceMetrics?: any;
  };
  transcript?: string;
  recordingUrl?: string;
  summary?: string;
  analysis?: {
    summary?: string;
    successEvaluation?: string;
  };
  assistantId?: string;
  webCallUrl?: string;
  endedReason?: string;
  messageCount?: number;
  duration?: number;
}

export default function CallDetailsPage() {
  const params = useParams();
  const callId = params?.callId as string;
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) return;

    const fetchCallDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/vapi/call-data/${callId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCallDetails(data);
      } catch (err) {
        console.error('Error fetching call details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch call details');
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [callId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mb-6">
          <Link 
            href="/call-data"
            className="text-primary-200 hover:text-primary-100 transition-colors"
          >
            ← Back to Call Data
          </Link>
        </div>
        <h1 className="text-white text-3xl font-bold mb-8">Call Details</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading call details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="mb-6">
          <Link 
            href="/call-data"
            className="text-primary-200 hover:text-primary-100 transition-colors"
          >
            ← Back to Call Data
          </Link>
        </div>
        <h1 className="text-white text-3xl font-bold mb-8">Call Details</h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!callDetails) {
    return (
      <div className="min-h-screen p-6">
        <div className="mb-6">
          <Link 
            href="/call-data"
            className="text-primary-200 hover:text-primary-100 transition-colors"
          >
            ← Back to Call Data
          </Link>
        </div>
        <h1 className="text-white text-3xl font-bold mb-8">Call Details</h1>
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Call not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <Link 
          href="/call-data"
          className="text-primary-200 hover:text-primary-100 transition-colors"
        >
          ← Back to Call Data
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-2">Call Details</h1>
        <p className="text-gray-400">Call ID: {callDetails.id}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <div className="bg-dark-200 border border-gray-600 rounded-lg p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">Status</label>
              <p className={`text-lg font-medium capitalize ${
                callDetails.status === 'ended' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {callDetails.status}
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Started At</label>
              <p className="text-white">{new Date(callDetails.startedAt).toLocaleString()}</p>
            </div>
            {callDetails.endedAt && (
              <div>
                <label className="text-gray-400 text-sm">Ended At</label>
                <p className="text-white">{new Date(callDetails.endedAt).toLocaleString()}</p>
              </div>
            )}
            <div>
              <label className="text-gray-400 text-sm">Duration</label>
              <p className="text-white">
                {callDetails.duration ? `${callDetails.duration} seconds` : 'N/A'}
              </p>
            </div>
            {callDetails.endedReason && (
              <div>
                <label className="text-gray-400 text-sm">Ended Reason</label>
                <p className="text-white capitalize">{callDetails.endedReason.replace(/-/g, ' ')}</p>
              </div>
            )}
            {callDetails.assistantId && (
              <div>
                <label className="text-gray-400 text-sm">Assistant ID</label>
                <p className="text-white font-mono text-sm">{callDetails.assistantId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cost Information */}
        {callDetails.cost && (
          <div className="bg-dark-200 border border-gray-600 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-primary-200 font-semibold">${callDetails.cost.toFixed(4)}</span>
              </div>
              {callDetails.costBreakdown && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LLM</span>
                    <span className="text-white">${callDetails.costBreakdown.llm?.toFixed(4) || '0.0000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">STT (Speech-to-Text)</span>
                    <span className="text-white">${callDetails.costBreakdown.stt?.toFixed(4) || '0.0000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TTS (Text-to-Speech)</span>
                    <span className="text-white">${callDetails.costBreakdown.tts?.toFixed(4) || '0.0000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vapi Platform</span>
                    <span className="text-white">${callDetails.costBreakdown.vapi?.toFixed(4) || '0.0000'}</span>
                  </div>
                  {callDetails.costBreakdown.analysisCostBreakdown && (
                    <div className="mt-4 pt-3 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Analysis Breakdown:</p>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Summary</span>
                          <span className="text-gray-300">${callDetails.costBreakdown.analysisCostBreakdown.summary?.toFixed(4) || '0.0000'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Success Evaluation</span>
                          <span className="text-gray-300">${callDetails.costBreakdown.analysisCostBreakdown.successEvaluation?.toFixed(4) || '0.0000'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Voice Recordings */}
        {(callDetails.recordingUrl || callDetails.artifact?.recordingUrl) && (
          <div className="bg-dark-200 border border-gray-600 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-xl font-semibold mb-4">Voice Recordings</h2>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {/* Combined Recording */}
              {(callDetails.recordingUrl || callDetails.artifact?.recordingUrl) && (
                <AudioPlayer
                  src={callDetails.recordingUrl || callDetails.artifact?.recordingUrl || ''}
                  title="Combined Audio"
                  subtitle="Full conversation recording"
                />
              )}
              
              {/* Stereo Recording */}
              {callDetails.artifact?.stereoRecordingUrl && (
                <AudioPlayer
                  src={callDetails.artifact.stereoRecordingUrl}
                  title="Stereo Audio"
                  subtitle="High-quality stereo recording"
                />
              )}

              {/* Assistant Recording */}
              {callDetails.artifact?.recording?.mono?.assistantUrl && (
                <AudioPlayer
                  src={callDetails.artifact.recording.mono.assistantUrl}
                  title="AI Interviewer"
                  subtitle="Assistant voice only"
                />
              )}

              {/* Customer Recording */}
              {callDetails.artifact?.recording?.mono?.customerUrl && (
                <AudioPlayer
                  src={callDetails.artifact.recording.mono.customerUrl}
                  title="Candidate"
                  subtitle="Candidate voice only"
                />
              )}
            </div>
          </div>
        )}

        {/* Messages/Conversation */}
        {callDetails.messages && callDetails.messages.length > 0 && (
          <div className="bg-dark-200 border border-gray-600 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-xl font-semibold mb-4">
              Conversation ({callDetails.messages.length} messages)
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {callDetails.messages
                .filter(message => message.role !== 'system') // Hide system prompts for cleaner view
                .map((message, index) => (
                <div key={index} className={`border-l-4 pl-4 py-3 ${
                  message.role === 'bot' || message.role === 'assistant' 
                    ? 'border-primary-500 bg-primary-900/10' 
                    : 'border-green-500 bg-green-900/10'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-medium ${
                      message.role === 'bot' || message.role === 'assistant' 
                        ? 'text-primary-200' 
                        : 'text-green-400'
                    }`}>
                      {message.role === 'bot' || message.role === 'assistant' ? 'AI Interviewer' : 'Candidate'}
                    </span>
                    <div className="text-right text-xs text-gray-400">
                      {message.timestamp && (
                        <div>{new Date(message.timestamp).toLocaleTimeString()}</div>
                      )}
                      {message.duration && (
                        <div>{(message.duration / 1000).toFixed(1)}s</div>
                      )}
                      {message.secondsFromStart && (
                        <div>+{message.secondsFromStart.toFixed(1)}s</div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        {callDetails.transcript && (
          <div className="bg-dark-200 border border-gray-600 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-xl font-semibold mb-4">Full Transcript</h2>
            <div className="bg-dark-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{callDetails.transcript}</p>
            </div>
          </div>
        )}

        {/* Summary */}
        {callDetails.summary && (
          <div className="bg-dark-200 border border-gray-600 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-xl font-semibold mb-4">Interview Summary</h2>
            <div className="bg-dark-300 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed">{callDetails.summary}</p>
            </div>
          </div>
        )}

        {/* Analysis */}
        {callDetails.analysis && (
          <div className="bg-dark-200 border border-gray-600 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-xl font-semibold mb-4">Interview Analysis</h2>
            <div className="space-y-4">
              {callDetails.analysis.summary && (
                <div className="bg-dark-300 rounded-lg p-4">
                  <h3 className="text-primary-200 font-medium mb-2">Summary</h3>
                  <p className="text-gray-300 leading-relaxed">{callDetails.analysis.summary}</p>
                </div>
              )}
              {callDetails.analysis.successEvaluation && (
                <div className="bg-dark-300 rounded-lg p-4">
                  <h3 className="text-primary-200 font-medium mb-2">Success Evaluation</h3>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    callDetails.analysis.successEvaluation === 'true' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {callDetails.analysis.successEvaluation === 'true' ? 'Successful' : 'Needs Improvement'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {callDetails.artifact?.performanceMetrics && (
          <div className="bg-dark-200 border border-gray-600 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-dark-300 rounded-lg p-4">
                <h3 className="text-primary-200 font-medium mb-3">Average Latencies</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Model Latency</span>
                    <span className="text-white">{callDetails.artifact.performanceMetrics.modelLatencyAverage?.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Voice Latency</span>
                    <span className="text-white">{callDetails.artifact.performanceMetrics.voiceLatencyAverage?.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transcriber Latency</span>
                    <span className="text-white">{callDetails.artifact.performanceMetrics.transcriberLatencyAverage?.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Turn Latency</span>
                    <span className="text-white">{callDetails.artifact.performanceMetrics.turnLatencyAverage?.toFixed(0)}ms</span>
                  </div>
                </div>
              </div>
              
              {callDetails.artifact.performanceMetrics.turnLatencies && (
                <div className="bg-dark-300 rounded-lg p-4">
                  <h3 className="text-primary-200 font-medium mb-3">Turn-by-Turn Performance</h3>
                  <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                    {callDetails.artifact.performanceMetrics.turnLatencies.map((turn: any, index: number) => (
                      <div key={index} className="border-b border-gray-600 pb-2 last:border-b-0">
                        <div className="text-gray-400 mb-1">Turn {index + 1}</div>
                        <div className="flex justify-between text-xs">
                          <span>Total: {turn.turnLatency}ms</span>
                          <span>Model: {turn.modelLatency}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Web Call URL */}
        {callDetails.webCallUrl && (
          <div className="bg-dark-200 border border-gray-600 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-white text-xl font-semibold mb-4">Call Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">Web Call URL</label>
                <a 
                  href={callDetails.webCallUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary-200 hover:text-primary-100 transition-colors break-all"
                >
                  {callDetails.webCallUrl}
                </a>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Message Count</label>
                <p className="text-white">{callDetails.messageCount || 0} messages</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
