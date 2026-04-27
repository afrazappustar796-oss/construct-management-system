import { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const ReportsPage = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [expenseTrends, setExpenseTrends] = useState([]);
  const [materialUsage, setMaterialUsage] = useState([]);
  const [laborCosts, setLaborCosts] = useState({ payments: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('budget');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [budgetRes, trendsRes, materialsRes, laborRes] = await Promise.all([
        api.get('/dashboard/budget-overview'),
        api.get('/dashboard/expense-trends'),
        api.get('/dashboard/material-usage'),
        api.get('/dashboard/labor-costs')
      ]);
      setBudgetData(budgetRes.data.data);
      setExpenseTrends(trendsRes.data.data);
      setMaterialUsage(materialsRes.data.data);
      setLaborCosts({ payments: laborRes.data.data.payments, total: laborRes.data.data.totalLaborCost });
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const downloadCSV = () => {
    let data = [];
    let filename = '';
    let headers = [];

    switch (reportType) {
      case 'budget':
        data = budgetData.map(d => ({ Project: d.name, Budget: d.budget, Spent: d.spent, Remaining: d.remaining }));
        headers = ['Project', 'Budget', 'Spent', 'Remaining'];
        filename = 'budget_report.csv';
        break;
      case 'expenses':
        data = expenseTrends.map(d => ({ Date: d.date, Amount: d.amount }));
        headers = ['Date', 'Amount'];
        filename = 'expense_trends.csv';
        break;
      case 'materials':
        data = materialUsage.map(d => ({ Material: d.name, Unit: d.unit, Quantity: d.quantity, Cost: d.cost }));
        headers = ['Material', 'Unit', 'Quantity', 'Cost'];
        filename = 'material_usage.csv';
        break;
      case 'labor':
        data = laborCosts.payments.map(p => ({ Worker: p.worker.name, Amount: p.amount, Date: new Date(p.date).toLocaleDateString() }));
        headers = ['Worker', 'Amount', 'Date'];
        filename = 'labor_costs.csv';
        break;
      default:
        return;
    }

    const csvContent = [headers.join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-3xl text-primary dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400">Generate and export reports</p>
        </div>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
        >
          📥 Download CSV
        </button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['budget', 'expenses', 'materials', 'labor'].map(type => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition ${
              reportType === type
                ? 'bg-accent text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {type} Report
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      ) : (
        <>
          {reportType === 'budget' && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="font-heading font-bold text-xl text-primary dark:text-white mb-4">Budget vs Actual by Project</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="budget" fill="#3B82F6" name="Budget" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spent" fill="#22C55E" name="Spent" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Project</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Budget</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Spent</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Remaining</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">% Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {budgetData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.name}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${row.budget.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right">${row.spent.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-accent">${row.remaining.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {((row.spent / row.budget) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'expenses' && (
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-heading font-bold text-xl text-primary dark:text-white mb-4">Expense Trends (30 Days)</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={expenseTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="amount" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === 'materials' && (
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-heading font-bold text-xl text-primary dark:text-white mb-4">Material Usage</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialUsage}
                      dataKey="quantity"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label
                    >
                      {materialUsage.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === 'labor' && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="font-heading font-bold text-xl text-primary dark:text-white mb-4">Total Labor Costs</h2>
                <p className="text-4xl font-heading font-bold text-accent">${laborCosts.total.toLocaleString()}</p>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Worker</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {laborCosts.payments.map((payment, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{payment.worker.name}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">${payment.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;