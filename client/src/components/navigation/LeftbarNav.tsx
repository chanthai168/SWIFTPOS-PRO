import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Monitor, 
  Users, 
  FileBarChart, 
  History, 
  Settings, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Menu,
  ArrowRight
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
}

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const mainNavItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Inventory', icon: Package, href: '/inventory' },
    { label: 'POS', icon: Monitor, href: '/pos' },
    { label: 'Supplier', icon: Users, href: '/supplier' },
    { label: 'Inventory report', icon: FileBarChart, href: '/inventory-report' },
    { label: 'History', icon: History, href: '/history' },
  ];

  const bottomNavItems: NavItem[] = [
    { label: 'Setting', icon: Settings, href: '/setting' },
    { label: 'About company', icon: Building2, href: '/about' },
  ];

  return (
    <>
      {/* Mobile Hamburger Menu Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#00a9b5] text-white rounded-xl md:hidden shadow-md transition-transform active:scale-95"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Dark Backdrop overlay for Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-layer2 border-r border-gray-100 flex flex-col justify-between p-4 z-40 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-64 ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Upper Section */}
        <div className="flex flex-col gap-8">
          {/* Header / Logo */}
          <div className="flex items-center justify-between min-h-[40px] mt-12 md:mt-0">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* VK Brand Icon */}
              <div className="flex items-center justify-center min-w-[32px] h-8 bg-[#00a9b5]/10 text-[#00a9b5] rounded-lg font-bold text-lg">
                VK
              </div>
              <span className={`font-bold text-xl text-gray-900 tracking-tight whitespace-nowrap transition-opacity duration-200
                ${isCollapsed ? 'md:opacity-0 md:w-0 md:pointer-events-none' : 'opacity-100'}
              `}>
                Company
              </span>
            </div>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {mainNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)} // Closes menu on mobile selection
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-[#00a9b5] text-white font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`} />
                  
                  {/* Text Label */}
                  <span className={`transition-all duration-200 whitespace-nowrap 
                    ${isCollapsed ? 'md:opacity-0 md:w-0 md:pointer-events-none' : 'opacity-100'}
                  `}>
                    {item.label}
                  </span>

                  {/* Tooltip on Hover (Desktop Collapsed mode only) */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block z-50 shadow-md">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Section */}
        <div className="flex flex-col gap-6">
          {/* Promo/Notification Card - Controlled purely via Tailwind for perfect responsive syncing */}
          <div className={`bg-[#fff1f3] rounded-2xl p-4 flex flex-col items-center text-center relative mt-8 transition-all duration-200
            ${isCollapsed ? 'md:hidden' : 'block'}
          `}>
            {/* Illustration Placeholder Stack */}
            <div className="flex items-center justify-center -mt-10 mb-2 relative h-14 w-20">
              <span className="text-3xl">👕</span>
              <span className="text-3xl -ml-2 rotate-12">📄</span>
              <span className="absolute -top-2 -right-2 text-yellow-400 font-bold text-lg">✨</span>
            </div>
            
            <p className="text-xs font-semibold text-gray-800 px-2 leading-relaxed mb-4">
              12 product has been add recently
            </p>

            <div className="flex items-center gap-2 w-full">
              <button className="flex-1 bg-gray-200/80 hover:bg-gray-200 text-red-500 font-semibold text-xs py-2 rounded-xl transition-colors">
                Dismiss
              </button>
              <button className="p-2 bg-gray-200/80 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Footer Settings Navigation */}
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-4">
            {bottomNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-600 transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-[#00a9b5] text-white font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                    `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`} />
                  
                  <span className={`transition-all duration-200 whitespace-nowrap
                    ${isCollapsed ? 'md:opacity-0 md:w-0 md:pointer-events-none' : 'opacity-100'}
                  `}>
                    {item.label}
                  </span>

                  {/* Tooltip on Hover */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block z-50 shadow-md">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};