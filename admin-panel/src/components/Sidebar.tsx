import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  CalendarRange, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Verifications', path: '/verifications', icon: ShieldCheck },
    { name: 'Users Management', path: '/users', icon: Users },
    { name: 'Bookings Tracker', path: '/bookings', icon: CalendarRange },
    { name: 'Financial Ledger', path: '/finance', icon: CreditCard },
    { name: 'Moderation Hub', path: '/moderation', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_name');
    navigate('/login');
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-20 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-300 md:static ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand logo header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        {isOpen && (
          <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            NirogApp Admin
          </span>
        )}
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isOpen && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer logout button */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
