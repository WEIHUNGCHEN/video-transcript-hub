import type { Metadata } from "next";

import SignUpForm from "@/components/SignUpForm";

export const metadata: Metadata = {
  title: "免費註冊 / Sign up — Video Speed Reader",
  description: "Create a free Video Speed Reader account and get clean transcripts in minutes.",
};

export default function Page() {
  return <SignUpForm />;
}
