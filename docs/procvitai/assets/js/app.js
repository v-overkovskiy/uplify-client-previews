const PHOTO = 'assets/photos/';
const imageMeta = {
  'care-water':[800,1000],'hero-alt':[800,1200],'hero-monstera':[800,1000],'monstera-b':[800,1000],'monstera-c':[800,1067],
  'moody':[800,1200],'orchid-pink':[800,1080],'orchid-white':[800,1067],'pot-plant':[800,1000],'pot-stand':[800,532],
  'pot-white':[800,1200],'shelf-a':[800,533],'shelf-b':[800,900],'soil-hand':[800,533],'soil-moss':[800,458],
  'soil-trowel':[800,533],'succ-orange':[800,533],'succ-white':[800,1035],'terra':[800,1200],'violet-a':[800,1000],'violet-b':[800,1067]
};

const products = [
  {id:'aroid-mix',name:'Aroid Mix',cat:'substrates',catName:'Субстрати',price:55,badge:'Хіт',image:'soil-trowel',second:'soil-hand',plantImage:'monstera-b',plantLabel:'монстери',mediaFilter:'saturate(.9) contrast(1.04)',gallery:['soil-trowel','monstera-b','shelf-a'],positions:['46% 50%','50% 55%','center'],desc:'Повітряний субстрат для монстер, філодендронів та інших ароїдних.',for:'Монстера, філодендрон, антуріум',recipe:[['Кора','30%'],['Перліт','25%'],['Кокос','25%'],['Цеоліт','20%']],variants:[['1 л',55],['3 л',145],['5 л',225]]},
  {id:'succulent-mix',name:'Субстрат для сукулентів',cat:'substrates',catName:'Субстрати',price:65,image:'soil-hand',second:'soil-moss',plantImage:'succ-white',plantLabel:'сукулентів',mediaFilter:'brightness(1.08) saturate(.82)',gallery:['soil-hand','succ-white','shelf-a'],positions:['58% 48%','52% 58%','center'],desc:'Структурний мікс, що допомагає воді не затримуватися надовго.',for:'Кактуси та сукуленти',recipe:[['Перліт','35%'],['Цеоліт','25%'],['Кокос','20%'],['Пісок','20%']],variants:[['1 л',65],['3 л',170]]},
  {id:'orchid-mix',name:'Субстрат для орхідей',cat:'substrates',catName:'Субстрати',price:80,image:'soil-moss',second:'soil-trowel',plantImage:'orchid-white',plantLabel:'орхідеї',mediaFilter:'brightness(.94) saturate(1.08)',gallery:['soil-moss','orchid-white','shelf-b'],positions:['50% 48%','50% 48%','center'],desc:'Крупна повітряна структура для коріння епіфітних орхідей.',for:'Фаленопсис та інші епіфітні орхідеї',recipe:[['Кора','55%'],['Кокос','20%'],['Перліт','15%'],['Цеоліт','10%']],variants:[['1 л',80],['3 л',210]]},
  {id:'violet-mix',name:'Субстрат для фіалок',cat:'substrates',catName:'Субстрати',price:60,image:'soil-trowel',second:'soil-moss',plantImage:'violet-a',plantLabel:'фіалки',mediaFilter:'brightness(1.03) sepia(.06)',gallery:['soil-trowel','violet-a','shelf-b'],positions:['62% 52%','52% 53%','center'],desc:'Легкий мікс для компактної кореневої системи сенполій.',for:'Фіалка, сенполія',recipe:[['Торф','35%'],['Кокос','30%'],['Перліт','25%'],['Цеоліт','10%']],variants:[['1 л',60],['3 л',155]]},
  {id:'universal-mix',name:'Універсальний субстрат',cat:'substrates',catName:'Субстрати',price:50,image:'soil-hand',second:'soil-trowel',mediaFilter:'brightness(1.02) saturate(.9)',gallery:['soil-hand','hero-alt','shelf-a'],positions:['45% 50%','50% 55%','center'],desc:'Базовий мікс для невибагливих декоративно-листяних рослин.',for:'Фікус, драцена, хлорофітум',recipe:[['Кокос','35%'],['Торф','30%'],['Перліт','20%'],['Кора','15%']],variants:[['1 л',50],['3 л',135],['5 л',205]]},
  {id:'wick-pot-12',name:'Гнотовий горщик 12 см',cat:'pots',catName:'Горщики',price:85,image:'pot-white',second:'shelf-a',gallery:['pot-white','pot-white','shelf-a'],positions:['50% 48%','63% 50%','center'],desc:'Компактний формат для молодих і невеликих рослин.',for:'Молоді рослини та фіалки',water:38,variants:[['12 см · 0,8 л',85],['12 см · 0,8 л + гніт',98]]},
  {id:'wick-pot-15',name:'Гнотовий горщик 15 см',cat:'pots',catName:'Горщики',price:105,badge:'Зручно',image:'pot-stand',second:'pot-white',gallery:['pot-stand','pot-white','shelf-a'],positions:['center','50% 44%','center'],desc:'Горщик із резервуаром, який допомагає рослині брати воду поступово.',for:'Для рослин, яким підходить гнотовий полив',water:48,variants:[['15 см · 1,3 л',105],['15 см · 1,3 л + гніт',120]]},
  {id:'wick-pot-18',name:'Гнотовий горщик 18 см',cat:'pots',catName:'Горщики',price:135,image:'pot-plant',second:'pot-white',gallery:['pot-plant','pot-white','shelf-a'],positions:['50% 58%','50% 44%','center'],desc:'Більший резервуар для дорослих рослин.',for:'Середні декоративно-листяні рослини',water:62,variants:[['18 см · 2,2 л',135],['18 см · 2,2 л + гніт',150]]},
  {id:'plant-food',name:'Добриво для рослин',cat:'care',catName:'Догляд',price:75,image:'soil-moss',second:'soil-hand',gallery:['soil-moss','soil-hand','shelf-a'],positions:['center','center','center'],desc:'Порційне пакування для спокійної рутини догляду.',for:'Домашні декоративні рослини',variants:[['30 г',75],['60 г',135]]},
  {id:'wick-refill',name:'Гніт запасний',cat:'care',catName:'Догляд',price:30,image:'soil-trowel',second:'pot-white',gallery:['soil-trowel','pot-white','shelf-b'],positions:['center','center','center'],desc:'Запасний гніт для системи нижнього поливу.',for:'Гнотові горщики',variants:[['1 м',30],['3 м',70]]},
  {id:'sprayer',name:'Обприскувач 300 мл',cat:'care',catName:'Догляд',price:145,image:'care-water',second:'shelf-b',gallery:['care-water','care-water','shelf-b'],positions:['45% 51%','60% 52%','center'],desc:'Лаконічний розпилювач для щоденного догляду.',for:'Догляд за листям',variants:[['300 мл',145]]},
  {id:'clay-drainage',name:'Дренаж-керамзит',cat:'care',catName:'Догляд',price:45,image:'terra',second:'soil-trowel',gallery:['terra','soil-trowel','shelf-a'],positions:['50% 52%','center','center'],desc:'Керамзит для дренажного шару та декоративних задач.',for:'Пересаджування рослин',variants:[['1 л',45],['3 л',110]]},
  {id:'monstera-young',name:'Монстера молода',cat:'plants',catName:'Рослини',price:260,image:'monstera-b',second:'hero-alt',gallery:['monstera-b','hero-alt','shelf-a'],positions:['50% 58%','center','center'],desc:'Демонстраційна рослина для майбутнього асортименту.',for:'Світле місце без прямого полуденного сонця',variants:[['Горщик 12 см',260]]}
];

const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const money = value => `${value} ₴`;
const photo = (name, alt, className = '', options = {}) => {
  const [width,height] = imageMeta[name];
  const loading = options.loading || 'lazy';
  const sizes = options.sizes || '(max-width: 640px) 50vw, (max-width: 1184px) 50vw, 25vw';
  const priority = options.priority ? ' fetchpriority="high"' : '';
  return `<picture class="${options.pictureClass || ''}"><source type="image/webp" srcset="${PHOTO}${name}-400.webp 400w, ${PHOTO}${name}-800.webp 800w, ${PHOTO}${name}-1600.webp 1600w" sizes="${sizes}"><img class="${className}" src="${PHOTO}${name}-800.webp" width="${width}" height="${height}" alt="${alt}" loading="${loading}" decoding="async"${priority}></picture>`;
};
const recipe = (product, compact = false) => product.recipe ? `<div class="formula-chips" aria-label="Демонстраційна рецептура">${product.recipe.map(([name,value])=>`<span class="formula-chip">${name}${compact?'':` <b>${value}</b>`}</span>`).join('')}</div>` : '';
const recipeCard = product => `<div class="recipe-top"><strong>Рецептура</strong><span>демо-склад</span></div>${recipe(product)}<div class="recipe-scale" aria-hidden="true">${'<i></i>'.repeat(10)}</div>`;
const substrateInset = (product, className = '') => product.cat === 'substrates' && product.plantImage ? `<span class="substrate-inset ${className}" data-product-inset>${photo(product.plantImage,'','',{sizes:'72px'})}<small>для: ${product.plantLabel}</small></span>` : '';
const galleryLabels = product => product.cat === 'substrates' ? ['Ґрунт','Рослина','В інтер’єрі'] : ['Основний вигляд','Деталь','В інтер’єрі'];

function productCard(product, index = 0) {
  const substrate = product.cat === 'substrates';
  return `<article class="product-card will-reveal ${substrate?'substrate-card':''}" data-price="${product.price}" style="--delay:${index * 70}ms">
    <div class="product-media" style="--object-position:${product.positions[0]};--media-filter:${product.mediaFilter || 'none'}"><a class="product-photo-link" href="#/product/${product.id}" aria-label="Переглянути ${product.name}">
      ${product.badge ? `<span class="badge ${product.badge==='Зручно'?'terra':''}">${product.badge}</span>` : ''}
      ${photo(product.image, `${substrate?'Фото ґрунту':'Рослина або матеріал'}, що ілюструє товар «${product.name}»`, 'primary-photo', {sizes:'(max-width: 640px) 50vw, (max-width: 1184px) 50vw, 25vw'})}
      ${photo(product.second, '', 'secondary-photo', {sizes:'(max-width: 640px) 50vw, (max-width: 1184px) 50vw, 25vw'})}
      ${substrateInset(product)}${product.water ? `<span class="water-gauge" style="--water:${product.water}%" aria-label="Візуальний індикатор рівня води"></span>` : ''}</a>
      <button class="card-add" type="button" data-add="${product.id}" aria-label="Додати ${product.name} у кошик">${icon('plus')}<span>У кошик</span></button>
    </div>
    <div class="card-body"><span class="card-kicker">${product.catName}</span><h3><a href="#/product/${product.id}">${product.name}</a></h3><p class="card-desc">${product.desc}</p><div class="card-foot"><span class="price">${money(product.price)}</span></div></div>
  </article>`;
}

function categoryTile(href, image, number, title, alt, className='') {
  const loading = Number(number) <= 2 ? 'eager' : 'lazy';
  return `<a class="category-tile photo-reveal ${className}" href="${href}">${photo(image, alt, '', {loading,sizes:'(max-width: 899px) 50vw, (max-width: 1199px) 50vw, 25vw'})}<span class="category-copy"><span><small>${number}</small><h3>${title}</h3></span><span class="category-arrow">${icon('arrow')}</span></span></a>`;
}

function pickerResult(product) {
  return `<div class="picker-result-media" style="--media-filter:${product.mediaFilter || 'none'}">${photo(product.image, `Фото ґрунту для ${product.name}`, '', {sizes:'(max-width: 900px) 100vw, 45vw'})}${substrateInset(product,'picker-product-inset')}</div><div class="picker-result-copy"><span class="eyebrow">Рекомендуємо</span><h3>${product.name}</h3><p>${product.desc}</p>${recipe(product)}<a class="btn btn-forest" href="#/product/${product.id}">До товару ${icon('arrow')}</a></div>`;
}

function consultation() {
  return `<section class="consult-section" data-block-id="consultation"><div class="consult-card photo-reveal">${photo('moody','Темно-зелене листя монстери у м’якому світлі','parallax-photo',{sizes:'100vw'})}<div class="consult-copy"><div><span class="eyebrow light">Можна просто запитати</span><h2>Не знаєш, що обрати?</h2><p>Опиши рослину й те, що турбує. Допоможемо знайти спокійний наступний крок.</p></div><a class="btn btn-paper" href="https://t.me/+7pbW6uPOpOZmZTM6" target="_blank" rel="noopener">Безкоштовна консультація ${icon('arrow')}</a></div></div></section>`;
}

function delivery() {
  return `<section class="delivery-strip" data-block-id="delivery"><div class="shell delivery-row"><article class="delivery-item">${icon('truck')}<div><h3>Новою поштою по Україні</h3><p>Спосіб і умови доставки обереш під час оформлення.</p></div></article><article class="delivery-item">${icon('drop')}<div><h3>Оплата без сюрпризів</h3><p>Доступні способи оплати будуть показані перед підтвердженням.</p></div></article></div></section>`;
}

function home() {
  const values = ['Авторські субстрати','Підбір під конкретну рослину','Гнотовий полив без вгадування','Доставка по Україні'];
  const marquee = [...values,...values].map(value=>`<span class="marquee-item">${icon('leaf')}${value}</span>`).join('');
  return `<div class="page-transition">
    <section class="hero-stage" data-block-id="hero">
      <div class="hero-media">${photo('hero-monstera','Монстера в керамічному горщику біля теплого вікна','',{loading:'eager',priority:true,sizes:'(max-width: 900px) 100vw, 61vw'})}</div>
      <div class="hero-copy"><span class="eyebrow">Авторські рішення для рослин</span><h1><span class="hero-line"><span>Рослинам</span></span><span class="hero-line"><span>потрібен</span></span><span class="hero-line hero-line-accent"><span><em>правильний ґрунт.</em></span></span></h1><p class="hero-intro">Субстрати, гнотові горщики й догляд, у яких легко розібратися. Допоможемо обрати саме для твоєї рослини.</p><div class="hero-actions"><a class="btn btn-forest magnetic" href="#/catalog">До магазину ${icon('arrow')}</a><a class="btn magnetic" href="#picker">Підібрати субстрат</a></div></div>
      <div class="hero-recipe">${recipeCard(products[0])}</div>
      <a class="hero-consult" href="https://t.me/+7pbW6uPOpOZmZTM6" target="_blank" rel="noopener">${icon('chat')}<small>Не знаєш, що обрати?</small><strong>Безкоштовна консультація</strong></a>
    </section>
    <div class="value-marquee" aria-label="Наші цінності"><div class="marquee-track">${marquee}</div></div>
    <section class="section" data-block-id="categories"><div class="shell"><div class="section-head will-reveal"><div><span class="eyebrow">Магазин за потребою</span><h2>З чого почнемо?</h2></div><p>Обирай не за складною термінологією, а за тим, що зараз потрібно твоїй рослині.</p></div><div class="category-grid">
      ${categoryTile('#/catalog/substrates','soil-trowel','01','Субстрати','Совок із пухким субстратом на робочій поверхні')}
      ${categoryTile('#/catalog/pots','pot-white','02','Горщики','Білий текстурований горщик із зеленою рослиною')}
      ${categoryTile('#/catalog/care','care-water','03','Догляд','Жовта лійка поливає рослину в зеленому горщику')}
      ${categoryTile('#/catalog/plants','monstera-b','04','Рослини','Молода монстера у світлому керамічному горщику')}
    </div></div></section>
    <section class="section picker-section" id="picker" data-block-id="substrate-picker"><div class="shell"><div class="picker-heading will-reveal"><div><span class="eyebrow light">Підбір без тривоги</span><h2>Хто живе у твоєму горщику?</h2></div><p>Обери тип рослини — покажемо базову рекомендацію. Фінальний склад рецептури буде замінено підтвердженими даними Ярини.</p></div><div class="picker-layout"><div class="plant-options">${[['aroid-mix','Монстера / ароїдні'],['universal-mix','Фікус'],['succulent-mix','Сукулент / кактус'],['orchid-mix','Орхідея'],['violet-mix','Фіалка / сенполія']].map(([id,label],i)=>`<button class="plant-option ${i===0?'active':''}" type="button" data-pick="${id}" aria-pressed="${i===0}"><span>0${i+1}</span>${label}</button>`).join('')}</div><div class="picker-result" data-picker-result aria-live="polite">${pickerResult(products[0])}</div></div></div></section>
    <section class="section" data-block-id="bestsellers"><div class="shell"><div class="section-head will-reveal"><div><span class="eyebrow">Найчастіше обирають</span><h2>Спокійний старт</h2></div><p>Чотири рішення, з яких легко почати: ґрунт, полив і базова рутина догляду.</p></div><div class="product-grid">${[products[0],products[6],products[8],products[1]].map(productCard).join('')}</div></div></section>
    <section class="section wick-section" data-block-id="wick-story"><div class="shell wick-layout"><div class="wick-media photo-reveal">${photo('pot-white','Білий текстурований горщик із рослиною на підвіконні','',{sizes:'(max-width: 900px) 100vw, 55vw'})}<span class="water-gauge" style="--water:35%" data-story-gauge aria-label="Рівень води змінюється під час прокручування"></span></div><div class="wick-copy"><span class="eyebrow">Полив без вгадування</span><h2>Як працює гнотовий горщик</h2><div class="story-steps"><article class="story-step active" data-story-step data-level="35"><span>01</span><div><h3>Налий воду</h3><p>Вода залишається в нижньому резервуарі, а не заливає субстрат зверху.</p></div></article><article class="story-step" data-story-step data-level="62"><span>02</span><div><h3>Гніт проведе вологу</h3><p>Система подає її поступово, підтримуючи рівніший ритм поливу.</p></div></article><article class="story-step" data-story-step data-level="82"><span>03</span><div><h3>Перевіряй шкалу</h3><p>Видимий рівень допомагає зрозуміти, коли резервуар час поповнити.</p></div></article></div></div></div></section>
    <section class="section founder-section" data-block-id="founder"><div class="shell founder-layout"><div class="founder-media photo-reveal"><div class="founder-media-main">${photo('soil-moss','Руки тримають молоду зелену рослину над природним ґрунтом','parallax-photo',{sizes:'(max-width: 900px) 100vw, 58vw'})}</div><blockquote class="founder-media-note">«Допомагаю виростити здорові рослини»</blockquote></div><div class="founder-copy will-reveal"><span class="eyebrow">Ярина Гавришко</span><h2>Турбота, яку легко повторити</h2><p>У «Процвітай» вибір починається не з продажу, а з розуміння рослини. Ярина пояснює догляд живою мовою та допомагає знайти рішення без зайвої тривоги.</p><div class="instagram-proof"><strong data-instagram-count="16.4">16,4</strong><span>тис. читачів в Instagram</span></div><div class="social-links"><a href="https://instagram.com/procvitai" target="_blank" rel="noopener">Instagram ↗</a><a href="https://tiktok.com/@yaryna.havryshko" target="_blank" rel="noopener">TikTok ↗</a><a href="https://facebook.com/share/1KN7esMFcB/" target="_blank" rel="noopener">Facebook ↗</a><a href="https://t.me/+7pbW6uPOpOZmZTM6" target="_blank" rel="noopener">Telegram ↗</a></div></div></div></section>
    ${consultation()}${delivery()}
  </div>`;
}

function catalog(category = 'all') {
  const filtered = category === 'all' ? products : products.filter(product=>product.cat===category);
  return `<div class="page-transition"><header class="page-hero"><div class="shell page-hero-grid"><div><span class="eyebrow">Магазин рослинних рішень</span><h1>Обери своє</h1><p class="lead">Субстрати, горщики й догляд — з чітким поясненням, кому та для чого вони підійдуть.</p></div><div class="page-hero-media photo-reveal">${photo('shelf-a','Світлий інтер’єр із домашньою колекцією рослин','',{loading:'eager',sizes:'(max-width: 900px) 100vw, 42vw'})}</div></div></header><section class="catalog-wrap"><div class="shell"><div class="catalog-toolbar"><div class="chips">${[['all','Усі'],['substrates','Субстрати'],['pots','Горщики'],['care','Догляд'],['plants','Рослини']].map(([id,label])=>`<a class="chip ${id===category?'active':''}" href="#/catalog${id==='all'?'':'/'+id}">${label}</a>`).join('')}</div><label class="sort-wrap">Сортування <select data-sort><option value="featured">Рекомендовані</option><option value="low">Ціна: від нижчої</option><option value="high">Ціна: від вищої</option></select></label></div><p class="catalog-meta">${filtered.length} товарів · демонстраційні дані</p><div class="product-grid catalog-grid" data-catalog-grid>${filtered.map(productCard).join('')}</div><p class="catalog-note">Фото для ілюстрації. Реальні фото товару додамо з вашого каталогу.</p></div></section>${consultation()}</div>`;
}

function accordion(title, content, open = false) {
  const id = `acc-${title.toLowerCase().replace(/[^а-яіїєa-z0-9]+/gi,'-')}`;
  return `<div class="accordion"><button class="accordion-trigger" type="button" aria-expanded="${open}" aria-controls="${id}" data-accordion>${title}${icon('plus')}</button><div class="accordion-panel" id="${id}" ${open?'':'hidden'}><p>${content}</p></div></div>`;
}

function pdp(product) {
  if (!product) return notFound();
  pdpState = {variant:0,qty:1};
  const labels = galleryLabels(product);
  const main = photo(product.gallery[0],`Ілюстративне фото для товару «${product.name}»`,'',{loading:'eager',priority:true,sizes:'(max-width: 900px) 100vw, 58vw'});
  return `<div class="page-transition"><section class="pdp"><div class="shell pdp-grid"><div class="pdp-gallery"><div class="gallery-main" data-gallery-main style="--gallery-position:${product.positions[0]};--gallery-filter:${product.mediaFilter || 'none'}">${main}${substrateInset(product,'gallery-product-inset')}<span class="gallery-caption" data-gallery-caption>${product.cat==='substrates'?'Фото ґрунту для ілюстрації. Реальні фото товару додамо з вашого каталогу.':'Фото для ілюстрації. Реальні фото товару додамо з вашого каталогу.'}</span></div><div class="gallery-thumbs">${product.gallery.map((image,index)=>`<button class="gallery-thumb ${index===0?'active':''}" type="button" data-gallery="${index}" aria-label="${labels[index]}" aria-pressed="${index===0}">${photo(image,'','',{sizes:'12vw'})}</button>`).join('')}</div><p class="gallery-disclosure">Галерея показує настрій і контекст використання, а не точну упаковку конкретного SKU.</p></div><div class="pdp-info"><nav class="breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="#/catalog">Магазин</a> / <a href="#/catalog/${product.cat}">${product.catName}</a></nav><span class="eyebrow">${product.catName}</span><h1>${product.name}</h1><p class="pdp-lede">${product.desc}</p><div class="pdp-price" data-pdp-price>${money(product.variants[0][1])}</div><div class="option-group"><span>Обʼєм / розмір</span><div class="variant-options">${product.variants.map(([label],index)=>`<button class="variant-btn ${index===0?'active':''}" type="button" data-variant="${index}" aria-pressed="${index===0}">${label}</button>`).join('')}</div></div><div class="buy-row"><div class="qty"><button type="button" data-qty="-1" aria-label="Зменшити кількість">${icon('minus')}</button><output data-qty-output>1</output><button type="button" data-qty="1" aria-label="Збільшити кількість">${icon('plus')}</button></div><button class="btn btn-forest" type="button" data-pdp-add="${product.id}">Додати в кошик ${icon('plus')}</button></div>${product.recipe?`<section class="recipe-box"><div class="recipe-box-head"><h2>Склад рецептури</h2><small>Демо-рецептура · замінити даними клієнта</small></div>${recipe(product)}</section>`:''}<div class="pdp-accordions">${accordion('Склад',product.recipe?'Компоненти в блоці рецептури наведено як демонстраційний приклад і буде замінено підтвердженим складом.':'Точний склад і матеріали буде перенесено з каталогу клієнта.',true)}${accordion('Для яких рослин',product.for)}${accordion('Доставка','Відправлення Новою поштою по Україні. Точні умови й доступні способи оплати буде показано під час оформлення.')}</div></div></div></section><section class="related"><div class="shell"><div class="section-head"><div><span class="eyebrow">Може знадобитися</span><h2>Додай до догляду</h2></div></div><div class="product-grid">${products.filter(item=>item.id!==product.id).slice(0,4).map(productCard).join('')}</div></div></section><div class="mobile-buybar"><span class="price" data-mobile-price>${money(product.variants[0][1])}</span><button class="btn btn-forest" type="button" data-pdp-add="${product.id}">Додати ${icon('plus')}</button></div></div>`;
}

function simplePage(type) {
  if (type === 'about') return `<div class="page-transition"><section class="editorial-page"><div class="shell"><div class="editorial-hero"><div><span class="eyebrow">Про Ярину</span><h1>Догляд стає зрозумілим</h1></div><p class="lead">«Процвітай» продовжує розмову, яку Ярина веде у соцмережах: спочатку розібратися в потребі рослини, потім — обрати рішення.</p></div><div class="editorial-media photo-reveal">${photo('soil-moss','Руки дбайливо тримають молоду рослину','parallax-photo',{loading:'eager',sizes:'100vw'})}</div><div class="editorial-body"><blockquote class="editorial-quote">«Допомагаю виростити здорові рослини»</blockquote><div><p>Ярина Гавришко ділиться досвідом догляду, пояснює складні речі живою мовою та відповідає на запитання спільноти. Магазин виростає з тієї ж довіри — через авторські субстрати, гнотові горщики й допомогу з вибором.</p><div class="social-links"><a href="https://instagram.com/procvitai" target="_blank" rel="noopener">Instagram ↗</a><a href="https://tiktok.com/@yaryna.havryshko" target="_blank" rel="noopener">TikTok ↗</a><a href="https://t.me/+7pbW6uPOpOZmZTM6" target="_blank" rel="noopener">Telegram ↗</a></div></div></div></div></section>${consultation()}</div>`;
  return `<div class="page-transition"><section class="editorial-page"><div class="shell"><div class="editorial-hero"><div><span class="eyebrow">Контакти</span><h1>Завжди можна запитати</h1></div><p class="lead">Опиши рослину й ситуацію — підкажемо, з чого почати.</p></div><div class="editorial-body"><div class="editorial-media photo-reveal">${photo('shelf-b','Світла домашня полиця з колекцією рослин','',{loading:'eager',sizes:'(max-width: 900px) 100vw, 45vw'})}</div><div class="contact-list"><a href="https://instagram.com/procvitai" target="_blank" rel="noopener"><span>Instagram</span><span>@procvitai ↗</span></a><a href="https://tiktok.com/@yaryna.havryshko" target="_blank" rel="noopener"><span>TikTok</span><span>@yaryna.havryshko ↗</span></a><a href="https://facebook.com/share/1KN7esMFcB/" target="_blank" rel="noopener"><span>Facebook</span><span>Відкрити ↗</span></a><a href="https://t.me/+7pbW6uPOpOZmZTM6" target="_blank" rel="noopener"><span>Telegram</span><span>Написати ↗</span></a></div></div></div></section></div>`;
}

function notFound() { return `<section class="editorial-page page-transition"><div class="shell"><span class="eyebrow">404</span><h1>Тут нічого не росте</h1><p>Повернімося до магазину.</p><a class="btn btn-forest" href="#/catalog">До магазину ${icon('arrow')}</a></div></section>`; }

const app = document.querySelector('#app');
const header = document.querySelector('[data-site-header]');
const drawer = document.querySelector('[data-cart-drawer]');
const scrim = document.querySelector('[data-scrim]');
const searchPanel = document.querySelector('[data-search-panel]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
let cart = [];
try { cart = JSON.parse(localStorage.getItem('procvitai-cart') || '[]'); } catch { cart = []; }
let pdpState = {variant:0,qty:1};
let lastFocus = null;
let toastTimer = null;
let renderTimer = null;
let revealObserver = null;
let revealItems = new Set();
let revealRaf = 0;
let revealSafetyTimer = null;
let heroSafetyTimer = null;
let counterStarted = false;
let pickerTimer = null;

function currentRoute() { return location.hash.slice(1) || '/'; }
function currentProduct() { return products.find(product=>product.id===currentRoute().split('/').filter(Boolean).at(-1)); }
function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 24); header.classList.toggle('is-solid', currentRoute() !== '/'); }

function renderNow() {
  const bits = currentRoute().split('/').filter(Boolean);
  document.documentElement.classList.remove('page-ready','hero-complete');
  clearTimeout(heroSafetyTimer);
  if (!bits.length) app.innerHTML = home();
  else if (bits[0] === 'catalog') app.innerHTML = catalog(bits[1] || 'all');
  else if (bits[0] === 'product') app.innerHTML = pdp(products.find(product=>product.id===bits[1]));
  else if (bits[0] === 'about' || bits[0] === 'contacts') app.innerHTML = simplePage(bits[0]);
  else app.innerHTML = notFound();
  document.title = bits[0] === 'product' ? `${currentProduct()?.name || 'Товар'} · Процвітай` : bits[0] === 'catalog' ? 'Магазин · Процвітай' : bits[0] === 'about' ? 'Про Ярину · Процвітай' : bits[0] === 'contacts' ? 'Контакти · Процвітай' : 'Процвітай · авторські субстрати й турбота про рослини';
  window.scrollTo({top:0,behavior:'instant'});
  updateHeader(); updateNav(); bindPage(); setupMotion();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.documentElement.classList.add('page-ready');
    finalizeHero();
  }));
}

function finalizeHero() {
  const lastLine = app.querySelector('.hero-line:last-child > span');
  const done = () => {
    clearTimeout(heroSafetyTimer);
    document.documentElement.classList.add('hero-complete');
  };
  if (!lastLine) { done(); return; }
  lastLine.addEventListener('animationend',done,{once:true});
  heroSafetyTimer = setTimeout(done,2000);
}

function updateNav() {
  const route = currentRoute();
  document.querySelectorAll('.desktop-nav a').forEach(link=>link.setAttribute('aria-current', route.startsWith(link.getAttribute('href').slice(1)) ? 'page' : 'false'));
}

function setupMotion() {
  const items = [...app.querySelectorAll('.will-reveal,.photo-reveal')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  clearTimeout(revealSafetyTimer);
  revealObserver?.disconnect();
  revealItems = new Set(items);
  counterStarted = false;
  items.forEach((item,index)=>{
    const authoredDelay = Number.parseFloat(item.style.getPropertyValue('--delay'));
    item.style.transitionDelay = `${Number.isFinite(authoredDelay) ? Math.min(authoredDelay,350) : Math.min(index % 4,3) * 70}ms`;
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(revealItem);
    startCounter(true);
    document.documentElement.classList.add('motion-ready');
    updateScrollEffects();
    return;
  }

  revealObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{ if (entry.isIntersecting) revealItem(entry.target); });
  },{threshold:0,rootMargin:'0px 0px -6% 0px'});
  revealItems.forEach(item=>revealObserver.observe(item));
  revealVisibleItems();
  document.documentElement.classList.add('motion-ready');
  revealSafetyTimer = setTimeout(()=>{
    revealItems.forEach(revealItem);
    startCounter(true);
  },2000);
  updateScrollEffects();
}

function revealItem(item) {
  if (!item) return;
  item.classList.add('is-visible');
  revealObserver?.unobserve(item);
  revealItems.delete(item);
}

function revealVisibleItems() {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  revealItems.forEach(item=>{
    if (!item.isConnected) { revealItems.delete(item); return; }
    if (item.getBoundingClientRect().top <= viewportHeight) revealItem(item);
  });
  startCounter(false);
}

function scheduleRevealCheck() {
  if (revealRaf) return;
  revealRaf = requestAnimationFrame(()=>{ revealRaf=0; revealVisibleItems(); });
}

function startCounter(immediate = false) {
  const counter = app.querySelector('[data-instagram-count]');
  if (!counter || counterStarted) return;
  const rect = counter.getBoundingClientRect();
  if (!immediate && rect.top > (window.innerHeight || document.documentElement.clientHeight)) return;
  counterStarted = true;
  counter.textContent = immediate ? '16,4' : '0';
  if (immediate) return;
  const start=performance.now();
  const run=now=>{ const p=Math.min(1,(now-start)/900); const value=16.4*(1-Math.pow(1-p,3)); counter.textContent=value.toFixed(1).replace('.',','); if(p<1) requestAnimationFrame(run); };
  requestAnimationFrame(run);
}

function updateScrollEffects() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  app.querySelectorAll('.parallax-photo').forEach(image=>{ const rect=image.getBoundingClientRect(); const amount=Math.max(-18,Math.min(18,(innerHeight/2-(rect.top+rect.height/2))*.035)); image.style.setProperty('--parallax',`${amount}px`); });
  const steps = [...app.querySelectorAll('[data-story-step]')];
  if (steps.length) {
    let active = steps[0]; let best = Infinity;
    steps.forEach(step=>{ const distance=Math.abs(step.getBoundingClientRect().top-innerHeight*.42); if(distance<best){best=distance;active=step;} });
    steps.forEach(step=>step.classList.toggle('active',step===active));
    const gauge=app.querySelector('[data-story-gauge]'); if(gauge) gauge.style.setProperty('--water',`${active.dataset.level}%`);
  }
}

function bindPage() {
  app.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();addToCart(button.dataset.add);}));
  app.querySelectorAll('[data-pdp-add]').forEach(button=>button.addEventListener('click',()=>addToCart(button.dataset.pdpAdd,pdpState.qty,pdpState.variant)));
  app.querySelectorAll('[data-pick]').forEach(button=>button.addEventListener('click',()=>{
    app.querySelectorAll('[data-pick]').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',item===button)});
    const result=app.querySelector('[data-picker-result]');
    clearTimeout(pickerTimer);
    result.classList.add('is-switching');
    pickerTimer=setTimeout(()=>{
      result.innerHTML=pickerResult(products.find(product=>product.id===button.dataset.pick));
      requestAnimationFrame(()=>result.classList.remove('is-switching'));
    },180);
  }));
  app.querySelectorAll('[data-variant]').forEach(button=>button.addEventListener('click',()=>{ pdpState.variant=Number(button.dataset.variant); app.querySelectorAll('[data-variant]').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',item===button)}); const value=currentProduct().variants[pdpState.variant][1]; app.querySelector('[data-pdp-price]').textContent=money(value); app.querySelector('[data-mobile-price]').textContent=money(value); }));
  app.querySelectorAll('[data-qty]').forEach(button=>button.addEventListener('click',()=>{pdpState.qty=Math.max(1,pdpState.qty+Number(button.dataset.qty));app.querySelector('[data-qty-output]').textContent=pdpState.qty;}));
  app.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>switchGallery(button)));
  app.querySelectorAll('[data-accordion]').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));document.getElementById(button.getAttribute('aria-controls')).hidden=open;}));
  const sort=app.querySelector('[data-sort]'); if(sort) sort.addEventListener('change',()=>sortCatalog(sort.value));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) app.querySelectorAll('.magnetic').forEach(button=>{button.addEventListener('pointermove',event=>{const rect=button.getBoundingClientRect();button.style.transform=`translate(${(event.clientX-rect.left-rect.width/2)*.05}px,${(event.clientY-rect.top-rect.height/2)*.05}px)`});button.addEventListener('pointerleave',()=>button.style.transform='');});
}

function switchGallery(button) {
  const product=currentProduct(); const index=Number(button.dataset.gallery); const target=app.querySelector('[data-gallery-main]');
  app.querySelectorAll('[data-gallery]').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',item===button)});
  target.style.setProperty('--gallery-position',product.positions[index] || 'center');
  target.style.setProperty('--gallery-filter',index===0 ? product.mediaFilter || 'none' : 'none');
  const caption=target.querySelector('[data-gallery-caption]');
  target.querySelector(':scope > picture').outerHTML=photo(product.gallery[index],`Ілюстративне фото: ${product.name}, ${galleryLabels(product)[index].toLowerCase()}`,'',{loading:'eager',sizes:'(max-width: 900px) 100vw, 58vw'});
  target.querySelector('[data-product-inset]')?.remove();
  if (index === 0 && product.plantImage) caption.insertAdjacentHTML('beforebegin',substrateInset(product,'gallery-product-inset'));
  caption.textContent=index===2?'Фото в інтер’єрі для ілюстрації. Реальні фото товару додамо з вашого каталогу.':product.cat==='substrates'&&index===0?'Фото ґрунту для ілюстрації. Реальні фото товару додамо з вашого каталогу.':'Фото рослини або товару для ілюстрації. Реальні фото додамо з вашого каталогу.';
}

function sortCatalog(mode) {
  const grid=app.querySelector('[data-catalog-grid]'); const cards=[...grid.children];
  if(mode!=='featured') cards.sort((a,b)=>mode==='low'?Number(a.dataset.price)-Number(b.dataset.price):Number(b.dataset.price)-Number(a.dataset.price));
  cards.forEach(card=>{card.classList.add('is-visible');grid.append(card)});
}

function addToCart(id, qty=1, variant=0) {
  const product=products.find(item=>item.id===id); const key=`${id}:${variant}`; const line=cart.find(item=>item.key===key);
  if(line) line.qty+=qty; else cart.push({key,id,variant,qty});
  saveCart(); const trigger=document.querySelector('[data-cart-open]');trigger.classList.remove('bump');void trigger.offsetWidth;trigger.classList.add('bump');showToast(product);
}
function saveCart(){localStorage.setItem('procvitai-cart',JSON.stringify(cart));updateCart();}
function updateCart(){
  document.querySelector('.cart-count').textContent=cart.reduce((sum,item)=>sum+item.qty,0);
  const lines=document.querySelector('[data-cart-lines]'); const summary=document.querySelector('[data-cart-summary]'); let total=0;
  if(!cart.length){lines.innerHTML=`<div class="empty-cart">${icon('leaf')}<h3>Кошик поки порожній</h3><p>Знайди рішення для своєї рослини.</p><a class="btn" href="#/catalog" data-cart-close>До магазину</a></div>`;summary.innerHTML='';return;}
  lines.innerHTML=cart.map((item,index)=>{const product=products.find(entry=>entry.id===item.id);const variant=product.variants[item.variant];const sum=variant[1]*item.qty;total+=sum;return `<article class="cart-line" data-cart-line="${index}"><img src="${PHOTO}${product.image}-400.webp" width="400" height="${Math.round(imageMeta[product.image][1]/2)}" alt=""><div><h3>${product.name}</h3><p>${variant[0]}</p><div class="line-qty"><button type="button" data-line="${index}" data-delta="-1" aria-label="Зменшити кількість">−</button><span>${item.qty}</span><button type="button" data-line="${index}" data-delta="1" aria-label="Збільшити кількість">+</button><button class="line-remove" type="button" data-remove="${index}">видалити</button></div></div><span class="line-price">${money(sum)}</span></article>`}).join('');
  summary.innerHTML=`<div class="total-row"><span>Разом</span><strong>${money(total)}</strong></div><button class="btn btn-forest" type="button" data-checkout>Оформити замовлення ${icon('arrow')}</button><small>Доставка й оплата уточнюються під час оформлення</small>`;
  drawer.querySelectorAll('[data-line]').forEach(button=>button.addEventListener('click',()=>{const item=cart[Number(button.dataset.line)];item.qty+=Number(button.dataset.delta);if(item.qty<1)cart.splice(Number(button.dataset.line),1);saveCart();}));
  drawer.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.remove);const row=drawer.querySelector(`[data-cart-line="${index}"]`);row.classList.add('removing');setTimeout(()=>{cart.splice(index,1);saveCart();},240);}));
  drawer.querySelector('[data-checkout]').addEventListener('click',openModal);
}

function showToast(product){const toast=document.querySelector('[data-toast]');toast.innerHTML=`<img src="${PHOTO}${product.image}-400.webp" alt=""><span>${product.name}<small>Додано у кошик</small></span>`;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);}

function setBackgroundInert(active){[app,header,document.querySelector('.site-footer')].forEach(element=>element.inert=active);}
function openCart(){closeMenu(false);closeSearch(false);lastFocus=document.activeElement;updateCart();scrim.hidden=false;requestAnimationFrame(()=>scrim.classList.add('visible'));drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('locked');setBackgroundInert(true);drawer.querySelector('[data-cart-close]').focus();}
function closeCart(restore=true){if(!drawer.classList.contains('open'))return;drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');scrim.classList.remove('visible');setTimeout(()=>scrim.hidden=true,300);document.body.classList.remove('locked');setBackgroundInert(false);if(restore)lastFocus?.focus();}
function openMenu(){closeCart(false);closeSearch(false);lastFocus=document.activeElement;mobileMenu.classList.add('open');mobileMenu.setAttribute('aria-hidden','false');document.querySelector('[data-menu-open]').setAttribute('aria-expanded','true');document.body.classList.add('locked');setBackgroundInert(true);mobileMenu.querySelector('[data-menu-close]').focus();}
function closeMenu(restore=true){if(!mobileMenu.classList.contains('open'))return;mobileMenu.classList.remove('open');mobileMenu.setAttribute('aria-hidden','true');document.querySelector('[data-menu-open]').setAttribute('aria-expanded','false');document.body.classList.remove('locked');setBackgroundInert(false);if(restore)lastFocus?.focus();}
function openSearch(){closeCart(false);closeMenu(false);lastFocus=document.activeElement;searchPanel.classList.add('open');searchPanel.setAttribute('aria-hidden','false');document.body.classList.add('locked');setBackgroundInert(true);searchPanel.querySelector('input').focus();}
function closeSearch(restore=true){if(!searchPanel.classList.contains('open'))return;searchPanel.classList.remove('open');searchPanel.setAttribute('aria-hidden','true');document.body.classList.remove('locked');setBackgroundInert(false);if(restore)lastFocus?.focus();}
function openModal(){closeCart(false);const wrap=document.querySelector('[data-modal-wrap]');wrap.hidden=false;document.body.classList.add('locked');setBackgroundInert(true);wrap.querySelector('[data-modal-close]').focus();}
function closeModal(){const wrap=document.querySelector('[data-modal-wrap]');if(wrap.hidden)return;wrap.hidden=true;document.body.classList.remove('locked');setBackgroundInert(false);lastFocus?.focus();}

function activeDialog(){const modal=document.querySelector('[data-modal-wrap]');if(!modal.hidden)return modal;if(drawer.classList.contains('open'))return drawer;if(mobileMenu.classList.contains('open'))return mobileMenu;if(searchPanel.classList.contains('open'))return searchPanel;return null;}
function trapFocus(event){const box=activeDialog();if(!box||event.key!=='Tab')return;const focusable=[...box.querySelectorAll('a[href],button:not([disabled]),input,select')].filter(element=>element.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}

document.addEventListener('click',event=>{
  if(event.target.closest('[data-cart-open]'))openCart();
  if(event.target.closest('[data-cart-close]'))closeCart();
  if(event.target.closest('[data-menu-open]'))openMenu();
  if(event.target.closest('[data-menu-close]'))closeMenu();
  if(event.target.closest('[data-search-open]'))openSearch();
  if(event.target.closest('[data-search-close]'))closeSearch();
  if(event.target.closest('[data-modal-close]'))closeModal();
  if(event.target.closest('.mobile-menu a'))closeMenu(false);
  if(event.target.closest('.search-results a'))closeSearch(false);
});
scrim.addEventListener('click',()=>closeCart());
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeCart();closeMenu();closeSearch();closeModal();}trapFocus(event);});
document.querySelector('#site-search').addEventListener('input',event=>{const query=event.target.value.toLowerCase().trim();const results=query?products.filter(product=>`${product.name} ${product.catName} ${product.for}`.toLowerCase().includes(query)).slice(0,6):[];document.querySelector('[data-search-results]').innerHTML=results.length?results.map(product=>`<a href="#/product/${product.id}"><span>${product.name}</span><strong>${money(product.price)}</strong></a>`).join(''):query?'<p>Нічого не знайшли. Спробуй назву рослини або категорії.</p>':'<p>Почни з назви рослини або категорії.</p>';});
window.addEventListener('scroll',()=>{updateHeader();updateScrollEffects();scheduleRevealCheck();},{passive:true});
window.addEventListener('resize',scheduleRevealCheck,{passive:true});
window.addEventListener('hashchange',()=>{
  closeCart(false);closeMenu(false);closeSearch(false);app.classList.add('page-leaving');scheduleRevealCheck();clearTimeout(renderTimer);
  renderTimer=setTimeout(()=>{app.classList.remove('page-leaving');renderNow();scheduleRevealCheck();},150);
});
updateCart();renderNow();
