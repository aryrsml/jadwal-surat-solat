// Static export: hasilnya folder `out/`, bisa di-host di mana saja.
// Untuk GitHub Pages, build dengan GITHUB_PAGES=true dan GITHUB_PAGES_REPO=nama-repo
// (workflow di .github/workflows sudah mengurus ini otomatis).
const isGhPages = process.env.GITHUB_PAGES === "true";
const repo = process.env.GITHUB_PAGES_REPO ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  ...(isGhPages && repo ? { basePath: `/${repo}`, assetPrefix: `/${repo}/` } : {}),
};

export default nextConfig;
