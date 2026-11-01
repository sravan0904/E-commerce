import React from 'react';
import { Link } from 'react-router-dom';

const PromoBanner = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Banner 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-8 text-white min-h-[200px] flex items-center">
            <div className="absolute right-0 bottom-0 opacity-10">
              <div className="w-64 h-64 rounded-full bg-white -translate-y-1/4 translate-x-1/4" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                Limited Time
              </span>
              <h3 className="mt-3 text-3xl font-bold leading-tight">
                Up to 50% Off<br />Electronics
              </h3>
              <p className="mt-2 text-emerald-100 text-sm">
                Top brands at unbeatable prices
              </p>
              <Link
                to="/products?categoryId=1"
                className="mt-5 inline-block bg-white text-emerald-700 font-semibold px-5 py-2 rounded-lg hover:shadow-lg transition-shadow text-sm"
              >
                Shop Electronics →
              </Link>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 p-8 text-white min-h-[200px] flex items-center">
            <div className="absolute right-0 bottom-0 opacity-10">
              <div className="w-64 h-64 rounded-full bg-white -translate-y-1/4 translate-x-1/4" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                New Arrivals
              </span>
              <h3 className="mt-3 text-3xl font-bold leading-tight">
                Fresh Fashion<br />Collections
              </h3>
              <p className="mt-2 text-orange-100 text-sm">
                Stay ahead of the trend
              </p>
              <Link
                to="/products?categoryId=2"
                className="mt-5 inline-block bg-white text-orange-600 font-semibold px-5 py-2 rounded-lg hover:shadow-lg transition-shadow text-sm"
              >
                Shop Fashion →
              </Link>
            </div>
          </div>
        </div>

        {/* 3-col smaller banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Free Delivery', desc: 'On orders above ₹499', color: 'bg-blue-50 border-blue-100', icon: '🚚' },
            { label: 'Use SAVE10', desc: '10% off your first order', color: 'bg-purple-50 border-purple-100', icon: '🎁' },
            { label: 'Easy Returns', desc: '30-day hassle-free returns', color: 'bg-amber-50 border-amber-100', icon: '↩️' },
          ].map((b) => (
            <div key={b.label} className={`${b.color} border rounded-xl p-5 flex items-center gap-4`}>
              <span className="text-3xl">{b.icon}</span>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{b.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
