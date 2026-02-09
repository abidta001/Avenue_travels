
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Printer, FileText, CheckCircle2, Clock, AlertCircle, Trash2, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { Booking, Customer, Trip, TripStatus, PaymentStatus, PaymentMethod } from '../types';

interface BookingsProps {
  bookings: Booking[];
  customers: Customer[];
  trips: Trip[];
  onAdd: (b: Omit<Booking, 'id'>) => void;
  onUpdate: (b: Booking) => void;
  onDelete: (id: string) => void;
}

const Bookings: React.FC<BookingsProps> = ({ bookings, customers, trips, onAdd, onUpdate, onDelete }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [preselectedTripId, setPreselectedTripId] = useState<string | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [numPersonsInput, setNumPersonsInput] = useState<number>(1);

  useEffect(() => {
    if (location.state?.tripId) {
      setPreselectedTripId(location.state.tripId);
      setSelectedTripId(location.state.tripId);
      setEditingBooking(null);
      setErrorMessage(null);
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (editingBooking) {
      setSelectedTripId(editingBooking.tripId);
      setNumPersonsInput(editingBooking.numPersons);
    } else if (!preselectedTripId) {
      setSelectedTripId("");
      setNumPersonsInput(1);
    }
    setErrorMessage(null);
  }, [editingBooking, isModalOpen, preselectedTripId]);

  const getAvailableSeats = (tripId: string, excludeBookingId?: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return 0;
    const filledSeats = bookings
      .filter(b => b.tripId === tripId && b.id !== excludeBookingId)
      .reduce((sum, b) => sum + b.numPersons, 0);
    return trip.totalSeats - filledSeats;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tripId = formData.get('tripId') as string;
    const numPersons = Number(formData.get('numPersons'));
    const paidAmount = Number(formData.get('paidAmount'));
    const trip = trips.find(t => t.id === tripId);
    
    if (!trip) return;

    const available = getAvailableSeats(tripId, editingBooking?.id);
    if (numPersons > available) {
      setErrorMessage(`Not enough seats! Only ${available} available.`);
      return;
    }

    const serviceFee = trip.agencyProfit;
    const totalAmount = (trip.costPerPerson + serviceFee) * numPersons;
    
    let paymentStatus: PaymentStatus;
    if (totalAmount > 0 && paidAmount >= totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatus = PaymentStatus.PARTIAL;
    } else {
      paymentStatus = PaymentStatus.PENDING;
    }
    
    const data = {
      customerId: formData.get('customerId') as string,
      tripId: tripId,
      bookingDate: formData.get('bookingDate') as string,
      numPersons: numPersons,
      serviceFee: serviceFee,
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      paymentStatus: paymentStatus,
      paymentMethod: formData.get('paymentMethod') as PaymentMethod,
    };

    if (editingBooking) {
      onUpdate({ ...data, id: editingBooking.id });
    } else {
      onAdd(data);
    }
    setIsModalOpen(false);
    setEditingBooking(null);
    setPreselectedTripId(null);
    setErrorMessage(null);
  };

  const handlePrint = (booking: Booking) => {
    const customer = customers.find(c => c.id === booking.customerId);
    const trip = trips.find(t => t.id === booking.tripId);
    const pending = booking.totalAmount - booking.paidAmount;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${customer?.name}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; padding: 0; margin: 0; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; position: relative; }
          
          /* Styled Header mimicking app sidebar */
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .brand-icon { width: 32px; height: 32px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 900; }
          .brand-text { font-size: 32px; font-weight: 900; color: #3b82f6; letter-spacing: -2px; }
          
          .receipt-title { text-align: right; }
          .receipt-title h1 { margin: 0; font-size: 24px; color: #64748b; font-weight: 800; text-transform: uppercase; }
          .receipt-title p { margin: 5px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 700; }
          
          .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .section-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; }
          .info-block p { margin: 2px 0; font-weight: 600; font-size: 13px; }
          
          .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; }
          .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          
          .financials { margin-left: auto; width: 300px; }
          .fin-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .fin-row.total { border-top: 2px solid #3b82f6; margin-top: 10px; padding-top: 15px; font-weight: 900; font-size: 20px; color: #1e293b; }
          
          .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          .status-badge { display: inline-block; padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 900; text-transform: uppercase; border: 1px solid currentColor; }
          .status-Paid { color: #15803d; }
          .status-Partial { color: #9a3412; }
          .status-Pending { color: #b91c1c; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">
              <div class="brand-icon">✈</div>
              <div class="brand-text">AVENUE</div>
            </div>
            <div class="receipt-title">
              <h1>Booking Receipt</h1>
              <p>REF: #${booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <div class="details-grid">
            <div class="info-block">
              <div class="section-title">Customer Details</div>
              <p><strong>${customer?.name}</strong></p>
              <p>${customer?.phone}</p>
              <p>${customer?.email}</p>
            </div>
            <div class="info-block" style="text-align: right;">
              <div class="section-label" style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px;">Service Provider</div>
              <p style="margin: 2px 0; font-weight: 600; font-size: 13px;"><strong>Avenue tours and travels</strong></p>
              <p style="margin: 2px 0; font-weight: 600; font-size: 13px;">Beena Arcade, Erumapetty</p>
              <p style="margin: 2px 0; font-weight: 600; font-size: 13px;">Thrissur 680584, Kerala</p>
              <p style="margin: 2px 0; font-weight: 600; font-size: 13px;">avenuetravels2026@gmail.com</p>
            </div>
          </div>
          <div class="details-grid" style="margin-top: -20px;">
            <div class="info-block">
               <div class="section-title">Transaction Info</div>
               <p>Date: ${new Date(booking.bookingDate).toLocaleDateString()}</p>
               <p>Method: ${booking.paymentMethod || 'N/A'}</p>
            </div>
            <div class="info-block" style="text-align: right;">
              <div class="section-title">Status</div>
              <span class="status-badge status-${booking.paymentStatus}">${booking.paymentStatus}</span>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr><th>Item Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Total</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="font-weight: 800;">${trip?.name} Travel Package</div>
                  <div style="font-size: 11px; color: #64748b;">${trip?.destination}</div>
                </td>
                <td style="text-align:center">${booking.numPersons}</td>
                <td style="text-align:right">₹${booking.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="financials">
            <div class="fin-row"><span>Gross Amount</span><span>₹${booking.totalAmount.toLocaleString()}</span></div>
            <div class="fin-row" style="color: #15803d; font-weight: bold;"><span>Amount Paid</span><span>- ₹${booking.paidAmount.toLocaleString()}</span></div>
            <div class="fin-row total"><span>Balance Due</span><span>₹${pending.toLocaleString()}</span></div>
          </div>
          <div class="footer">
            <p>Thank you for choosing AVENUE - Luxury Tours & Travels</p>
            <p>Authorized Digital Copy | Thrissur, Kerala</p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      onDelete(bookingToDelete);
      setBookingToDelete(null);
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return <CheckCircle2 className="text-emerald-500" size={16} />;
      case PaymentStatus.PARTIAL: return <Clock className="text-orange-500" size={16} />;
      case PaymentStatus.PENDING: return <AlertCircle className="text-red-500" size={16} />;
    }
  };

  const activeTrip = trips.find(t => t.id === selectedTripId);
  const availableNow = selectedTripId ? getAvailableSeats(selectedTripId, editingBooking?.id) : 0;
  const currentTotal = activeTrip ? (activeTrip.costPerPerson + activeTrip.agencyProfit) * numPersonsInput : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Reservations</h3>
        <button
          onClick={() => { setEditingBooking(null); setPreselectedTripId(null); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all font-bold"
        >
          <Plus size={18} className="mr-2" /> New Booking
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Booking Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Trip</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Method</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((booking) => {
                const customer = customers.find(c => c.id === booking.customerId);
                const trip = trips.find(t => t.id === booking.tripId);
                const pending = booking.totalAmount - booking.paidAmount;

                return (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{customer?.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-black">{new Date(booking.bookingDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{trip?.name}</div>
                      <div className="text-xs text-slate-500">{booking.numPersons} Pax</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                        {booking.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase space-x-1 ${
                        booking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                        booking.paymentStatus === 'Partial' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {getStatusIcon(booking.paymentStatus)}
                        <span>{booking.paymentStatus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handlePrint(booking)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Print Receipt"><Printer size={16} /></button>
                         <button onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit"><FileText size={16} /></button>
                         <button onClick={() => setBookingToDelete(booking.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="py-20 text-center text-slate-400">No bookings yet.</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">{editingBooking ? 'Edit Booking' : 'New Booking'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-transform hover:rotate-90"><Plus size={20} className="rotate-45" /></button>
            </div>
            
            {errorMessage && <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm font-bold flex items-center"><AlertCircle size={16} className="mr-2" /> {errorMessage}</div>}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Customer</label>
                  <select name="customerId" defaultValue={editingBooking?.customerId || ""} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Trip Package</label>
                  <select 
                    name="tripId" 
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select Trip</option>
                    {trips
                      .filter(t => t.status !== TripStatus.COMPLETED || t.id === (editingBooking?.tripId || selectedTripId))
                      .map(t => <option key={t.id} value={t.id}>{t.name} {t.status === TripStatus.COMPLETED ? '(Closed)' : ''}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Persons</label>
                  <input name="numPersons" type="number" value={numPersonsInput} onChange={(e) => setNumPersonsInput(Number(e.target.value))} min="1" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Payment Method</label>
                  <select name="paymentMethod" defaultValue={editingBooking?.paymentMethod || PaymentMethod.CASH} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={PaymentMethod.CASH}>Cash</option>
                    <option value={PaymentMethod.UPI}>UPI</option>
                    <option value={PaymentMethod.CARD}>Card</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl text-white">
                 <div className="flex justify-between items-center border-t border-slate-700 pt-1 font-black text-lg">
                    <span>TOTAL PAYABLE</span>
                    <span className="text-blue-400">₹{currentTotal.toLocaleString()}</span>
                 </div>
                 {activeTrip && (
                   <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest text-right">
                     Availability: {availableNow} / {activeTrip.totalSeats} seats
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Paid Amount (₹)</label>
                  <input name="paidAmount" type="number" defaultValue={editingBooking?.paidAmount || 0} required className="w-full p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Booking Date</label>
                  <input name="bookingDate" type="date" defaultValue={editingBooking?.bookingDate || new Date().toISOString().split('T')[0]} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95">
                  {editingBooking ? 'Update Reservation' : 'Confirm & Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bookingToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Booking?</h3>
            <p className="text-sm text-slate-500 mb-6">This will permanently remove the record.</p>
            <div className="flex space-x-3">
              <button onClick={() => setBookingToDelete(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => { onDelete(bookingToDelete); setBookingToDelete(null); }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
