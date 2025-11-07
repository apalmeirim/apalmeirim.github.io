import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function AboutPage() {
  usePageTitle('about');

  return (
    <>
      <main>

        <section id="about-me">
          <h1>About Me</h1>
          <p>(to future fill)</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
