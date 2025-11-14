import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function LandingPage() {
  usePageTitle('.zzz');
  const [showWhisper, setShowWhisper] = useState(false);
  useEffect(() => {
    const previousPadding = document.body.style.padding;
    const previousBackground = document.body.style.backgroundColor;
    const previousColor = document.body.style.color;
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#0d0d0d';
    document.body.style.color = '#ffffff';
    document.body.classList.remove('modal-open');
    return () => {
      document.body.style.padding = previousPadding;
      document.body.style.backgroundColor = previousBackground;
      document.body.style.color = previousColor;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setShowWhisper(true), 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Link className="landing-page" to="/main" aria-label="Enter site">
      <img
        className="landing-page__image"
        src="/assets/images/sleepy-asleep_gif.gif"
        alt="Snoopy sleeping"
      />
      <div className="landing-page__whisper-slot" aria-live="polite">
        <p
          className={`landing-page__whisper ${
            showWhisper ? 'landing-page__whisper--visible' : ''
          }`}
        >
          click/tap to enter...
        </p>
      </div>
      <Footer />
    </Link>
  );
}
  