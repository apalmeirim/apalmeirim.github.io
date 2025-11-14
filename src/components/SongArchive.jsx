import { useEffect, useState } from "react";

const PLAYLIST_URL = "https://open.spotify.com/playlist/35iWgU5Ah270CPSMCcP4h4?si=47e588c5d2d74a2b";
const TOUCH_MEDIA_QUERY = "(hover: none)";

const getTouchPreference = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(TOUCH_MEDIA_QUERY).matches;
};

export default function SongArchive() {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isTouch, setIsTouch] = useState(getTouchPreference);

  useEffect(() => {
    fetch("https://daily-song-api.vercel.app/api/archive")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then(setSongs)
      .catch((err) => {
        console.error("Failed to load archive", err);
        setError(err);
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(TOUCH_MEDIA_QUERY);
    const updatePreference = () => setIsTouch(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const timeout = setTimeout(() => setActiveIndex(null), 2500);
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  const openSong = (url) => {
    if (!url || typeof window === "undefined") {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleBlockClick = (index, songUrl) => {
    if (!songUrl) {
      return;
    }

    if (!isTouch) {
      openSong(songUrl);
      return;
    }

    if (activeIndex === index) {
      openSong(songUrl);
      setActiveIndex(null);
      return;
    }

    setActiveIndex(index);
  };

  if (error) {
    return (
      <div className="song-archive">
        <p>Couldn't load the archive.</p>
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div className="song-archive">
        <p>Loading archive...</p>
      </div>
    );
  }

  return (
    <div className="song-archive">
      <h2 className="showcase-heading">
        <a
          href={PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="showcase-heading__button"
        >
          archive
        </a>
      </h2>
      <div className="song-grid">
        {songs.map((song, index) => {
          const formattedDate = new Date(song.addedAt).toLocaleDateString();

          return (
            <button
              type="button"
              key={index}
              className={`song-mini-block ${activeIndex === index ? "active" : ""}`}
              onClick={() => handleBlockClick(index, song.spotifyUrl)}
            >
              <img
                src={song.albumArt}
                alt={`${song.title} album cover`}
                className="mini-art"
              />
              <div className="mini-overlay">
                <div className="mini-text">
                  <span className="mini-date">{formattedDate}</span>
                  <span className="mini-title">{song.title}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
