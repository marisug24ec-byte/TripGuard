// TripGuard AI - Interactive Budget Tracker (Recharts + Deterministic Arithmetic)
import React, { useState } from 'react';
import { 
  Wallet, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Calendar, 
  PieChart as PieIcon, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle,
  Tag,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useTrip } from '../context/TripContext';
import { StatCard } from '../components/common/StatCard';
import { ExpenseCategory } from '../types';

export const BudgetTracker: React.FC = () => {
  const { activeTrip, activeItinerary, expenses, addExpense, deleteExpense } = useTrip();

  // Add Expense Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<ExpenseCategory>('activities');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number>(500);
  const [expenseDate, setExpenseDate] = useState<string>(activeTrip.departure_date);

  const estimatedBreakdown = activeItinerary?.itinerary_data.costBreakdown || {
    transport: 7200,
    accommodation: 9600,
    food: 6000,
    activities: 4200,
    miscellaneous: 1400,
  };

  const totalEstimatedCost = activeItinerary?.total_estimated_cost || 28400;

  // Calculate actual totals by category
  const actualTotals: { [key in ExpenseCategory]: number } = {
    transport: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    miscellaneous: 0,
  };

  expenses.forEach((exp) => {
    if (actualTotals[exp.category] !== undefined) {
      actualTotals[exp.category] += Number(exp.amount);
    }
  });

  const totalActualCost = Object.values(actualTotals).reduce((a, b) => a + b, 0);
  const remainingAgainstActual = activeTrip.budget - totalActualCost;

  // Recharts Data: Donut breakdown of actual / estimated
  const pieData = [
    { name: 'Transport', value: actualTotals.transport || estimatedBreakdown.transport, color: '#38bdf8' },
    { name: 'Accommodation', value: actualTotals.accommodation || estimatedBreakdown.accommodation, color: '#2dd4bf' },
    { name: 'Food', value: actualTotals.food || estimatedBreakdown.food, color: '#fbbf24' },
    { name: 'Activities', value: actualTotals.activities || estimatedBreakdown.activities, color: '#818cf8' },
    { name: 'Miscellaneous', value: actualTotals.miscellaneous || estimatedBreakdown.miscellaneous, color: '#f43f5e' },
  ];

  // Recharts Data: Comparison Bar Chart (Estimated vs Actual)
  const barData = [
    { category: 'Transport', Estimated: estimatedBreakdown.transport, Actual: actualTotals.transport },
    { category: 'Lodging', Estimated: estimatedBreakdown.accommodation, Actual: actualTotals.accommodation },
    { category: 'Food', Estimated: estimatedBreakdown.food, Actual: actualTotals.food },
    { category: 'Activities', Estimated: estimatedBreakdown.activities, Actual: actualTotals.activities },
    { category: 'Misc', Estimated: estimatedBreakdown.miscellaneous, Actual: actualTotals.miscellaneous },
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    addExpense({
      category,
      description: description.trim(),
      amount: Number(amount),
      expense_date: expenseDate,
    });

    setDescription('');
    setAmount(500);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-teal-400" />
            <span>Deterministic Budget Tracker</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Compare AI estimated allocations with actual recorded receipts. Pure deterministic arithmetic.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 text-navy-950 hover:bg-teal-400 shadow-lg shadow-teal-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Actual Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Authorized Trip Budget"
          value={`₹${activeTrip.budget.toLocaleString('en-IN')}`}
          subtitle="User defined cap"
          icon={IndianRupee}
          color="blue"
        />
        <StatCard
          title="Total Estimated Cost"
          value={`₹${totalEstimatedCost.toLocaleString('en-IN')}`}
          subtitle="Itinerary projection"
          icon={Calendar}
          color="cyan"
          badge={`v${activeItinerary?.version || 1}`}
        />
        <StatCard
          title="Actual Recorded Expenses"
          value={`₹${totalActualCost.toLocaleString('en-IN')}`}
          subtitle={`${expenses.length} receipt items logged`}
          icon={Wallet}
          color="amber"
          badge={`${Math.round((totalActualCost / activeTrip.budget) * 100)}% Spent`}
        />
        <StatCard
          title="Remaining Balance"
          value={`₹${remainingAgainstActual.toLocaleString('en-IN')}`}
          subtitle={remainingAgainstActual >= 0 ? 'Within budget limit' : 'Budget overrun alert'}
          icon={ShieldCheck}
          color={remainingAgainstActual >= 0 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown Donut (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-teal-400" />
              <span>Expense Allocation by Category</span>
            </h3>
            <span className="text-[10px] text-slate-400">Recharts Visual</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Allocation']}
                  contentStyle={{ backgroundColor: '#0a1533', borderColor: '#1e3477', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-navy-950/60">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 font-medium">{item.name}</span>
                <span className="text-slate-400 ml-auto font-mono">₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Bar Chart: Estimated vs Actual (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Category Comparison: Estimated vs. Actual</span>
            </h3>
            <span className="text-[10px] text-slate-400">INR Currency</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0a1533', borderColor: '#1e3477', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Estimated" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actual Expenses Ledger Table */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-400" />
            <span>Actual Expense Ledger ({expenses.length} Records)</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Deterministic Ledger</span>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No actual expenses recorded yet. Click "Record Actual Expense" to log your receipts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Description</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Amount (INR)</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-400">
                      {exp.expense_date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap capitalize font-bold text-teal-300">
                      {exp.category}
                    </td>
                    <td className="py-3.5 px-4 text-white font-medium">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-emerald-400">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-md" 
            onClick={() => setIsAddModalOpen(false)} 
          />
          <div className="relative w-full max-w-md bg-navy-900 border border-slate-700 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Record Actual Expense</h3>
            
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="activities">Activities & Sightseeing</option>
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="food">Food & Dining</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. City Palace composite ticket"
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Amount in INR (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 text-navy-950 hover:bg-teal-400 transition-colors"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
