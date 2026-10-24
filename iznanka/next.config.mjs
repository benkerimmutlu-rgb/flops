/** @type {import('next').NextConfig} */
// Статический экспорт: приложение встраивается в портал VivaLearn как зона /iznanka.
const nextConfig = {
  output: "export",
  basePath: "/iznanka",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
