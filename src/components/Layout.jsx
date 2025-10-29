import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Dither from './Dither/Dither.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Layout() {
  const { isDark } = useTheme();
  const waveColor = isDark ? [0.2, 0.2, 0.2] : [0.5, 0.5, 0.5];
  const location = useLocation();
  const hideNavbar = location.pathname === '/main';

  return (
    <div className="app-shell">
      <div className="app-shell__background">
        <Dither
          waveColor={waveColor}
          disableAnimation={false}
          enableMouseInteraction={false}
          mouseRadius={0.4}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>
      <div className="app-shell__content">
        {!hideNavbar && <Navbar />}
        <Outlet />
      </div>
    </div>
  );
}
