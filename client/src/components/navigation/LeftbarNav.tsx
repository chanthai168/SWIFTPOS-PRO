import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

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
  ArrowRight,
  BellRing,
  Sparkles
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
}

const productIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
	<path d="M0 0h32v32H0z" fill="none" />
	<path fill="currentColor" d="M24 21v2h1.748A11.96 11.96 0 0 1 16 28C9.383 28 4 22.617 4 16H2c0 7.72 6.28 14 14 14c4.355 0 8.374-2.001 11-5.345V26h2v-5z" />
	<path fill="currentColor" d="m22.505 11.637l-5.989-3.5a1 1 0 0 0-1.008-.001l-6.011 3.5A1 1 0 0 0 9 12.5v7a1 1 0 0 0 .497.864l6.011 3.5A.96.96 0 0 0 16 24c.174 0 .36-.045.516-.137l5.989-3.5A1 1 0 0 0 23 19.5v-7a1 1 0 0 0-.495-.863m-6.494-1.48l4.007 2.343l-4.007 2.342l-4.023-2.342zM11 14.24l4 2.33v4.685l-4-2.33zm6 7.025v-4.683l4-2.338v4.683z" />
	<path fill="currentColor" d="M16 2A13.95 13.95 0 0 0 5 7.345V6H3v5h5V9H6.252A11.96 11.96 0 0 1 16 4c6.617 0 12 5.383 12 12h2c0-7.72-6.28-14-14-14" />
</svg>
;
const flashIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 14 14">
	<path d="M0 0h14v14H0z" fill="none" />
	<g fill="none">
		<path fill="#d7e0ff" d="M4.25.5L2 5.81a.5.5 0 0 0 .46.69h2.79l-2 7l8.59-8.14a.501.501 0 0 0-.34-.86H7.75l2-4z" />
		<path stroke="#4147d5" stroke-linecap="round" stroke-linejoin="round" d="M4.25.5L2 5.81a.5.5 0 0 0 .46.69h2.79l-2 7l8.59-8.14a.5.5 0 0 0-.34-.86H7.75l2-4z" />
	</g>
</svg>
;
const warningIcon = <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
	<path d="M0 0h512v512H0z" fill="none" />
	<path fill="currentColor" d="M479 447.77L268.43 56.64a8 8 0 0 0-14.09 0L43.73 447.77a8 8 0 0 0 7.05 11.79H472a8 8 0 0 0 7-11.79m-197.62-36.29h-40v-40h40Zm-4-63.92h-32l-6-160h44Z" />
</svg>
;
export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [activeNotification, setActiveNotification] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<any | null>(null);
  const isSlidingRef = useRef(false);
  const location = useLocation();
  const { user } = useAuth0();

  const profileName = user?.name || 'Manager';
  const profileImage = user?.picture;
  const avatarSrc = avatarFailed || !profileImage ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=00a9b5&color=fff&size=96` : profileImage;


  const notifications = [
    {
      title: 'New stock arrived',
      description: '12 products were added recently',
      accent: 'from-[#00a9b5] to-[#00d4df]',
      icon: productIcon,
    },
    {
      title: 'Flash deal',
      description: 'Enjoy 10% off on selected items',
      accent: 'from-blue-400 to-blue-500 ',
      icon: flashIcon,
    },
    {
      title: 'Low stock alert',
      description: '3 SKUs need restock soon',
      accent: 'from-orange-400 to-orange-500',
      icon: warningIcon,
    },
  ];

  const currentNotification = notifications[activeNotification];

  const slideNext = () => {
    // Use ref to check if sliding to avoid stale closure
    if (isSlidingRef.current) return;
    
    isSlidingRef.current = true;
    setIsSliding(true);
    setSlideDirection('right');
    
    setTimeout(() => {
      setActiveNotification((prev) => (prev + 1) % notifications.length);
      setTimeout(() => {
        setIsSliding(false);
        isSlidingRef.current = false;
      }, 50);
    }, 300);
  };

  const slidePrevious = () => {
    if (isSlidingRef.current) return;
    
    isSlidingRef.current = true;
    setIsSliding(true);
    setSlideDirection('left');
    
    setTimeout(() => {
      setActiveNotification((prev) => (prev - 1 + notifications.length) % notifications.length);
      setTimeout(() => {
        setIsSliding(false);
        isSlidingRef.current = false;
      }, 50);
    }, 300);
  };

  // Auto-rotate notification every 3 seconds
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Don't start timer if collapsed or hovered
    if (isCollapsed || isHovered) {
      return;
    }

    // Start the timer
    timerRef.current = setInterval(() => {
      slideNext();
    }, 6000);

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCollapsed, isHovered]); // Remove activeNotification from dependencies

  const nextNotification = () => {
    // Clear timer when manually navigating
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    slideNext();
    
    // Restart timer after manual navigation
    if (!isCollapsed && !isHovered) {
      setTimeout(() => {
        if (!timerRef.current && !isCollapsed && !isHovered) {
          timerRef.current = setInterval(() => {
            slideNext();
          }, 6000);
        }
      }, 500);
    }
  };

  const previousNotification = () => {
    // Clear timer when manually navigating
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    slidePrevious();
    
    // Restart timer after manual navigation
    if (!isCollapsed && !isHovered) {
      setTimeout(() => {
        if (!timerRef.current && !isCollapsed && !isHovered) {
          timerRef.current = setInterval(() => {
            slideNext();
          }, 6000);
        }
      }, 500);
    }
  };

  const handleNotificationClick = (index: number) => {
    if (index === activeNotification) return;
    
    // Clear timer when manually navigating
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (index > activeNotification) {
      setSlideDirection('right');
    } else {
      setSlideDirection('left');
    }
    setActiveNotification(index);
    
    // Restart timer after manual navigation
    if (!isCollapsed && !isHovered) {
      setTimeout(() => {
        if (!timerRef.current && !isCollapsed && !isHovered) {
          timerRef.current = setInterval(() => {
            slideNext();
          }, 3000);
        }
      }, 500);
    }
  };

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
          className="fixed inset-0 bg-black/50 z-40  md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0  left-0 h-screen bg-layer2 flex flex-col justify-between p-4 z-40 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-64 ${isCollapsed ? 'md:w-18.5' : 'md:w-64'}
        `}
      >
        {/* Upper Section */}
        <div className="flex flex-col gap-8 ">
          {/* Header / Logo */}
          <div className="flex items-center  relative justify-between min-h-[40px] mt-12 md:mt-0">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* VK Brand Icon */}
              <div className='w-12 h-12 flex justify-center items-center overflow-hidden'>
                  <img src="../../public/logo.png" alt="" />
              </div>
              
              <span className={`font-semibold text-xl text-gray-900 tracking-tight whitespace-nowrap transition-opacity duration-200
                ${isCollapsed ? 'md:opacity-0 md:w-0 md:pointer-events-none' : 'opacity-100'}
              `}>
                SwiftPOS Pro
              </span>
            </div>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors absolute -right-5"
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
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-full  py-2.5  text-sm transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-primary text-white font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isCollapsed ? 'grid h-10.5 justify-center items-center':'px-3'}
                  `}
                > 
                  <div className=' '>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`} />
                  </div>
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



        <div className="flex flex-col justify-center ">
                  {/* Fake Notification with Sliding Animation */}
        {isCollapsed ? (
          <div className="hidden md:flex items-center justify-center mt-8">
            <button
              type="button"
              className="relative p-2.5 rounded-xl bg-[#fff1f3] text-primary shadow-sm transition-colors hover:bg-[#ffe7ec]"
              aria-label="Notifications"
            >
              <BellRing size={16} />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>
          </div>
        ) : (
          <div 
            className="bg-layer3 rounded-2xl p-2 flex flex-col items-center text-center mt-8 relative h-48  transition-all duration-300 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-transparent" />
            <div className="relative flex w-full items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-700">
                <BellRing size={14} className="text-primary" />
                News
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={previousNotification}
                  disabled={isSliding}
                  className="rounded-full bg-white/80 p-1.5 text-gray-600 shadow-sm transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous notification"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={nextNotification}
                  disabled={isSliding}
                  className="rounded-full bg-white/80 p-1.5 text-gray-600 shadow-sm transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next notification"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Sliding Notification Container  */}
            <div className="relative w-full overflow-hidden">
              <div 
                className={`flex w-full flex-col items-center transition-all duration-300 ease-in-out
                  ${isSliding && slideDirection === 'right' ? 'opacity-0 -translate-x-10' : ''}
                  ${isSliding && slideDirection === 'left' ? 'opacity-0 translate-x-10' : ''}
                `}
              >
                <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${currentNotification.accent} text-white shadow-sm text-2xl`}>
                  {currentNotification.icon}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {currentNotification.title}
                </p>
                <p className="text-xs font-semibold text-gray-800 px-2 leading-relaxed mb-4">
                  {currentNotification.description}
                </p>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="relative flex justify-center gap-1.5 mb-2">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleNotificationClick(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeNotification 
                      ? 'w-4 bg-primary' 
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>


            <div className="relative flex items-center gap-2 w-full">
              <button className="flex-1 bg-gray-200 text-red-500 font-semibold text-xs py-2 rounded-full transition-colors">
                Dismiss
              </button>
              <button className="p-2 bg-gray-200  text-gray-600 rounded-full transition-colors">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

          {/* Footer Settings Navigation */}
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-4">
            
            {!isCollapsed && (
              <div className='flex p-2 gap-2 w-64'>
                <img
                  src={avatarSrc}
                  className='rounded-3xl border-2 border-white shadow object-cover'
                  alt={profileName}
                  width="48"
                  height="48"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                />
                <div>
                  <p className='text-sm font-semibold text-blue-500'>Manager</p>
                  <p>{profileName}</p>
                </div>
              </div>
            )}

            {bottomNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-full font-medium text-sm text-gray-600 transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-primary text-white font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      
                    }
                     ${isCollapsed ? 'grid h-10.5 justify-center items-center':'px-3'}
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