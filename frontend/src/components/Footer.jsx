const Footer = () => {
  return (
    <footer className="bg-primary text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading font-bold text-xl mb-4">🏗️ ConstructPro</h3>
            <p className="text-gray-400 text-sm">
              Global Construction Management & Cost Intelligence System for enterprise construction companies.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Project Management</li>
              <li>Inventory Tracking</li>
              <li>Labor Management</li>
              <li>Cost Analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Support</li>
              <li>Updates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📧 support@constructpro.com</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>📍 Global Headquarters</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          © 2024 ConstructPro. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;