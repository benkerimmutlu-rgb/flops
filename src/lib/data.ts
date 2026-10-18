import { Country, CountryLite, ContinentId } from "./types";
import { COUNTRIES_EXTRA } from "./countries-lite";

export const COUNTRIES: Country[] = [
  {
    code: "it",
    name: "Италия",
    continent: "europe",
    capital: "Рим",
    flagMeaning:
      "Зелёный цвет символизирует луга и холмы страны, белый — снежные вершины Альп, а красный — кровь, пролитую за независимость.",
    dish: {
      name: "Пицца «Маргарита»",
      recipeShort:
        "Тонко раскатанное тесто смазывается густым томатным соусом, сверху выкладываются ломтики свежего сыра моцарелла и листики базилика. Запекается в жаркой дровяной печи до хруста.",
    },
    culturalFigure: {
      name: "Леонардо да Винчи",
      fact: "Он не только написал самую знаменитую картину в мире («Мона Лиза»), но и за сотни лет до их реального изобретения нарисовал чертежи парашюта, танка и вертолёта.",
    },
    language: {
      name: "Итальянский",
      phrases: [
        { id: "hello", label: "Привет", native: "Ciao", translit: "Чао" },
        { id: "thanks", label: "Спасибо", native: "Grazie", translit: "Грацие" },
        { id: "bye", label: "Пока", native: "Arrivederci", translit: "Арриведерчи" },
      ],
    },
    myth: {
      myth: "Итальянцы каждый день едят только пиццу и макароны.",
      reality:
        "В Италии потрясающе готовят мясо и морепродукты, а на севере страны главным блюдом считается ризотто (блюдо из риса) и полента (каша из кукурузной муки).",
    },
    quizCropZones: [
      { id: "green", label: "Зелёная полоса", x: 0, y: 0, w: 33.3, h: 100 },
      { id: "white", label: "Белая полоса", x: 33.3, y: 0, w: 33.4, h: 100 },
      { id: "red", label: "Красная полоса", x: 66.7, y: 0, w: 33.3, h: 100 },
    ],
  },
  {
    code: "gb",
    name: "Великобритания",
    continent: "europe",
    capital: "Лондон",
    flagMeaning:
      "Флаг называется «Юнион Джек». Это наложение друг на друга трёх крестов: покровителя Англии (красный крест на белом), Шотландии (белый диагональный крест на синем) и Ирландии (красный диагональный на белом).",
    dish: {
      name: "Фиш-энд-чипс (Fish and Chips)",
      recipeShort:
        "Филе свежей белой рыбы окунают в густой кляр и жарят в кипящем масле до золотистой корочки. Подаётся с толстыми ломтиками жареной картошки и зелёным гороховым пюре.",
    },
    culturalFigure: {
      name: "Исаак Ньютон",
      fact: "Однажды он сидел в саду, и, по легенде, ему на голову упало яблоко. Это помогло ему открыть закон всемирного тяготения и объяснить, почему люди не падают с круглой Земли.",
    },
    language: {
      name: "Английский",
      phrases: [
        { id: "hello", label: "Привет", native: "Hello", translit: "Хэллоу" },
        { id: "thanks", label: "Спасибо", native: "Thank you", translit: "Сэнк ю" },
        { id: "bye", label: "Пока", native: "Goodbye", translit: "Гудбай" },
      ],
    },
    myth: {
      myth: "В Лондоне всегда идут дожди и висит густой туман.",
      reality:
        "В Лондоне за год выпадает меньше осадков, чем в Риме или Сиднее. Погода просто очень быстро меняется из-за близости океана.",
    },
    quizCropZones: [
      { id: "blue", label: "Тёмно-синий фон", x: 0, y: 0, w: 42, h: 36 },
      { id: "white_cross", label: "Белый крест", x: 40, y: 0, w: 20, h: 100 },
      { id: "red_cross", label: "Красный крест", x: 44, y: 0, w: 12, h: 100 },
    ],
  },
  {
    code: "se",
    name: "Швеция",
    continent: "europe",
    capital: "Стокгольм",
    flagMeaning:
      "Жёлтый скандинавский крест на синем фоне. Это цвета исторического герба Швеции — трёх золотых корон на синем щите. Края креста смещены влево, как и у всех скандинавских стран.",
    dish: {
      name: "Чёттбуллар (Köttbullar) — шведские фрикадельки",
      recipeShort:
        "Маленькие мясные шарики обжариваются в масле. Главный секрет — их едят с картофельным пюре, густым сливочным соусом и сладковато-кислым вареньем из лесной брусники.",
    },
    culturalFigure: {
      name: "Астрид Линдгрен",
      fact: "Эта писательница придумала Карлсона и Пеппи Длинныйчулок. Она показала всему миру, что дети имеют право шалить, быть собой и что к ним нужно относиться с таким же уважением, как ко взрослым.",
    },
    language: {
      name: "Шведский",
      phrases: [
        { id: "hello", label: "Привет", native: "Hej", translit: "Хей" },
        { id: "thanks", label: "Спасибо", native: "Tack", translit: "Так" },
        { id: "bye", label: "Пока", native: "Hejdå", translit: "Хейдо" },
      ],
    },
    myth: {
      myth: "В Швеции по улицам ходят белые медведи.",
      reality:
        "Белых медведей в Швеции нет в дикой природе (они живут гораздо севернее). Зато в шведских лесах можно встретить очень много огромных лосей.",
    },
    quizCropZones: [
      { id: "cross_v", label: "Жёлтый крест (вертикаль)", x: 31.25, y: 0, w: 12.5, h: 100 },
      { id: "cross_h", label: "Жёлтый крест (горизонталь)", x: 0, y: 40, w: 100, h: 20 },
      { id: "blue", label: "Синий фон", x: 0, y: 0, w: 31, h: 40 },
    ],
  },
  {
    code: "es",
    name: "Испания",
    continent: "europe",
    capital: "Мадрид",
    flagMeaning:
      "Три горизонтальные полосы — красная, жёлтая, красная. По легенде, король Арагона провёл окровавленными пальцами по золотому щиту. Цвета символизируют корриду (красный) и песок арены (жёлтый).",
    dish: {
      name: "Паэлья (Paella)",
      recipeShort:
        "Блюдо готовится на огромной плоской сковороде. В специальный рис добавляют шафран (он делает рис жёлтым), оливковое масло, свежие морепродукты, курицу и овощи.",
    },
    culturalFigure: {
      name: "Антонио Гауди",
      fact: "Великий архитектор, который не любил прямые линии, потому что их нет в природе. Он строил дома, похожие на пряничные избушки, скалы или кости дракона (например, Храм Святого Семейства в Барселоне).",
    },
    language: {
      name: "Испанский",
      phrases: [
        { id: "hello", label: "Привет", native: "Hola", translit: "Ола" },
        { id: "thanks", label: "Спасибо", native: "Gracias", translit: "Грасиас" },
        { id: "bye", label: "Пока", native: "Adiós", translit: "Адьос" },
      ],
    },
    myth: {
      myth: "Все испанцы днём спят (у них сиеста), и ничего не работает.",
      reality:
        "В крупных городах большинство современных офисов и компаний работают по стандартному графику без дневного сна, хотя маленькие магазинчики на юге могут закрываться в жару.",
    },
    quizCropZones: [
      { id: "red_top", label: "Красная полоса (верх)", x: 0, y: 0, w: 100, h: 25 },
      { id: "yellow", label: "Жёлтая полоса", x: 0, y: 25, w: 100, h: 50 },
      { id: "red_bottom", label: "Красная полоса (низ)", x: 0, y: 75, w: 100, h: 25 },
    ],
  },
  {
    code: "fr",
    name: "Франция",
    continent: "europe",
    capital: "Париж",
    flagMeaning:
      "Синий и красный — традиционные цвета Парижа, белый — цвет монархии. Вместе, со времён Французской революции, они символизируют свободу, равенство и братство.",
    dish: {
      name: "Круассан",
      recipeShort:
        "Слоёное тесто много раз складывают вместе с маслом, затем раскатывают, сворачивают полумесяцем и выпекают до хрустящей золотистой корочки.",
    },
    culturalFigure: {
      name: "Мария Кюри",
      fact: "Она открыла два новых химических элемента (полоний и радий) и стала первым человеком, получившим Нобелевскую премию дважды — в физике и в химии.",
    },
    language: {
      name: "Французский",
      phrases: [
        { id: "hello", label: "Привет", native: "Bonjour", translit: "Бонжур" },
        { id: "thanks", label: "Спасибо", native: "Merci", translit: "Мерси" },
        { id: "bye", label: "Пока", native: "Au revoir", translit: "О ревуар" },
      ],
    },
    myth: {
      myth: "Французы грубые и свысока смотрят на туристов.",
      reality:
        "Во Франции очень ценят вежливость: если зайти в магазин или кафе и первым сказать «Bonjour», отношение сразу становится гораздо теплее.",
    },
    quizCropZones: [
      { id: "blue", label: "Синяя полоса", x: 0, y: 0, w: 33.3, h: 100 },
      { id: "white", label: "Белая полоса", x: 33.3, y: 0, w: 33.4, h: 100 },
      { id: "red", label: "Красная полоса", x: 66.7, y: 0, w: 33.3, h: 100 },
    ],
  },
  {
    code: "de",
    name: "Германия",
    continent: "europe",
    capital: "Берлин",
    flagMeaning:
      "Чёрный, красный и золотой — цвета немецкого движения за единство и свободу XIX века, позже ставшие цветами демократической Германии.",
    dish: {
      name: "Крендель (Brezel)",
      recipeShort:
        "Тесто скручивают в форме узла и перед выпечкой на несколько секунд опускают в содовый раствор — именно это даёт крендельку блестящую тёмную корочку и особый вкус.",
    },
    culturalFigure: {
      name: "Альберт Эйнштейн",
      fact: "Он создал теорию относительности и знаменитую формулу E=mc², полностью изменив то, как учёные понимают пространство, время и энергию.",
    },
    language: {
      name: "Немецкий",
      phrases: [
        { id: "hello", label: "Привет", native: "Hallo", translit: "Хало" },
        { id: "thanks", label: "Спасибо", native: "Danke", translit: "Данке" },
        { id: "bye", label: "Пока", native: "Tschüss", translit: "Чюс" },
      ],
    },
    myth: {
      myth: "Немцы никогда не опаздывают и совсем не умеют веселиться.",
      reality:
        "Пунктуальность на встречах и правда ценится, но вне работы немцы с удовольствием отдыхают на пивных фестивалях и любят долгие посиделки с друзьями.",
    },
    quizCropZones: [
      { id: "black", label: "Чёрная полоса", x: 0, y: 0, w: 100, h: 33.3 },
      { id: "red", label: "Красная полоса", x: 0, y: 33.3, w: 100, h: 33.4 },
      { id: "gold", label: "Золотая полоса", x: 0, y: 66.7, w: 100, h: 33.3 },
    ],
  },
  {
    code: "tr",
    name: "Турция",
    continent: "asia",
    capital: "Анкара",
    flagMeaning:
      "Красный фон — традиционный цвет со времён Османской империи. Полумесяц и звезда — классические тюркские и исламские символы надежды и доброго пути.",
    dish: {
      name: "Kahvaltı (турецкий завтрак)",
      recipeShort:
        "Большой стол накрывают сразу всем: сыром, оливками, мёдом, яйцами и свежим хлебом. Турки завтракают не спеша — это может растянуться на целый час.",
    },
    culturalFigure: {
      name: "Мимар Синан",
      fact: "Главный архитектор Османской империи построил сотни мечетей и мостов. Некоторые его постройки простояли уже почти 500 лет и до сих пор выдерживают землетрясения.",
    },
    language: {
      name: "Турецкий",
      phrases: [
        { id: "hello", label: "Привет", native: "Merhaba", translit: "Мерхаба" },
        { id: "thanks", label: "Спасибо", native: "Teşekkürler", translit: "Тешеккюрлер" },
        { id: "bye", label: "Пока", native: "Hoşça kal", translit: "Хошча кал" },
      ],
    },
    myth: {
      myth: "В Турции всегда очень жарко и кругом пустыня.",
      reality:
        "Климат в Турции очень разный: на побережье тепло почти круглый год, а в горах Анатолии зимой выпадает снег и бывает по-настоящему холодно.",
    },
    quizCropZones: [
      { id: "red", label: "Красный фон", x: 0, y: 0, w: 100, h: 100 },
      { id: "crescent", label: "Полумесяц", x: 20, y: 20, w: 30, h: 60 },
      { id: "star", label: "Звезда", x: 45, y: 25, w: 20, h: 50 },
    ],
  },
  {
    code: "jp",
    name: "Япония",
    continent: "asia",
    capital: "Токио",
    flagMeaning:
      "Красный круг символизирует солнце — недаром Японию называют «страной восходящего солнца».",
    dish: {
      name: "Онигири",
      recipeShort:
        "Варёный рис лепят руками в форме треугольника, внутрь кладут начинку (например, рыбу или маринованную сливу), а снаружи оборачивают листом водорослей нори.",
    },
    culturalFigure: {
      name: "Хаяо Миядзаки",
      fact: "Режиссёр придумал множество добрых мультфильмов, которые смотрят дети по всему миру — например, «Мой сосед Тоторо» и «Унесённые призраками».",
    },
    language: {
      name: "Японский",
      phrases: [
        { id: "hello", label: "Привет", native: "こんにちは", translit: "Коннитива" },
        { id: "thanks", label: "Спасибо", native: "ありがとう", translit: "Аригато:" },
        { id: "bye", label: "Пока", native: "さようなら", translit: "Саёнара" },
      ],
    },
    myth: {
      myth: "В Японии все едят суши каждый день.",
      reality:
        "Дома японцы чаще готовят рис, суп мисо и рыбу на гриле — суши чаще едят по особым случаям или в ресторане, а не каждый день.",
    },
    quizCropZones: [
      { id: "white", label: "Белый фон", x: 0, y: 0, w: 100, h: 100 },
      { id: "circle", label: "Красный круг (солнце)", x: 30, y: 15, w: 40, h: 70 },
    ],
  },
  {
    code: "ng",
    name: "Нигерия",
    continent: "africa",
    capital: "Абуджа",
    flagMeaning:
      "Зелёный цвет символизирует природные богатства и сельское хозяйство страны, белый в середине — мир и единство.",
    dish: {
      name: "Джоллоф-рис",
      recipeShort:
        "Рис тушится в густом соусе из помидоров, перца и лука со специями. По всей Западной Африке до сих пор спорят, в какой стране джоллоф готовят вкуснее.",
    },
    culturalFigure: {
      name: "Чимаманда Нгози Адичи",
      fact: "Писательница, чьи книги и выступления помогли миллионам людей по всему миру иначе взглянуть на истории Африки и её культур.",
    },
    language: {
      name: "Йоруба",
      phrases: [
        { id: "hello", label: "Привет", native: "Bawo", translit: "Баво" },
        { id: "thanks", label: "Спасибо", native: "E se", translit: "Э шэ" },
        { id: "bye", label: "Пока", native: "O dabo", translit: "О дабо" },
      ],
    },
    myth: {
      myth: "В Африке везде пустыня, а по улицам городов бродят дикие животные.",
      reality:
        "Лагос, крупнейший город Нигерии, — это огромный современный мегаполис с небоскрёбами и одним из самых больших рынков в мире, совсем не похожий на саванну.",
    },
    quizCropZones: [
      { id: "green_left", label: "Зелёная полоса (слева)", x: 0, y: 0, w: 33.3, h: 100 },
      { id: "white", label: "Белая полоса", x: 33.3, y: 0, w: 33.4, h: 100 },
      { id: "green_right", label: "Зелёная полоса (справа)", x: 66.7, y: 0, w: 33.3, h: 100 },
    ],
  },
  {
    code: "ca",
    name: "Канада",
    continent: "north_america",
    capital: "Оттава",
    flagMeaning:
      "Красный и белый — официальные цвета Канады. Кленовый лист растёт по всей стране и символизирует единство всех её жителей.",
    dish: {
      name: "Поутин (Poutine)",
      recipeShort:
        "Картофель фри поливают горячей густой подливкой и посыпают кусочками сыра, который слегка подтаивает от тепла.",
    },
    culturalFigure: {
      name: "Александр Грэм Белл",
      fact: "Жил и работал в Канаде, где изобрёл телефон — устройство, которое навсегда изменило то, как люди по всему миру общаются друг с другом.",
    },
    language: {
      name: "Французский (Квебек)",
      phrases: [
        { id: "hello", label: "Привет", native: "Allô", translit: "Алло" },
        { id: "thanks", label: "Спасибо", native: "Merci beaucoup", translit: "Мерси боку" },
        { id: "bye", label: "Пока", native: "À bientôt", translit: "А бьенто" },
      ],
    },
    myth: {
      myth: "В Канаде круглый год лежит снег и очень холодно.",
      reality:
        "Летом во многих канадских городах, например в Торонто, бывает настоящая жара — больше +30°C, совсем как на юге.",
    },
    quizCropZones: [
      { id: "red_left", label: "Красная полоса (слева)", x: 0, y: 0, w: 25, h: 100 },
      { id: "leaf", label: "Кленовый лист", x: 35, y: 10, w: 30, h: 80 },
      { id: "red_right", label: "Красная полоса (справа)", x: 75, y: 0, w: 25, h: 100 },
    ],
  },
  {
    code: "br",
    name: "Бразилия",
    continent: "south_america",
    capital: "Бразилиа",
    flagMeaning:
      "Зелёный — леса страны, жёлтый ромб — её богатства, синий круг с белой лентой — небо над Рио-де-Жанейро и девиз «Порядок и прогресс».",
    dish: {
      name: "Фейжоада",
      recipeShort:
        "Чёрную фасоль тушат много часов с разными видами мяса, подают с рисом, дольками апельсина и обжаренной капустой.",
    },
    culturalFigure: {
      name: "Пеле",
      fact: "Величайший футболист XX века вдохновил миллионы детей по всему миру начать играть в футбол и показал, что мечты из самых бедных кварталов могут сбываться.",
    },
    language: {
      name: "Португальский",
      phrases: [
        { id: "hello", label: "Привет", native: "Oi", translit: "Ой" },
        { id: "thanks", label: "Спасибо", native: "Obrigado", translit: "Обригаду" },
        { id: "bye", label: "Пока", native: "Tchau", translit: "Чау" },
      ],
    },
    myth: {
      myth: "В Бразилии все только и делают, что танцуют самбу и играют в футбол на пляже.",
      reality:
        "Бразилия — огромная страна с множеством разных культур: от мегаполисов вроде Сан-Паулу до джунглей Амазонии, и у каждого региона свои музыка и традиции.",
    },
    quizCropZones: [
      { id: "green", label: "Зелёный фон", x: 0, y: 0, w: 100, h: 100 },
      { id: "diamond", label: "Жёлтый ромб", x: 10, y: 10, w: 80, h: 80 },
      { id: "circle", label: "Синий круг", x: 35, y: 30, w: 30, h: 40 },
    ],
  },
  {
    code: "fi",
    name: "Финляндия",
    continent: "europe",
    capital: "Хельсинки",
    flagMeaning: "Белый фон символизирует снега Финляндии, а синий крест — её бесчисленные озёра и небо.",
    dish: {
      name: "Корвапуусти",
      recipeShort:
        "Сдобное тесто раскатывают, посыпают корицей и сахаром, закручивают и защипывают так, что булочка по форме напоминает маленькое ушко.",
    },
    culturalFigure: {
      name: "Туве Янссон",
      fact: "Придумала муми-троллей — добрых и забавных существ, истории о которых помогают детям во всём мире говорить о дружбе и принятии непохожих на себя.",
    },
    language: {
      name: "Финский",
      phrases: [
        { id: "hello", label: "Привет", native: "Hei", translit: "Хей" },
        { id: "thanks", label: "Спасибо", native: "Kiitos", translit: "Киитос" },
        { id: "bye", label: "Пока", native: "Näkemiin", translit: "Некемиин" },
      ],
    },
    myth: {
      myth: "В Финляндии полгода вообще нет солнца и всегда темно.",
      reality:
        "Так происходит только на самом севере страны, за полярным кругом. В остальной Финляндии смена сезонов обычная, просто зима длиннее и снежнее, чем на юге Европы.",
    },
    quizCropZones: [
      { id: "cross_v", label: "Синий крест (вертикаль)", x: 31.25, y: 0, w: 12.5, h: 100 },
      { id: "cross_h", label: "Синий крест (горизонталь)", x: 0, y: 40, w: 100, h: 20 },
      { id: "white", label: "Белый фон", x: 0, y: 0, w: 31, h: 40 },
    ],
  },
];

export function countryByCode(code: string) {
  return COUNTRIES.find((c) => c.code === code);
}

export function randomCountry(excludeCode?: string): Country {
  const pool = excludeCode
    ? COUNTRIES.filter((c) => c.code !== excludeCode)
    : COUNTRIES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Flag palette/look-alike tags for the 12 fully-detailed countries, kept here
// so the Country records above stay focused on learning content. Merged into
// their CountryLite projection for the distractor picker.
const FULL_FLAG_META: Record<string, Pick<CountryLite, "flagTags" | "lookalikes">> = {
  it: { flagTags: ["green", "white", "red", "tricolor-v"], lookalikes: ["mx", "ie"] },
  gb: { flagTags: ["red", "white", "blue", "union-jack", "cross"] },
  se: { flagTags: ["blue", "yellow", "nordic-cross"], lookalikes: ["fi"] },
  es: { flagTags: ["red", "yellow", "stripes", "coat-of-arms"] },
  fr: { flagTags: ["blue", "white", "red", "tricolor-v"], lookalikes: ["nl", "ru"] },
  de: { flagTags: ["black", "red", "yellow", "tricolor-h"] },
  tr: { flagTags: ["red", "white", "crescent", "star"], lookalikes: ["tn"] },
  jp: { flagTags: ["white", "red", "circle"], lookalikes: ["bd"] },
  ng: { flagTags: ["green", "white", "tricolor-v"] },
  ca: { flagTags: ["red", "white", "leaf"] },
  br: { flagTags: ["green", "yellow", "blue", "circle", "stars"] },
  fi: { flagTags: ["white", "blue", "nordic-cross"], lookalikes: ["se"] },
};

// The 12 detailed countries projected down to CountryLite (+ their tags).
const FULL_AS_LITE: CountryLite[] = COUNTRIES.map((c) => ({
  code: c.code,
  name: c.name,
  continent: c.continent,
  ...FULL_FLAG_META[c.code],
}));

/** Every country the games can use: 12 detailed + the lite list, deduped. */
export const ALL_LITE: CountryLite[] = (() => {
  const seen = new Set(FULL_AS_LITE.map((c) => c.code));
  return [...FULL_AS_LITE, ...COUNTRIES_EXTRA.filter((c) => !seen.has(c.code))];
})();

const LITE_BY_CODE: Record<string, CountryLite> = Object.fromEntries(
  ALL_LITE.map((c) => [c.code, c])
);

export function liteByCode(code: string): CountryLite | undefined {
  return LITE_BY_CODE[code];
}

/** Game continent filter — "america" merges North + South. */
export type GameContinent = "europe" | "asia" | "africa" | "america" | "all";

function matchesContinent(c: CountryLite, filter: GameContinent): boolean {
  if (filter === "all") return true;
  if (filter === "america")
    return c.continent === "north_america" || c.continent === "south_america";
  return c.continent === filter;
}

/** Shuffle (Fisher–Yates) — impure, call after mount / on user action only. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick up to `count` random countries from a continent filter. */
export function pickCountries(count: number, filter: GameContinent): CountryLite[] {
  const pool = ALL_LITE.filter((c) => matchesContinent(c, filter));
  return shuffle(pool).slice(0, count);
}

/** How many countries are available per game-continent (for setup UI). */
export function countByContinent(filter: GameContinent): number {
  return ALL_LITE.filter((c) => matchesContinent(c, filter)).length;
}

export const ALL_CONTINENT_IDS: ContinentId[] = [
  "europe",
  "asia",
  "africa",
  "north_america",
  "south_america",
  "oceania",
];
