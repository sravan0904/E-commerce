import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ArrowRight } from 'lucide-react'
import { newsletterAPI } from '../../api'
import { useToast } from '../../context/ToastContext'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) { toast.error('Please enter a valid email'); return }
    setSubscribing(true)
    try {
      const res = await newsletterAPI.subscribe(email)
      toast.success(res.data.message || 'Subscribed successfully!')
      setEmail('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Subscription failed')
    } finally { setSubscribing(false) }
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      {/* Newsletter */}
      <div className="bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-2xl font-bold">Get Exclusive Deals</h3>
            <p className="text-emerald-100 text-sm mt-1">Subscribe to our newsletter for 20% off your first order</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none"
              required
            />
            <button type="submit" disabled={subscribing} className="bg-white text-emerald-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap">
              {subscribing ? 'Joining...' : 'Subscribe'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-xl">ShopSphere</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">A premium curated marketplace where exceptional design meets unparalleled craftsmanship.</p>
          <div className="flex gap-4 mt-5">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-500 hover:text-emerald-400 transition-colors"><Icon className="w-5 h-5" /></a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-5">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {[['/', 'Home'], ['/products', 'Shop All'], ['/products?featured=true', 'Featured'], ['/orders', 'My Orders'], ['/wishlist', 'Wishlist']].map(([href, label]) => (
              <li key={href}><Link to={href} className="text-gray-400 hover:text-emerald-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold mb-5">Categories</h4>
          <ul className="space-y-3 text-sm">
            {[['electronics', 'Electronics'], ['fashion', 'Fashion & Apparel'], ['home-living', 'Home & Living'], ['beauty-wellness', 'Beauty & Wellness'], ['sports-fitness', 'Sports & Fitness']].map(([slug, label]) => (
              <li key={slug}><Link to={`/products?search=${slug}`} className="text-gray-400 hover:text-emerald-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-5">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 text-gray-400"><MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> 42 Marina Boulevard, Mumbai, MH 400001</li>
            <li className="flex items-center gap-3 text-gray-400"><Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" /> +91 98765 43210</li>
            <li className="flex items-center gap-3 text-gray-400"><Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" /> hello@shopsphere.in</li>
          </ul>
          <div className="mt-5 p-4 bg-gray-800 rounded-xl text-xs text-gray-400">
            <p className="font-medium text-gray-300 mb-1">🔒 Secure Shopping</p>
            <p>100% secure payments with SSL encryption</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 ShopSphere. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
