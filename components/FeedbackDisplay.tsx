"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, ThumbsUp, ThumbsDown, TrendingUp, Brain, 
  Target, MessageSquare, BookOpen, CheckCircle,
  AlertCircle, Lightbulb, ArrowRight
} from 'lucide-react';
import { feedbackService, InterviewFeedback } from '@/services/feedback/feedback.service';
import { useI18n } from '@/components/I18nProvider';

interface FeedbackDisplayProps {
  interviewId: string;
  userId: string;
  callData?: any;
}

export default function FeedbackDisplay({ interviewId, userId, callData }: FeedbackDisplayProps) {
  const { t } = useI18n();
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [userFeedbackSubmitted, setUserFeedbackSubmitted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComments, setUserComments] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, [interviewId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      let existingFeedback = await feedbackService.getFeedbackByInterview(interviewId);
      
      if (!existingFeedback && callData) {
        // Generate AI feedback from call data
        const transcript = callData.messages || [];
        const interviewType = determineInterviewType(callData);
        
        const aiAnalysis = await feedbackService.generateAIFeedback(transcript, interviewType);
        
        const feedbackData = {
          userId,
          interviewId,
          callId: callData.id,
          interviewType: interviewType as any,
          overallScore: aiAnalysis.scores.overall,
          communicationScore: aiAnalysis.scores.communication,
          technicalScore: aiAnalysis.scores.technical,
          problemSolvingScore: aiAnalysis.scores.problemSolving,
          confidenceScore: aiAnalysis.scores.confidence,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses,
          suggestions: aiAnalysis.suggestions,
          nextSteps: aiAnalysis.nextSteps,
          responseTime: calculateAverageResponseTime(transcript),
          completionRate: 100, // Assume completed if we have data
          duration: callData.duration || 30,
          aiSummary: aiAnalysis.aiSummary,
          personalizedPlan: aiAnalysis.personalizedPlan,
        };

        const feedbackId = await feedbackService.createFeedback(feedbackData);
        existingFeedback = await feedbackService.getFeedback(feedbackId);
      }
      
      setFeedback(existingFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineInterviewType = (callData: any): string => {
    // Logic to determine interview type from call data
    const content = JSON.stringify(callData).toLowerCase();
    if (content.includes('algorithm') || content.includes('coding')) return 'dsa';
    if (content.includes('system') || content.includes('design')) return 'system-design';
    if (content.includes('behavior') || content.includes('experience')) return 'behavioral';
    return 'technical';
  };

  const calculateAverageResponseTime = (transcript: any[]): number => {
    // Simplified calculation - you can enhance this
    return Math.random() * 10 + 5; // 5-15 seconds average
  };

  const submitUserFeedback = async () => {
    try {
      await feedbackService.submitUserFeedback({
        userId,
        interviewId,
        rating: userRating,
        comments: userComments,
        difficulty: 'medium', // You can make this selectable
        wouldRecommend: userRating >= 4,
        improvementAreas: [], // You can make this selectable
      });
      setUserFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-dark-200 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-dark-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-40 bg-dark-200 rounded-lg"></div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <Card className="bg-dark-200 border-gray-600">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">{t('feedback.title')} not available yet.</p>
            <p className="text-gray-500 text-sm mt-2">Complete the interview to receive detailed feedback.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 80) return 'bg-yellow-600';
    if (score >= 70) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('feedback.title')}</h1>
        <Badge className={`${getScoreBadgeColor(feedback.overallScore)} text-white`}>
          {t('feedback.overallScore')}: {feedback.overallScore}%
        </Badge>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-dark-200 border-gray-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Communication</p>
                <p className={`text-2xl font-bold ${getScoreColor(feedback.communicationScore)}`}>
                  {feedback.communicationScore}%
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-gray-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Technical</p>
                <p className={`text-2xl font-bold ${getScoreColor(feedback.technicalScore)}`}>
                  {feedback.technicalScore}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-gray-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Problem Solving</p>
                <p className={`text-2xl font-bold ${getScoreColor(feedback.problemSolvingScore)}`}>
                  {feedback.problemSolvingScore}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-gray-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Confidence</p>
                <p className={`text-2xl font-bold ${getScoreColor(feedback.confidenceScore)}`}>
                  {feedback.confidenceScore}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      <Card className="bg-dark-200 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed">{feedback.aiSummary}</p>
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-dark-200 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-400" />
              {t('feedback.strengths')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{strength}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              {t('feedback.improvements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{weakness}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions and Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-dark-200 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              {t('feedback.suggestions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-400" />
              {t('feedback.nextSteps')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Improvement Plan */}
      <Card className="bg-dark-200 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Personalized Improvement Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.personalizedPlan.map((plan, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-dark-100 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-300">{plan}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Feedback Section */}
      {!userFeedbackSubmitted && (
        <Card className="bg-dark-200 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">How was your experience?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-400 mb-3">Rate this interview session:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setUserRating(rating)}
                    className={`p-2 rounded-lg transition-colors ${
                      userRating >= rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'
                    }`}
                  >
                    <Star className="w-6 h-6" fill={userRating >= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 mb-2">Additional comments (optional):</p>
              <textarea
                value={userComments}
                onChange={(e) => setUserComments(e.target.value)}
                className="w-full p-3 bg-dark-100 border border-gray-600 rounded-lg text-white placeholder-gray-500 resize-none"
                rows={3}
                placeholder="Share your thoughts about this interview experience..."
              />
            </div>

            <Button 
              onClick={submitUserFeedback} 
              className="bg-primary-600 hover:bg-primary-700"
              disabled={userRating === 0}
            >
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {userFeedbackSubmitted && (
        <Card className="bg-green-900/20 border-green-600">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">Thank you for your feedback!</p>
                <p className="text-gray-300 text-sm">Your input helps us improve the interview experience.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
