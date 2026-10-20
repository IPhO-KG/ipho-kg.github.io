/*
 * Общие данные NPhO: результаты IV этапа и PDF с задачами.
 * Используются главной страницей (/) и отдельными страницами /results/ГГГГ/.
 * Редактор (/admin/) может переопределить результаты через /api/site-content.
 *
 * PDF: kind = 'problems' (условия) | 'solutions' (решения); пустой url → «Скоро».
 */
window.NPHO_PDF_LINKS = {
  '2026': [
    { day: 1, kind: 'problems',  url: '/assets/pdf/IPhO_2026_TST_Rus1.pdf' },
    { day: 1, kind: 'solutions', url: '/assets/pdf/IPhO_2026_TST_Sol1.pdf' },
    { day: 2, kind: 'problems',  url: '/assets/pdf/IPhO_2026_TST_Rus2.pdf' },
    { day: 2, kind: 'solutions', url: '/assets/pdf/IPhO_2026_TST_Sol2.pdf' },
    { day: 3, kind: 'problems',  url: '/assets/pdf/IPhO_2026_TST_Rus3.pdf' },
    { day: 3, kind: 'solutions', url: '/assets/pdf/IPhO_2026_TST_Sol3.pdf' },
  ],
  '2025': [
    { day: 1, kind: 'problems',  url: '/assets/pdf/Prob1.pdf' },
    { day: 1, kind: 'solutions', url: '/assets/pdf/Solu1.pdf' },
    { day: 2, kind: 'problems',  url: '' }, // TODO: файла Prob2.pdf нет в assets/pdf — добавьте и впишите '/assets/pdf/Prob2.pdf'
    { day: 2, kind: 'solutions', url: '/assets/pdf/Solu2.pdf' },
  ],
  '2024': [
    { day: 1, kind: 'problems',  url: '' },
    { day: 1, kind: 'solutions', url: '/assets/pdf/Sol1.pdf' },
    { day: 2, kind: 'problems',  url: '' },
    { day: 2, kind: 'solutions', url: '' },
  ],
};

/*
 * Имена латиницей: для английской версии можно указать официальное написание (как в паспорте),
 * добавив в строку поле nameEn, например: { name:'Анаралы уулу Эмир', nameEn:'Emir Anaraly uulu', ... }.
 * Без nameEn имя транслитерируется автоматически.
 */

/* Даты IV этапа (ключ — год). Если даты нет, строка «Даты» не показывается. */
window.NPHO_STAGE_DATES = {
  '2026': { ru: '4–6 апреля 2026', ky: '4–6-апрель 2026', en: 'April 4–6, 2026' },
};

window.NPHO_GOLD_COUNT = 5;
window.NPHO_SILVER_COUNT = 3;

window.NPHO_RESULTS = {
  '2022': [
    { name:'Сапарбек уулу Денис',  d1:'12.5', d2:'11.4', d3:'',    status:'APhO/IPhO' },
    { name:'Турдубаев Эрбол',      d1:'11.5', d2:'8.8',  d3:'',    status:'APhO/IPhO' },
    { name:'Жусупбеков Нияз',      d1:'11.3', d2:'4',    d3:'',    status:'APhO/IPhO' },
    { name:'Мартыненко Арсений',   d1:'12.3', d2:'1.0',  d3:'1.5', status:'APhO/IPhO' },
    { name:'Турдукеев Атай',       d1:'6.0',  d2:'2.6',  d3:'0.5', status:'APhO/IPhO' },
    { name:'Садыков Темирлан',     d1:'10.8', d2:'2.8',  d3:'',    status:'APhO' },
    { name:'Жамил уулу Алкелди',   d1:'6.9',  d2:'5',    d3:'',    status:'APhO' },
    { name:'Гартман Бекали',       d1:'7.5',  d2:'0.5',  d3:'',    status:'APhO' },
    { name:'Жусубалиев Сыймык',    d1:'5.6',  d2:'1.2',  d3:'',    status:'' },
    { name:'Баратали Бектур',      d1:'5.3',  d2:'1',    d3:'0.2', status:'' },
    { name:'Ускенбаева Анель',     d1:'5.4',  d2:'1',    d3:'',    status:'' },
    { name:'Минкин Тимур',         d1:'5.6',  d2:'0',    d3:'',    status:'' },
    { name:'Токтобекова Бактыгуль',d1:'1.6',  d2:'3',    d3:'',    status:'' },
    { name:'Карташев Владимир',    d1:'2.5',  d2:'2',    d3:'',    status:'' },
    { name:'Кадыр уулу Алинур',    d1:'2.4',  d2:'1.6',  d3:'',    status:'' },
  ],
  '2023': [
    { name:'Турдукеев Атай',       d1:'20',   d2:'28',   d3:'', status:'IPhO/APhO' },
    { name:'Баратали Бектур',      d1:'19',   d2:'27.5', d3:'', status:'IPhO/APhO' },
    { name:'Жусубалиев Сыймык',    d1:'18',   d2:'27',   d3:'', status:'IPhO/APhO' },
    { name:'Абдиев Аскар',         d1:'16',   d2:'28',   d3:'', status:'IPhO/APhO' },
    { name:'Анаралы уулу Эмир',    d1:'20',   d2:'24',   d3:'', status:'IPhO/APhO' },
    { name:'Турдубаев Эрбол',      d1:'20',   d2:'23.5', d3:'', status:'' },
    { name:'Сакиева Умут',         d1:'9',    d2:'17.5', d3:'', status:'APhO/EuPhO' },
    { name:'Чилдибаев Арстан',     d1:'16',   d2:'14.5', d3:'', status:'APhO/EuPhO' },
    { name:'Озокеев Атай',         d1:'9',    d2:'17.5', d3:'', status:'APhO' },
    { name:'Жамил уулу Алкелди',   d1:'16',   d2:'10',   d3:'', status:'' },
    { name:'Ускенбаева Анель',     d1:'13',   d2:'10.5', d3:'', status:'EuPhO' },
    { name:'Туратов Умар',         d1:'13',   d2:'9.5',  d3:'', status:'' },
    { name:'Токтобекова Бактыгул', d1:'9',    d2:'11.5', d3:'', status:'EuPhO' },
    { name:'Омурбеков Памир',      d1:'13',   d2:'7.5',  d3:'', status:'' },
    { name:'Бакытбеков Акбар',     d1:'15',   d2:'5',    d3:'', status:'' },
  ],
  '2024': [
    { name:'Абдиев Аскар',         d1:'51.85',  d2:'28.4',   d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Анаралы уулу Эмир',    d1:'51.85',  d2:'22.65',  d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Баратали Бектур',      d1:'41.25',  d2:'29.3',   d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Эмилбеков Айтегин',    d1:'33.725', d2:'26.675', d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Турдукеев Атай',       d1:'28.5',   d2:'30.975', d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Абылаев Ахмед',        d1:'19.125', d2:'27.7',   d3:'', status:'APhO' },
    { name:'Мамытов Иса',          d1:'28.5',   d2:'20.5',   d3:'', status:'APhO' },
    { name:'Озокеев Атай',         d1:'23.875', d2:'21.6',   d3:'', status:'APhO' },
    { name:'Жусубалиев Сыймык',    d1:'21.5',   d2:'23.45',  d3:'', status:'' },
    { name:'Ашырова Эльдана',      d1:'22.175', d2:'17.9',   d3:'', status:'' },
    { name:'Бакытбеков Акбар',     d1:'17.875', d2:'19',     d3:'', status:'EuPhO' },
    { name:'Омурбеков Памир',      d1:'26.875', d2:'13.8',   d3:'', status:'EuPhO' },
    { name:'Раяпов Нурсултан',     d1:'19.45',  d2:'14',     d3:'', status:'EuPhO' },
    { name:'Салиев Темирхан',      d1:'13.55',  d2:'15',     d3:'', status:'EuPhO' },
    { name:'Туратов Умар',         d1:'15.175', d2:'15.625', d3:'', status:'' },
  ],
  '2025': [
    { name:'Анаралы уулу Эмир',  d1:'37.4',  d2:'30.8',  d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Абдиев Аскар',       d1:'44.5',  d2:'22.3',  d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Темирхан Салиев',    d1:'36.1',  d2:'24',    d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Эмилбеков Айтегин',  d1:'29.45', d2:'19.5',  d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Баратали Бектур',    d1:'30.6',  d2:'18.35', d3:'', status:'IPhO/APhO/ISPhO' },
    { name:'Абылаев Ахмед',      d1:'24.55', d2:'21.05', d3:'', status:'APhO' },
    { name:'Бакытбеков Акбар',   d1:'25.6',  d2:'16.05', d3:'', status:'APhO' },
    { name:'Мамытов Иса',        d1:'19.4',  d2:'5',     d3:'', status:'APhO' },
    { name:'Эрмеков Алан',       d1:'16',    d2:'4.7',   d3:'', status:'' },
    { name:'Турдукеев Атай',     d1:'14.5',  d2:'6',     d3:'', status:'' },
    { name:'Касымов Марсель',    d1:'11.45', d2:'6.2',   d3:'', status:'' },
    { name:'Глинова Варвара',    d1:'8',     d2:'7.6',   d3:'', status:'' },
    { name:'Каримов Асылбек',    d1:'11.3',  d2:'3.7',   d3:'', status:'' },
    { name:'Туташбаев Умар',     d1:'12.5',  d2:'2.5',   d3:'', status:'' },
    { name:'Мырзабеков Нурбол',  d1:'6.2',   d2:'5',     d3:'', status:'' },
  ],
  '2026': [
    { name:'Аскар Абдиев',      d1:'16.4',  d2:'22.45', d3:'25',    status:'IPhO/APhO/EuPhO' },
    { name:'Айтегин Эмилбеков', d1:'18.2',  d2:'24.25', d3:'12.9',  status:'IPhO/APhO/EuPhO' },
    { name:'Темирхан Салиев',   d1:'11.3',  d2:'19.85', d3:'12.55', status:'IPhO/APhO' },
    { name:'Нурбол Мырзабеков', d1:'12.85', d2:'12.45', d3:'15.25', status:'IPhO/APhO' },
    { name:'Ахмед Абылаев',     d1:'11.05', d2:'18.85', d3:'6.45',  status:'IPhO/APhO' },
    { name:'Истеми Тазабеков',  d1:'8.7',   d2:'16.15', d3:'8.25',  status:'APhO' },
    { name:'Марсель Касымов',   d1:'12.2',  d2:'11.1',  d3:'9.7',   status:'APhO' },
    { name:'Умар Туташбаев',    d1:'7.2',   d2:'13.55', d3:'7.15',  status:'APhO' },
    { name:'Рашитов Бактыбек',  d1:'4.1',   d2:'6.1',   d3:'7.4',   status:'BPO' },
    { name:'Асанбаев Ариетбек', d1:'5',     d2:'7.8',   d3:'3.8',   status:'BPO' },
    { name:'Ашырова Эльдана',   d1:'7.35',  d2:'7.2',   d3:'1.9',   status:'BPO' },
    { name:'Эрмеков Нурэл',     d1:'7.4',   d2:'6.9',   d3:'1.6',   status:'BPO' },
    { name:'Таисия Ри',         d1:'5.1',   d2:'5.5',   d3:'2.65',  status:'Резерв' },
    { name:'Каримов Асылбек',   d1:'4.3',   d2:'3.1',   d3:'5.4',   status:'Резерв' },
    { name:'Осмонов Чынгыз',    d1:'5.6',   d2:'4.95',  d3:'0.7',   status:'Резерв' },
  ]
};
