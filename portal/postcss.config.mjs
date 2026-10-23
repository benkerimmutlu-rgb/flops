// Портал использует обычный CSS (site.css), без Tailwind. Свой постcss-конфиг
// нужен, чтобы при изолированной сборке на Vercel Next не подхватывал
// родительский app/postcss.config.mjs с @tailwindcss/postcss.
const config = { plugins: {} };
export default config;
