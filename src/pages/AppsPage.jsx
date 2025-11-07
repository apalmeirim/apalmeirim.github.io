import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const apps = [
  {
    name: 'c@ncelled',
    description: 'removes any artist(s) from your Spotify playlists and library.',
    href: 'https://apalmeirim.github.io/cancelled_app',
    status: 'final',
  },
];

export default function AppsPage() {
  usePageTitle('apps');

  return (
    <>
      <main>
        <section id="apps" className="projects-page apps-page">
          <header className="projects-page__header">
            <h1>apps</h1>
            <p>
              apps that are ready to run from a click of a link.
            </p>
          </header>

          <section className="projects-section apps-section">
            <h2>live builds</h2>
            <ul className="projects-list apps-list">
              {apps.map((app) => (
                <li key={app.name} className="project-card app-card">
                  <div className="project-card__body">
                    <div className="project-card__eyebrow">{app.status}</div>
                    <h3>{app.name}</h3>
                    <p>{app.description}</p>
                  </div>
                  <a className="project-card__cta" href={app.href} target="_blank" rel="noreferrer">
                    launch app
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
