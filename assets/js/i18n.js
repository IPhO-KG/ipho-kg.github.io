/*
 * NPhO — переводы интерфейса: кыргызский (ky), русский (ru), английский (en).
 * Русский — основной язык: контент из редактора (/admin/) хранится на русском.
 * Переводы контента (CONTENT) применяются только к тем полям, которые совпадают
 * с исходным русским текстом; если редактор изменил текст, показывается его версия.
 *
 * Язык выбирается так: ?lang=ky|ru|en в адресе → сохранённый выбор → русский.
 */
(function(){
  const LANGS = ['ky','ru','en'];
  const DEFAULT_LANG = 'ru';
  const STORAGE_KEY = 'npho-lang';

  const UI = {
    ru: {
      'lang.label':'Язык',
      'nav.home':'Главная','nav.problems':'Банк задач','nav.results':'Результаты','nav.about':'Об олимпиаде',
      'theme.dark':'Тёмная','theme.light':'Светлая','theme.toDark':'Включить тёмную тему','theme.toLight':'Включить светлую тему','theme.toggle':'Переключить цветовую тему',
      'meta.title':'Национальная олимпиада по физике, Кыргызстан (NPhO)',
      'meta.description':'Официальный сайт Национальной олимпиады по физике Кыргызской Республики. Задачи, решения, результаты и информация об олимпиаде.',
      'official.site':'Официальный сайт',
      'official.badge':'Представитель официального комитета по физике КР',
      'hero.title1':'Национальная олимпиада','hero.title2':'по физике',
      'hero.sub':'Задачи, решения и понятный путь от национального отбора к международным олимпиадам по физике.',
      'footer.title':'Национальная олимпиада по физике',
      'footer.desc':'Официальный сайт и представитель официального комитета по физике Кыргызской Республики.',
      'footer.chair':'Председатель комитета',
      'footer.nav':'Навигация','footer.contacts':'Контакты',
      'footer.copy':'© 2026 Национальная олимпиада по физике Кыргызской Республики',
      'home.selEyebrow':'Два маршрута · один финал','home.selTitle':'Как устроен отбор',
      'home.calEyebrow':'Сезон 2025–2026','home.calTitle':'Календарь сезона','home.important':'Важно',
      'home.stagesCol':'Этапы NPhO','home.intlCol':'Международные старты','flag.alt':'Флаг: {name}',
      'about.kicker':'Об олимпиаде','about.label.org':'Организатор','about.orgTitle':'Официальный статус',
      'about.orgText':'npho.edu.kg — официальный сайт Национальной олимпиады по физике Кыргызской Республики. Сайт является представителем официального комитета по физике КР: здесь публикуются условия и решения, результаты отбора и составы команд на международные олимпиады.',
      'about.org.status':'Статус','about.org.statusVal':'Официальный сайт Национальной олимпиады по физике',
      'about.org.committee':'Комитет','about.org.committeeVal':'Представитель официального комитета по физике Кыргызской Республики',
      'about.org.chair':'Председатель комитета',
      'about.label.system':'Система отбора','about.label.teams':'Состав команд','about.label.intl':'Международный уровень',
      'results.title':'Результаты','results.kicker':'Заключительный этап','results.stage':'IV этап {year}',
      'results.dates':'Даты','results.place':'Место','results.bishkek':'Бишкек','results.duration':'Продолжительность',
      'results.pdfs':'Задачи и решения','results.day':'День {n}','results.problems':'Условия задач','results.solutions':'Решения',
      'results.available':'Доступно для скачивания','results.later':'Будет добавлено позже','results.download':'Скачать','results.soon':'Скоро',
      'results.table':'Таблица результатов','results.noData':'Нет данных.','results.participant':'Участник','results.total':'Итого','results.status':'Статус',
      'results.permalink':'Отдельная страница','results.copyLink':'Скопировать ссылку','results.copied':'Ссылка скопирована',
      'results.pageTitle':'Результаты NPhO {year}','results.pageSub':'IV этап Национальной олимпиады по физике Кыргызской Республики',
      'results.years':'Год','results.legend':'Цвет номера обозначает место в итоговом рейтинге отбора, а не медаль. Составы команд указаны в столбце «Статус».',
      'status.Резерв':'Резерв',
      'problems.title':'Банк задач','problems.intro':'Сначала выберите задачник, затем раздел физики и номер задачи.',
      'problems.loading':'Загружаем опубликованные задачи…','problems.fallback':'Показаны сохранённые на сайте задачи.',
      'problems.add':'Добавить задачу','problems.addTitle':'Доступно редакторам после входа',
      'problems.backBooks':'← К выбору задачника','problems.backTopics':'← К разделам задачника','problems.backSection':'← Вернуться к задачам раздела',
      'problems.search':'Поиск по номеру или главе','problems.clear':'Очистить поиск','problems.clearShort':'Очистить',
      'problems.empty':'В этом разделе пока нет задач.','problems.notFound':'По вашему запросу ничего не найдено.','problems.of':'{a} из {b}',
      'problems.legend':'Цветовая шкала сложности задач',
      'diff.1':'Лёгкая','diff.2':'Средняя','diff.3':'Сложная','diff.4':'Гроб',
      'diffLong.1':'Лёгкая задача — зелёный цвет','diffLong.2':'Средняя задача — оранжевый цвет','diffLong.3':'Сложная задача — красный цвет','diffLong.4':'Гроб — тёмно-красный цвет с черепом',
      'problems.task':'Задача {n}','problems.openTask':'Открыть задачу {n}. Сложность: {d}','problems.difficulty':'Сложность: {d}',
      'problems.copyLink':'⧉ Скопировать ссылку','problems.copied':'✓ Ссылка скопирована','problems.copyTitle':'Скопировать ссылку на задачу','problems.copyPrompt':'Скопируйте ссылку на задачу:',
      'problems.statement':'Условие','problems.hints':'Пошаговые подсказки','problems.openHint':'Открыть подсказку','problems.solution':'Решение',
      'problems.answer':'Ответ','problems.comment':'Комментарий автора','problems.show':'Показать','problems.hide':'Скрыть',
      'problems.prev':'← Предыдущая','problems.next':'Следующая →','problems.navLabel':'Переход между задачами','problems.sidebarBack':'Вернуться к разделу',
      'problems.noSolution':'Решение пока не добавлено.','problems.noHints':'Подсказки пока не добавлены.','problems.noHintsBtn':'Нет подсказок',
      'problems.hintsOpened':'Открыто {a} из {b}','problems.hintN':'Подсказка {n}','problems.openHintN':'Открыть подсказку {a} из {b}','problems.hideHints':'Скрыть подсказки',
      'problems.sectionStart':'Начало раздела','problems.sectionEnd':'Конец раздела','problems.contentNote':'',
      'book.desc.default':'Задачи и решения, опубликованные редакцией NPhO.',
      'book.desc.Савченко':'Задачи по механике, термодинамике, электричеству и оптике.',
      'book.desc.Овчинкин':'Отдельный каталог задач с собственной нумерацией по каждому разделу.',
      'book.desc.Сборник NPhO':'Официальные и тренировочные задачи Национальной олимпиады по физике.',
      'book.desc.Авторские задачи':'Авторские подборки преподавателей и тренеров сборной.',
    },
    ky: {
      'lang.label':'Тил',
      'nav.home':'Башкы бет','nav.problems':'Маселелер банкы','nav.results':'Жыйынтыктар','nav.about':'Олимпиада жөнүндө',
      'theme.dark':'Караңгы','theme.light':'Жарык','theme.toDark':'Караңгы теманы күйгүзүү','theme.toLight':'Жарык теманы күйгүзүү','theme.toggle':'Түс темасын которуу',
      'meta.title':'Физика боюнча улуттук олимпиада, Кыргызстан (NPhO)',
      'meta.description':'Кыргыз Республикасынын физика боюнча улуттук олимпиадасынын расмий сайты. Маселелер, чыгарылыштар, жыйынтыктар жана олимпиада тууралуу маалымат.',
      'official.site':'Расмий сайт',
      'official.badge':'КР физика боюнча расмий комитетинин өкүлү',
      'hero.title1':'Физика боюнча','hero.title2':'улуттук олимпиада',
      'hero.sub':'Маселелер, чыгарылыштар жана улуттук тандоодон эл аралык физика олимпиадаларына чейинки түшүнүктүү жол.',
      'footer.title':'Физика боюнча улуттук олимпиада',
      'footer.desc':'Кыргыз Республикасынын физика боюнча расмий комитетинин расмий сайты жана өкүлү.',
      'footer.chair':'Комитеттин төрагасы',
      'footer.nav':'Навигация','footer.contacts':'Байланыш',
      'footer.copy':'© 2026 Кыргыз Республикасынын физика боюнча улуттук олимпиадасы',
      'home.selEyebrow':'Эки жол · бир финал','home.selTitle':'Тандоо кандай уюштурулган',
      'home.calEyebrow':'2025–2026-окуу жылы','home.calTitle':'Сезондун календары','home.important':'Маанилүү',
      'home.stagesCol':'NPhO этаптары','home.intlCol':'Эл аралык мелдештер','flag.alt':'Желек: {name}',
      'about.kicker':'Олимпиада жөнүндө','about.label.org':'Уюштуруучу','about.orgTitle':'Расмий статус',
      'about.orgText':'npho.edu.kg — Кыргыз Республикасынын физика боюнча улуттук олимпиадасынын расмий сайты. Сайт КР физика боюнча расмий комитетинин өкүлү болуп саналат: бул жерде маселелердин шарттары жана чыгарылыштары, тандоонун жыйынтыктары жана эл аралык олимпиадаларга командалардын курамы жарыяланат.',
      'about.org.status':'Статус','about.org.statusVal':'Физика боюнча улуттук олимпиаданын расмий сайты',
      'about.org.committee':'Комитет','about.org.committeeVal':'Кыргыз Республикасынын физика боюнча расмий комитетинин өкүлү',
      'about.org.chair':'Комитеттин төрагасы',
      'about.label.system':'Тандоо системасы','about.label.teams':'Командалардын курамы','about.label.intl':'Эл аралык деңгээл',
      'results.title':'Жыйынтыктар','results.kicker':'Жыйынтыктоочу этап','results.stage':'IV этап {year}',
      'results.dates':'Даталар','results.place':'Өткөн жери','results.bishkek':'Бишкек','results.duration':'Узактыгы',
      'results.pdfs':'Маселелер жана чыгарылыштар','results.day':'{n}-күн','results.problems':'Маселелердин шарттары','results.solutions':'Чыгарылыштар',
      'results.available':'Жүктөп алууга болот','results.later':'Кийинчерээк кошулат','results.download':'Жүктөө','results.soon':'Жакында',
      'results.table':'Жыйынтыктар таблицасы','results.noData':'Маалымат жок.','results.participant':'Катышуучу','results.total':'Жалпы','results.status':'Статус',
      'results.permalink':'Өзүнчө барак','results.copyLink':'Шилтемени көчүрүү','results.copied':'Шилтеме көчүрүлдү',
      'results.pageTitle':'NPhO {year} жыйынтыктары','results.pageSub':'Кыргыз Республикасынын физика боюнча улуттук олимпиадасынын IV этабы',
      'results.years':'Жыл','results.legend':'Номердин түсү медалды эмес, тандоонун жыйынтыктоочу рейтингиндеги орунду билдирет. Командалардын курамы «Статус» тилкесинде көрсөтүлгөн.',
      'status.Резерв':'Резерв',
      'problems.title':'Маселелер банкы','problems.intro':'Адегенде маселелер жыйнагын, андан кийин физиканын бөлүмүн жана маселенин номерин тандаңыз.',
      'problems.loading':'Жарыяланган маселелер жүктөлүүдө…','problems.fallback':'Сайтта сакталган маселелер көрсөтүлдү.',
      'problems.add':'Маселе кошуу','problems.addTitle':'Редакторлор үчүн, кирүүдөн кийин жеткиликтүү',
      'problems.backBooks':'← Жыйнакты тандоого','problems.backTopics':'← Жыйнактын бөлүмдөрүнө','problems.backSection':'← Бөлүмдүн маселелерине кайтуу',
      'problems.search':'Номер же глава боюнча издөө','problems.clear':'Издөөнү тазалоо','problems.clearShort':'Тазалоо',
      'problems.empty':'Бул бөлүмдө азырынча маселе жок.','problems.notFound':'Сурамыңыз боюнча эч нерсе табылган жок.','problems.of':'{b} ичинен {a}',
      'problems.legend':'Маселелердин татаалдык шкаласы',
      'diff.1':'Жеңил','diff.2':'Орто','diff.3':'Татаал','diff.4':'Өтө татаал',
      'diffLong.1':'Жеңил маселе — жашыл түс','diffLong.2':'Орто маселе — кызгылт сары түс','diffLong.3':'Татаал маселе — кызыл түс','diffLong.4':'Өтө татаал — баш сөөгү бар кочкул кызыл түс',
      'problems.task':'{n}-маселе','problems.openTask':'{n}-маселени ачуу. Татаалдыгы: {d}','problems.difficulty':'Татаалдыгы: {d}',
      'problems.copyLink':'⧉ Шилтемени көчүрүү','problems.copied':'✓ Шилтеме көчүрүлдү','problems.copyTitle':'Маселенин шилтемесин көчүрүү','problems.copyPrompt':'Маселенин шилтемесин көчүрүп алыңыз:',
      'problems.statement':'Шарты','problems.hints':'Кадам сайын кеңештер','problems.openHint':'Кеңешти ачуу','problems.solution':'Чыгарылышы',
      'problems.answer':'Жообу','problems.comment':'Автордун комментарийи','problems.show':'Көрсөтүү','problems.hide':'Жашыруу',
      'problems.prev':'← Мурунку','problems.next':'Кийинки →','problems.navLabel':'Маселелердин ортосунда өтүү','problems.sidebarBack':'Бөлүмгө кайтуу',
      'problems.noSolution':'Чыгарылышы азырынча кошула элек.','problems.noHints':'Кеңештер азырынча кошула элек.','problems.noHintsBtn':'Кеңеш жок',
      'problems.hintsOpened':'{b} ичинен {a} ачылды','problems.hintN':'{n}-кеңеш','problems.openHintN':'{b} ичинен {a}-кеңешти ачуу','problems.hideHints':'Кеңештерди жашыруу',
      'problems.sectionStart':'Бөлүмдүн башы','problems.sectionEnd':'Бөлүмдүн аягы','problems.contentNote':'Маселелердин тексттери орус тилинде.',
      'book.desc.default':'NPhO редакциясы жарыялаган маселелер жана чыгарылыштар.',
      'book.desc.Савченко':'Механика, термодинамика, электр жана оптика боюнча маселелер.',
      'book.desc.Овчинкин':'Ар бир бөлүм боюнча өз номерлөөсү бар өзүнчө маселелер каталогу.',
      'book.desc.Сборник NPhO':'Улуттук физика олимпиадасынын расмий жана машыгуу маселелери.',
      'book.desc.Авторские задачи':'Мугалимдердин жана курама команданын машыктыруучуларынын автордук тандамалары.',
    },
    en: {
      'lang.label':'Language',
      'nav.home':'Home','nav.problems':'Problem bank','nav.results':'Results','nav.about':'About',
      'theme.dark':'Dark','theme.light':'Light','theme.toDark':'Switch to dark theme','theme.toLight':'Switch to light theme','theme.toggle':'Toggle color theme',
      'meta.title':'National Physics Olympiad of Kyrgyzstan (NPhO)',
      'meta.description':'Official website of the National Physics Olympiad of the Kyrgyz Republic. Problems, solutions, results and information about the olympiad.',
      'official.site':'Official website',
      'official.badge':'Representative of the official Physics Committee of the Kyrgyz Republic',
      'hero.title1':'National','hero.title2':'Physics Olympiad',
      'hero.sub':'Problems, solutions and a clear path from national selection to the international physics olympiads.',
      'footer.title':'National Physics Olympiad',
      'footer.desc':'Official website and representative of the official Physics Committee of the Kyrgyz Republic.',
      'footer.chair':'Committee Chair',
      'footer.nav':'Navigation','footer.contacts':'Contacts',
      'footer.copy':'© 2026 National Physics Olympiad of the Kyrgyz Republic',
      'home.selEyebrow':'Two routes · one final','home.selTitle':'How selection works',
      'home.calEyebrow':'Season 2025–2026','home.calTitle':'Season calendar','home.important':'Important',
      'home.stagesCol':'NPhO stages','home.intlCol':'International competitions','flag.alt':'Flag: {name}',
      'about.kicker':'About the Olympiad','about.label.org':'Organizer','about.orgTitle':'Official status',
      'about.orgText':'npho.edu.kg is the official website of the National Physics Olympiad of the Kyrgyz Republic. The site represents the official Physics Committee of the Kyrgyz Republic: problems and solutions, selection results and international team rosters are published here.',
      'about.org.status':'Status','about.org.statusVal':'Official website of the National Physics Olympiad',
      'about.org.committee':'Committee','about.org.committeeVal':'Representative of the official Physics Committee of the Kyrgyz Republic',
      'about.org.chair':'Committee Chair',
      'about.label.system':'Selection system','about.label.teams':'Team selection','about.label.intl':'International level',
      'results.title':'Results','results.kicker':'Final stage','results.stage':'Stage IV {year}',
      'results.dates':'Dates','results.place':'Venue','results.bishkek':'Bishkek','results.duration':'Duration',
      'results.pdfs':'Problems and solutions','results.day':'Day {n}','results.problems':'Problems','results.solutions':'Solutions',
      'results.available':'Available for download','results.later':'Will be added later','results.download':'Download','results.soon':'Soon',
      'results.table':'Results table','results.noData':'No data.','results.participant':'Participant','results.total':'Total','results.status':'Status',
      'results.permalink':'Standalone page','results.copyLink':'Copy link','results.copied':'Link copied',
      'results.pageTitle':'NPhO {year} Results','results.pageSub':'Stage IV of the National Physics Olympiad of the Kyrgyz Republic',
      'results.years':'Year','results.legend':'The colour of the number marks the place in the final selection ranking, not a medal. Team selection is shown in the “Status” column.','results.namesNote':'Names are shown in Latin script with the original Cyrillic spelling below.',
      'status.Резерв':'Reserve',
      'problems.title':'Problem bank','problems.intro':'Choose a problem book first, then a physics topic and a problem number.',
      'problems.loading':'Loading published problems…','problems.fallback':'Showing problems saved on the site.',
      'problems.add':'Add a problem','problems.addTitle':'Available to editors after signing in',
      'problems.backBooks':'← Back to problem books','problems.backTopics':'← Back to topics','problems.backSection':'← Back to the topic',
      'problems.search':'Search by number or chapter','problems.clear':'Clear search','problems.clearShort':'Clear',
      'problems.empty':'There are no problems in this topic yet.','problems.notFound':'Nothing matches your search.','problems.of':'{a} of {b}',
      'problems.legend':'Problem difficulty scale',
      'diff.1':'Easy','diff.2':'Medium','diff.3':'Hard','diff.4':'Brutal',
      'diffLong.1':'Easy problem — green','diffLong.2':'Medium problem — orange','diffLong.3':'Hard problem — red','diffLong.4':'Brutal — dark red with a skull',
      'problems.task':'Problem {n}','problems.openTask':'Open problem {n}. Difficulty: {d}','problems.difficulty':'Difficulty: {d}',
      'problems.copyLink':'⧉ Copy link','problems.copied':'✓ Link copied','problems.copyTitle':'Copy a link to this problem','problems.copyPrompt':'Copy the link to this problem:',
      'problems.statement':'Statement','problems.hints':'Step-by-step hints','problems.openHint':'Show hint','problems.solution':'Solution',
      'problems.answer':'Answer','problems.comment':'Author’s comment','problems.show':'Show','problems.hide':'Hide',
      'problems.prev':'← Previous','problems.next':'Next →','problems.navLabel':'Problem navigation','problems.sidebarBack':'Back to the topic',
      'problems.noSolution':'The solution has not been added yet.','problems.noHints':'No hints have been added yet.','problems.noHintsBtn':'No hints',
      'problems.hintsOpened':'{a} of {b} shown','problems.hintN':'Hint {n}','problems.openHintN':'Show hint {a} of {b}','problems.hideHints':'Hide hints',
      'problems.sectionStart':'Start of topic','problems.sectionEnd':'End of topic','problems.contentNote':'Problem texts are in Russian.',
      'book.desc.default':'Problems and solutions published by the NPhO editorial team.',
      'book.desc.Савченко':'Problems in mechanics, thermodynamics, electricity and optics.',
      'book.desc.Овчинкин':'A separate catalogue with its own numbering in each topic.',
      'book.desc.Сборник NPhO':'Official and practice problems of the National Physics Olympiad.',
      'book.desc.Авторские задачи':'Original problem sets by teachers and national team coaches.',
    }
  };

  /* Имя председателя комитета */
  const CHAIR = { ru:'Кылычбеков Салижан', ky:'Кылычбеков Салижан', en:'Salizhan Kylychbekov' };

  const COUNTRIES = {
    ru:{KR:'Республика Корея',SE:'Швеция',RU:'Россия',TR:'Турция',CO:'Колумбия'},
    ky:{KR:'Корея Республикасы',SE:'Швеция',RU:'Россия',TR:'Түркия',CO:'Колумбия'},
    en:{KR:'Republic of Korea',SE:'Sweden',RU:'Russia',TR:'Türkiye',CO:'Colombia'}
  };

  /* Названия разделов и задачников для отображения (данные остаются на русском). */
  const TERMS = {
    ky:{'Механика':'Механика','Термодинамика':'Термодинамика','Электричество':'Электр','Оптика':'Оптика','Без главы':'Главасыз','Сборник NPhO':'NPhO жыйнагы','Авторские задачи':'Автордук маселелер'},
    en:{'Механика':'Mechanics','Термодинамика':'Thermodynamics','Электричество':'Electricity','Оптика':'Optics','Без главы':'No chapter','Савченко':'Savchenko','Овчинкин':'Ovchinkin','Сборник NPhO':'NPhO collection','Авторские задачи':'Original problems'}
  };

  /* Переводы контента сайта (о олимпиаде, отбор, календарь). Структура повторяет DEFAULT_SITE_CONTENT. */
  const CONTENT = {
    ky: {
      about: {
        kicker:'Олимпиада жөнүндө',
        title:'Физика боюнча улуттук олимпиада',
        intro:'Физика боюнча улуттук олимпиада (NPhO) — улуттук деңгээлдеги мелдеш жана жыйынтыктоочу тандоого кошумча жол. Бардык аймактардын катышуучулары маселелерди бирдей шартта чыгарышат, ал эми алардын жыйынтыктары өлкө боюнча бирдиктүү рейтингде салыштырылат.',
        originTitle:'Жыйынтыктоочу тандоого эки жол',
        originText:'Кыргызстанда жыйынтыктоочу тандоого эки параллелдүү жол алып барат. Республикалык олимпиада аркылуу катышуучу райондук, андан кийин облустук же шаардык жана республикалык этаптардан өтөт. Ар бир өтүүдө аймактык квота колдонулат, ошондуктан кийинки этапка өтүү жыйынтыктан гана эмес, район, облус же шаар ичиндеги атаандаштыктан да көз каранды.\n\nNPhO экинчи, улуттук жолду түзөт. Алгачкы эки онлайн этапта бардык аймактардын катышуучулары бирдей маселелерди чыгарып, бирдиктүү рейтингге кирет: окуган жери жана аймактык квота тандоого таасир этпейт. Мыктылар Бишкек жана Ош шаарларында бетме-бет өтүүчү III этапка чыгат. IV этапта эки жол биригип, NPhO жана Республикалык олимпиаданын катышуучулары жалпы рейтингде атаандашат.',
        benefitTitle:'NPhOдогу тандоонун принциптери',
        benefits:[
          {title:'Бирдиктүү рейтинг',text:'NPhOнун бардык катышуучулары маселелерди бирдей шартта чыгарышат жана алардын жыйынтыктары өлкө боюнча салыштырылат.'},
          {title:'Аймактан көз карандысыздык',text:'Кийинки этапка өтүү район, облус же шаардын квотасы менен эмес, топтолгон балл менен аныкталат.'},
          {title:'Жалпы IV этап',text:'NPhOнун мыкты катышуучулары Республикалык олимпиаданын эң күчтүү катышуучулары менен жалпы жыйынтыктоочу тандоодо жолугушат.'}
        ],
        pathTitle:'Эл аралык олимпиадалар',
        pathText:'Кыргызстан бир нече эл аралык мелдешке команда түзөт. Алардын эрежелери, командалардын курамы жана маселелердин мүнөзү ар башка.',
        internationalDetails:[
          {name:'Эл аралык физика олимпиадасы',text:'Мектеп окуучуларынын улуттук командалары үчүн дүйнөлүк олимпиада жана бул деңгээлдеги эң абройлуу эл аралык мелдеш. Программага өзүнчө теориялык жана эксперименталдык турлар кирет; өлкөнүн командасы бештен ашпаган катышуучудан турат.'},
          {name:'Азия физика олимпиадасы',text:'Азия жана Океания өлкөлөрү үчүн аймактык олимпиада. Форматы IPhOго жакын, бирок командада сегизге чейин катышуучу болушу мүмкүн; теориялык жана эксперименталдык турлар жогорку татаалдыгы жана иштин тыгыздыгы менен айырмаланат.'},
          {name:'Европа физика олимпиадасы',text:'Европалык жана чакырылган командалар катышкан Европа олимпиадасы. Ал теориялык жана эксперименталдык турларды камтыйт; кыска шарттар адатта моделди жана негизги физикалык идеяны өз алдынча тандоону талап кылат.'},
          {name:'Балкан физика олимпиадасы',text:'Балкан физикалык бирлигинин өлкөлөрү жана чакырылган командалар үчүн аймактык олимпиада. Ыкчам формат катышуучуларга эл аралык чөйрөдө маселе чыгаруу тажрыйбасын берет.'},
          {name:'Эл аралык илимий физика олимпиадасы',text:'Улуттук делегациялар үчүн эл аралык илимий физика олимпиадасы. Тапшырмалар теориялык жана эксперименталдык физиканы камтыйт жана моделдер менен ишенимдүү иштөөнү, маалыматтарды талдоону талап кылат.'}
        ]
      },
      notice:'Маалымат өзгөрүшү мүмкүн. Даталар, өтүүчү жерлер, турлардын форматы жана тандоонун шарттары уюштуруучулар тарабынан ар бир окуу жылына такталат. Катышуудан мурун Кыргыз Республикасынын Агартуу министрлигинин учурдагы буйруктарын текшерип алууну сунуштайбыз.',
      calendar:[
        {date:'Январь 2026',title:'NPhO I этабы',details:'Онлайн · прокторинг жана бирдиктүү рейтинг'},
        {date:'Февраль 2026',title:'NPhO II этабы',details:'Онлайн · улуттук жолдун кийинки этабы'},
        {date:'Март 2026',title:'NPhO III этабы',details:'Бир күн бетме-бет · Бишкек жана Ош'},
        {date:'4–6-апрель 2026',title:'IV этап — улуттук финал',details:'Үч күн · Бишкек · тандоонун эки жолу биригет'},
        {date:'17–25-май 2026',title:'APhO 2026',details:'Пусан, Корея Республикасы'},
        {date:'12–16-июнь 2026',title:'EuPhO 2026',details:'Гётеборг, Швеция'},
        {date:'21–30-июнь 2026',title:'ISPhO 2026',details:'Онлайн'},
        {date:'27–30-июнь 2026',title:'BPO 2026',details:'Стамбул, Түркия'},
        {date:'4–12-июль 2026',title:'IPhO 2026',details:'Букараманга, Колумбия'}
      ],
      selection:{
        title:'Тандоо кандай уюштурулган',
        intro:'Жалпы финалга эки жол алып барат: Республикалык жана Улуттук олимпиадалар. IV этапта алардын эң күчтүү катышуучулары бирдиктүү тандоодо жолугушат.',
        republicanTitle:'Республикалык олимпиада',
        republicanStages:['Райондук этап','Облустук / шаардык этап','Республикалык этап','Этаптын жыйынтыгы боюнча мыктылар'],
        republicanNote:'Этаптардын ортосунда квоталар колдонулат, ошондуктан Республикалык олимпиада аркылуу бүт жолду басып өтүү оңой эмес.',
        nationalTitle:'Улуттук олимпиада',
        nationalStages:['I этап · онлайн','II этап · онлайн','III этап · Бишкек жана Ошто бетме-бет','III этаптын жыйынтыгы боюнча мыктылар'],
        nationalNote:'Бирдиктүү улуттук рейтинг жалпы жыйынтыктоочу тандоого кошумча жол ачат.',
        finalTitle:'Улуттук олимпиаданын IV этабы',
        finalText:'Улуттук олимпиаданын эң мыкты катышуучулары + Республикалык олимпиаданын эң күчтүү катышуучулары',
        rulesTitle:'Эл аралык командаларды түзүү',
        rulesText:'IV этаптан кийин жыйынтыктоочу рейтинг түзүлөт. Анын негизинде жана уюштуруучулардын чечимдерин эске алуу менен Кыргызстандын командаларынын курамы аныкталат.',
        teamRules:[
          {count:'5 катышуучу',text:'Жыйынтыктоочу рейтингдин алгачкы беш катышуучусу IPhOго бара турган командага кирет.'},
          {count:'8 катышуучу',text:'Жыйынтыктоочу рейтингдин алгачкы сегиз катышуучусу APhOго бара турган командага кирет.'},
          {count:'Уюштуруучулардын чечими боюнча',text:'Курамдар тандоонун жыйынтыктарын, эрежелерди жана жеткиликтүү квоталарды эске алуу менен өзүнчө аныкталат.'}
        ]
      }
    },
    en: {
      about: {
        kicker:'About the Olympiad',
        title:'National Physics Olympiad',
        intro:'The National Physics Olympiad (NPhO) is a nationwide competition and an additional route to the final selection. Participants from all regions solve problems under the same conditions, and their results are compared in a single national ranking.',
        originTitle:'Two routes to the final selection',
        originText:'In Kyrgyzstan, two parallel routes lead to the final selection. Through the Republican Olympiad, a participant goes through the district stage, then the regional or city stage, and finally the republican stage. Every transition has a territorial quota, so advancing depends not only on the score but also on the competition within a district, region or city.\n\nNPhO creates a second, national route. In the first two online stages, participants from all regions solve the same problems and enter a single ranking: neither where they study nor regional quotas affect selection. The best advance to the in-person Stage III in Bishkek and Osh. At Stage IV the two routes merge, and participants of NPhO and of the Republican Olympiad compete in a common ranking.',
        benefitTitle:'NPhO selection principles',
        benefits:[
          {title:'Single ranking',text:'All NPhO participants solve problems under the same conditions, and their results are compared nationwide.'},
          {title:'Independent of region',text:'Advancing to the next stage is determined by the points scored, not by a district, regional or city quota.'},
          {title:'Common Stage IV',text:'The best NPhO participants meet the strongest participants of the Republican Olympiad in a common final selection.'}
        ],
        pathTitle:'International Olympiads',
        pathText:'Kyrgyzstan sends teams to several international competitions. Their regulations, team sizes and problem styles differ.',
        internationalDetails:[
          {name:'International Physics Olympiad',text:'The worldwide olympiad for national teams of secondary-school students and the most prestigious international competition at this level. It has separate theoretical and experimental rounds; a national team has at most five members.'},
          {name:'Asian Physics Olympiad',text:'A regional olympiad for the countries of Asia and Oceania. The format is close to IPhO, but a team may have up to eight members; the theoretical and experimental rounds are known for their difficulty and intensity.'},
          {name:'European Physics Olympiad',text:'A European olympiad with European and invited teams. It includes theoretical and experimental rounds; short problem statements usually require choosing a model and the key physical idea on your own.'},
          {name:'Balkan Physics Olympiad',text:'A regional olympiad of the Balkan Physical Union countries and invited teams. Its more compact format gives participants experience of solving problems in an international setting.'},
          {name:'International Scientific Physics Olympiad',text:'An international scientific physics olympiad for national delegations. Tasks cover theoretical and experimental physics and require confident work with models and data analysis.'}
        ]
      },
      notice:'Information may change. Dates, venues, round formats and selection conditions are confirmed by the organizers for each academic year. Before taking part, please check the current orders of the Ministry of Education of the Kyrgyz Republic.',
      calendar:[
        {date:'January 2026',title:'NPhO Stage I',details:'Online · proctored · single ranking'},
        {date:'February 2026',title:'NPhO Stage II',details:'Online · next stage of the national route'},
        {date:'March 2026',title:'NPhO Stage III',details:'One in-person day · Bishkek and Osh'},
        {date:'April 4–6, 2026',title:'Stage IV — National Final',details:'Three days · Bishkek · both selection routes meet'},
        {date:'May 17–25, 2026',title:'APhO 2026',details:'Busan, Republic of Korea'},
        {date:'June 12–16, 2026',title:'EuPhO 2026',details:'Gothenburg, Sweden'},
        {date:'June 21–30, 2026',title:'ISPhO 2026',details:'Online'},
        {date:'June 27–30, 2026',title:'BPO 2026',details:'Istanbul, Türkiye'},
        {date:'July 4–12, 2026',title:'IPhO 2026',details:'Bucaramanga, Colombia'}
      ],
      selection:{
        title:'How selection works',
        intro:'Two routes lead to the common final: the Republican Olympiad and the National Olympiad. At Stage IV their strongest participants meet in a single selection.',
        republicanTitle:'Republican Olympiad',
        republicanStages:['District stage','Regional / city stage','Republican stage','Top performers of the stage'],
        republicanNote:'Quotas apply between stages, so going all the way through the Republican Olympiad is not easy.',
        nationalTitle:'National Olympiad',
        nationalStages:['Stage I · online','Stage II · online','Stage III · in person in Bishkek and Osh','Top performers of Stage III'],
        nationalNote:'A single national ranking opens an additional route to the common final selection.',
        finalTitle:'Stage IV of the National Olympiad',
        finalText:'Top participants of the National Olympiad + the strongest participants of the Republican Olympiad',
        rulesTitle:'Forming the international teams',
        rulesText:'After Stage IV a final ranking is compiled. Based on it, and taking the organizers’ decisions into account, the teams of Kyrgyzstan are determined.',
        teamRules:[
          {count:'5 participants',text:'The top five of the final ranking make the IPhO team.'},
          {count:'8 participants',text:'The top eight of the final ranking make the APhO team.'},
          {count:'By organizers’ decision',text:'Teams are determined separately, based on the selection results, regulations and available quotas.'}
        ]
      }
    }
  };

  function normalize(lang){ lang=String(lang||'').toLowerCase(); if(lang==='kg'||lang==='kgz')lang='ky'; return LANGS.includes(lang)?lang:''; }

  function detectLang(){
    try{ const fromUrl=normalize(new URLSearchParams(location.search).get('lang')); if(fromUrl){ try{localStorage.setItem(STORAGE_KEY,fromUrl)}catch{} return fromUrl; } }catch{}
    try{ const saved=normalize(localStorage.getItem(STORAGE_KEY)); if(saved)return saved; }catch{}
    return DEFAULT_LANG;
  }

  let current = detectLang();

  function t(key, vars){
    let s = (UI[current]&&UI[current][key]);
    if(s===undefined) s = UI.ru[key];
    if(s===undefined) return key;
    if(vars) s = s.replace(/\{(\w+)\}/g,(m,k)=>vars[k]!==undefined?vars[k]:m);
    return s;
  }
  function has(key){ return !!(UI[current]&&UI[current][key]!==undefined) || UI.ru[key]!==undefined; }

  function pluralTasks(n){
    if(current==='en') return n===1?'problem':'problems';
    if(current==='ky') return 'маселе';
    const n10=n%10,n100=n%100;
    if(n10===1&&n100!==11)return 'задача';
    if(n10>=2&&n10<=4&&(n100<12||n100>14))return 'задачи';
    return 'задач';
  }
  function pluralDays(n){
    if(current==='en') return n+(n===1?' day':' days');
    if(current==='ky') return n+' күн';
    const n10=n%10,n100=n%100;
    if(n10===1&&n100!==11)return n+' день';
    if(n10>=2&&n10<=4&&(n100<12||n100>14))return n+' дня';
    return n+' дней';
  }

  const TRANSLIT = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','ң':'ng','о':'o','ө':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ү':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
  function translit(text){
    return String(text||'').replace(/[Ѐ-ӿ]/g,(ch,idx,str)=>{
      const lower=ch.toLowerCase();
      let out=TRANSLIT[lower];
      if(out===undefined) return ch;
      /* «Е» в начале слова → «ye» (Елена → Yelena); в остальных случаях «e» (Абдиев → Abdiev). */
      if(lower==='е'){ const prev=str[idx-1]; if(!prev||/[\s\-ъь]/i.test(prev)) out='ye'; }
      if(ch!==lower && out) out=out.charAt(0).toUpperCase()+out.slice(1);
      return out;
    });
  }
  /* Имена людей: в английской версии — латиницей. */
  /* Имя участника. В английской версии: nameEn из данных (официальное написание), иначе транслитерация. */
  function personName(name, nameEn){ if(current!=='en')return String(name||''); return String(nameEn||'').trim()||translit(name); }
  /* HTML для ячейки таблицы: в английской версии под латиницей показывается оригинал на кириллице (для поиска и сверки). */
  function personNameHtml(row, esc){
    const main=personName(row.name,row.nameEn);
    const orig=String(row.name||'');
    if(current==='en'&&orig&&orig!==main) return esc(main)+'<span class="name-orig" lang="ru">'+esc(orig)+'</span>';
    return esc(main||'—');
  }
  /* Ссылка с текущим языком: русский — без параметра, остальные — ?lang=xx. */
  function langUrl(path){ const url=new URL(path||location.href, location.origin); if(current==='ru')url.searchParams.delete('lang'); else url.searchParams.set('lang',current); return url.href; }
  function syncUrl(){ try{ const href=langUrl(location.href); if(href!==location.href) history.replaceState(history.state,'',href); }catch{} }
  function statusLabel(status){
    return String(status||'').split('/').map(part=>{ const key='status.'+part.trim(); return has(key)?t(key):part; }).join('/');
  }
  function term(value){ const map=TERMS[current]; const v=String(value||''); return (map&&map[v])||v; }
  function country(code){ return (COUNTRIES[current]||COUNTRIES.ru)[code]||(COUNTRIES.ru[code]||''); }
  function chair(){ return CHAIR[current]||CHAIR.ru; }

  /* Накладывает перевод на контент: поле переводится, только если в контенте стоит исходный русский текст. */
  function localizeDeep(cur, def, tr){
    if(typeof tr==='string') return (typeof cur==='string'&&cur===def)?tr:cur;
    if(Array.isArray(cur)) return cur.map((item,i)=>(Array.isArray(tr)&&tr[i]!==undefined)?localizeDeep(item, Array.isArray(def)?def[i]:undefined, tr[i]):item);
    if(cur&&typeof cur==='object'){
      const out={...cur};
      if(tr&&typeof tr==='object') Object.keys(tr).forEach(k=>{ if(k in cur) out[k]=localizeDeep(cur[k], def?def[k]:undefined, tr[k]); });
      return out;
    }
    return cur;
  }
  function localizeContent(content, defaults){
    if(current==='ru'||!CONTENT[current]) return content;
    return localizeDeep(content, defaults, CONTENT[current]);
  }

  function setLang(lang){
    lang=normalize(lang)||DEFAULT_LANG;
    current=lang;
    try{localStorage.setItem(STORAGE_KEY,lang)}catch{}
    document.documentElement.lang=lang;
    /* Адрес всегда отражает язык (?lang=en / ?lang=ky), чтобы скопированная ссылка открывалась на том же языке. */
    syncUrl();
    applyStatic();
    document.dispatchEvent(new CustomEvent('npho:langchange',{detail:{lang}}));
  }

  /* Статический текст: data-i18n (textContent), data-i18n-html, data-i18n-attr="attr:key;attr:key". */
  function applyStatic(root){
    const scope=root||document;
    scope.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=t(el.getAttribute('data-i18n')); });
    scope.querySelectorAll('[data-i18n-attr]').forEach(el=>{
      el.getAttribute('data-i18n-attr').split(';').forEach(pair=>{ const [attr,key]=pair.split(':').map(s=>s&&s.trim()); if(attr&&key) el.setAttribute(attr,t(key)); });
    });
    scope.querySelectorAll('[data-i18n-chair]').forEach(el=>{ el.textContent=chair(); });
    scope.querySelectorAll('select[data-lang-select]').forEach(sel=>{ sel.value=current; });
  }

  document.documentElement.lang=current;
  syncUrl();

  window.NPHO_I18N = {
    LANGS, get lang(){return current;}, t, has, setLang, applyStatic, pluralTasks, pluralDays,
    translit, personName, personNameHtml, langUrl, statusLabel, term, country, chair, localizeContent
  };
})();
