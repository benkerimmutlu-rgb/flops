import Link from "next/link";
import { PhoneShell, Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <PhoneShell>
      <div className="screen" style={{ justifyContent: "center", gap: "var(--space-6)" }}>
        <Logo size={24} />
        <h1 className="title-md">Страница не найдена</h1>
        <p className="card__text body">Такого кластера или темы пока нет.</p>
        <div className="foot">
          <Link className="btn btn--block label" href="/">
            На карту знаний
          </Link>
        </div>
      </div>
    </PhoneShell>
  );
}
