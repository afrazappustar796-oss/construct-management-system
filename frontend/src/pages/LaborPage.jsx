import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const LaborPage = () => {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editWorker, setEditWorker] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', wageType: 'DAILY', wageAmount: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersRes, attendanceRes] = await Promise.all([
        api.get('/workers'),
        api.get('/attendance')
      ]);
      setWorkers(workersRes.data.data);
      setAttendance(attendanceRes.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editWorker) {
        await api.put(`/workers/${editWorker.id}`, formData);
      } else {
        await api.post('/workers', formData);
      }
      fetchData();
      setModalOpen(false);
      setEditWorker(null);
      setFormData({ name: '', role: '', phone: '', wageType: 'DAILY', wageAmount: '' });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleEdit = (worker) => {
    setEditWorker(worker);
    setFormData({
      name: worker.name,
      role: worker.role,
      phone: worker.phone || '',
      wageType: worker.wageType,
      wageAmount: worker.wageAmount
    });
    setModalOpen(true);
  };

  const handleDelete = async (worker) => {
    if (window.confirm(`Delete worker "${worker.name}"?`)) {
      try {
        await api.delete(`/workers/${worker.id}`);
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleCheckIn = async (workerId) => {
    try {
      await api.post('/attendance/checkin', { workerId, siteId: null });
      fetchData();
      alert('Check-in successful!');
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (workerId) => {
    try {
      await api.post('/attendance/checkout', { workerId });
      fetchData();
      alert('Check-out successful!');
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
    }
  };

  const workerColumns = [
    { key: 'name', header: 'Worker Name' },
    { key: 'role', header: 'Role' },
    { key: 'phone', header: 'Phone', render: (val) => val || '-' },
    { key: 'wageType', header: 'Wage Type', render: (val) => <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">{val}</span> },
    { key: 'wageAmount', header: 'Wage', render: (val) => `$${val}/day` },
    { key: 'status', header: 'Status', render: (val) => (
      <span className={`px-2 py-1 text-xs rounded-full ${val === 'ACTIVE' ? 'bg-accent/20 text-accent' : 'bg-gray-200 text-gray-600'}`}>
        {val}
      </span>
    )},
  ];

  const attendanceColumns = [
    { key: 'date', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'worker', header: 'Worker', render: (val) => val?.name },
    { key: 'checkIn', header: 'Check In', render: (val) => val ? new Date(val).toLocaleTimeString() : '-' },
    { key: 'checkOut', header: 'Check Out', render: (val) => val ? new Date(val).toLocaleTimeString() : '-' },
    { key: 'status', header: 'Status', render: (val) => (
      <span className={`px-2 py-1 text-xs rounded-full ${val === 'PRESENT' ? 'bg-accent/20 text-accent' : 'bg-warning/20 text-warning'}`}>
        {val}
      </span>
    )},
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary dark:text-white">Labor</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage workers and attendance</p>
        </div>
        <button
          onClick={() => { setEditWorker(null); setFormData({ name: '', role: '', phone: '', wageType: 'DAILY', wageAmount: '' }); setModalOpen(true); }}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
        >
          + New Worker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workers.filter(w => w.status === 'ACTIVE').slice(0, 3).map(worker => (
          <div key={worker.id} className="glass-card p-4 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-heading font-bold text-lg text-primary dark:text-white">{worker.name}</h3>
                <p className="text-sm text-gray-500">{worker.role}</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">Active</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              <p>Wage: ${worker.wageAmount}/{worker.wageType.toLowerCase()}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleCheckIn(worker.id)}
                className="flex-1 px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90"
              >
                Check In
              </button>
              <button
                onClick={() => handleCheckOut(worker.id)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Check Out
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-heading font-bold text-lg text-primary dark:text-white">Workers</h2>
        </div>
        {loading ? (
          <div className="p-8 skeleton h-32" />
        ) : (
          <DataTable columns={workerColumns} data={workers} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-heading font-bold text-lg text-primary dark:text-white">Attendance</h2>
        </div>
        <DataTable columns={attendanceColumns} data={attendance} actions={false} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editWorker ? 'Edit Worker' : 'New Worker'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              placeholder="e.g., Mason, Electrician"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wage Type</label>
              <select
                value={formData.wageType}
                onChange={(e) => setFormData({ ...formData, wageType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
              >
                <option value="DAILY">Daily</option>
                <option value="MONTHLY">Monthly</option>
                <option value="PIECE">Piece</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wage Amount</label>
              <input
                type="number"
                value={formData.wageAmount}
                onChange={(e) => setFormData({ ...formData, wageAmount: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark text-primary dark:text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">{editWorker ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LaborPage;