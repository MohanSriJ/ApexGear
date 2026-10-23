import React from 'react';
import { Star, ShoppingCart, Plus, Check } from 'lucide-react';
import SafeImage from './SafeImage';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  onAddToCart, 
  isInCart 
}) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300">
      
      {/* Product Image & Badges */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer"
      >
        <SafeImage
          src={product.image}
          alt={product.title}
          category={product.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900/80 backdrop-blur-md text-white shadow">
            {product.badge}
          </span>
        )}

        {product.stock <= 0 && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-600 text-white shadow">
            Out of Stock
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium text-brand-600">{product.brand}</span>
          <div className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
            <span>{product.rating}</span>
            <span className="text-slate-400 font-normal">({product.reviewCount})</span>
          </div>
        </div>

        <h3 
          onClick={() => onSelectProduct(product)}
          className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 cursor-pointer text-base"
        >
          {product.title}
        </h3>

        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Highlights tag */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.highlights.slice(0, 2).map((hl, idx) => (
            <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {hl}
            </span>
          ))}
        </div>

        {/* Price & Cart Action */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {product.stock > 0 ? `${product.stock} in stock` : 'Restocking soon'}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isInCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-900 hover:bg-brand-600 text-white shadow-sm hover:shadow active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
