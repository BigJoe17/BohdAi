import AuthForm from "@/components/AuthForm";
import React from "react";

// Force dynamic rendering for auth pages
export const dynamic = 'force-dynamic';

function page() {
  return <AuthForm type="sign-in" />;
}

export default page;
