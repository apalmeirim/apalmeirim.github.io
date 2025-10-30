import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { useTheme } from "../context/ThemeContext.jsx";
import Footer from "../components/Footer.jsx";
import DailySong from "../components/DailySong.jsx";
import SongArchive from "../components/SongArchive.jsx";

export default function Showcase() {
  const { isDark } = useTheme();
  usePageTitle("_showcase");

  return (
    <>

      <main className={`showcase-main ${isDark ? "dark" : "light"}`}>
        <DailySong />
        <SongArchive />
        </main>

      <Footer />
    </>
  );
}
