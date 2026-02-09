
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  CreditCard, 
  TrendingUp, 
  Package
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Customer, Trip, Booking, FinanceEntry, FinanceType } from '../types';

interface DashboardProps {
  customers: Customer[];
  trips: Trip[];
  bookings: Booking[];
  finance: FinanceEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ customers, trips, bookings, finance }) => {
  const navigate = useNavigate();

  const totalIncome = finance
    .filter(f => f.type === FinanceType.INCOME)
    .reduce((sum, f) => sum + f.amount, 0);
  
  const totalExpense = finance
    .filter(f => f.type === FinanceType.EXPENSE)
    .reduce((sum, f) => sum + f.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Mock data for the chart - Group finance by month
  const chartData = [
    { month: 'Jan', income: 45000, expense: 32000 },
    { month: 'Feb', income: 52000, expense: 34000 },
    { month: 'Mar', income: 48000, expense: 31000 },
    { month: 'Apr', income: 61000, expense: 38000 },
    { month: 'May', income: totalIncome, expense: totalExpense },
  ];

  const stats = [
    { title: 'Total Customers', value: customers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', path: '/customers' },
    { title: 'Total Trips', value: trips.length, icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-100', path: '/trips' },
    { title: 'Active Bookings', value: bookings.length, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100', path: '/bookings' },
    { title: 'Net Profit', value: `₹${netProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100', path: '/finance' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.path)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className={`p-4 rounded-lg ${stat.bg} ${stat.color} mr-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Financial Performance</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 focus:ring-blue-500 outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Quick Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Upcoming Trips</h3>
          <div className="space-y-4">
            {trips.slice(0, 4).map((trip) => (
              <div 
                key={trip.id} 
                onClick={() => navigate('/trips')}
                className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
              >
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{trip.name}</p>
                  <p className="text-xs text-slate-500">{new Date(trip.startDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                    trip.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {trip.status}
                  </span>
                </div>
              </div>
            ))}
            {trips.length === 0 && <p className="text-slate-400 text-center py-4">No upcoming trips</p>}
          </div>
          <button 
            onClick={() => navigate('/trips')}
            className="w-full mt-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View All Trips
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
