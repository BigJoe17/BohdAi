"use client"
import AuthForm from "@/components/AuthForm";
import React from "react";

export const dynamic = 'force-dynamic';
export default function page() {
  return <AuthForm type="sign-up" />;
}


