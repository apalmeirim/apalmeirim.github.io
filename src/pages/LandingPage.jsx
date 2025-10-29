import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function LandingPage() {
  usePageTitle('.zzz');
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

  return (
    <div className="landing-page">
      <Link className="landing-page__link" to="/main" aria-label="Enter site">
        <img
          className="landing-page__image"
          src="/assets/images/sleepy-asleep_gif.gif"
          alt="Snoopy sleeping"
        />
      </Link>
      <Footer />
    </div>
  );
}
