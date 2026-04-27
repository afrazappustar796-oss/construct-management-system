import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-heading font-bold text-3xl text-primary dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="font-heading font-bold text-xl text-primary dark:text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
              <p className="text-lg font-medium text-primary dark:text-white">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <p className="text-lg font-medium text-primary dark:text-white">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Role</label>
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-accent/20 text-accent">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h2 className="font-heading font-bold text-xl text-primary dark:text-white mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition ${
                darkMode ? 'bg-accent' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl md:col-span-2">
          <h2 className="font-heading font-bold text-xl text-primary dark:text-white mb-4">Account</h2>
          <div className="space-y-4">
            <button
              onClick={logout}
              className="px-4 py-2 border border-danger text-danger rounded-lg hover:bg-danger/10 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h2 className="font-heading font-bold text-xl text-primary dark:text-white mb-4">About ConstructPro</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Version 1.0.0
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Global Construction Management & Cost Intelligence System for enterprise construction companies.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;