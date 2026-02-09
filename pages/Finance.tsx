
import React, { useState } from 'react';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp, DollarSign, Printer, User, Repeat, Save, CreditCard, Smartphone } from 'lucide-react';
import { FinanceEntry, FinanceType, Trip, Booking, PaymentMethod, ServiceCategory } from '../types';

interface FinanceProps {
  finance: FinanceEntry[];
  bookings: Booking[];
  trips: Trip[];
  onAdd: (f: Omit<FinanceEntry, 'id'>) => void;
}

const Finance: React.FC<FinanceProps> = ({ finance, bookings, trips, onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FinanceType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>(ServiceCategory.OTHER);
  const [entryType, setEntryType] = useState<FinanceType>(FinanceType.INCOME);
  
  const [baseInput, setBaseInput] = useState<number>(0);
  const [marginInput, setMarginInput] = useState<number>(0);

  const resetForm = () => {
    setBaseInput(0);
    setMarginInput(0);
    setSelectedCategory(ServiceCategory.OTHER);
    setEntryType(FinanceType.INCOME);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as FinanceType;
    
    let totalAmount = 0;
    let base = 0;
    let profit = 0;

    if (type === FinanceType.INCOME && selectedCategory !== ServiceCategory.BOOKING) {
      base = Number(formData.get('baseAmount') || 0);
      profit = Number(formData.get('profitAmount') || 0);
      totalAmount = base + profit;
      if (totalAmount === 0 && formData.get('amount')) {
         totalAmount = Number(formData.get('amount'));
      }
    } else {
      totalAmount = Number(formData.get('amount') || 0);
    }

    const inputDate = formData.get('date') as string;
    const now = new Date();
    const preciseDate = new Date(inputDate);
    preciseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const data: Omit<FinanceEntry, 'id'> = {
      type: type,
      category: formData.get('category') as string,
      amount: totalAmount,
      baseAmount: base > 0 ? base : undefined,
      profitAmount: profit > 0 ? profit : undefined,
      date: preciseDate.toISOString(),
      tripId: formData.get('tripId') as string || undefined,
      description: formData.get('description') as string,
      paymentMethod: formData.get('paymentMethod') as PaymentMethod,
      clientName: formData.get('clientName') as string || undefined,
      clientContact: formData.get('clientContact') as string || undefined,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
    };
    onAdd(data);
    setIsModalOpen(false);
    resetForm();
  };

  const handlePrintInvoice = (entry: FinanceEntry) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${entry.clientName || 'Client'}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; line-height: 1.6; padding: 0; margin: 0; }
          .container { max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 8px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { display: flex; align-items: center; gap: 12px; }
          .brand-icon { width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 900; }
          .brand-text { font-size: 32px; font-weight: 900; color: #3b82f6; letter-spacing: -2px; }
          .invoice-meta { text-align: right; }
          .invoice-meta h1 { margin: 0; color: #64748b; font-size: 28px; font-weight: 800; text-transform: uppercase; }
          .invoice-meta p { margin: 4px 0 0 0; color: #94a3b8; font-size: 12px; font-weight: 700; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .section-label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
          .info-p { margin: 4px 0; font-weight: 600; font-size: 14px; color: #334155; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; }
          .table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .totals { margin-left: auto; width: 300px; border-top: 2px solid #3b82f6; padding-top: 20px; }
          .total-row { display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 8px; }
          .grand-total { font-size: 24px; font-weight: 900; color: #1e293b; margin-top: 10px; }
          .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          .payment-method { display: inline-block; background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 4px; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">
              <div class="brand-icon">✈</div>
              <div class="brand-text">AVENUE</div>
            </div>
            <div class="invoice-meta">
              <h1>Invoice</h1>
              <p>NO: ${entry.invoiceNumber || 'INV-000000'}</p>
              <p>DATE: ${new Date(entry.date).toLocaleString()}</p>
            </div>
          </div>
          
          <div class="details-grid">
            <div>
              <div class="section-label">Billed To</div>
              <p class="info-p"><strong>${entry.clientName || 'Valued Client'}</strong></p>
              <p class="info-p">${entry.clientContact || 'Contact details not provided'}</p>
            </div>
            <div style="text-align: right;">
              <div class="section-label">Service Provider</div>
              <p class="info-p"><strong>Avenue tours and travels</strong></p>
              <p class="info-p">Beena Arcade, Erumapetty</p>
              <p class="info-p">Thrissur 680584, Kerala</p>
              <p class="info-p">avenuetravels2026@gmail.com</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description of Service</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="font-weight: 800; color: #1e293b;">${entry.category}</div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${entry.description}</div>
                  ${entry.profitAmount ? `
                    <div style="font-size: 11px; color: #64748b; margin-top: 6px; font-style: italic;">
                      Base Amount: ₹${entry.baseAmount?.toLocaleString()} | 
                      Company Revenue: ₹${entry.profitAmount?.toLocaleString()}
                    </div>
                  ` : ''}
                </td>
                <td style="text-align: right; font-weight: 700; font-size: 16px;">₹${entry.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₹${entry.amount.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Tax (Inclusive)</span>
              <span>₹0.00</span>
            </div>
            <div class="total-row grand-total">
              <span>TOTAL</span>
              <span>₹${entry.amount.toLocaleString()}</span>
            </div>
            <div style="text-align: right;">
              <span class="payment-method">Paid via ${entry.paymentMethod || 'CASH'}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for choosing AVENUE for your travel needs.</p>
            <p>This is a computer generated invoice and requires no signature.</p>
            <p style="margin-top: 10px; font-weight: 800; color: #3b82f6;">AVENUE | TRAVEL WITH EXCELLENCE</p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filtered = activeTab === 'ALL' ? finance : finance.filter(f => f.type === activeTab);
  
  const incomeTotal = finance.filter(f => f.type === FinanceType.INCOME).reduce((s, f) => s + f.amount, 0);
  const expensesTotal = finance.filter(f => f.type === FinanceType.EXPENSE).reduce((s, f) => s + f.amount, 0);
  
  const tripMargins = bookings.reduce((sum, b) => sum + ((b.serviceFee || 0) * b.numPersons), 0);
  const otherServiceMargins = finance.filter(f => f.type === FinanceType.INCOME && f.profitAmount).reduce((s, f) => s + (f.profitAmount || 0), 0);
  const totalRevenue = tripMargins + otherServiceMargins;

  // Payment Method Breakdown
  const cashTotal = finance.filter(f => f.type === FinanceType.INCOME && f.paymentMethod === PaymentMethod.CASH).reduce((s, f) => s + f.amount, 0);
  const upiTotal = finance.filter(f => f.type === FinanceType.INCOME && f.paymentMethod === PaymentMethod.UPI).reduce((s, f) => s + f.amount, 0);
  const cardTotal = finance.filter(f => f.type === FinanceType.INCOME && f.paymentMethod === PaymentMethod.CARD).reduce((s, f) => s + f.amount, 0);

  const useSplitPricing = entryType === FinanceType.INCOME && selectedCategory !== ServiceCategory.BOOKING;

  return (
    <div className="space-y-6">
      {/* Primary Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase">Total Income</span>
            <ArrowUpCircle className="text-emerald-500" size={20} />
          </div>
          <h4 className="text-xl font-bold text-slate-800">₹{incomeTotal.toLocaleString()}</h4>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase">Total Expenses</span>
            <ArrowDownCircle className="text-red-500" size={20} />
          </div>
          <h4 className="text-xl font-bold text-slate-800">₹{expensesTotal.toLocaleString()}</h4>
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 text-xs font-bold uppercase">Agency Margin</span>
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <h4 className="text-xl font-bold text-blue-900">₹{totalRevenue.toLocaleString()}</h4>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase">Cash Balance</span>
            <Wallet className="text-blue-400" size={20} />
          </div>
          <h4 className="text-xl font-bold">₹{(incomeTotal - expensesTotal).toLocaleString()}</h4>
        </div>
      </div>

      {/* Payment Method Summary (Cash / UPI / Online) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h5 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center">
          <DollarSign size={14} className="mr-1" /> Collection by Mode
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-3">
               <Wallet size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400">Cash</p>
               <p className="text-lg font-black text-slate-800">₹{cashTotal.toLocaleString()}</p>
             </div>
           </div>
           <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
               <Smartphone size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400">UPI</p>
               <p className="text-lg font-black text-slate-800">₹{upiTotal.toLocaleString()}</p>
             </div>
           </div>
           <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
             <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-3">
               <CreditCard size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-slate-400">Card / Online</p>
               <p className="text-lg font-black text-slate-800">₹{cardTotal.toLocaleString()}</p>
             </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('ALL')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
          <button onClick={() => setActiveTab(FinanceType.INCOME)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === FinanceType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}>Incomes</button>
          <button onClick={() => setActiveTab(FinanceType.EXPENSE)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === FinanceType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-red-600'}`}>Expenses</button>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-bold"
        >
          <Plus size={18} className="mr-2" />
          Add Entry
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Transaction</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Method</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => {
                const isIncome = entry.type === FinanceType.INCOME;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500 font-bold uppercase">{new Date(entry.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                      <div className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1">
                        {entry.category === ServiceCategory.CURRENCY_EXCHANGE && <Repeat size={12} className="text-blue-500" />}
                        {entry.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-600 uppercase">
                        {entry.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 italic line-clamp-1 max-w-xs">{entry.description}</div>
                      {entry.clientName && <div className="text-[10px] text-slate-400 mt-1 font-bold">Client: {entry.clientName}</div>}
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'} ₹{entry.amount.toLocaleString()}
                      {entry.profitAmount && (
                        <div className="text-[9px] text-blue-500 font-bold flex items-center justify-end uppercase tracking-tighter">
                          <TrendingUp size={8} className="mr-0.5" /> Margin: ₹{entry.profitAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {isIncome && entry.category !== ServiceCategory.BOOKING && (
                         <button onClick={() => handlePrintInvoice(entry)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Print Invoice">
                           <Printer size={18} />
                         </button>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in fade-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Financial Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-transform hover:rotate-90">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Entry Type</label>
                  <select 
                    name="type" 
                    required 
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as FinanceType)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  >
                    <option value={FinanceType.INCOME}>Income (+)</option>
                    <option value={FinanceType.EXPENSE}>Expense (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Date</label>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Service Category</label>
                <select 
                  name="category" 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                >
                  <option value={ServiceCategory.PASSPORT}>{ServiceCategory.PASSPORT}</option>
                  <option value={ServiceCategory.VISA}>{ServiceCategory.VISA}</option>
                  <option value={ServiceCategory.CURRENCY_EXCHANGE}>{ServiceCategory.CURRENCY_EXCHANGE}</option>
                  <option value={ServiceCategory.TICKET}>{ServiceCategory.TICKET}</option>
                  <option value={ServiceCategory.INSURANCE}>{ServiceCategory.INSURANCE}</option>
                  <option value={ServiceCategory.OTHER}>{ServiceCategory.OTHER}</option>
                </select>
              </div>

              {entryType === FinanceType.INCOME && selectedCategory !== ServiceCategory.BOOKING && (
                <div className="grid grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="col-span-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center">
                    <User size={12} className="mr-1" /> Client Info (For Invoice)
                  </div>
                  <input name="clientName" placeholder="Client Full Name" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm font-medium" />
                  <input name="clientContact" placeholder="Phone / Email" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-sm font-medium" />
                </div>
              )}

              {useSplitPricing ? (
                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-900 rounded-3xl text-white shadow-inner">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center">
                      <DollarSign size={10} className="mr-1" /> Base Cost (₹)
                    </label>
                    <input 
                      name="baseAmount" 
                      type="number" 
                      required 
                      value={baseInput || ''} 
                      onChange={(e) => setBaseInput(Number(e.target.value))}
                      placeholder="Agency Cost" 
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-blue-400 mb-2 flex items-center">
                      <TrendingUp size={10} className="mr-1" /> Agency Margin (₹)
                    </label>
                    <input 
                      name="profitAmount" 
                      type="number" 
                      required 
                      value={marginInput || ''} 
                      onChange={(e) => setMarginInput(Number(e.target.value))}
                      placeholder="Your Share" 
                      className="w-full p-3 bg-slate-800 border border-blue-500/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-400 placeholder:text-slate-600" 
                    />
                  </div>
                  <div className="col-span-2 pt-4 mt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Total Collected</span>
                    <span className="text-3xl font-black text-emerald-400 tracking-tighter">₹{(baseInput + marginInput).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Amount (₹)</label>
                    <input name="amount" type="number" required placeholder="0.00" className={`w-full p-3 ${entryType === FinanceType.EXPENSE ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'} border rounded-xl focus:ring-2 outline-none font-black`} />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Payment Method</label>
                    <select name="paymentMethod" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                      <option value={PaymentMethod.CASH}>Cash</option>
                      <option value={PaymentMethod.UPI}>UPI</option>
                      <option value={PaymentMethod.CARD}>Card</option>
                    </select>
                  </div>
                </div>
              )}

              {useSplitPricing && (
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-2">Payment Mode</label>
                  <select name="paymentMethod" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                    <option value={PaymentMethod.CASH}>Cash</option>
                    <option value={PaymentMethod.UPI}>UPI</option>
                    <option value={PaymentMethod.CARD}>Card</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Description</label>
                <textarea name="description" rows={3} placeholder="Add transaction notes..." required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                   <Save size={20} />
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
