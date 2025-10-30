import { useEffect, useState } from "react";

export default function DailySong() {
  const [song, setSong] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
  console.log("Fetching daily song...");
  fetch("https://daily-song-api.vercel.app/api/daily_song")
    .then((res) => {
      console.log("Response status:", res.status);
      return res.json();
    })
    .then((data) => {
      console.log("Received data:", data);
      setSong(data);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setError(err);
    });
}, []);

  if (error) return <p>Couldn’t load the song 😢</p>;
  if (!song) return <p>Loading your daily song...</p>;

  return (
    <div className="daily-song">
      <img
        src={song.albumArt}
        alt={`${song.title} cover`}
        style={{ width: 300, borderRadius: "1rem" }}
      />
      <h2>{song.title}</h2>
      <p>{song.artist}</p>
      <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">
        Listen on Spotify
      </a>
    </div>
  );
}
