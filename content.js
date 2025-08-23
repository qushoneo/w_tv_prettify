console.log('7TV Smiles loaded!');

const SET_ID = '01GE9SQ9KR0006MCY6R6BPT998';
const API_URL = `https://7tv.io/v3/emote-sets/${SET_ID}`;

let emotes = {};

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
    // Look for word start, including colons for emotes like :3
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
    // Look for word start, including colons for emotes like :3
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

loadEmotesFromAPI().then(() => {
  replaceEmotes();
  observer.observe(document.body, { childList: true, subtree: true });

  setupEmoteAutocomplete();
});
