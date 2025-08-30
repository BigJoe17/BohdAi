import Agent from "@/components/Agent";
import PageLayout from "@/components/PageLayout";

function InterviewPage() {
  return (
    <PageLayout showFooter={false}>
      <div className="fixed inset-0 z-50 pt-24">
        <Agent userName={"you"} userId={"123"} type="generate" />
      </div>
    </PageLayout>
  );
}

export default InterviewPage;
