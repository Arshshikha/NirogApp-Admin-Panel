import React from 'react';
import { Menu, User, Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const adminName = localStorage.getItem('admin_name') || 'System Admin';
  const adminEmail = localStorage.getItem('admin_email') || 'admin@nirog.com';

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-slate-900 border-b border-slate-800 text-slate-200">
      {/* Left section: Sidebar Hamburger toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="hidden sm:block text-sm font-semibold text-slate-400">
          Control Center
        </h1>
      </div>

      {/* Right section: Notifications & Admin Profile */}
      <div className="flex items-center gap-4">
        {/* Notification bell icon button */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
        </button>

        <div className="w-px h-6 bg-slate-800" />

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-200">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight group-hover:text-emerald-400 transition-all duration-200">
              {adminName}
            </p>
            <p className="text-[10px] text-slate-500 leading-none">
              {adminEmail}
            </p>
          </div>
          <ChevronDown className="hidden md:block w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-all duration-200" />
        </div>
      </div>
    </header>
  );
};

export default Header;
