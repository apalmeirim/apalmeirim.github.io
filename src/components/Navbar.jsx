import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

const navLinks = [
  { to: '/main', label: '_main' },
  { to: '/about', label: 'aboutme' },
  { to: '/projects', label: 'projects' },
  { to: '/links', label: 'links' },
];

export default function Navbar({ showBackButton = false }) {
  const [open, setOpen] = useState(false);
  const menuToggleRef = useRef(null);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !menuToggleRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [open]);

  return (
    <div id="navbar-container">
      <div className="navbar">
        {showBackButton && (
          <Link
            to="#back"
            className="back-btn"
            aria-label="Go back"
            onClick={(event) => {
              event.preventDefault();
              navigate(-1);
            }}
          >
            {'<'}
          </Link>
        )}
        <button
          ref={menuToggleRef}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mainNav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          id="mainNav"
          ref={menuRef}
          className={`dropdown${open ? ' show' : ''}`}
          hidden={!open}
          aria-hidden={!open}
        >
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <div className="menu-toggle-switch">
                <label className="toggle-switch" aria-label="Toggle background theme">
                  <input type="checkbox" checked={!isDark} onChange={toggleTheme} />
                  <span className="toggle-switch__slider" aria-hidden="true" />
                </label>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
