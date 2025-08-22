// Простое расширение для замены слов на смайлики 7TV
console.log('7TV Smiles загружено!');

// ID набора смайлов с 7TV
const SET_ID = '01GE9SQ9KR0006MCY6R6BPT998';
const API_URL = `https://7tv.io/v3/emote-sets/${SET_ID}`;

// Хранилище эмотов
let emotes = {};

// Загружаем смайлы из API 7tv
async function loadEmotesFromAPI() {
  try {
    console.log('Загружаем смайлики с:', API_URL);
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Ошибка загрузки API: ${res.status}`);

    const data = await res.json();
    const parsed = {};

    for (const e of data.emotes) {
      // Берём имя и ссылку на смайл (2x webp)
      const name = e.name;
      const url = `https:${e.data.host.url}/2x.webp`;
      parsed[name] = url;
    }

    emotes = { ...emotes, ...parsed };
    console.log('Загружено смайликов:', Object.keys(parsed).length);

    // Отладочная информация - показываем все эмодзи, содержащие 'xd' (в любом регистре)
    const xdEmotes = Object.keys(parsed).filter((name) =>
      name.toLowerCase().includes('xd')
    );
    if (xdEmotes.length > 0) {
      console.log('Эмодзи с "xd":', xdEmotes);
    }
  } catch (err) {
    console.error('Ошибка при загрузке эмотов:', err);
  }
}

// Создание regex для поиска
function createEmoteRegex(emoteName) {
  const escaped = emoteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Для смайликов из скобок используем специальный паттерн
  if (/^[()]+$/.test(emoteName)) {
    // Для скобок используем позитивный lookbehind и lookahead
    // чтобы убедиться, что это отдельный смайлик, а не часть слова
    return new RegExp(`(?<!\\S)${escaped}(?!\\S)`, 'g'); // Убираем флаг 'i'
  }

  // Для обычных смайликов используем границы слов
  return new RegExp(`\\b${escaped}\\b`, 'g'); // Убираем флаг 'i' для чувствительности к регистру
}

// Замена текста на смайлы, чтобы картинки вставлялись в ту же строку, если влазят
function replaceEmotes(root = document.body) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    // Пропускаем, если родитель уже содержит теги img (чтобы не дублировать)
    if (
      node.parentNode &&
      (node.parentNode.tagName === 'SCRIPT' ||
        node.parentNode.tagName === 'STYLE' ||
        node.parentNode.closest('img'))
    ) {
      continue;
    }

    let text = node.textContent;
    let hasEmote = false;

    // Проверяем, есть ли хотя бы одно совпадение
    for (const [emoteName, emoteUrl] of Object.entries(emotes)) {
      const regex = createEmoteRegex(emoteName);
      if (regex.test(text)) {
        hasEmote = true;
        break;
      }
    }

    if (!hasEmote) continue;

    // Разбиваем текст на части, чтобы вставлять картинки "инлайново"
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let str = text;

    // Собираем все совпадения по всем эмотам
    // Для корректного порядка собираем все совпадения в массив
    let matches = [];
    for (const [emoteName, emoteUrl] of Object.entries(emotes)) {
      const regex = createEmoteRegex(emoteName);
      let match;
      while ((match = regex.exec(str)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          emoteName: match[0], // Сохраняем фактически найденный текст
          emoteUrl,
        });
      }
    }

    // Сортируем совпадения по индексу появления
    matches.sort((a, b) => a.index - b.index);

    // Если нет совпадений, ничего не делаем
    if (matches.length === 0) continue;

    let currentPos = 0;
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      // Если совпадение перекрывается с предыдущим, пропускаем
      if (m.index < currentPos) continue;

      // Добавляем текст до эмота
      if (m.index > currentPos) {
        fragment.appendChild(
          document.createTextNode(str.slice(currentPos, m.index))
        );
      }

      // Создаём img для эмота
      const img = document.createElement('img');
      img.src = m.emoteUrl;
      img.alt = m.emoteName; // Теперь это фактически найденный текст
      img.style.height = '20px';
      img.style.verticalAlign = 'middle';
      img.style.margin = '0 2px';
      img.style.display = 'inline'; // Важно для инлайнового размещения

      fragment.appendChild(img);

      currentPos = m.index + m.length;
    }

    // Добавляем оставшийся текст после последнего эмота
    if (currentPos < str.length) {
      fragment.appendChild(document.createTextNode(str.slice(currentPos)));
    }

    // Заменяем текстовый узел на фрагмент с инлайновыми картинками
    node.parentNode.replaceChild(fragment, node);
  }
}

// Наблюдатель за новым контентом в чате
const observer = new MutationObserver((muts) => {
  muts.forEach((m) => {
    m.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        replaceEmotes(node);
      }
    });
  });
});

// Загружаем эмоты и запускаем
loadEmotesFromAPI().then(() => {
  replaceEmotes();
  observer.observe(document.body, { childList: true, subtree: true });
});
