/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserves M0's "the build doesn't gate on types" behaviour; errors still
  // show up in the editor. (next.config eslint options are gone in Next 16.)
  typescript: { ignoreBuildErrors: true },
  // The SPA used /signin and /signup; keep old links working.
  async redirects() {
    return [
      { source: "/signin", destination: "/sign-in", permanent: true },
      { source: "/signup", destination: "/sign-up", permanent: true },
    ];
  },
};

export default nextConfig;
