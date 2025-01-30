const { Pool } = require('pg');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongsFromPlaylist(playlistId, userId) {
    const query = {
      text: `
        SELECT 
          playlists.id AS playlist_id,
          playlists.name AS playlist_name,
          songs.id AS song_id,
          songs.title,
          songs.performer
        FROM playlists
        LEFT JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id
        LEFT JOIN songs ON playlist_songs.song_id = songs.id
        LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
        WHERE playlists.id = $1 
        AND (playlists.owner = $2 OR collaborations.user_id = $2)
      `,
      values: [playlistId, userId],
    };
  
    const result = await this._pool.query(query);
  
    const { playlist_id, playlist_name } = result.rows[0];
    const songs = result.rows
      .filter((row) => row.song_id !== null)
      .map((row) => ({
        id: row.song_id,
        title: row.title,
        performer: row.performer,
      }));
  
    return {
      playlist: {
        id: playlist_id,
        name: playlist_name,
        songs,
      },
    };
  }  
}

module.exports = PlaylistSongsService;