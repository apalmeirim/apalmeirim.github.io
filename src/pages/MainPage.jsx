import { useState } from 'react';
import { Link } from 'react-router-dom';
import RunnerGate from '../components/RunnerGate.jsx';
import TerminalOverlay from '../components/TerminalOverlay.jsx';
import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useTheme } from '../context/ThemeContext.jsx';

export default function MainPage() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  usePageTitle('_main');

  return (
    <>
      <header>
        <div className="navbar-spacer" aria-hidden="true" />
        <RunnerGate open={runnerOpen} onClose={() => setRunnerOpen(false)} />
      </header>
      <main>
        <section id="home">
          <h1>_main</h1>
          <div className="home-layout">
            <div className="home-links">
              <button type="button" id="showcaseBtn" className="home-link">
                showcase
              </button>
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
