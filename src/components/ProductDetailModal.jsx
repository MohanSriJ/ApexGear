import React, { useEffect } from 'react';
import { X, Star, ShoppingCart, Check, Shield, Truck, RotateCcw } from 'lucide-react';
import SafeImage from './SafeImage';

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  isInCart,
  onAskAIAboutProduct
}) {
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-500 hover:text-slate-800 shadow hover:bg-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image Column */}
          <div className="relative aspect-square sm:aspect-auto bg-slate-100">
            <SafeImage
              src={product.image}
              alt={product.title}
              category={product.category}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md shadow">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-brand-600">{product.brand}</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                {product.title}
              </h2>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600 ml-auto">
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Specs List */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <div key={key} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="block text-slate-400 capitalize">{key}</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock <= 0}
                className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                  isInCart
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-900 hover:bg-brand-600 text-white shadow-md'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart - ${product.price.toFixed(2)}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAskAIAboutProduct(product);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition"
              >
                Ask AI Shopper about this item ✨
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
