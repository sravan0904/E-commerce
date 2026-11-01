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
   