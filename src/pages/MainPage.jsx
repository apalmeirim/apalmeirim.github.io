import { useState } from 'react';
import { Link } from 'react-router-dom';
import RunnerGate from '../components/RunnerGate.jsx';
import TerminalOverlay from '../components/TerminalOverlay.jsx';
import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useTheme } from '../context/ThemeContext.jsx';
import ASCIIText from '../components/ASCIIText.jsx';
import DailySong from '../components/DailySong.jsx';

export default function MainPage() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  usePageTitle('_main');

  return (
    <>
      <header className="home-header">
        <div className="navbar-spacer" aria-hidden="true" />
        <div className="home-header__title" role="img" aria-label="_main">
          <ASCIIText text="_main" enableWaves asciiFontSize={4}/>
        </div>
        <RunnerGate open={runnerOpen} onClose={() => setRunnerOpen(false)} />
      </header>
      <main>
        <section id="home">
          <div className="home-layout">
            <div className="home-links">
              <Link to="/showcase" id="aboutBtn" className="home-link">
                showcase
              </Link>
              <Link to="/links" id="linksBtn" className="home-link">
                links
              </Link>
              <Link to="/projects" id="projectsBtn" className="home-link">
                projects
              </Link>
              <Link to="/about" id="aboutBtn" className="home-link">
                about me
              </Link>
            </div>
            <button
              type="button"
              id="playGameBtn"
              className="home-link runner-link"
              onClick={() => setRunnerOpen(true)}
            >
              runner.exe
            </button>
            <button
              type="button"
              id="openTerminalBtn"
              className="home-link terminal-link"
              aria-haspopup="dialog"
              onClick={() => setTerminalOpen(true)}
            >
              &gt;_
            </button>
          </div>
        </section>
        <section id="daily-song-test" style={{ textAlign: "center", marginTop: "3rem" }}>
          <h2>Daily Song 🎶</h2>
          <DailySong />
        </section>
      </main>
      <TerminalOverlay open={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <Footer>
        <div className="footer-controls">
          <button
            type="button"
            id="mainThemeToggle"
            className="toggle-switch"
            aria-pressed={isDark}
            aria-label="Toggle wave theme"
            onClick={toggleTheme}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </Footer>
    </>
  );
}
