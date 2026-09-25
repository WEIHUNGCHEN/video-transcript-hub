import type { Metadata } from "next";

import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = {
  title: "Sign in / 登入 — Video Speed Reader",
  description: "Sign in to Video Speed Reader and turn your videos into clean transcripts.",
};

export default function Page() {
  return <SignInForm />;
}
