import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, Heart, Star, Truck, Shield, RotateCcw,
  ChevronLeft, ChevronRight, Minus, Plus, Loader2, Share2,
  Package, CheckCircle2, MapPin, Zap, Tag, Info
} from 'lucide-react';
import { productAPI, reviewAPI } from '../../api/index';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, getDiscountPercent } from '../../utils/helpers';
import StarRating from '../../components/common/StarRating';
import ProductCard from '../../components/product/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ─── helpers ─── */
const getEffectivePrice = (p) => p?.discountPrice || p?.price || 0;

const getImages = (product) => {
  if (product?.images?.length) {
    const urls = product.images.map((i) => i?.imageUrl || i?.url || i).filter(Boolean);
    if (urls.length) return urls;
  }
  if (product?.imageUrl) return [product.imageUrl];
  return [`https://placehold.co/600x600/f3f4f6/374151?text=${encodeURIComponent((product?.name || 'Product').substring(0, 20))}`];
};

const deliveryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

/* ─── sub-components ─── */
const RatingBar = ({ star, count, total }) => {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-gray-600">{star}</span>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400">{count}</span>
    </div>
  );
};

/* ─── main component ─── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingCart, setAddingCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setLoading(true);
    setSelectedImage(0);
    setQuantity(1);
    setProduct(null);

    const isNumeric = /^\d+$/.test(id);
    const fetchProduct = isNumeric ? productAPI.getById(id) : productAPI.getBySlug(id);
    let resolvedId = null;

    fetchProduct
      .then((r) => {
        const prod = r.data?.data || r.data;
        setProduct(prod);
        resolvedId = prod?.id;
        return productAPI.getAll({ categoryId: prod?.categoryId, size: 6 });
      })
      .then((r) => {
        const items = r?.data?.data?.content || r?.data?.content || [];
        setRelated(items.filter((p) => p.id !== resolvedId).slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    reviewAPI.getByProduct(id).then((r) => {
      const data = r.data?.data?.content || r.data?.data || r.data?.content || r.data || [];
      setReviews(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, [id]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    if (product.stockQuantity <= 0) { showToast('Product is out of stock', 'error'); return; }
    setAddingCart(true);
    try {
      await addToCart(product.id, quantity, product);
      showToast(`${product.name} added to cart! 🛒`, 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setAddingCart(false);
    }
  }, [product, quantity, addToCart, showToast]);

  const handleBuyNow = useCallback(async () => {
    if (!product) return;
    if (product.stockQuantity <= 0) { showToast('Product is out of stock', 'error'); return; }
    setBuyingNow(true);
    try {
      await addToCart(product.id, quantity, product);
      showToast('Proceeding to checkout...', 'success');
      if (isAuthenticated) {
        navigate('/checkout');
      } else {
        navigate('/login', { state: { from: { pathname: '/checkout' } } });
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to proceed', 'error');
    } finally {
      setBuyingNow(false);
    }
  }, [product, quantity, addToCart, isAuthenticated, navigate, showToast]);

  const handleWishlist = useCallback(() => {
    if (!isAuthenticated) { showToast('Please sign in to save to wishlist', 'info'); return; }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showToast('Removed from wishlist', 'success');
    } else {
      addToWishlist(product.id);
      showToast('Added to wishlist! ❤️', 'success');
    }
  }, [product, isAuthenticated, isInWishlist, addToWishlist, removeFromWishlist, showToast]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const handlePincodeCheck = () => {
    if (!pincode || pincode.length < 6) { showToast('Enter a valid 6-digit pincode', 'error'); return; }
    setPincodeMsg(`✅ Delivery available to ${pincode} — Expected by ${deliveryDate()}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      await reviewAPI.create({ productId: product.id, rating: reviewForm.rating, comment: reviewForm.comment });
      showToast('Review submitted! Thank you 🌟', 'success');
      setReviewForm({ rating: 5, comment: '' });
      const r = await reviewAPI.getByProduct(id);
      const data = r.data?.data?.content || r.data?.data || r.data?.content || r.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-500 text-sm">Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Package className="w-16 h-16 text-gray-300" />
      <h2 className="text-xl font-semibold text-gray-700">Product not found</h2>
      <Link to="/products" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">
        Browse Products
      </Link>
    </div>
  );

  const images = getImages(product);
  const rating = Number(product.rating || product.averageRating || 0);
  const effectivePrice = getEffectivePrice(product);
  const discountPct = getDiscountPercent(product.price, product.discountPrice);
  const inWishlist = isInWishlist(product.id);
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
  const isOutOfStock = product.stockQuantity <= 0;

  // Rating breakdown
  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => Math.round(r.rating) === s).length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-emerald-600 transition-colors">Products</Link>
            {product.categoryName && (
              <>
                <span>/</span>
                <Link to={`/products?categoryId=${product.categoryId}`} className="hover:text-emerald-600 transition-colors">
                  {product.categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── LEFT: Image Gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              style={{ aspectRatio: '1/1' }}
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-contain p-6 transition-transform duration-200 ${zoomed ? 'scale-150' : 'scale-100'}`}
                style={zoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
                onError={(e) => { e.target.src = `https://placehold.co/600x600/f3f4f6/374151?text=${encodeURIComponent(product.name?.substring(0,20) || 'Product')}`; }}
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {discountPct > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    {discountPct}% OFF
                  </span>
                )}
                {product.featured && (
                  <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    Featured
                  </span>
                )}
                {isLowStock && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm animate-pulse">
                    Only {product.stockQuantity} left!
                  </span>
                )}
              </div>

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                  {selectedImage + 1} / {images.length}
                </div>
              )}

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((p) => Math.max(0, p - 1))}
                    disabled={selectedImage === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((p) => Math.min(images.length - 1, p + 1))}
                    disabled={selectedImage === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-3 left-3 text-xs text-gray-400 bg-white/80 px-2 py-0.5 rounded-md pointer-events-none">
                Hover to zoom
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-emerald-500 shadow-sm shadow-emerald-200'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-contain bg-white p-1"
                      onError={(e) => { e.target.src = 'https://placehold.co/64x64/f3f4f6/374151?text=Img'; }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Share & Wishlist row */}
            <div className="flex gap-3">
              <button
                onClick={handleWishlist}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex-1 justify-center ${
                  inWishlist
                    ? 'border-red-400 bg-red-50 text-red-500'
                    : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-400 text-sm font-medium transition-all"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="space-y-5">
            {/* Brand + Category */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {product.brand}
                </span>
              )}
              {product.categoryName && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {product.categoryName}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <StarRating rating={rating} size="md" />
                <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
              </div>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-sm text-emerald-600 hover:underline"
              >
                {reviews.length > 0 ? `${reviews.length} reviews` : 'Be the first to review'}
              </button>
              {product.reviewCount > 0 && (
                <span className="text-xs text-gray-400">| {product.reviewCount} ratings</span>
              )}
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(effectivePrice)}</span>
                {product.discountPrice && product.price > effectivePrice && (
                  <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                )}
                {discountPct > 0 && (
                  <span className="bg-green-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-lg">
                    {discountPct}% off
                  </span>
                )}
              </div>
              {discountPct > 0 && (
                <p className="text-sm text-emerald-700 mt-1 font-medium">
                  You save {formatCurrency(product.price - effectivePrice)} on this order!
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Stock Status */}
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-600 font-semibold">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Out of Stock — Check back later
              </div>
            ) : isLowStock ? (
              <div>
                <div className="flex items-center gap-2 text-orange-600 font-semibold mb-1.5">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  Hurry! Only {product.stockQuantity} left in stock
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${Math.min((product.stockQuantity / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                In Stock — Ready to ship
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-bold text-gray-900 min-w-[48px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    className="px-3.5 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">{product.stockQuantity} available</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingCart}
                className="flex-1 py-3.5 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:border-gray-200 disabled:text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
              >
                {addingCart ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || buyingNow}
                className="flex-1 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-900/20 text-sm"
              >
                {buyingNow ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Buy Now</>
                )}
              </button>
            </div>

            {!isAuthenticated && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                💡 <Link to="/login" className="font-semibold underline">Sign in</Link> for a faster checkout and to track your orders
              </p>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders ₹499+' },
                { icon: Shield, label: 'Secure Pay', sub: '100% Protected' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '30-day Policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Icon className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-semibold text-gray-800">{label}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{sub}</span>
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <Truck className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                <div>
                  <span className="font-semibold">Expected Delivery: {deliveryDate()}</span>
                  <p className="text-blue-600 text-xs mt-0.5">Order in next 2 hours for same-day dispatch</p>
                </div>
              </div>
              {/* Pincode Checker */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').substring(0, 6)); setPincodeMsg(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePincodeCheck()}
                    placeholder="Check delivery pincode"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handlePincodeCheck}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check
                </button>
              </div>
              {pincodeMsg && <p className="text-xs text-emerald-700 font-medium">{pincodeMsg}</p>}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                {product.shortDescription}
              </p>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-14 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { key: 'description', label: 'Description' },
              { key: 'specifications', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 lg:p-8">
            {/* Description */}
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p>{product.description || 'No description available for this product.'}</p>
              </div>
            )}

            {/* Specifications */}
            {activeTab === 'specifications' && (
              <div>
                {product.specifications ? (() => {
                  try {
                    const specs = typeof product.specifications === 'string'
                      ? JSON.parse(product.specifications)
                      : product.specifications;
                    return (
                      <div className="grid sm:grid-cols-2 gap-0 border border-gray-100 rounded-xl overflow-hidden">
                        {Object.entries(specs).map(([k, v], i) => (
                          <div key={k} className={`flex gap-3 px-5 py-3 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100`}>
                            <span className="text-sm font-semibold text-gray-600 min-w-[130px]">{k}</span>
                            <span className="text-sm text-gray-900">{v}</span>
                          </div>
                        ))}
                      </div>
                    );
                  } catch {
                    return <p className="text-gray-500 text-sm">Specifications unavailable.</p>;
                  }
                })() : (
                  <p className="text-gray-500 text-sm">No specifications available.</p>
                )}
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Rating Summary */}
                {reviews.length > 0 && (
                  <div className="flex gap-8 flex-wrap">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</div>
                      <StarRating rating={rating} size="sm" />
                      <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2 py-1">
                      {starCounts.map(({ star, count }) => (
                        <RatingBar key={star} star={star} count={count} total={reviews.length} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Review List */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                              {(r.customerName || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{r.customerName || 'Anonymous'}</div>
                              <StarRating rating={r.rating} size="sm" />
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                          </span>
                        </div>
                        {r.comment && <p className="text-sm text-gray-700 mt-3 leading-relaxed">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">No reviews yet</p>
                    <p className="text-gray-400 text-xs mt-1">Be the first to share your experience!</p>
                  </div>
                )}

                {/* Write Review */}
                {isAuthenticated ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" /> Write a Review
                    </h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <StarRating
                          rating={reviewForm.rating}
                          interactive
                          size="lg"
                          onRate={(r) => setReviewForm((p) => ({ ...p, rating: r }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
                        <textarea
                          rows={3}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                          placeholder="Share your experience with this product..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-60 transition-colors"
                      >
                        {submittingReview ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : '⭐ Submit Review'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-600 mb-3">Sign in to write a review</p>
                    <Link
                      to="/login"
                      className="inline-block px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <Link to={`/products?categoryId=${product.categoryId}`} className="text-sm text-emerald-600 hover:underline font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
