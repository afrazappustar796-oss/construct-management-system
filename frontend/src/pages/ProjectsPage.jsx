import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        await api.put(`/projects/${editProject.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      fetchProjects();
      setModalOpen(false);
      setEditProject(null);
      setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      budget: project.budget,
      startDate: project.startDate?.split('T')[0] || '',
      endDate: project.endDate?.split('T')[0] || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (project) => {
    if (window.confirm(`Delete project "${project.name}"?`)) {
      try {
        await api.delete(`/projects/${project.id}`);
        fetchProjects();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Project Name' },
    { key: 'budget', header: 'Budget', render: (val) => `$${val.toLocaleString()}` },
    { key: 'status', header: 'Status', render: (val) => (
      <span className={`px-2 py-1 text-xs rounded-full ${val === 'ACTIVE' ? 'bg-accent/20 text-accent' : 'bg-gray-200 text-gray-600'}`}>
        {val}
      </span>
    )},
    { key: 'startDate', header: 'Start Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'endDate', header: 'End Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your construction projects</p>
        </div>
        <button
          onClick={() => { setEditProject(null); setFormData({ name: '', description: '', budget: '', startDate: '', endDate: '' }); setModalOpen(true); }}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
        >
          + New Project
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="skeleton h-10 w-full mb-4" />
            <div className="skeleton h-32 w-full" />
          </div>
        ) : (
          <DataTable columns={columns} data={projects} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProject ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              {editProject ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;