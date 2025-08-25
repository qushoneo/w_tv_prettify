console.log('7TV Smiles loaded!');

const SET_ID = '01GE9SQ9KR0006MCY6R6BPT998';
const API_URL = `https://7tv.io/v3/emote-sets/${SET_ID}`;

let emotes = {};

let db = null;
let app = null;

async function initializeFirebase() {
  try {
    console.log('Starting Firebase initialization...');
    console.log('Firebase config:', firebaseConfig);

    if (typeof firebase !== 'undefined') {
      console.log('Firebase already loaded');
    } else {
      console.log('Firebase not loaded, loading scripts...');

      const firebaseScript = document.createElement('script');
      firebaseScript.src =
        'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
      document.head.appendChild(firebaseScript);
      console.log('Firebase App script added');

      await new Promise((resolve, reject) => {
        firebaseScript.onload = () => {
          console.log('Firebase App script loaded successfully');
          resolve();
        };
        firebaseScript.onerror = (error) => {
          console.error('Firebase App script failed to load:', error);
          reject(error);
        };
      });

      const firebaseDBScript = document.createElement('script');
      firebaseDBScript.src =
        'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js';
      document.head.appendChild(firebaseDBScript);
      console.log('Firebase Database script added');

      await new Promise((resolve, reject) => {
        firebaseDBScript.onload = () => {
          console.log('Firebase Database script loaded successfully');
          resolve();
        };
        firebaseDBScript.onerror = (error) => {
          console.error('Firebase Database script failed to load:', error);
          reject(error);
        };
      });
    }

    if (typeof firebase === 'undefined') {
      throw new Error('Firebase is not available after loading scripts');
    }

    console.log('Firebase object available:', firebase);
    console.log('Initializing Firebase app...');

    app = firebase.initializeApp(firebaseConfig);
    console.log('Firebase app initialized:', app);

    console.log('Getting Firebase database...');
    db = firebase.database();
    console.log('Firebase database obtained:', db);

    console.log('Firebase initialized successfully');

    try {
      const testRef = db.ref('test');
      await testRef.set({ timestamp: Date.now() });
      console.log('Firebase connection test successful');
      await testRef.remove();
    } catch (testError) {
      console.error('Firebase connection test failed:', testError);
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Error details:', error.message, error.stack);
  }
}

function findStreamerName() {
  // Поиск имени стримера в div с data-v-c95df1f8 и классом flex gap-1.5
  console.log('Поиск имени стримера...');

  const streamerContainers = document.querySelectorAll(
    '.flex.gap-1\\.5.text-\\[var\\(--color-base-foreground-primary\\)\\]'
  );
  console.log(`Найдено контейнеров стримера: ${streamerContainers.length}`);

  for (const container of streamerContainers) {
    console.log('Проверяем контейнер стримера:', container.innerHTML);

    // Ищем span с именем стримера
    const streamerSpan = container.querySelector(
      '.subtitle.max-md\\:truncate.max-md\\:max-w-\\[116px\\]'
    );
    if (streamerSpan && streamerSpan.textContent.trim()) {
      const streamerName = streamerSpan.textContent.trim();
      console.log('Найдено имя стримера:', streamerName);
      return streamerName;
    }

    // Альтернативный поиск по классу subtitle
    const subtitleSpan = container.querySelector('.subtitle');
    if (subtitleSpan && subtitleSpan.textContent.trim()) {
      const streamerName = subtitleSpan.textContent.trim();
      console.log('Найдено имя стримера (альтернативный поиск):', streamerName);
      return streamerName;
    }
  }

  // Дополнительный поиск по data-v атрибуту
  const dataVContainers = document.querySelectorAll('[data-v-c95df1f8].flex');
  console.log(
    `Найдено контейнеров с data-v-c95df1f8: ${dataVContainers.length}`
  );

  for (const container of dataVContainers) {
    const streamerSpan = container.querySelector('.subtitle');
    if (streamerSpan && streamerSpan.textContent.trim()) {
      const streamerName = streamerSpan.textContent.trim();
      console.log('Найдено имя стримера через data-v:', streamerName);
      return streamerName;
    }
  }

  return null;
}

function findNicknameInMaxWDiv() {
  // Специальный поиск в div class="max-w-[80%]"
  console.log('Поиск никнейма в max-w-[80%] контейнере...');

  const maxWContainers = document.querySelectorAll('.max-w-\\[80\\%\\]');
  console.log(`Найдено max-w-[80%] контейнеров: ${maxWContainers.length}`);

  for (const container of maxWContainers) {
    console.log('Проверяем max-w контейнер:', container.innerHTML);

    // Ищем p с никнеймом внутри этого контейнера
    const usernameP = container.querySelector(
      '.font-medium.text-sm.text-\\[var\\(--color-base-foreground-primary\\)\\].truncate'
    );
    if (usernameP && usernameP.textContent.trim()) {
      const nickname = usernameP.textContent.trim();
      console.log('Найден никнейм в max-w контейнере:', nickname);
      return nickname;
    }
  }

  return null;
}

function findNicknameInSpecialDiv() {
  console.log('Поиск контейнера с указанными классами...');

  // Сначала пробуем найти в max-w-[80%] контейнере
  const maxWNickname = findNicknameInMaxWDiv();
  if (maxWNickname) {
    return maxWNickname;
  }

  // Пробуем разные варианты поиска контейнера
  let containerDiv = null;

  // Вариант 1: Поиск по ключевым классам
  const keySelectors = [
    '.font-medium.items-center.cursor-pointer.p-2.flex.gap-2',
    '.font-medium.items-center.text-sm.cursor-pointer.p-2',
    '.items-center.cursor-pointer.p-2.flex.gap-2',
    '.cursor-pointer.p-2.rounded-\\[var\\(--rounding-control-button-l\\)\\]',
    '.font-medium.items-center.transition-colors.text-sm',
    '.max-w-\\[80\\%\\]', // Добавляем новый селектор для контейнера с никнеймом
  ];

  for (const selector of keySelectors) {
    console.log(`Пробуем селектор: ${selector}`);
    const elements = document.querySelectorAll(selector);
    console.log(`Найдено элементов: ${elements.length}`);

    if (elements.length > 0) {
      // Проверяем каждый найденный элемент на наличие никнейма
      for (const element of elements) {
        console.log('Проверяем элемент:', element.textContent.trim(), element);

        // Ищем никнейм внутри этого элемента
        const usernameElement = element.querySelector(
          '.font-medium.text-sm.text-\\[var\\(--color-base-foreground-primary\\)\\].truncate'
        );
        if (usernameElement && usernameElement.textContent.trim()) {
          containerDiv = element;
          console.log('Найден контейнер с никнеймом!', containerDiv);
          break;
        }

        // Проверяем альтернативные селекторы для никнейма
        const altSelectors = [
          '.font-medium.truncate',
          '.truncate',
          '.font-medium',
        ];
        for (const altSel of altSelectors) {
          const altElement = element.querySelector(altSel);
          if (
            altElement &&
            altElement.textContent.trim() &&
            altElement.textContent.trim().length > 0
          ) {
            containerDiv = element;
            console.log(
              `Найден контейнер с никнеймом по селектору ${altSel}!`,
              containerDiv
            );
            break;
          }
        }

        if (containerDiv) break;
      }

      if (containerDiv) break;
    }
  }

  // Вариант 2: Поиск по атрибутам
  if (!containerDiv) {
    console.log('Поиск по атрибутам...');
    const elementsWithAttributes = document.querySelectorAll(
      '[class*="font-medium"][class*="cursor-pointer"][class*="p-2"]'
    );
    console.log(
      `Найдено элементов с атрибутами: ${elementsWithAttributes.length}`
    );

    for (const element of elementsWithAttributes) {
      const usernameElement = element.querySelector(
        '.font-medium.text-sm.text-\\[var\\(--color-base-foreground-primary\\)\\].truncate'
      );
      if (usernameElement && usernameElement.textContent.trim()) {
        containerDiv = element;
        console.log('Найден контейнер через поиск по атрибутам!', containerDiv);
        break;
      }
    }
  }

  // Вариант 3: Попытка поиска оригинального селектора
  if (!containerDiv) {
    console.log('Пробуем оригинальный селектор...');
    containerDiv = document.querySelector(
      '.font-medium.items-center.disabled\\:cursor-not-allowed.aria-disabled\\:cursor-not-allowed.aria-disabled\\:opacity-75.transition-colors.text-sm.text-inverted.focus-visible\\:outline-offset-2.focus-visible\\:outline-primary.disabled\\:bg-\\[--color-base-brand-bg\\].disabled\\:opacity-\\[--opacity-item-disabled\\].aria-disabled\\:bg-\\[--color-base-brand-bg\\].outline-offset-2.outline-\\[--color-control-focus\\].focus-visible\\:outline-2.bg-transparent.hover\\:bg-\\[var\\(--color-control-neutral-ghost-bg-hover\\)\\].active\\:bg-\\[var\\(--color-control-neutral-ghost-bg-hover\\)\\].active\\:opacity-86.border-2.border-transparent.focus-visible\\:shadow-\\[0_0_0_2px_\\#000\\,_0_0_0_4px_\\#8F58FEAD\\].cursor-pointer.p-2.rounded-\\[var\\(--rounding-control-button-l\\)\\].focus\\:shadow-none.flex.gap-2'
    );
    if (containerDiv) {
      console.log('Найден через оригинальный селектор!', containerDiv);
    }
  }

  if (containerDiv) {
    console.log('Найден контейнер:', containerDiv);
    console.log('Содержимое контейнера:', containerDiv.textContent);
    console.log('HTML содержимое контейнера:', containerDiv.innerHTML);

    // Теперь ищем внутри этого контейнера существующий селектор для никнейма
    const usernameElement = containerDiv.querySelector(
      '.font-medium.text-sm.text-\\[var\\(--color-base-foreground-primary\\)\\].truncate'
    );

    if (usernameElement && usernameElement.textContent.trim()) {
      const nickname = usernameElement.textContent.trim();
      console.log('Никнейм найден внутри контейнера:', nickname);
      return nickname;
    }

    // Если стандартный селектор не сработал, ищем другие возможные селекторы для никнейма внутри контейнера
    const possibleSelectors = [
      '.font-medium.truncate',
      '.font-medium',
      '.truncate',
      '[class*="font-medium"]',
      '[class*="truncate"]',
    ];

    for (const selector of possibleSelectors) {
      const element = containerDiv.querySelector(selector);
      if (element && element.textContent.trim()) {
        const nickname = element.textContent.trim();
        console.log(`Никнейм найден по селектору ${selector}:`, nickname);
        return nickname;
      }
    }

    // Если ничего не найдено с помощью селекторов, ищем любой текстовый контент
    const textContent = containerDiv.textContent.trim();
    if (textContent) {
      console.log('Текстовое содержимое контейнера:', textContent);
      return textContent;
    }
  } else {
    console.log(
      'Контейнер с указанными классами не найден - пробуем альтернативные методы'
    );
  }

  return null;
}

async function sendInstallStats() {
  try {
    console.log('Starting to send install stats...');

    let username = 'anonymous';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Сначала пробуем найти никнейм в специальном div
      const specialNickname = findNicknameInSpecialDiv();
      if (specialNickname) {
        username = specialNickname;
        console.log(
          `Username found in special div on attempt ${attempts + 1}:`,
          username
        );
        break;
      }

      // Если не найден, используем старый способ
      const usernameElement = document.querySelector(
        '.font-medium.text-sm.text-\\[var\\(--color-base-foreground-primary\\)\\].truncate'
      );

      console.log(`Attempt ${attempts + 1}: Found element:`, usernameElement);
      if (usernameElement) {
        console.log(`Element text: "${usernameElement.textContent}"`);
      }

      if (usernameElement && usernameElement.textContent.trim()) {
        username = usernameElement.textContent.trim();
        console.log(`Username found on attempt ${attempts + 1}:`, username);
        break;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(
          `Username not found, retrying... (${attempts}/${maxAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log('Найденный username:', username);

    // Ищем имя стримера
    let streamerName = 'unknown';
    let streamerAttempts = 0;
    const maxStreamerAttempts = 5;

    while (streamerAttempts < maxStreamerAttempts) {
      const foundStreamerName = findStreamerName();
      if (foundStreamerName) {
        streamerName = foundStreamerName;
        console.log(
          `Имя стримера найдено на попытке ${streamerAttempts + 1}:`,
          streamerName
        );
        break;
      }

      streamerAttempts++;
      if (streamerAttempts < maxStreamerAttempts) {
        console.log(
          `Имя стримера не найдено, повторная попытка... (${streamerAttempts}/${maxStreamerAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (streamerName === 'unknown') {
      console.log(
        'Имя стримера не найдено после всех попыток, используем unknown'
      );
    }

    if (username === 'anonymous') {
      console.log('Username not found after all attempts, using anonymous');
    }

    const stats = {
      username: username,
      streamer: streamerName,
      action: 'install',
      timestamp: new Date().toISOString(),
    };

    console.log('PIGSEX');

    const response = await fetch(`${firebaseConfig.databaseURL}/stats.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats),
    });

    if (response.ok) {
      console.log('Stats sent successfully');
    }
  } catch (error) {
    console.error('Firebase stats error:', error);
  }
}

async function loadEmotesFromAPI() {
  try {
    console.log('Loading emotes from:', API_URL);
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API loading error: ${res.status}`);

    const data = await res.json();
    const parsed = {};

    for (const e of data.emotes) {
      const name = e.name;
      const url = `https:${e.data.host.url}/2x.webp`;
      parsed[name] = url;
    }

    emotes = { ...emotes, ...parsed };
    console.log('Loaded emotes:', Object.keys(parsed).length);
  } catch (err) {
    console.error('Error loading emotes:', err);
  }
}

function createEmoteRegex(emoteName) {
  const escaped = emoteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (/^[()]+$/.test(emoteName)) {
    return new RegExp(`(?<!\\S)${escaped}(?!\\S)`, 'g');
  }

  if (emoteName.includes(':')) {
    return new RegExp(`(?<!\\S)${escaped}(?!\\S)`, 'g');
  }

  return new RegExp(`(?<!\\S)${escaped}(?!\\S)`, 'g');
}

function replaceEmotes(root = document.body) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (
      node.parentNode &&
      (node.parentNode.tagName === 'SCRIPT' ||
        node.parentNode.tagName === 'STYLE' ||
        node.parentNode.closest('img') ||
        node.parentNode.closest('.username') ||
        node.parentNode.closest('[data-test-id*="username"]') ||
        node.parentNode.closest('.nickname') ||
        node.parentNode.closest('.user-info') ||
        node.parentNode.closest('[data-state]') ||
        node.parentNode.closest('[data-grace-area-trigger]') ||
        node.parentNode.closest('.font-semibold') ||
        node.parentNode.closest('.truncate'))
    ) {
      continue;
    }

    let text = node.textContent;
    let hasEmote = false;

    for (const [emoteName, emoteUrl] of Object.entries(emotes)) {
      const regex = createEmoteRegex(emoteName);

      if (regex.test(text)) {
        hasEmote = true;
        break;
      }
    }

    if (!hasEmote) continue;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let str = text;

    let matches = [];
    for (const [emoteName, emoteUrl] of Object.entries(emotes)) {
      const regex = createEmoteRegex(emoteName);
      let match;
      while ((match = regex.exec(str)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          emoteName: match[0],
          emoteUrl,
        });
      }
    }

    matches.sort((a, b) => a.index - b.index);

    if (matches.length === 0) continue;

    let currentPos = 0;
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      if (m.index < currentPos) continue;

      if (m.index > currentPos) {
        fragment.appendChild(
          document.createTextNode(str.slice(currentPos, m.index))
        );
      }

      const img = document.createElement('img');
      img.src = m.emoteUrl;
      img.alt = m.emoteName;
      img.style.height = '30px';
      img.style.verticalAlign = 'middle';
      img.style.margin = '0 2px';
      img.style.display = 'inline';

      fragment.appendChild(img);

      currentPos = m.index + m.length;
    }

    if (currentPos < str.length) {
      fragment.appendChild(document.createTextNode(str.slice(currentPos)));
    }

    node.parentNode.replaceChild(fragment, node);
  }
}

const observer = new MutationObserver((muts) => {
  muts.forEach((m) => {
    m.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        replaceEmotes(node);
      }
    });
  });
});

// я знаю что это хуево =)) пока так
var firebaseConfig = {
  apiKey: 'AIzaSyDm1xFUlI6i1FLTdwguRtqyomMyg2cIcuo',
  authDomain: 'wtvemojis.firebaseapp.com',
  databaseURL:
    'https://wtvemojis-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'wtvemojis',
  storageBucket: 'wtvemojis.firebasestorage.app',
  messagingSenderId: '324786416725',
  appId: '1:324786416725:web:ff564065c92d37e86338dc',
  measurementId: 'G-0KMRSRQJTX',
};

function setupEmoteAutocomplete() {
  const chatInput = document.querySelector(
    'input[data-test-id="messChat"], input[placeholder*="сообщение"], input[placeholder*="message"], textarea[placeholder*="сообщение"], textarea[placeholder*="message"]'
  );

  if (!chatInput) {
    setTimeout(setupEmoteAutocomplete, 1000);
    return;
  }

  const rect = chatInput.getBoundingClientRect();
  const isVisible =
    rect.width > 0 &&
    rect.height > 0 &&
    window.getComputedStyle(chatInput).opacity !== '0' &&
    window.getComputedStyle(chatInput).visibility !== 'hidden';

  if (!isVisible) {
    setTimeout(setupEmoteAutocomplete, 1000);
    return;
  }

  let autocompleteList = null;
  let currentSuggestions = [];
  let selectedIndex = -1;

  function createAutocompleteList() {
    if (autocompleteList) {
      autocompleteList.remove();
    }

    autocompleteList = document.createElement('div');
    autocompleteList.style.cssText = `
      position: absolute;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    `;

    document.body.appendChild(autocompleteList);
  }

  function showSuggestions(suggestions, inputRect) {
    if (suggestions.length === 0) {
      hideSuggestions();
      return;
    }

    if (!autocompleteList) {
      createAutocompleteList();
    }

    autocompleteList.innerHTML = '';
    currentSuggestions = suggestions;
    selectedIndex = -1;

    suggestions.forEach((emote, index) => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ffffff;
        border-bottom: 1px solid #333;
      `;

      item.innerHTML = `
        <img src="${emote.url}" alt="${emote.name}" style="width: 30px; height: 30px;">
        <span>${emote.name}</span>
      `;

      item.addEventListener('click', () => {
        insertEmote(emote.name);
        hideSuggestions();
      });

      item.addEventListener('mouseenter', () => {
        selectedIndex = index;
        updateSelection();
      });

      autocompleteList.appendChild(item);
    });

    const rect = inputRect || chatInput.getBoundingClientRect();
    autocompleteList.style.left = rect.left + 'px';
    autocompleteList.style.top = rect.top - 5 + 'px';
    autocompleteList.style.transform = 'translateY(-100%)';
    autocompleteList.style.width = rect.width + 'px';
    autocompleteList.style.display = 'block';
  }

  function hideSuggestions() {
    if (autocompleteList) {
      autocompleteList.style.display = 'none';
    }
    selectedIndex = -1;
    currentSuggestions = [];
  }

  function updateSelection() {
    const items = autocompleteList.querySelectorAll('div');
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.style.backgroundColor = '#4a90e2';
        item.style.color = '#ffffff';
      } else {
        item.style.backgroundColor = 'transparent';
        item.style.color = '#ffffff';
      }
    });
  }

  function insertEmote(emoteName) {
    const value = chatInput.value;
    const cursorPos = chatInput.selectionStart;

    let wordStart = cursorPos;

    while (wordStart > 0 && /[\w\u0400-\u04FF:]/.test(value[wordStart - 1])) {
      wordStart--;
    }

    const newValue =
      value.slice(0, wordStart) + emoteName + value.slice(cursorPos);
    chatInput.value = newValue;

    const newCursorPos = wordStart + emoteName.length;
    chatInput.setSelectionRange(newCursorPos, newCursorPos);

    const inputEvent = new Event('input', { bubbles: true });
    chatInput.dispatchEvent(inputEvent);

    const changeEvent = new Event('change', { bubbles: true });
    chatInput.dispatchEvent(changeEvent);

    chatInput.focus();
  }

  function handleInput() {
    const value = chatInput.value;
    const cursorPos = chatInput.selectionStart;

    let wordStart = cursorPos;

    while (wordStart > 0 && /[\w\u0400-\u04FF:]/.test(value[wordStart - 1])) {
      wordStart--;
    }

    const currentWord = value.slice(wordStart, cursorPos).toLowerCase();

    if (currentWord.length >= 2) {
      const suggestions = Object.entries(emotes)
        .filter(([name, url]) => name.toLowerCase().includes(currentWord))
        .slice(0, 10)
        .map(([name, url]) => ({ name, url }));

      if (suggestions.length > 0) {
        showSuggestions(suggestions);
      } else {
        hideSuggestions();
      }
    } else {
      hideSuggestions();
    }
  }

  function handleKeydown(event) {
    if (!autocompleteList || autocompleteList.style.display === 'none') {
      return;
    }

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
          insertEmote(currentSuggestions[selectedIndex].name);
          hideSuggestions();
        } else if (currentSuggestions.length > 0) {
          insertEmote(currentSuggestions[0].name);
          hideSuggestions();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(
          selectedIndex + 1,
          currentSuggestions.length - 1
        );
        updateSelection();
        break;

      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection();
        break;

      case 'Escape':
        hideSuggestions();
        break;

      case 'Enter':
        if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
          event.preventDefault();
          insertEmote(currentSuggestions[selectedIndex].name);
          hideSuggestions();
        } else {
          hideSuggestions();
        }
        break;
    }
  }

  chatInput.addEventListener('input', handleInput);
  chatInput.addEventListener('keydown', handleKeydown);
  chatInput.addEventListener('blur', () => {
    setTimeout(hideSuggestions, 150);
  });

  document.addEventListener('click', (event) => {
    if (
      autocompleteList &&
      !autocompleteList.contains(event.target) &&
      event.target !== chatInput
    ) {
      hideSuggestions();
    }
  });
}

function createCustomFullscreenButton() {
  if (document.getElementById('custom-fullscreen-btn')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'custom-fullscreen-btn';
  button.textContent = 'Режим кинотеатра';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 220px;
    z-index: 10001;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    font-family: Arial, sans-serif;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.background = '#357abd';
    button.style.transform = 'translateY(-1px)';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = '#4a90e2';
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
  });

  let isHidden = false;
  let targetElement1 = null;
  let targetElement2 = null;
  let headerElement = null;
  let sidebarElement = null;
  let mainElement = null;
  let chatElement = null;
  let usernameElement = null;

  button.addEventListener('click', () => {
    if (!targetElement1) {
      targetElement1 = document.querySelector(
        '.max-lg\\:p-4.max-md\\:bg-\\[var\\(--color-bg-info\\)\\].max-md\\:rounded-b-\\[20px\\].max-md\\:gap-1.flex.justify-between.items-center'
      );
    }

    if (!targetElement2) {
      targetElement2 = document.querySelector('.hidden.lg\\:flex.flex-col');
    }

    if (!headerElement) {
      headerElement = document.querySelector('header');
    }

    if (!sidebarElement) {
      sidebarElement = document.querySelector('.layout-sidebar');
    }

    if (!mainElement) {
      mainElement = document.querySelector('main');
    }

    if (!chatElement) {
      chatElement = document.querySelector(
        '.sticky.top-\\[var\\(--header-height\\)\\].w-\\[var\\(--chat-width\\)\\].h-\\[calc\\(100svh-\\(var\\(--header-height\\)\\)\\)\\].hidden.lg\\:flex.shrink-0'
      );
    }

    if (!usernameElement) {
      usernameElement = document.querySelector(
        '.font-medium.text-sm.text-\\[var\\(--color-base-foreground-primary\\)\\].truncate'
      );
    }

    if (
      targetElement1 ||
      targetElement2 ||
      headerElement ||
      sidebarElement ||
      mainElement ||
      chatElement
    ) {
      if (isHidden) {
        if (targetElement1) {
          targetElement1.style.display = 'flex';
        }
        if (targetElement2) {
          targetElement2.style.display = 'flex';
          targetElement2.style.flexDirection = 'column';
        }
        if (headerElement) {
          headerElement.style.display = '';
        }
        if (sidebarElement) {
          sidebarElement.style.display = 'block';
        }
        if (mainElement) {
          mainElement.style.margin = '';
          mainElement.style.padding = '';
        }
        if (chatElement) {
          chatElement.style.top = '';
        }

        document.documentElement.style.setProperty('--chat-width', '');
        button.textContent = 'Режим кинотеатра';
        button.style.opacity = '0.5';
        button.style.top = '20px';
        button.style.right = '220px';
        button.style.bottom = '';

        isHidden = false;
      } else {
        if (targetElement1) {
          targetElement1.style.display = 'none';
        }
        if (targetElement2) {
          targetElement2.style.display = 'none';
        }
        if (headerElement) {
          headerElement.style.display = 'none';
        }
        if (sidebarElement) {
          sidebarElement.style.display = 'none';
        }
        if (mainElement) {
          mainElement.style.margin = '0';
          mainElement.style.padding = '0';
        }
        if (chatElement) {
          chatElement.style.top = '0';
        }

        document.documentElement.style.setProperty('--chat-width', '280px');
        button.style.right = '20px';
        button.textContent = 'Режим кинотеатра';
        button.style.opacity = '0.5';
        button.style.top = '';
        button.style.bottom = '20px';
        isHidden = true;
      }
    }
  });

  document.body.appendChild(button);
}

window.debugFindNickname = function () {
  console.log('=== Отладка поиска никнейма ===');

  // Поиск с полным селектором
  const fullSelector =
    '.font-medium.items-center.disabled\\:cursor-not-allowed.aria-disabled\\:cursor-not-allowed.aria-disabled\\:opacity-75.transition-colors.text-sm.text-inverted.focus-visible\\:outline-offset-2.focus-visible\\:outline-primary.disabled\\:bg-\\[--color-base-brand-bg\\].disabled\\:opacity-\\[--opacity-item-disabled\\].aria-disabled\\:bg-\\[--color-base-brand-bg\\].outline-offset-2.outline-\\[--color-control-focus\\].focus-visible\\:outline-2.bg-transparent.hover\\:bg-\\[var\\(--color-control-neutral-ghost-bg-hover\\)\\].active\\:bg-\\[var\\(--color-control-neutral-ghost-bg-hover\\)\\].active\\:opacity-86.border-2.border-transparent.focus-visible\\:shadow-\\[0_0_0_2px_\\#000\\,_0_0_0_4px_\\#8F58FEAD\\].cursor-pointer.p-2.rounded-\\[var\\(--rounding-control-button-l\\)\\].focus\\:shadow-none.flex.gap-2';

  console.log('Полный селектор:', fullSelector);
  const fullResult = document.querySelector(fullSelector);
  console.log('Результат с полным селектором:', fullResult);

  // Тестируем ключевые селекторы
  console.log('=== Тестирование ключевых селекторов ===');
  const keySelectors = [
    '.font-medium.items-center.cursor-pointer.p-2.flex.gap-2',
    '.font-medium.items-center.text-sm.cursor-pointer.p-2',
    '.items-center.cursor-pointer.p-2.flex.gap-2',
    '.cursor-pointer.p-2.rounded-\\[var\\(--rounding-control-button-l\\)\\]',
    '.font-medium.items-center.transition-colors.text-sm',
    '.max-w-\\[80\\%\\]', // Добавляем новый селектор для контейнера с никнеймом
  ];

  keySelectors.forEach((selector) => {
    console.log(`Ключевой селектор: ${selector}`);
    const elements = document.querySelectorAll(selector);
    console.log(`Найдено: ${elements.length} элементов`);
    elements.forEach((el, index) => {
      if (index < 2) {
        console.log(
          `  Элемент ${index + 1}:`,
          el.textContent.trim().substring(0, 50),
          el
        );
      }
    });
  });

  // Поиск по частям селектора
  const partialSelectors = [
    '.font-medium.items-center',
    '.font-medium.text-sm',
    '.cursor-pointer.p-2',
    '.flex.gap-2',
    '.border-transparent',
    '[class*="font-medium"][class*="items-center"]',
    '[class*="cursor-pointer"][class*="p-2"]',
  ];

  partialSelectors.forEach((selector) => {
    console.log(`Поиск по селектору: ${selector}`);
    const elements = document.querySelectorAll(selector);
    console.log(`Найдено элементов: ${elements.length}`);
    elements.forEach((el, index) => {
      if (index < 3) {
        // показываем только первые 3
        console.log(`  Элемент ${index + 1}:`, el.textContent.trim(), el);
      }
    });
  });

  // Тестируем поиск в max-w-[80%] контейнере
  console.log('=== Тестирование поиска в max-w-[80%] ===');
  const maxWNickname = findNicknameInMaxWDiv();
  console.log('Результат findNicknameInMaxWDiv:', maxWNickname);

  // Тестируем поиск имени стримера
  console.log('=== Тестирование поиска имени стримера ===');
  const streamerName = findStreamerName();
  console.log('Результат findStreamerName:', streamerName);

  // Вызов основной функции
  const nickname = findNicknameInSpecialDiv();
  console.log('Результат findNicknameInSpecialDiv:', nickname);

  console.log('=== Конец отладки ===');
  return nickname;
};

loadEmotesFromAPI().then(() => {
  replaceEmotes();
  observer.observe(document.body, { childList: true, subtree: true });

  setupEmoteAutocomplete();

  createCustomFullscreenButton();

  sendInstallStats();

  // Добавляем отладочные функции в глобальную область
  console.log(
    'Функции отладки добавлены: window.debugFindNickname(), window.debugFindStreamer()'
  );
});

// Добавляем функцию для отладки поиска стримера
window.debugFindStreamer = function () {
  console.log('=== Отладка поиска стримера ===');

  // Поиск контейнеров стримера
  const flexContainers = document.querySelectorAll(
    '.flex.gap-1\\.5.text-\\[var\\(--color-base-foreground-primary\\)\\]'
  );
  console.log(`Найдено flex контейнеров: ${flexContainers.length}`);

  flexContainers.forEach((container, index) => {
    console.log(`Контейнер ${index + 1}:`, container.innerHTML);
  });

  // Поиск по data-v атрибуту
  const dataVContainers = document.querySelectorAll('[data-v-c95df1f8].flex');
  console.log(`Найдено data-v контейнеров: ${dataVContainers.length}`);

  dataVContainers.forEach((container, index) => {
    console.log(`Data-v контейнер ${index + 1}:`, container.innerHTML);
  });

  // Поиск элементов с классом subtitle
  const subtitleElements = document.querySelectorAll('.subtitle');
  console.log(`Найдено subtitle элементов: ${subtitleElements.length}`);

  subtitleElements.forEach((element, index) => {
    if (index < 5) {
      console.log(
        `Subtitle ${index + 1}:`,
        element.textContent.trim(),
        element
      );
    }
  });

  // Вызов основной функции
  const streamerName = findStreamerName();
  console.log('Результат findStreamerName:', streamerName);

  console.log('=== Конец отладки стримера ===');
  return streamerName;
};
