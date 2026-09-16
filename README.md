# Video Transcript Hub

Build a SaaS landing page + authenticated app shell for Video Speed Reader, a product that

turns any video into an accurate transcript, targeted at content creators, educators, and

engineers who record long-form video and need a fast, clean transcript to repurpose into

blog posts, course notes, or searchable archives.

The site must include:

1. A public landing page ('/') with:

   - Hero section: product name "Video Speed Reader" prominently displayed, value prop

     "上傳影片，三分鐘內拿到逐字稿。" (English subtitle: "Upload your video, get a clean

     transcript in three minutes."), and a primary CTA button labeled "Sign in / 登入" in the

     top-right header. The hero also has a large centered CTA button "免費開始使用 / Get

     started free" that routes to the sign-up page.

   - A "How it works" section with three numbered steps: (1) 上傳影片 Upload your video,

     (2) AI 自動轉寫 AI transcribes it automatically, (3) 下載逐字稿 Download or copy the

     transcript.

   - A features section with 3–4 cards, each with an icon, a short title and one line of body

     copy: 高準確度中英辨識, 三分鐘內完成, 一鍵匯出 TXT / SRT / Markdown, 隱私優先，處理完即刪除.

   - A simple pricing section with two tiers — Free (每月 30 分鐘影片) and Pro (NT$299 每月，

     無限影片) — each with a CTA button. The buttons only route to sign-up for now; no payment

     integration.

   - A footer with the product name, a copyright line, and placeholder links for 隱私政策 and

     服務條款.

2. Authentication using Lovable's built-in Supabase-style auth (use whatever auth backend

   Lovable provides by default — Lovable Cloud is fine for this v1; we'll swap to a

   user-owned Supabase project in a later step):

   - Sign Up page with email + password

   - Sign In page with email + password

   - Sign Out functionality

   - Email confirmation can be disabled for simplicity in this v1

3. An authenticated app shell at '/app' that the user lands on after signing in:

   - '/app' must be a protected route: signed-out visitors are redirected to the sign-in page,

     and signed-in users who hit '/' or the auth pages are redirected to '/app'.

   - A top bar showing the product name, the signed-in user's email, and a "Sign out / 登出"

     button.

   - A placeholder dashboard body: a welcome heading ("嗨，{email}"), an empty-state card that

     says 還沒有任何影片 with a disabled "上傳影片 / Upload video" button marked "Coming soon",

     and a placeholder list/table area where past transcripts will eventually appear.

   - Keep the shell's layout ready for a sidebar later, but a single-column layout is fine for v1.

Design requirements:

- Modern, professional dark theme (purple/violet accent on a near-black background)

- Use Inter or a similar sans-serif font

- Mobile responsive

- Tasteful subtle animations (fade-in on scroll is fine; don't overdo it)

Out of scope for this v1: video upload widget, transcript display, payment, custom database

tables (do NOT create a 'profiles' or 'videos' table — only use Supabase's default

'auth.users'). Those come in later milestones. Stick to landing page + auth + placeholder

dashboard.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/417eb319-c6c8-449d-ac39-a4dd02b56ebe).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
