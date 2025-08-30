"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

interface CallData {
  id: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  cost?: number;
  messageCount?: number;
  hasArtifact?: boolean;
}

function CallDataPage() {
  const [callData, setCallData] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallData = async () => {
      try {
        console.log("Fetching call data...");
        const response = await fetch('/api/vapi/call-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Call data received:", data);
        
        if (Array.isArray(data)) {
          setCallData(data);
        } else {
          console.error("Expected array but got:", typeof data);
          setError("Invalid data format received");
        }
      } catch (err) {
        console.error('Error fetching call data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch call data');
      } finally {
        setLoading(false);
      }
    };

    fetchCallData();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen p-6 pt-32">
          <h1 className="text-white text-3xl font-bold mb-8">Your Interviews</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-lg">Loading interview data...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen p-6 pt-32">
          <h1 className="text-white text-3xl font-bold mb-8">Your Interviews</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h2 className="text-red-400 font-semibold mb-2">Error Loading Interviews</h2>
            <p className="text-red-300">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen p-6 pt-32">
        <h1 className="text-white text-3xl font-bold mb-8">Your Interviews</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {callData.map((call, index, array) => {
          // Calculate interview number from the end (most recent gets highest number)
          const totalInterviews = array.length;
          const interviewNumber = totalInterviews - index;
          
          return (
            <Link
              key={call.id}
              href={`/call-data/${call.id}`}
              className="bg-dark-200 border border-gray-600 rounded-lg p-6 hover:border-primary-200 transition-colors cursor-pointer block"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-semibold">Interview {interviewNumber}</h3>
                  <p className="text-gray-400 text-sm">
                    Status: <span className={`capitalize ${call.status === 'ended' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {call.status}
                    </span>
                  </p>
                </div>
                {call.cost && (
                  <div className="text-right">
                    <p className="text-primary-200 font-semibold">${call.cost.toFixed(4)}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-300 text-sm">
                  Started: {new Date(call.startedAt).toLocaleString()}
                </p>
                {call.endedAt && (
                  <p className="text-gray-300 text-sm">
                    Ended: {new Date(call.endedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  {call.messageCount || 0} messages
                </div>
                <div className="text-gray-400 text-sm flex items-center">
                  {call.hasArtifact ? '📄 Has Data' : '📝 Basic Info'}
                  <span className="ml-2 text-primary-300">→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {callData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No interviews available</p>
        </div>
      )}
      </div>
    </PageLayout>
  );
}

export default CallDataPage;
