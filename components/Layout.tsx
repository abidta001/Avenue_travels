
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  CalendarCheck, 
  Wallet, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Plane
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Trips', icon: MapPin, path: '/trips' },
    { name: 'Bookings', icon: CalendarCheck, path: '/bookings' },
    { name: 'Finance', icon: Wallet, path: '/finance' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plane className="text-blue-400" size={24} />
            {isSidebarOpen && <h1 className="text-2xl font-bold tracking-tight text-blue-400">AVENUE</h1>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span className="ml-4 font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/profile"
            className={`flex items-center p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mb-2 ${
              location.pathname === '/profile' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            <div className="relative">
              <img src={user.profilePic} alt={user.username} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
            </div>
            {isSidebarOpen && <span className="ml-4 font-medium truncate">{user.username}</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="ml-4 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8 bg-slate-50 min-h-screen`}>
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              {menuItems.find(i => i.path === location.pathname)?.name || (location.pathname === '/profile' ? 'My Profile' : 'Avenue')}
            </h2>
            <p className="text-slate-500">Welcome back, {user.username}. Here's what's happening.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-700">{user.username}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
             </div>
             <img src={user.profilePic} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" alt="Profile" />
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
