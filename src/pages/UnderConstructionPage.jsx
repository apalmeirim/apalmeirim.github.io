import DecryptedText from '../components/DecryptedText/DecryptedText.jsx';
import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function UnderConstructionPage() {
  usePageTitle('under construction');

  return (
    <>
      <main>
        <section id="under-construction" className="under-construction">
          <header className="under-construction__header">

            <DecryptedText
              text="Work In Progress."
              sequential
              revealDirection="start"
              animateOn="view"
              className="under-construction__text"
              parentClassName="under-construction__decrypted"
              encryptedClassName="under-construction__text"
            />
          </header>

          <div className="under-construction__media">
            <img
              src="/assets/images/toad.GIF"
              alt="Under construction animation"
              loading="lazy"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
