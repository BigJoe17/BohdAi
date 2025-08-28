import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Mic } from "lucide-react";

const HomePage = () => {
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col items-center gap-6 max-w-lg ">
          <h2>Get Interview Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice on real Interview questions & get instant feedback. 
            Voice interviews now include DSA coding questions with text chat support!
          </p>
          <Button asChild className="btn-primary">
            <Link href={"/interview"} className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Start AI Interview
            </Link>
          </Button>
        </div>
        <Image
          src={"/robot.png"}
          width={400}
          height={400}
          alt="robot"
          className="max-sm:hidden"
        />
      </section>

      {/* interview cards */}

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {dummyInterviews?.map((interview) => (
            <InterviewCard key={interview.id} {...interview} />
          ))}
          {/* <p>{`You haven't taken any Interviews yet`}</p> */}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-white">Interview Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-border">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 blue-gradient rounded-lg flex items-center justify-center">
                  <Mic className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Voice Interview</h3>
                  <p className="text-light-100 text-sm">Natural conversation with AI</p>
                </div>
              </div>
              <p className="text-light-100 mb-4">
                Practice with our AI interviewer using natural voice conversations. Perfect for behavioral and technical discussions.
              </p>
              <ul className="text-sm text-light-100 space-y-1">
                <li>• Real-time voice interaction</li>
                <li>• Behavioral & technical questions</li>
                <li>• Instant transcript & feedback</li>
              </ul>
            </div>
          </div>

          <div className="card-border">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">DSA Chat Support</h3>
                  <p className="text-light-100 text-sm">Code & algorithm questions</p>
                </div>
              </div>
              <p className="text-light-100 mb-4">
                When DSA questions come up during voice interviews, a chat window automatically appears for coding solutions.
              </p>
              <ul className="text-sm text-light-100 space-y-1">
                <li>• Auto-detects coding questions</li>
                <li>• Text input for code solutions</li>
                <li>• Real-time analysis & feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
