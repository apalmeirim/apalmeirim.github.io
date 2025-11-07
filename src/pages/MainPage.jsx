import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useTheme } from '../context/ThemeContext.jsx';
import ASCIIText from '../components/ASCIIText.jsx';

export default function MainPage() {
  const { isDark, toggleTheme } = useTheme();

  usePageTitle('_main');

  return (
    <>
      <header className="home-header">
        <div className="navbar-spacer" aria-hidden="true" />
        <div className="home-header__title" role="img" aria-label="_main">
          <ASCIIText text="_main" enableWaves asciiFontSize={4}/>
        </div>
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
          </div>
        </section>
      </main>
      <Footer>
        <div className="footer-controls">
          <label className="toggle-switch" aria-label="Toggle background theme">
            <input type="checkbox" checked={!isDark} onChange={toggleTheme} />
            <span className="toggle-switch__slider" aria-hidden="true" />
          </label>
        </div>
      </Footer>
    </>
  );
}
