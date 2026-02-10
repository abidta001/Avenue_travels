
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { fetchAppData, saveEntity, deleteEntity, AppData } from './store';
import { User, FinanceType, FinanceEntry } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Trips from './pages/Trips';
import Bookings from './pages/Bookings';
import Finance from './pages/Finance';
import Profile from './pages/Profile';
import Reports from './pages/Reports';

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('avenue_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginError, setLoginError] = useState('');

  // Load backend data asynchronously on mount
  useEffect(() => {
    fetchAppData().then(setAppData);
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!appData) return;
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const user = appData.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user && user.password === password) {
      setCurrentUser(user);
      localStorage.setItem('avenue_active_user', JSON.stringify(user));
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('avenue_active_user');
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!currentUser || !appData) return;
    const updatedUser = { ...currentUser, ...updates };
    const newUsers = appData.users.map(u => u.id === currentUser.id ? updatedUser : u);
    setAppData({ ...appData, users: newUsers });
    setCurrentUser(updatedUser);
    localStorage.setItem('avenue_active_user', JSON.stringify(updatedUser));
    
    // Sync to PostgreSQL
    await saveEntity('users', updatedUser);
  };

  // Prevent loading UI before data connection is established
  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white text-lg font-bold animate-pulse">Synchronizing with Database...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center bg-blue-600 text-white">
            <h1 className="text-4xl font-black tracking-tighter mb-2">AVENUE</h1>
            <p className="text-blue-100 font-medium opacity-80">Tours & Travels Portal</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && <p className="text-red-500 text-center text-sm font-bold bg-red-50 p-2 rounded">{loginError}</p>}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Username</label>
              <input name="username" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Anaswara or Preethi" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Password</label>
              <input name="password" type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout user={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard customers={appData.customers} trips={appData.trips} bookings={appData.bookings} finance={appData.finance} />} />
          <Route path="/customers" element={
            <Customers 
              customers={appData.customers} 
              onAdd={async (c) => {
                const newCustomer = { ...c, id: Math.random().toString(36).substr(2, 9) };
                setAppData({ ...appData, customers: [...appData.customers, newCustomer] });
                await saveEntity('customers', newCustomer);
              }}
              onUpdate={async (c) => {
                setAppData({ ...appData, customers: appData.customers.map(item => item.id === c.id ? c : item) });
                await saveEntity('customers', c);
              }}
              onDelete={async (id) => {
                setAppData({ ...appData, customers: appData.customers.filter(c => c.id !== id) });
                await deleteEntity('customers', id);
              }}
            />
          } />
          <Route path="/trips" element={
            <Trips 
              trips={appData.trips}
              onAdd={async (t) => {
                const newTrip = { ...t, id: Math.random().toString(36).substr(2, 9) };
                setAppData({ ...appData, trips: [...appData.trips, newTrip] });
                await saveEntity('trips', newTrip);
              }}
              onUpdate={async (t) => {
                setAppData({ ...appData, trips: appData.trips.map(item => item.id === t.id ? t : item) });
                await saveEntity('trips', t);
              }}
              onDelete={async (id) => {
                setAppData({ ...appData, trips: appData.trips.filter(t => t.id !== id) });
                await deleteEntity('trips', id);
              }}
            />
          } />
          <Route path="/bookings" element={
            <Bookings 
              bookings={appData.bookings}
              customers={appData.customers}
              trips={appData.trips}
              onAdd={async (b) => {
                const newBooking = { ...b, id: Math.random().toString(36).substr(2, 9) };
                
                const now = new Date();
                const bookingDate = new Date(b.bookingDate);
                bookingDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

                const newFinanceEntry: FinanceEntry = {
                  id: Math.random().toString(36).substr(2, 9),
                  type: FinanceType.INCOME,
                  category: 'Trip Booking',
                  amount: b.paidAmount,
                  date: bookingDate.toISOString(),
                  tripId: b.tripId,
                  description: `Initial payment for ${appData.customers.find(c => c.id === b.customerId)?.name}`,
                  paymentMethod: b.paymentMethod
                };
                
                // Optimistic Local State Update
                setAppData({ 
                  ...appData, 
                  bookings: [...appData.bookings, newBooking],
                  finance: [...appData.finance, newFinanceEntry]
                });

                // Network Sync
                await saveEntity('bookings', newBooking);
                await saveEntity('finance', newFinanceEntry);
              }}
              onUpdate={async (b) => {
                setAppData({ ...appData, bookings: appData.bookings.map(item => item.id === b.id ? b : item) });
                await saveEntity('bookings', b);
              }}
              onDelete={async (id) => {
                setAppData({ ...appData, bookings: appData.bookings.filter(b => b.id !== id) });
                await deleteEntity('bookings', id);
              }}
            />
          } />
          <Route path="/finance" element={
            <Finance 
              finance={appData.finance}
              bookings={appData.bookings}
              trips={appData.trips}
              onAdd={async (f) => {
                const newEntry = { ...f, id: Math.random().toString(36).substr(2, 9) };
                setAppData({ ...appData, finance: [...appData.finance, newEntry] });
                await saveEntity('finance', newEntry);
              }}
            />
          } />
          <Route path="/reports" element={
            <Reports trips={appData.trips} finance={appData.finance} bookings={appData.bookings} />
          } />
          <Route path="/profile" element={
            <Profile user={currentUser} onUpdate={handleUpdateProfile} />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
