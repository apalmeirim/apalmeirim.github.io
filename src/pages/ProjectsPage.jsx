import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function ProjectsPage() {
  usePageTitle('projects');

  const pathways = [
    {
      title: 'apps',
      description:
        'ready to run apps that you can launch and use right away.',
      to: '/projects/apps',
      cta: 'browse apps',
    },
    {
      title: 'repos',
      description:
        'Github repositories with detailed write-ups for each project.',
      to: '/projects/repos',
      cta: 'open repos',
    },
  ];

  return (
    <>
      <main>
        <section id="projects" className="projects-hub">
          <header className="projects-hub__header">
            <h1>projects</h1>
          </header>

          <ul className="projects-hub__options">
            {pathways.map((path) => (
              <li key={path.title}>
                <Link className="projects-hub__card" to={path.to}>
                  <h2>{path.title}</h2>
                  <p>{path.description}</p>
                  <span className="projects-hub__cta-label">{path.cta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
