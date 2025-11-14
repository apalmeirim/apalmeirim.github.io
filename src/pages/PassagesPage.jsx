import { useEffect, useState } from "react";
import Footer from "../components/Footer.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import passagesData from "../data/passages.js";

export default function PassagesPage() {
  const [activePassage, setActivePassage] = useState(null);
  usePageTitle("p@ssages");

  useEffect(() => {
    if (!activePassage) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") {
        setActivePassage(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activePassage]);

  return (
    <>
      <main className="passages-page">
        <header className="passages-header">
          <h1 className="showcase-heading">p@ssages</h1>
          <p className="passages-subhead">my personal & subjective reflections on various aspects on life.</p>
        </header>

        <ul className="passages-list">
          {passagesData.map((passage) => (
            <li key={passage.id}>
              <button
                type="button"
                className="passage-link"
                onClick={() => setActivePassage(passage)}
              >
                {passage.title}
              </button>
            </li>
          ))}
        </ul>
      </main>

      {activePassage && (
        <div
          className="passage-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePassage(null)}
        >
          <div
            className="passage-modal__panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="passage-modal__close showcase-heading__button"
              aria-label="Close passage"
              onClick={() => setActivePassage(null)}
            >
              x
            </button>
            <h2 className="passage-modal__title">{activePassage.title}</h2>
            <p className="passage-modal__body">{activePassage.body}</p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
