import React from 'react';
import { ShoppingBag, Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ 
  cartCount, 
  onOpenCart, 
  onOpenChat, 
  selectedCategory, 
  onSelectCategory,
  searchQuery,
  onSearchChange
}) {
  const categories = [
    'All Products',
    'Keyboards & Mice',
    'Audio',
    'Desk Setup',
    'Wearables & Fitness',
    'Travel & Power'
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Logo size="md" showBadge={true} />

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search gear, gadgets, accessories..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-brand-500 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Ask AI Shopper</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center animate-bounce-subtle">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="block md:hidden pb-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search gear, gadgets, accessories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-brand-500 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 py-2.5 overflow-x-auto no-scrollbar border-t border-slate-100 text-xs sm:text-sm font-medium">
          {categories.map((cat) => {
            const isSelected = (cat === 'All Products' && !selectedCategory) || selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat === 'All Products' ? null : cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
