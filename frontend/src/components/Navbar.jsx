import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'Projects', icon: '🏗️' },
    { path: '/sites', label: 'Sites', icon: '📍' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/labor', label: 'Labor', icon: '👷' },
    { path: '/expenses', label: 'Expenses', icon: '💰' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ] : [];

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card bg-white/80 dark:bg-dark/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏗️</span>
              <span className="font-heading font-bold text-xl text-primary dark:text-white">ConstructPro</span>
            </Link>
          </div>

          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-accent text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user.name}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;