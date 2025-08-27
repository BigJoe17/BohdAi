import Agent from "@/components/Agent";

function InterviewPage() {
  return (
    <>
      <h3>Interview Generation</h3>
      <Agent userName={"you"} userId={"123"} type="generate" />
    </>
  );
}

export default InterviewPage;
