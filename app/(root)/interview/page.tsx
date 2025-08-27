import Agent from "@/components/Agent";

function InterviewPage() {
  return (
    <div className="fixed inset-0 z-50">
      <Agent userName={"you"} userId={"123"} type="generate" />
    </div>
  );
}

export default InterviewPage;
