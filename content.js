console.log('7TV Smiles loaded!');

const SET_ID = '01GE9SQ9KR0006MCY6R6BPT998';
const API_URL = `https://7tv.io/v3/emote-sets/${SET_ID}`;

let emotes = {};

// Firebase configuration - замените на ваши данные
const firebaseConfig = {
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

// Initialize Firebase
let db = null;
let app = null;

async function initializeFirebase() {
  try {
    console.log('Starting Firebase initialization...');
    console.log('Firebase config:', firebaseConfig);

    // Проверяем, не загружен ли уже Firebase
    if (typeof firebase !== 'undefined') {
      console.log('Firebase already loaded');
    } else {
      console.log('Firebase not loaded, loading scripts...');

      // Загружаем Firebase SDK через обычные скрипты
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

    // Проверяем, что Firebase доступен
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase is not available after loading scripts');
    }

    console.log('Firebase object available:', firebase);
    console.log('Initializing Firebase app...');

    // Инициализируем Firebase
    app = firebase.initializeApp(firebaseConfig);
    console.log('Firebase app initialized:', app);

    console.log('Getting Firebase database...');
    db = firebase.database();
    console.log('Firebase database obtained:', db);

    console.log('Firebase initialized successfully');

    // Тестируем подключение
    try {
      const testRef = db.ref('test');
      await testRef.set({ timestamp: Date.now() });
      console.log('Firebase connection test successful');
      await testRef.remove(); // Удаляем тестовые данные
    } catch (testError) {
      console.error('Firebase connection test failed:', testError);
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Error details:', error.message, error.stack);
  }
}

async function sendInstallStats() {
  try {
    console.log('Starting to send install stats...');

    let username = 'anonymous';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
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
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Ждем 1 секунду
      }
    }

    if (username === 'anonymous') {
      console.log('Username not found after all attempts, using anonymous');
    }

    const stats = {
      username: username,
      action: 'install',
      timestamp: new Date().toISOString(),
    };
    console.log('Stats object created:', stats);

    // Send to Firebase via REST API
    const response = await fetch(`${firebaseConfig.databaseURL}/stats.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Stats sent to Firebase successfully:', result);
    } else {
      console.error(
        'Firebase REST API failed:',
        response.status,
        response.statusText
      );
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

  return new RegExp(`\\b${escaped}\\b`, 'g');
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
    // Skip if parent already contains img tags (avoid duplicates)
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

function setupEmoteAutocomplete() {
  const chatInput = document.querySelector(
    'input[data-test-id="messChat"], input[placeholder*="сообщение"], input[placeholder*="message"], textarea[placeholder*="сообщение"], textarea[placeholder*="message"]'
  );

  if (!chatInput) {
    console.log('Chat input field not found, retrying in 1 second...');
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
    console.log('Found field is hidden or invisible, looking for another...');
    setTimeout(setupEmoteAutocomplete, 1000);
    return;
  }

  console.log('Chat input field found:', chatInput);
  console.log('Field dimensions:', rect.width, 'x', rect.height);

  let autocompleteList = null;
  let currentSuggestions = [];
  let selectedIndex = -1;

  function createAutocompleteList() {
    console.log('Creating autocomplete list');

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
    console.log(
      'showSuggestions called with',
      suggestions.length,
      'suggestions'
    );

    if (suggestions.length === 0) {
      console.log('No suggestions, hiding list');
      hideSuggestions();
      return;
    }

    if (!autocompleteList) {
      console.log('Creating autocomplete list');
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

    while (wordStart > 0 && /[a-zA-Z0-9:]/.test(value[wordStart - 1])) {
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

    while (wordStart > 0 && /[a-zA-Z0-9:]/.test(value[wordStart - 1])) {
      wordStart--;
    }

    const currentWord = value.slice(wordStart, cursorPos).toLowerCase();

    if (currentWord.length >= 2) {
      const suggestions = Object.entries(emotes)
        .filter(([name, url]) => name.toLowerCase().includes(currentWord))
        .slice(0, 10)
        .map(([name, url]) => ({ name, url }));

      console.log('Found suggestions:', suggestions.length);

      if (suggestions.length > 0) {
        console.log(
          'Showing suggestions:',
          suggestions.map((s) => s.name)
        );
        showSuggestions(suggestions);
      } else {
        console.log('No suggestions, hiding list');
        hideSuggestions();
      }
    } else {
      console.log('Word too short, hiding list');
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
  button.textContent = 'Врубить мадарыча побольше';
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

    // Ищем элемент с ником пользователя
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
        // Восстанавливаем CSS переменную
        document.documentElement.style.setProperty('--chat-width', '');
        button.textContent = 'Врубить мадарыча поменьше';
        button.style.top = '20px';
        button.style.right = '220px';
        button.style.bottom = '';

        isHidden = false;
        console.log('Elements shown');
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
        // Устанавливаем минимальную ширину через CSS переменную
        document.documentElement.style.setProperty('--chat-width', '280px');
        button.style.right = '20px';
        button.textContent = 'Врубить мадарыча поменьше';
        button.style.top = '';
        button.style.bottom = '20px';
        isHidden = true;
        console.log('Elements hidden');
      }
    } else {
      console.log('Target elements not found');
    }
  });

  document.body.appendChild(button);
}

loadEmotesFromAPI().then(() => {
  replaceEmotes();
  observer.observe(document.body, { childList: true, subtree: true });

  setupEmoteAutocomplete();

  createCustomFullscreenButton();

  // Отправляем статистику
  sendInstallStats();
});
