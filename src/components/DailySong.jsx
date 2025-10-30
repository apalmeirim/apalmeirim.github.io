import { useEffect, useState } from "react";

export default function DailySong() {
  const [song, setSong] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://daily-song-api.vercel.app/api/daily_song") // 👈 replace with your actual API URL
      .then((res) => res.json())
      .then(setSong)
      .catch(setError);
  }, []);

  if (error)
    return (
      <div className="daily-song">
        <p>Couldn’t load the daily song 😢</p>
      </div>
    );

  if (!song)
    return (
      <div className="daily-song">
        <p>Loading daily song...</p>
      </div>
    );

  const trackId = song.spotifyUrl.split("/track/")[1]?.split("?")[0];

  return (
    <div className="daily-song">
      <h2>daily song</h2>
      {trackId && (
        <iframe
          style={{ borderRadius: "12px" }}
          src={`https://open.spotify.com/embed/track/${trackId}`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Player"
        ></iframe>
      )}
      <p>
        <strong>{song.title}</strong> — {song.artist}
      </p>
      <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
        Added on {new Date(song.addedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
