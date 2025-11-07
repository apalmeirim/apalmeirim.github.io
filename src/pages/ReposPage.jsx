import Footer from '../components/Footer.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const repoEntries = [
  {
    name: 'project blueprint',
    summary:
      'Use this template card to highlight the problem you tackled, the solution you shipped, and what makes the build special.',
    stack: ['tech one', 'tech two', 'tech three'],
    learnings: [
      'What you learned or validated while shipping the project.',
      'A challenge you solved or a system you implemented.',
      'Next steps or stretch goals to explore.',
    ],
    caseStudyUrl: '#',
    repoUrl: '#',
  },
  {
    name: 'future deep dive',
    summary:
      'Clone this entry for each repo you want to spotlight. Keep the copy conversational and focus on outcomes.',
    stack: ['primary tool', 'supporting library', 'platform'],
    learnings: [
      'Key insight #1',
      'Key insight #2',
      'Key insight #3',
    ],
    caseStudyUrl: '#',
    repoUrl: '#',
  },
];

export default function ReposPage() {
  usePageTitle('repos');

  return (
    <>
      <main>
        <section id="repos" className="projects-page repos-page">
          <header className="projects-page__header">
            <h1>repos</h1>
            <p>
              Collect the behind-the-scenes breakdowns. Each card pairs a narrative case study with
              the GitHub repo so readers can dig into the code.
            </p>
          </header>

          <section className="projects-section repos-section">
            <h2>case studies</h2>
            <p className="projects-section__intro">
              Replace the placeholder copy with a short pitch, note the stack, and capture the
              biggest learnings from the build.
            </p>
            <ul className="projects-list repo-list">
              {repoEntries.map((repo) => (
                <li key={repo.name} className="project-card repo-card">
                  <header className="repo-card__header">
                    <h3>{repo.name}</h3>
                  </header>
                  <p className="repo-card__summary">{repo.summary}</p>

                  <dl className="repo-card__meta">
                    <div className="repo-card__group">
                      <dt>tech stack</dt>
                      <dd>
                        <ul className="tag-list">
                          {repo.stack.map((tech) => (
                            <li key={tech}>{tech}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="repo-card__group">
                      <dt>learnings</dt>
                      <dd>
                        <ul className="bullet-list">
                          {repo.learnings.map((learning) => (
                            <li key={learning}>{learning}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>

                  <div className="repo-card__links">
                    <a className="repo-card__link repo-card__link--primary" href={repo.caseStudyUrl}>
                      read the case study
                    </a>
                    <a
                      className="repo-card__link"
                      href={repo.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      view on github
                    </a>
                  </div>
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
