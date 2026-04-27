import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const features = [
    {
      icon: '🏗️',
      title: 'Project Management',
      description: 'Manage multiple construction projects with detailed budget tracking and timeline monitoring.'
    },
    {
      icon: '📦',
      title: 'Inventory Control',
      description: 'Track materials across all sites with real-time stock levels and low stock alerts.'
    },
    {
      icon: '👷',
      title: 'Labor Management',
      description: 'Manage workers, track attendance, and calculate wages seamlessly.'
    },
    {
      icon: '💰',
      title: 'Cost Intelligence',
      description: 'Budget vs actual tracking, expense categorization, and comprehensive reporting.'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Visual charts and analytics to make data-driven decisions quickly.'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Role-based access control and audit logs for complete visibility.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-dark text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🏗️</span>
              <span className="font-heading font-bold text-xl">ConstructPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-white/10">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1 mb-6 rounded-full bg-accent/20 text-accent text-sm font-medium">
            🌟 Enterprise Construction Management Platform
          </div>
          <h1 className="font-heading font-bold text-5xl md:text-7xl mb-6 leading-tight">
            Build Smarter with
            <span className="text-accent block">ConstructPro</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            The global construction management & cost intelligence system used by enterprise companies to manage projects, materials, labor, and budgets in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-accent text-white rounded-xl hover:bg-accent/90 transition font-bold text-lg shadow-lg shadow-accent/30"
            >
              Get Started Free
            </Link>
            <button className="px-8 py-4 border border-white/30 rounded-xl hover:bg-white/10 transition font-bold text-lg">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg">
              A complete suite of tools to manage your construction business efficiently.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-4xl mb-6">
            Ready to Transform Your Construction Business?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join thousands of construction companies using ConstructPro to streamline their operations.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-5 bg-accent text-white rounded-xl hover:bg-accent/90 transition font-bold text-xl shadow-lg shadow-accent/30"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          © 2024 ConstructPro. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;