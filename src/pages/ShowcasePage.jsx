import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { useTheme } from "../context/ThemeContext.jsx";
import Footer from "../components/Footer.jsx";
import DailySong from "../components/DailySong.jsx";
import SongArchive from "../components/SongArchive.jsx";

export default function Showcase() {
  const { isDark } = useTheme();
  usePageTitle("showcase");
  const [showSongs, setShowSongs] = useState(false);

  return (
    <>

      <main className={`showcase-main ${isDark ? "dark" : "light"}`}>
        <header className="showcase-hero">
          <h1 className="showcase-heading showcase-heading--main">showcase</h1>
        </header>
        <ul className="showcase-menu">
          <li>
            <button
              type="button"
              className="showcase-menu__button"
              onClick={() => setShowSongs(true)}
            >
              daily song
            </button>
          </li>
          <li>
            <Link to="/under-construction" className="showcase-menu__button">
              photo dump
            </Link>
          </li>
          <li>
            <Link to="/passages" className="showcase-menu__button">
              p@ssages
            </Link>
          </li>
        </ul>

        </main>

      {showSongs && (
        <div
          className="showcase-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSongs(false)}
        >
          <div
            className="showcase-modal__panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="showcase-modal__close showcase-heading__button"
              aria-label="Close daily songs modal"
              onClick={() => setShowSongs(false)}
            >
              X
            </button>
            <DailySong />
            <SongArchive />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
