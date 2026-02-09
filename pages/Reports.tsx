
import React, { useState, useMemo } from 'react';
import { 
  Download, 
  TrendingUp, 
  Wallet, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Briefcase, 
  History, 
  Clock, 
  MapPin,
  Smartphone,
  CreditCard,
  CircleDollarSign
} from 'lucide-react';
import { Trip, FinanceEntry, FinanceType, Booking, PaymentMethod, ServiceCategory } from '../types';

interface ReportsProps {
  trips: Trip[];
  finance: FinanceEntry[];
  bookings: Booking[];
}

type FilterType = 'all' | 'today' | 'last30' | 'last6months' | 'thisYear' | 'custom';

const Reports: React.FC<ReportsProps> = ({ trips, finance, bookings }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const filteredData = useMemo(() => {
    const now = new Date();
    
    const filterByDate = (dateStr: string) => {
      const d = new Date(dateStr);
      
      switch (filter) {
        case 'today':
          const today = new Date();
          return d.toDateString() === today.toDateString();
        case 'last30':
          return d.getTime() >= now.getTime() - 30 * 24 * 60 * 60 * 1000;
        case 'last6months':
          return d.getTime() >= now.getTime() - 180 * 24 * 60 * 60 * 1000;
        case 'thisYear':
          return d.getFullYear() === now.getFullYear();
        case 'custom':
          if (!customRange.start || !customRange.end) return true;
          const start = new Date(customRange.start);
          const end = new Date(customRange.end);
          end.setHours(23, 59, 59);
          return d >= start && d <= end;
        default:
          return true;
      }
    };

    return {
      finance: finance.filter(f => filterByDate(f.date)),
      bookings: bookings.filter(b => filterByDate(b.bookingDate))
    };
  }, [filter, customRange, finance, bookings]);

  const stats = useMemo(() => {
    const totalIncome = filteredData.finance
      .filter(f => f.type === FinanceType.INCOME)
      .reduce((s, f) => s + f.amount, 0);
    
    const totalExpense = filteredData.finance
      .filter(f => f.type === FinanceType.EXPENSE)
      .reduce((s, f) => s + f.amount, 0);

    const bookingMargins = filteredData.bookings.reduce((sum, b) => sum + ((b.serviceFee || 0) * b.numPersons), 0);
    const serviceProfits = filteredData.finance.reduce((sum, f) => sum + (f.profitAmount || 0), 0);
    const companyRevenue = bookingMargins + serviceProfits;
    
    const methodTotals = {
      cash: filteredData.finance
        .filter(f => f.paymentMethod === PaymentMethod.CASH && f.type === FinanceType.INCOME)
        .reduce((s, f) => s + f.amount, 0),
      upi: filteredData.finance
        .filter(f => f.paymentMethod === PaymentMethod.UPI && f.type === FinanceType.INCOME)
        .reduce((s, f) => s + f.amount, 0),
      card: filteredData.finance
        .filter(f => f.paymentMethod === PaymentMethod.CARD && f.type === FinanceType.INCOME)
        .reduce((s, f) => s + f.amount, 0),
    };

    return { 
      totalIncome, 
      totalExpense, 
      companyRevenue, 
      methodTotals, 
      netProfit: totalIncome - totalExpense 
    };
  }, [filteredData]);

  const serviceStats = useMemo(() => {
    const categories = [
      ServiceCategory.PASSPORT,
      ServiceCategory.VISA,
      ServiceCategory.CURRENCY_EXCHANGE,
      ServiceCategory.TICKET,
      ServiceCategory.INSURANCE,
      ServiceCategory.OTHER
    ];

    return categories.map(cat => {
      const entries = filteredData.finance.filter(f => f.category === cat);
      const income = entries.filter(e => e.type === FinanceType.INCOME).reduce((s, e) => s + e.amount, 0);
      const profit = entries.filter(e => e.type === FinanceType.INCOME).reduce((s, e) => s + (e.profitAmount || 0), 0);
      return { category: cat, income, profit, count: entries.length };
    }).filter(s => s.count > 0);
  }, [filteredData]);

  const handleDownloadReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tripRows = trips.map(trip => {
      const tripFinance = filteredData.finance.filter(f => f.tripId === trip.id);
      const tripIncome = tripFinance.filter(f => f.type === FinanceType.INCOME).reduce((s, f) => s + f.amount, 0);
      const tripExpense = tripFinance.filter(f => f.type === FinanceType.EXPENSE).reduce((s, f) => s + f.amount, 0);
      const tripBooked = filteredData.bookings.filter(b => b.tripId === trip.id).reduce((s, b) => s + b.numPersons, 0);
      return `
        <tr>
          <td>${trip.name}</td>
          <td style="text-align:center">${tripBooked} Pax</td>
          <td style="text-align:right">₹${tripIncome.toLocaleString()}</td>
          <td style="text-align:right">₹${tripExpense.toLocaleString()}</td>
          <td style="text-align:right; font-weight: bold;">₹${(tripIncome - tripExpense).toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const serviceRows = serviceStats.map(s => `
      <tr>
        <td>${s.category}</td>
        <td style="text-align:center">${s.count} Entries</td>
        <td style="text-align:right">₹${s.income.toLocaleString()}</td>
        <td style="text-align:right; font-weight: bold;">₹${s.profit.toLocaleString()}</td>
      </tr>
    `).join('');

    const transactionRows = filteredData.finance
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(f => `
        <tr>
          <td>${new Date(f.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
          <td>${f.category}</td>
          <td><span style="color: ${f.type === FinanceType.INCOME ? '#10b981' : '#ef4444'}; font-weight: 800;">${f.type.toUpperCase()}</span></td>
          <td style="text-align:right">₹${f.amount.toLocaleString()}</td>
          <td style="text-align:right; color: #3b82f6;">₹${(f.profitAmount || 0).toLocaleString()}</td>
        </tr>
      `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Avenue - Full Audit Report</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.4; padding: 0; margin: 0; font-size: 11px; }
          .container { max-width: 800px; margin: 0 auto; padding: 10px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
          .brand { font-size: 24px; font-weight: 900; color: #3b82f6; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center; }
          .card h4 { margin: 0; font-size: 8px; color: #64748b; text-transform: uppercase; }
          .card p { margin: 5px 0 0 0; font-size: 13px; font-weight: 900; }
          .section-title { font-size: 10px; font-weight: 800; color: #1e293b; margin: 20px 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th { background: #f1f5f9; padding: 8px; text-align: left; font-size: 9px; color: #475569; border-bottom: 1px solid #cbd5e1; }
          .table td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
          .mode-grid { display: flex; gap: 20px; margin-bottom: 20px; }
          .mode-item { flex: 1; padding: 10px; border: 1px solid #f1f5f9; border-radius: 6px; }
          .mode-item h5 { margin: 0; font-size: 8px; color: #94a3b8; text-transform: uppercase; }
          .mode-item p { margin: 4px 0 0 0; font-weight: 900; font-size: 12px; color: #334155; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">AVENUE TRAVELS</div>
            <div style="text-align:right">
              <div style="font-weight:bold">Full Audit Report</div>
              <div>${new Date().toLocaleString()}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card"><h4>Gross Income</h4><p>₹${stats.totalIncome.toLocaleString()}</p></div>
            <div class="card"><h4>Operations</h4><p>₹${stats.totalExpense.toLocaleString()}</p></div>
            <div class="card" style="background:#eff6ff"><h4>Revenue</h4><p style="color:#2563eb">₹${stats.companyRevenue.toLocaleString()}</p></div>
            <div class="card" style="background:#1e293b"><h4>Net Profit</h4><p style="color:white">₹${stats.netProfit.toLocaleString()}</p></div>
          </div>

          <div class="section-title">Revenue by Payment Mode</div>
          <div class="mode-grid">
            <div class="mode-item"><h5>Cash Collection</h5><p>₹${stats.methodTotals.cash.toLocaleString()}</p></div>
            <div class="mode-item"><h5>UPI Collection</h5><p>₹${stats.methodTotals.upi.toLocaleString()}</p></div>
            <div class="mode-item"><h5>Card/Online Collection</h5><p>₹${stats.methodTotals.card.toLocaleString()}</p></div>
          </div>

          <div class="section-title">Trip Performance Breakdown</div>
          <table class="table">
            <thead><tr><th>Trip</th><th>Sales</th><th>Income</th><th>Expense</th><th>Net Profit</th></tr></thead>
            <tbody>${tripRows}</tbody>
          </table>

          <div class="section-title">General Service Performance</div>
          <table class="table">
            <thead><tr><th>Service Category</th><th>Volume</th><th>Gross Sales</th><th>Company Margin</th></tr></thead>
            <tbody>${serviceRows}</tbody>
          </table>

          <div class="section-title">Transaction Log (Date & Time)</div>
          <table class="table">
            <thead><tr><th>Timestamp</th><th>Category</th><th>Type</th><th>Amount</th><th>Margin</th></tr></thead>
            <tbody>${transactionRows}</tbody>
          </table>
        </div>
        <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              <Filter size={22} className="mr-2 text-blue-600" /> 
              Analytics Filters
            </h3>
            <p className="text-sm text-slate-500">Track performance by specific time periods</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'today', 'last30', 'last6months', 'thisYear', 'custom'].map(id => (
              <button 
                key={id} 
                onClick={() => setFilter(id as FilterType)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  filter === id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z0-9])/g, ' $1')}
              </button>
            ))}
          </div>
        </div>
        
        {filter === 'custom' && (
          <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase">From</span>
              <input 
                type="date" 
                value={customRange.start} 
                onChange={e => setCustomRange({...customRange, start: e.target.value})}
                className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase">To</span>
              <input 
                type="date" 
                value={customRange.end} 
                onChange={e => setCustomRange({...customRange, end: e.target.value})}
                className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group">
          <ArrowUpRight className="absolute top-4 right-4 text-emerald-100 group-hover:text-emerald-200 transition-colors" size={40} />
          <span className="text-xs font-black uppercase text-slate-400">Total Income</span>
          <div className="text-2xl font-black text-slate-800 mt-1">₹{stats.totalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group">
          <ArrowDownRight className="absolute top-4 right-4 text-red-50 group-hover:text-red-100 transition-colors" size={40} />
          <span className="text-xs font-black uppercase text-slate-400">Total Expenses</span>
          <div className="text-2xl font-black text-slate-800 mt-1">₹{stats.totalExpense.toLocaleString()}</div>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 relative group">
          <TrendingUp className="absolute top-4 right-4 text-blue-100 group-hover:text-blue-200 transition-colors" size={40} />
          <span className="text-xs font-black uppercase text-blue-600">Agency Revenue</span>
          <div className="text-2xl font-black text-blue-800 mt-1">₹{stats.companyRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative group">
          <Wallet className="absolute top-4 right-4 text-slate-800 group-hover:text-slate-700 transition-colors" size={40} />
          <span className="text-xs font-black uppercase text-slate-400">Net Profit</span>
          <div className="text-2xl font-black text-white mt-1">₹{stats.netProfit.toLocaleString()}</div>
        </div>
      </div>

      {/* Payment Mode Collection Stats */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center">
          <CircleDollarSign size={14} className="mr-1.5" /> Collection by Payment Mode
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <div className="flex items-center p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
             <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
               <Wallet size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cash Revenue</p>
               <p className="text-xl font-black text-slate-800">₹{stats.methodTotals.cash.toLocaleString()}</p>
             </div>
           </div>
           <div className="flex items-center p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
               <Smartphone size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">UPI Collection</p>
               <p className="text-xl font-black text-slate-800">₹{stats.methodTotals.upi.toLocaleString()}</p>
             </div>
           </div>
           <div className="flex items-center p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
               <CreditCard size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Card / Online</p>
               <p className="text-xl font-black text-slate-800">₹{stats.methodTotals.card.toLocaleString()}</p>
             </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleDownloadReport}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          <Download size={20} className="mr-2" /> 
          Export Report to PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center">
            <MapPin size={18} className="mr-2 text-blue-600" />
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Trip Profitability</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Trip</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Gross</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {trips.map(t => {
                  const tripFinance = filteredData.finance.filter(f => f.tripId === t.id);
                  const income = tripFinance.filter(f => f.type === FinanceType.INCOME).reduce((s, f) => s + f.amount, 0);
                  const expense = tripFinance.filter(f => f.type === FinanceType.EXPENSE).reduce((s, f) => s + f.amount, 0);
                  const profit = income - expense;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{t.destination}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">₹{income.toLocaleString()}</td>
                      <td className={`px-6 py-4 text-sm font-black text-right ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        ₹{profit.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center">
            <Briefcase size={18} className="mr-2 text-blue-600" />
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Service Analysis</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Service Type</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Sales</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">Agency Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {serviceStats.map(s => (
                  <tr key={s.category} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{s.category}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{s.count} transactions</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">₹{s.income.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-black text-blue-600 text-right">₹{s.profit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center">
          <History size={18} className="mr-2 text-blue-600" />
          <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Full Transaction Audit Log</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Timestamp</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Mode</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">Gross Amount</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredData.finance
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-500 font-medium whitespace-nowrap">
                        <Clock size={12} className="mr-2" />
                        {new Date(f.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                        {f.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className={`text-[10px] font-black uppercase mb-0.5 ${f.type === FinanceType.INCOME ? 'text-emerald-500' : 'text-red-500'}`}>{f.type}</div>
                       <div className="font-bold text-slate-700">{f.category}</div>
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${f.type === FinanceType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                      {f.type === FinanceType.INCOME ? '+' : '-'} ₹{f.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      {f.profitAmount ? `₹${f.profitAmount.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              {filteredData.finance.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">No recordable financial history in selected range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
