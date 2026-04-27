import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [formData, setFormData] = useState({ projectId: '', siteId: '', category: '', amount: '', description: '' });
  const [filter, setFilter] = useState({ projectId: '', category: '' });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.projectId) params.append('projectId', filter.projectId);
      if (filter.category) params.append('category', filter.category);

      const [expensesRes, projectsRes, sitesRes] = await Promise.all([
        api.get(`/expenses?${params}`),
        api.get('/projects'),
        api.get('/sites')
      ]);
      setExpenses(expensesRes.data.data);
      setProjects(projectsRes.data.data);
      setSites(sitesRes.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editExpense) {
        await api.put(`/expenses/${editExpense.id}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      fetchData();
      setModalOpen(false);
      setEditExpense(null);
      setFormData({ projectId: '', siteId: '', category: '', amount: '', description: '' });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setFormData({
      projectId: expense.projectId,
      siteId: expense.siteId || '',
      category: expense.category,
      amount: expense.amount,
      description: expense.description || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (expense) => {
    if (window.confirm(`Delete this expense?`)) {
      try {
        await api.delete(`/expenses/${expense.id}`);
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const categories = ['MATERIALS', 'LABOR', 'EQUIPMENT', 'TRANSPORT', 'FOOD', 'UTILITIES', 'OTHER'];

  const columns = [
    { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'project', header: 'Project', render: (val) => val?.name },
    { key: 'site', header: 'Site', render: (val) => val?.name || '-' },
    { key: 'category', header: 'Category', render: (val) => (
      <span className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">{val}</span>
    )},
    { key: 'amount', header: 'Amount', render: (val) => `$${val.toLocaleString()}` },
    { key: 'description', header: 'Description', render: (val) => val || '-' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary dark:text-white">Expenses</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage project expenses</p>
        </div>
        <button
          onClick={() => { setEditExpense(null); setFormData({ projectId: '', siteId: '', category: '', amount: '', description: '' }); setModalOpen(true); }}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
        >
          + New Expense
        </button>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter.projectId}
            onChange={(e) => setFilter({ ...filter, projectId: e.target.value })}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 skeleton h-32" />
        ) : (
          <DataTable columns={columns} data={expenses} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="font-heading font-bold text-2xl text-primary dark:text-white">
            ${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editExpense ? 'Edit Expense' : 'New Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            >
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site (Optional)</label>
            <select
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            >
              <option value="">Select site</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            >
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">{editExpense ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensesPage;