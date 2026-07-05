import { globalCache } from './cache.service.js';

const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const VIDEO_TTL = 30 * 60; // 30 minutes
const PLAYLIST_TTL = 6 * 60 * 60; // 6 hours

export class YouTubeProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async searchVideos(query, channelIds) {
    if (!this.apiKey) return [];
    
    const cacheKey = `yt_video_${query}_${channelIds.join(',')}`;
    const cached = globalCache.get(cacheKey);
    if (cached) return cached;

    try {
      const fetchPromises = channelIds.map(channelId => {
        const url = new URL(`${YT_BASE_URL}/search`);
        url.searchParams.append('key', this.apiKey);
        url.searchParams.append('part', 'snippet');
        url.searchParams.append('q', query);
        url.searchParams.append('channelId', channelId);
        url.searchParams.append('type', 'video');
        url.searchParams.append('maxResults', 3);
        
        return fetch(url.toString()).then(res => res.json());
      });

      const results = await Promise.all(fetchPromises);
      const videos = [];

      results.forEach(result => {
        if (result.items) {
          result.items.forEach(item => {
            videos.push({
              id: item.id.videoId,
              type: 'video',
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
              channel: item.snippet.channelTitle,
              description: item.snippet.description,
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            });
          });
        }
      });

      // If multiple channels, we might have more than 3, ensure we return top 3
      const finalVideos = videos.slice(0, 3);
      globalCache.set(cacheKey, finalVideos, VIDEO_TTL);
      return finalVideos;
      
    } catch (error) {
      console.error('YouTube Video Search Error:', error);
      return [];
    }
  }

  async searchPlaylists(query, channelIds) {
    if (!this.apiKey) return [];

    const cacheKey = `yt_playlist_${query}_${channelIds.join(',')}`;
    const cached = globalCache.get(cacheKey);
    if (cached) return cached;

    try {
      const fetchPromises = channelIds.map(channelId => {
        const url = new URL(`${YT_BASE_URL}/search`);
        url.searchParams.append('key', this.apiKey);
        url.searchParams.append('part', 'snippet');
        url.searchParams.append('q', query);
        url.searchParams.append('channelId', channelId);
        url.searchParams.append('type', 'playlist');
        url.searchParams.append('maxResults', 2);
        
        return fetch(url.toString()).then(res => res.json());
      });

      const results = await Promise.all(fetchPromises);
      const playlists = [];

      results.forEach(result => {
        if (result.items) {
          result.items.forEach(item => {
            playlists.push({
              id: item.id.playlistId,
              type: 'playlist',
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
              channel: item.snippet.channelTitle,
              description: item.snippet.description,
              url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`
            });
          });
        }
      });

      const finalPlaylists = playlists.slice(0, 2);
      globalCache.set(cacheKey, finalPlaylists, PLAYLIST_TTL);
      return finalPlaylists;

    } catch (error) {
      console.error('YouTube Playlist Search Error:', error);
      return [];
    }
  }
}
