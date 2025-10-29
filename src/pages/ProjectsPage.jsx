import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function ProjectsPage() {
  usePageTitle('projects');

  return (
    <>
      <main>
        <section id="projects">
          <h1>projects</h1>
          <ul>
            <li>Project 1: (to future fill)</li>
            <li>Project 2: (to future fill)</li>
            <li>Project 3: (to future fill)</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
