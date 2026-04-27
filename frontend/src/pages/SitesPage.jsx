import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const SitesPage = () => {
  const [sites, setSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    projectId: ''
  });

  useEffect(() => {
    fetchSites();
    fetchProjects();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSite) {
        await api.put(`/sites/${editSite.id}`, formData);
      } else {
        await api.post('/sites', formData);
      }
      fetchSites();
      setModalOpen(false);
      setEditSite(null);
      setFormData({ name: '', location: '', projectId: '' });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleEdit = (site) => {
    setEditSite(site);
    setFormData({
      name: site.name,
      location: site.location,
      projectId: site.projectId
    });
    setModalOpen(true);
  };

  const handleDelete = async (site) => {
    if (window.confirm(`Delete site "${site.name}"?`)) {
      try {
        await api.delete(`/sites/${site.id}`);
        fetchSites();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Site Name' },
    { key: 'location', header: 'Location' },
    { key: 'project', header: 'Project', render: (val) => val?.name || '-' },
    { key: 'status', header: 'Status', render: (val) => (
      <span className={`px-2 py-1 text-xs rounded-full ${val === 'ACTIVE' ? 'bg-accent/20 text-accent' : 'bg-gray-200 text-gray-600'}`}>
        {val}
      </span>
    )},
    { key: '_count', header: 'Activities', render: (val) => `${val?.inventoryLogs || 0} logs` },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary dark:text-white">Sites</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage construction sites</p>
        </div>
        <button
          onClick={() => { setEditSite(null); setFormData({ name: '', location: '', projectId: '' }); setModalOpen(true); }}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
        >
          + New Site
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 skeleton h-32" />
        ) : (
          <DataTable columns={columns} data={sites} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editSite ? 'Edit Site' : 'New Site'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            >
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">{editSite ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SitesPage;