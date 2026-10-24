// Контракт контента. UI рендерит строго по этим типам, поэтому добавление
// нового кластера/темы = добавление данных, без правок компонентов.

export type GlossaryItem = {
  term: string;
  definition: string;
};

// Доказательная база: источник/гайдлайн, на который опирается тема.
export type Reference = {
  source: string; // автор, год, название или гайдлайн
  note?: string; // чем полезен / что подтверждает
  url?: string; // ссылка, если есть
};

export type TopicPractice = {
  psychoeducation: string; // «Сказать клиенту»
  mistake: string; // «Частая ошибка»
  red_flags: string; // «Красные флаги»
};

export type Topic = {
  id: string;
  title: string;
  cards: string[]; // Быстрый старт — карточки микрообучения
  longread: string; // Теоретическая база
  practice: TopicPractice; // В кабинете
  glossary: GlossaryItem[];
  references?: Reference[]; // Доказательная база
  simulation?: CaseSim; // Кейс-симуляция (блок «В кабинете»)
};

export type TestOption = {
  text: string;
  isCorrect: boolean;
  feedback: string;
};

// Один выбор (по умолчанию).
export type SingleQuestion = {
  id: string;
  kind?: "single";
  question: string;
  options: TestOption[];
};

// Выбрать все верные.
export type MultiQuestion = {
  id: string;
  kind: "multi";
  question: string;
  options: TestOption[];
  feedback: string; // общий разбор после проверки
};

// Расставить шаги по порядку (items заданы в ПРАВИЛЬНОМ порядке).
export type OrderQuestion = {
  id: string;
  kind: "order";
  question: string;
  items: string[];
  feedback: string;
};

export type TestQuestion = SingleQuestion | MultiQuestion | OrderQuestion;

export type ClusterTest = {
  // Порог прохождения: минимум верных ответов. По умолчанию — все.
  passScore?: number;
  questions: TestQuestion[];
};

export type Avatar = {
  name: string;
  case: string;
};

export type Cluster = {
  id: string;
  title: string;
  description: string;
  disclaimer: string;
  avatar: Avatar;
  topics: Topic[];
  test: ClusterTest;
};

// Заготовка будущего кластера для хаба (без контента — только карточка).
export type ClusterStub = {
  id: string;
  title: string;
  description: string;
};

// Кейс-симуляция: ветвящийся диалог с «клиентом».
export type SimOptionQuality = "good" | "ok" | "poor";

export type SimOption = {
  text: string; // реплика терапевта
  quality: SimOptionQuality;
  feedback: string; // разбор выбора
  next: string | null; // id следующего узла или null — конец
};

export type SimNode = {
  id: string;
  client: string; // реплика клиента
  options: SimOption[];
};

export type CaseSim = {
  id: string;
  title: string;
  intro: string;
  start: string; // id стартового узла
  nodes: SimNode[];
  outro: string;
};

export type TopicStatus = "new" | "progress" | "done";

// Карточка интервального повторения (упрощённый SM-2).
export type SrsCard = {
  ease: number; // коэффициент лёгкости
  interval: number; // текущий интервал в днях
  due: number; // timestamp следующего показа
};

export type SrsGrade = "again" | "hard" | "good" | "easy";

// Прогресс пользователя — тот же формат в localStorage и в Supabase (JSONB).
export type ProgressData = {
  status: Record<string, TopicStatus>;
  testPassed: Record<string, boolean>;
  srs?: Record<string, SrsCard>; // ключ — термин глоссария
};
