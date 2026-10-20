/* Russian UI keeps the site usable when the translation bundle cannot load.
 * Keep UI in sync with the Russian entries in i18n.js.
 */
(function(){
  if(window.NPHO_I18N) return;
  const UI = {
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
    };
  const text = value => String(value == null ? '' : value);
  const has = key => Object.prototype.hasOwnProperty.call(UI,key);
  const t = (key,vars) => (has(key)?UI[key]:key).replace(/\{(\w+)\}/g,(match,name)=>vars&&vars[name]!==undefined?vars[name]:match);
  const plural = (n,one,few,many) => n%10===1&&n%100!==11?one:n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?few:many;
  const chair = () => 'Кылычбеков Салижан';
  function langUrl(path){
    const url=new URL(path||location.href,location.origin);
    url.searchParams.delete('lang');
    return url.href;
  }
  function applyStatic(root){
    const scope=root||document;
    scope.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.getAttribute('data-i18n'));});
    scope.querySelectorAll('[data-i18n-attr]').forEach(el=>{
      el.getAttribute('data-i18n-attr').split(';').forEach(pair=>{
        const [attr,key]=pair.split(':').map(part=>part.trim());
        if(attr&&key)el.setAttribute(attr,t(key));
      });
    });
    scope.querySelectorAll('[data-i18n-chair]').forEach(el=>{el.textContent=chair();});
    scope.querySelectorAll('select[data-lang-select]').forEach(select=>{
      select.value='ru';
      select.disabled=true;
      select.title='Переводы временно недоступны';
    });
  }
  window.NPHO_I18N={
    LANGS:['ru'],lang:'ru',t,has,applyStatic,setLang:()=>applyStatic(),
    pluralTasks:n=>plural(n,'задача','задачи','задач'),
    pluralDays:n=>n+' '+plural(n,'день','дня','дней'),
    translit:text,personName:text,
    personNameHtml:(row,escape)=>escape(row.name||'—'),
    langUrl,statusLabel:text,term:text,country:()=>'',chair,
    localizeContent:content=>content
  };
  document.documentElement.lang='ru';
})();
