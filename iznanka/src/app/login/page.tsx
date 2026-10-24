import { redirect } from "next/navigation";

// Вход вынесен в экран профиля.
export default function LoginRedirect() {
  redirect("/profile");
}
