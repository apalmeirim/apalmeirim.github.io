import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Layout from './components/Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import MainPage from './pages/MainPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AppsPage from './pages/AppsPage.jsx';
import ReposPage from './pages/ReposPage.jsx';
import LinksPage from './pages/LinksPage.jsx';
import ShowcasePage from "./pages/ShowcasePage.jsx";
import UnderConstructionPage from './pages/UnderConstructionPage.jsx';


export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/about" element={<UnderConstructionPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/apps" element={<UnderConstructionPage />} />
          <Route path="/projects/repos" element={<UnderConstructionPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/under-construction" element={<UnderConstructionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
