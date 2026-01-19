import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const MobileHeader = () => {
    return (
        <header className="sticky top-0 left-0 right-0 glass border-b border-white/20 px-4 py-3 z-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <ShoppingBag className="text-white" size={22} />
                </div>
                <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        LUXE STORE
                    </h1>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">
                        Online Shopping
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                    <Search size={22} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                    <Bell size={22} className="text-gray-600" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </button>
            </div>
        </header>
    );
};

// Re-using same icons to avoid import errors if not careful
import { ShoppingBag } from 'lucide-react';

export default MobileHeader;
