import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const InventoryPage = () => {
  const [materials, setMaterials] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [formData, setFormData] = useState({ name: '', unit: '', costPerUnit: '', minStock: '' });
  const [logForm, setLogForm] = useState({ siteId: '', materialId: '', type: 'IN', quantity: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialsRes, logsRes, sitesRes] = await Promise.all([
        api.get('/materials'),
        api.get('/inventory'),
        api.get('/sites')
      ]);
      setMaterials(materialsRes.data.data);
      setLogs(logsRes.data.data);
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
      if (editMaterial) {
        await api.put(`/materials/${editMaterial.id}`, formData);
      } else {
        await api.post('/materials', formData);
      }
      fetchData();
      setModalOpen(false);
      setEditMaterial(null);
      setFormData({ name: '', unit: '', costPerUnit: '', minStock: '' });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', logForm);
      fetchData();
      setLogModalOpen(false);
      setLogForm({ siteId: '', materialId: '', type: 'IN', quantity: '', notes: '' });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleEdit = (material) => {
    setEditMaterial(material);
    setFormData({
      name: material.name,
      unit: material.unit,
      costPerUnit: material.costPerUnit,
      minStock: material.minStock
    });
    setModalOpen(true);
  };

  const handleDelete = async (material) => {
    if (window.confirm(`Delete material "${material.name}"?`)) {
      try {
        await api.delete(`/materials/${material.id}`);
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Material Name' },
    { key: 'unit', header: 'Unit' },
    { key: 'costPerUnit', header: 'Cost/Unit', render: (val) => `$${val.toFixed(2)}` },
    { key: 'minStock', header: 'Min Stock', render: (val) => val || '-' },
  ];

  const logColumns = [
    { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleString() },
    { key: 'material', header: 'Material', render: (val) => val?.name },
    { key: 'site', header: 'Site', render: (val) => val?.name },
    { key: 'type', header: 'Type', render: (val) => (
      <span className={`px-2 py-1 text-xs rounded-full ${val === 'IN' ? 'bg-accent/20 text-accent' : 'bg-warning/20 text-warning'}`}>
        {val}
      </span>
    )},
    { key: 'quantity', header: 'Quantity' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary dark:text-white">Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage materials and stock</p>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => { setLogForm({ siteId: '', materialId: '', type: 'IN', quantity: '', notes: '' }); setLogModalOpen(true); }}
            className="px-4 py-2 bg-warning text-dark rounded-lg hover:bg-warning/90 transition font-medium"
          >
            + Stock In/Out
          </button>
          <button
            onClick={() => { setEditMaterial(null); setFormData({ name: '', unit: '', costPerUnit: '', minStock: '' }); setModalOpen(true); }}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
          >
            + New Material
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-heading font-bold text-lg text-primary dark:text-white">Materials</h2>
        </div>
        {loading ? (
          <div className="p-8 skeleton h-32" />
        ) : (
          <DataTable columns={columns} data={materials} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-heading font-bold text-lg text-primary dark:text-white">Stock Logs</h2>
        </div>
        <DataTable columns={logColumns} data={logs} actions={false} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMaterial ? 'Edit Material' : 'New Material'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                placeholder="e.g., kg, bags"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost/Unit</label>
              <input
                type="number"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Stock Alert</label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              placeholder="Minimum stock level"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">{editMaterial ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} title="Stock In/Out">
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site</label>
            <select
              value={logForm.siteId}
              onChange={(e) => setLogForm({ ...logForm, siteId: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            >
              <option value="">Select site</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label>
            <select
              value={logForm.materialId}
              onChange={(e) => setLogForm({ ...logForm, materialId: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            >
              <option value="">Select material</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={logForm.type}
              onChange={(e) => setLogForm({ ...logForm, type: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            >
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
            <input
              type="number"
              value={logForm.quantity}
              onChange={(e) => setLogForm({ ...logForm, quantity: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={logForm.notes}
              onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setLogModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;