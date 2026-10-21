// 40 стандартных фраз на разных языках для раздела «Языки».
// Игрок видит фразу (родное написание + читаемая транслитерация) и угадывает,
// из какой это страны. При правильном ответе звучит перевод на русском (`ru`).
//
// Каждая фраза привязана к стране (`code` — есть флаг в /public/flags/<code>).
// lang — название языка по-русски (для подсказки в карточке).

export interface LanguagePhrase {
  code: string; // страна-ответ
  lang: string; // язык (рус.)
  native: string; // как пишется на самом языке
  translit: string; // читаемая транслитерация
  ru: string; // перевод на русский (его и озвучиваем при верном ответе)
}

export const LANGUAGE_PHRASES: LanguagePhrase[] = [
  { code: "fr", lang: "Французский", native: "Bonjour", translit: "Бонжур", ru: "Здравствуйте" },
  { code: "de", lang: "Немецкий", native: "Danke", translit: "Данке", ru: "Спасибо" },
  { code: "it", lang: "Итальянский", native: "Ciao", translit: "Чао", ru: "Привет" },
  { code: "es", lang: "Испанский", native: "Gracias", translit: "Грасиас", ru: "Спасибо" },
  { code: "gb", lang: "Английский", native: "Hello", translit: "Хэллоу", ru: "Привет" },
  { code: "pt", lang: "Португальский", native: "Olá", translit: "Ола", ru: "Привет" },
  { code: "nl", lang: "Нидерландский", native: "Dank je", translit: "Данк е", ru: "Спасибо" },
  { code: "pl", lang: "Польский", native: "Dziękuję", translit: "Дзенькуе", ru: "Спасибо" },
  { code: "se", lang: "Шведский", native: "Tack", translit: "Так", ru: "Спасибо" },
  { code: "fi", lang: "Финский", native: "Kiitos", translit: "Киитос", ru: "Спасибо" },
  { code: "gr", lang: "Греческий", native: "Ευχαριστώ", translit: "Эфхаристо", ru: "Спасибо" },
  { code: "tr", lang: "Турецкий", native: "Merhaba", translit: "Мерхаба", ru: "Привет" },
  { code: "jp", lang: "Японский", native: "こんにちは", translit: "Коннитива", ru: "Здравствуйте" },
  { code: "cn", lang: "Китайский", native: "你好", translit: "Нихао", ru: "Привет" },
  { code: "kr", lang: "Корейский", native: "안녕하세요", translit: "Аннёнхасэё", ru: "Здравствуйте" },
  { code: "in", lang: "Хинди", native: "नमस्ते", translit: "Намасте", ru: "Здравствуйте" },
  { code: "sa", lang: "Арабский", native: "شكرا", translit: "Шукран", ru: "Спасибо" },
  { code: "il", lang: "Иврит", native: "שלום", translit: "Шалом", ru: "Привет" },
  { code: "vn", lang: "Вьетнамский", native: "Xin chào", translit: "Син чао", ru: "Привет" },
  { code: "br", lang: "Португальский", native: "Obrigado", translit: "Обригаду", ru: "Спасибо" },
  { code: "ua", lang: "Украинский", native: "Дякую", translit: "Дякую", ru: "Спасибо" },
  { code: "ru", lang: "Русский", native: "Привет", translit: "Привет", ru: "Привет" },
  { code: "cz", lang: "Чешский", native: "Ahoj", translit: "Ахой", ru: "Привет" },
  { code: "sk", lang: "Словацкий", native: "Ďakujem", translit: "Дякуем", ru: "Спасибо" },
  { code: "hu", lang: "Венгерский", native: "Szia", translit: "Сиа", ru: "Привет" },
  { code: "ro", lang: "Румынский", native: "Mulțumesc", translit: "Мулцумеск", ru: "Спасибо" },
  { code: "dk", lang: "Датский", native: "Tak", translit: "Так", ru: "Спасибо" },
  { code: "no", lang: "Норвежский", native: "Takk", translit: "Так", ru: "Спасибо" },
  { code: "is", lang: "Исландский", native: "Takk", translit: "Так", ru: "Спасибо" },
  { code: "hr", lang: "Хорватский", native: "Hvala", translit: "Хвала", ru: "Спасибо" },
  { code: "rs", lang: "Сербский", native: "Здраво", translit: "Здраво", ru: "Привет" },
  { code: "bg", lang: "Болгарский", native: "Благодаря", translit: "Благодаря", ru: "Спасибо" },
  { code: "ge", lang: "Грузинский", native: "გამარჯობა", translit: "Гамарджоба", ru: "Здравствуйте" },
  { code: "am", lang: "Армянский", native: "Բարև", translit: "Барев", ru: "Привет" },
  { code: "th", lang: "Тайский", native: "สวัสดี", translit: "Саватди", ru: "Здравствуйте" },
  { code: "id", lang: "Индонезийский", native: "Terima kasih", translit: "Терима касих", ru: "Спасибо" },
  { code: "my", lang: "Малайский", native: "Terima kasih", translit: "Терима касих", ru: "Спасибо" },
  { code: "ph", lang: "Филиппинский", native: "Salamat", translit: "Саламат", ru: "Спасибо" },
  { code: "ke", lang: "Суахили", native: "Asante", translit: "Асанте", ru: "Спасибо" },
  { code: "za", lang: "Зулу", native: "Sawubona", translit: "Савубона", ru: "Здравствуйте" },
];
