import React from 'react';
import StarRating from '../common/StarRating';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    avatar: 'PS',
    rating: 5,
    text: 'ShopSphere has completely changed how I shop online. The product quality is amazing and delivery was super fast. Highly recommend!',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Rahul Mehta',
    location: 'Delhi',
    avatar: 'RM',
    rating: 5,
    text: 'Best deals I\'ve found anywhere online. The website is very easy to use and customer support is top-notch. Will shop again!',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Ananya Patel',
    location: 'Bangalore',
    avatar: 'AP',
    rating: 4,
    text: 'Great variety of products at competitive prices. The checkout process was smooth and my order arrived perfectly packaged.',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Vikram Singh',
    location: 'Chennai',
    avatar: 'VS',
    rating: 5,
    text: 'I was skeptical at first but ShopSphere exceeded my expectations. Authentic products and very professional service.',
    color: 'bg-orange-100 text-orange-700',
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-500 mt-2">Trusted by thousands of happy shoppers across India</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <StarRating rating={t.rating} size="sm" />
              <p className="mt-4 text-gray-700 text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
