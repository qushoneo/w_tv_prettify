// Twitch Emoticons Library
class TwitchEmoticons {
  constructor() {
    this.emotes = {};
    this.channel = null;
  }

  // Загрузка эмодзи для канала
  async loadChannelEmotes(channelName) {
    this.channel = channelName;
    console.log('Загружаем эмодзи для канала:', channelName);

    try {
      // Загружаем данные с API
      const response = await fetch(
        `https://api.twitchemotes.com/api/v4/channels/${channelName}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Обрабатываем обычные Twitch эмодзи
      if (data.emotes) {
        data.emotes.forEach((emote) => {
          this.emotes[emote.code] = {
            url: `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`,
            type: 'twitch',
            id: emote.id,
          };
        });
      }

      // Обрабатываем BTTV эмодзи
      if (data.bttv_emotes) {
        data.bttv_emotes.forEach((emote) => {
          this.emotes[emote.code] = {
            url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
            type: 'bttv',
            id: emote.id,
          };
        });
      }

      // Обрабатываем FFZ эмодзи
      if (data.ffz_emotes) {
        data.ffz_emotes.forEach((emote) => {
          this.emotes[emote.code] = {
            url: `https://cdn.frankerfacez.com/emote/${emote.id}/1`,
            type: 'ffz',
            id: emote.id,
          };
        });
      }

      console.log(`Загружено эмодзи: ${Object.keys(this.emotes).length}`);
      return this.emotes;
    } catch (error) {
      console.error('Ошибка при загрузке эмодзи:', error);
      return {};
    }
  }

  // Загрузка глобальных эмодзи
  async loadGlobalEmotes() {
    try {
      const response = await fetch(
        'https://api.twitchemotes.com/api/v4/sets/global',
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      data.emotes.forEach((emote) => {
        this.emotes[emote.code] = {
          url: `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`,
          type: 'twitch_global',
          id: emote.id,
        };
      });

      console.log(
        `Загружено глобальных эмодзи: ${Object.keys(this.emotes).length}`
      );
      return this.emotes;
    } catch (error) {
      console.error('Ошибка при загрузке глобальных эмодзи:', error);
      return {};
    }
  }

  // Получение всех эмодзи
  getAllEmotes() {
    return this.emotes;
  }

  // Получение URL эмодзи по названию
  getEmoteUrl(emoteName) {
    console.log(emoteName);
    return this.emotes[emoteName]?.url || null;
  }

  // Проверка существования эмодзи
  hasEmote(emoteName) {
    return emoteName in this.emotes;
  }

  // Замена текста на эмодзи
  replaceEmotes(text) {
    let result = text;

    for (const [emoteName, emoteData] of Object.entries(this.emotes)) {
      const regex = new RegExp(`\\b${emoteName}\\b`, 'gi');
      result = result.replace(
        regex,
        `<img src="${emoteData.url}" alt="${emoteName}" style="height: 20px; vertical-align: middle; margin: 0 2px;">`
      );
    }

    return result;
  }

  // Загрузка всех эмодзи (канал + глобальные)
  async loadAllEmotes(channelName) {
    await Promise.all([
      this.loadChannelEmotes(channelName),
      this.loadGlobalEmotes(),
    ]);

    return this.emotes;
  }
}

// Экспортируем для использования
window.TwitchEmoticons = TwitchEmoticons;
