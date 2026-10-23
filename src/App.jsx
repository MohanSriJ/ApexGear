import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import ChatWidget from './components/ChatWidget';
import Logo from './components/Logo';
import { PRODUCTS } from './data/products';
import { Sparkles, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [cartItems, setCartItems] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);

  // Cart Management
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
          image: product.image
        }
      ];
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Chat Trigger from Outside
  const handleAskPrompt = (promptText) => {
    setIsChatOpen(true);
    setPendingPrompt(promptText);
  };

  const handleAskAIAboutProduct = (product) => {
    setIsChatOpen(true);
    setPendingPrompt(`Can you tell me more about the ${product.title}? Is it good for everyday use?`);
  };

  // Filtered Products
  const filteredProducts = PRODUCTS.filter((prod) => {
    if (selectedCategory && prod.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = prod.title.toLowerCase().includes(q);
      const inBrand = prod.brand.toLowerCase().includes(q);
      const inDesc = prod.description.toLowerCase().includes(q);
      const inTags = prod.tags.some((t) => t.includes(q));
      return inTitle || inBrand || inDesc || inTags;
    }
    return true;
  });

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 text-center font-medium">
        <span>⚡ Tech Upgrade: Use code <strong>APEX10</strong> for 10% off • Students get 15% with <strong>STUDENT15</strong> • Free 2-4 day shipping over $50</span>
      </div>

      {/* Main Navbar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Storefront Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pb-20">
        
        {/* Hero Banner with Quick AI Prompts */}
        <HeroBanner onAskPrompt={handleAskPrompt} />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedCategory || 'Featured Tech & Workspace Gear'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredProducts.length} items • Need advice? Ask our AI assistant in the bottom corner.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter by category:</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No exact matches found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Our AI Sales Advisor can cross-reference our entire inventory or recommend alternative gear.
            </p>
            <button
              onClick={() => handleAskPrompt(`I am looking for "${searchQuery}". What do you recommend?`)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI to Find Alternatives
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={setSelectedProduct}
                onAddToCart={handleAddToCart}
                isInCart={cartItems.some((c) => c.id === prod.id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-3">
              <Logo size="sm" showBadge={false} />
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Engineered for productivity, deep work, and modern creators. Powered by interactive conversational AI sales guidance.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2.5">Shop Categories</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><button onClick={() => setSelectedCategory('Keyboards & Mice')} className="hover:text-brand-600">Mechanical Keyboards</button></li>
              <li><button onClick={() => setSelectedCategory('Audio')} className="hover:text-brand-600">Active Noise-Cancelling</button></li>
              <li><button onClick={() => setSelectedCategory('Desk Setup')} className="hover:text-brand-600">Ergonomic Desk Pads</button></li>
              <li><button onClick={() => setSelectedCategory('Travel & Power')} className="hover:text-brand-600">GaN Fast Chargers</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2.5">AI Assistance</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><button onClick={() => handleAskPrompt("What's the best keyboard for programming?")} className="hover:text-brand-600">Coding Keyboards</button></li>
              <li><button onClick={() => handleAskPrompt("I have wrist strain, what helps?")} className="hover:text-brand-600">Ergonomic Advice</button></li>
              <li><button onClick={() => handleAskPrompt("Show me active discount codes")} className="hover:text-brand-600">Coupons & Deals</button></li>
              <li><button onClick={() => handleAskPrompt("Explain your 30-day return policy")} className="hover:text-brand-600">Return Policy</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2.5">Guarantees</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>30-Day Free Return Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>2-Year Full Hardware Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Free 2-4 Day Shipping Over $50</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-4">
          <p>© 2026 ApexGear Inc. All rights reserved.</p>
          <p>Built with React, Tailwind CSS & Consultative AI Sales Agent</p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAskChatbot={handleAskPrompt}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isInCart={selectedProduct ? cartItems.some((c) => c.id === selectedProduct.id) : false}
        onAskAIAboutProduct={handleAskAIAboutProduct}
      />

      {/* AI Chat Widget (Bottom Right) */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onSelectProduct={setSelectedProduct}
        pendingPrompt={pendingPrompt}
        onClearPendingPrompt={() => setPendingPrompt(null)}
      />

    </div>
  );
}
