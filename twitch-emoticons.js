class TwitchEmoticons {
  constructor() {
    this.emotes = {};
    this.channel = null;
  }

  async loadChannelEmotes(channelName) {
    this.channel = channelName;

    try {
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

      if (data.emotes) {
        data.emotes.forEach((emote) => {
          this.emotes[emote.code] = {
            url: `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`,
            type: 'twitch',
            id: emote.id,
          };
        });
      }

      if (data.bttv_emotes) {
        data.bttv_emotes.forEach((emote) => {
          this.emotes[emote.code] = {
            url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
            type: 'bttv',
            id: emote.id,
          };
        });
      }

      if (data.ffz_emotes) {
        data.ffz_emotes.forEach((emote) => {
          this.emotes[emote.code] = {
            url: `https://cdn.frankerfacez.com/emote/${emote.id}/1`,
            type: 'ffz',
            id: emote.id,
          };
        });
      }

      return this.emotes;
    } catch (error) {
      console.error('Error loading emotes:', error);
      return {};
    }
  }

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

      return this.emotes;
    } catch (error) {
      console.error('Error loading global emotes:', error);
      return {};
    }
  }

  getAllEmotes() {
    return this.emotes;
  }

  getEmoteUrl(emoteName) {
    return this.emotes[emoteName]?.url || null;
  }

  hasEmote(emoteName) {
    return emoteName in this.emotes;
  }

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

  async loadAllEmotes(channelName) {
    await Promise.all([
      this.loadChannelEmotes(channelName),
      this.loadGlobalEmotes(),
    ]);

    return this.emotes;
  }
}

window.TwitchEmoticons = TwitchEmoticons;
