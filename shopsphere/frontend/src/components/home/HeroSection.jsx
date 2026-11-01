import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star, Truck } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-300 text-sm font-medium">
              <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              Trusted by 50,000+ happy shoppers
            </div>

            <div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Shop the
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Future
                </span>
                Today.
              </h1>
              <p className="mt-6 text-xl text-gray-300 leading-relaxed max-w-lg">
                Discover curated collections of premium products at unbeatable prices. 
                From electronics to fashion — everything you need, delivered fast.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?category=featured"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-white/5"
              >
                View Deals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[
                { label: 'Products', value: '10K+' },
                { label: 'Brands', value: '500+' },
                { label: 'Happy Customers', value: '50K+' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-emerald-400">{s.value}</div>
                  <div className="text-sm text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Feature cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              {
                icon: Truck,
                title: 'Free Shipping',
                desc: 'On orders over ₹499',
                color: 'from-blue-500/20 to-blue-600/10',
                border: 'border-blue-500/20',
              },
              {
                icon: Star,
                title: 'Top Rated',
                desc: '4.8★ avg from reviews',
                color: 'from-amber-500/20 to-amber-600/10',
                border: 'border-amber-500/20',
              },
              {
                icon: ShoppingBag,
                title: 'Easy Returns',
                desc: '30-day return policy',
                color: 'from-emerald-500/20 to-emerald-600/10',
                border: 'border-emerald-500/20',
              },
              {
                icon: Star,
                title: 'Secure Pay',
                desc: '100% payment security',
                color: 'from-purple-500/20 to-purple-600/10',
                border: 'border-purple-500/20',
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-6 backdrop-blur-sm`}
              >
                <card.icon className="w-8 h-8 text-white mb-3 opacity-80" />
                <h3 className="font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 0C480 0 240 60 0 30L0 60Z" fill="#F9FAFB" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
