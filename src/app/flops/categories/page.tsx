import { redirect } from "next/navigation";

// «Мои страны» слились с «Миром» в единый раздел «Мой мир» (/world).
// Старые ссылки (/categories, /know) ведут туда же.
export default function CategoriesRedirect() {
  redirect("/flops/world");
}
