import { NextRequest, NextResponse } from 'next/server';
import { vapiCallDataService } from '@/services/vapi/call-data.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const { callId } = await params;

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      );
    }

    // Get the full call details from VAPI
    const callDetails = await vapiCallDataService.getCall(callId);

    if (!callDetails) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    // Process and format the call details
    const formattedCallDetails = {
      id: callDetails.id,
      status: callDetails.status,
      startedAt: callDetails.startedAt,
      endedAt: callDetails.endedAt,
      cost: callDetails.cost,
      costBreakdown: callDetails.costBreakdown,
      
      // Messages with proper formatting
      messages: callDetails.messages?.map((message: any) => ({
        role: message.role,
        message: message.message,
        time: message.time,
        timestamp: message.time ? new Date(message.time).toISOString() : null,
        duration: message.duration,
        source: message.source,
        endTime: message.endTime,
        secondsFromStart: message.secondsFromStart
      })) || [],
      
      // Additional call data (these exist in the actual response)
      transcript: (callDetails as any).transcript,
      recordingUrl: (callDetails as any).recordingUrl,
      artifact: (callDetails as any).artifact,
      summary: (callDetails as any).summary,
      analysis: (callDetails as any).analysis,
      
      // Technical details
      assistantId: (callDetails as any).assistantId,
      webCallUrl: (callDetails as any).webCallUrl,
      
      // Error info if any
      endedReason: (callDetails as any).endedReason,
      
      // Additional metrics
      messageCount: callDetails.messages?.length || 0,
      duration: callDetails.endedAt && callDetails.startedAt 
        ? Math.round((new Date(callDetails.endedAt).getTime() - new Date(callDetails.startedAt).getTime()) / 1000)
        : null
    };

    return NextResponse.json(formattedCallDetails);
  } catch (error) {
    console.error('Error fetching call details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call details' },
      { status: 500 }
    );
  }
}
