const { fetch } = require("undici");

let spotifyPattern =
  /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/;

class Spotify {
  constructor(options = {}) {
    this.baseURL = "https://api.spotify.com/v1";
    this.options = options
    this.searchMarket =  options.searchMarket || "IN",
    this.token = null;
    this.interval = 0;
  }

 
  resolve(url) {
    return spotifyPattern.test(url);
  }

  async requestAnonymousToken() {
    try {
      const data = await fetch(
        "https://open.spotify.com/get_access_token?reason=transport&productType=embed",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
          },
        }
      );

      const body = await data.json();
      this.token = `Bearer ${body.accessToken}`;
      this.interval = body.accessTokenExpirationTimestampMs * 1000;
    } catch (e) {
        throw new Error(e);
      }
  }


  async requestToken() {
    
    if(!this.options.clientID && !this.options.clientSecret) return this.requestAnonymousToken()
    
    try {
      const data = await fetch('https://accounts.spotify.com/api/token?grant_type=client_credentials', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.options.clientID}:${this.options.clientSecret}`
          ).toString("base64")}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const body = await data.json();
      this.token = `Bearer ${body.access_token}`;
      this.interval = body.expires_in * 1000;
    } catch (e) {
      if (e.status === 400) {
        throw new Error('Invalid Spotify client and Secret');
      }
    }
  }








  async refreshToken() {
    if (Date.now() >= this.interval) {
      await this.requestToken();
    }
  }

  async requestData(endpoint) {
    await this.refreshToken();

    const req = await fetch(
      `${this.baseURL}${/^\//.test(endpoint) ? endpoint : `/${endpoint}`}`,
      {
        headers: { Authorization: this.token },
      }
    );
    const data = await req.json();
    return data;
  }

  async search(query) {
    if (!this.token) await this.requestToken();
    const [, type, id] = spotifyPattern.exec(query) ?? [];

    switch (type) {
      case "playlist": {
        return this.getPlaylist(id);
      }
      case "track": {
        return this.getTrack(id);
      }
      case "album": {
        return this.getAlbum(id);
      }
      case "artist": {
        return this.getArtistTracks(id);
      }
      default: {
        return this.getTrackByWords(query);
      }
    }
  }

  async getPlaylist(id) {
    const playlist = await this.requestData(`/playlists/${id}`);
    await this.getPlaylistTracks(playlist);

    return playlist;
  }
  async getPlaylistTracks(spotifyPlaylist) {
    let nextPage = spotifyPlaylist.tracks.next;
    let pageLoaded = 1;
    while (nextPage) {
      if (!nextPage) break;
      const req = await fetch(nextPage, {
        headers: { Authorization: this.token },
      });
      const body = await req.json();
      if (body.error) break;
      spotifyPlaylist.tracks.items.push(...body.items);

      nextPage = body.next;
      pageLoaded++;
    }
  }

  async getAlbum(id) {
    const album = await this.requestData(`/albums/${id}`);
    return album;
  }

  async getArtistTracks(id) {
    const artist = await this.requestData(`/artists/${id}`);
    const data = await this.requestData(
      `/artists/${id}/top-tracks?market=${this.searchMarket}`
    );

    return data;
  }

  async getTrack(id) {
    const data = await this.requestData(`/tracks/${id}`);
    return data;
  }

  async getTrackByWords(query) {
    const data = await this.requestData(
      `/search/?q="${query}"&type=artist,album,track&market=${this.options.searchMarket}`
    );

    return data;
  }
}

module.exports = Spotify;

