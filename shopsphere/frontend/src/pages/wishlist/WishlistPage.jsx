import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, PackageOpen } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getEffectivePrice, getDiscountPercent } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const items = wishlist?.items || [];

  const handleMoveToCart = async (item) => {
    await addToCart(item.productId, 1);
    removeFromWishlist(item.productId);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="xl" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          My Wishlist
          {items.length > 0 && <span className="text-base font-normal text-gray-500">({items.length} items)</span>}
        </h1>

        {!items.length ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love by clicking the heart icon on any product."
            actionLabel="Browse Products"
            actionTo="/products"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const price = getEffectivePrice(item);
              const discount = getDiscountPercent(item);
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                  <Link to={`/products/${item.productId}`} className="block relative">
                    <img
                      src={item.imageUrl || 'https://placehold.co/300x300?text=Product'}
                      alt={item.productName}
                      className="w-full h-48 object-contain bg-gray-50 p-3 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=Product'; }}
                    />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        -{discount}%
                      </span>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2 text-sm">{item.productName}</h3>
                    </Link>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-gray-900">{formatCurrency(price)}</span>
                      {item.price && item.price > price && (
                        <span className="text-xs text-gray-400 line-through">{formatCurrency(item.price)}</span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.productId)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
