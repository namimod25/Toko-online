import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Shop', path: '/products' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/20 px-6 py-3 z-50 animate-slide-up">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-300 relative ${isActive ? 'text-blue-600 scale-110' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full animate-fade-in" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
      <div className="h-[var(--safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
