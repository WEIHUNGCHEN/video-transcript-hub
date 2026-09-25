import type { Metadata } from "next";

import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Video Speed Reader — 影片轉逐字稿，三分鐘完成",
  description:
    "Upload your video and get a clean, accurate transcript in three minutes. Export to TXT, SRT, or Markdown.",
};

export default function Page() {
  return <LandingPage />;
}
