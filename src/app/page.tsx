import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Привет! Готов(а) путешествовать?
        </h1>
        <p className="max-w-prose text-stone-600">
          Учи флаги, столицы, языки и культуру разных стран — в формате
          викторины. Подходит и для детей, и для взрослых любителей
          путешествий.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/flags"
          className="group flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-4xl">🚩</span>
          <span className="text-xl font-bold text-stone-900">Учи Флаги</span>
          <span className="text-sm text-stone-500">
            Основной раздел. Карточки флагов вперемешку, викторина и
            интересные факты о каждой стране.
          </span>
          <span className="mt-auto text-sm font-semibold text-stone-900 group-hover:underline">
            Начать →
          </span>
        </Link>

        <Link
          href="/capitals"
          className="group flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-4xl">🏛️</span>
          <span className="text-xl font-bold text-stone-900">
            Учи Столицы
          </span>
          <span className="text-sm text-stone-500">
            Необязательный раздел: флаг и страна — а столицу надо вспомнить
            или выучить.
          </span>
          <span className="mt-auto text-sm font-semibold text-stone-900 group-hover:underline">
            Начать →
          </span>
        </Link>
      </div>

      <Link
        href="/categories"
        className="flex items-center justify-between rounded-2xl border border-dashed border-stone-300 px-5 py-4 text-sm font-medium text-stone-600 hover:border-stone-400 hover:text-stone-900"
      >
        <span>Разложить изученные флаги по категориям</span>
        <span>→</span>
      </Link>
    </div>
  );
}
