import React, { useEffect, useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductSection from '../components/home/ProductSection';
import PromoBanner from '../components/home/PromoBanner';
import Testimonials from '../components/home/Testimonials';
import { categoryAPI, productAPI } from '../api/index';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    // Fetch categories
    categoryAPI.getAll()
      .then((res) => {
        const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoadingCats(false));

    // Fetch featured products
    productAPI.getFeatured()
      .then((res) => {
        const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
        setFeatured(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        productAPI.getAll({ size: 8 }).then((res) => {
          const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
          setFeatured(Array.isArray(data) ? data : []);
        });
      })
      .finally(() => setLoadingFeatured(false));

    // Fetch new arrivals
    productAPI.getNewArrivals()
      .then((res) => {
        const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
        setNewArrivals(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        productAPI.getAll({ size: 8 }).then((res) => {
          const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
          setNewArrivals(Array.isArray(data) ? data : []);
        });
      })
      .finally(() => setLoadingNew(false));

    // Fetch top rated
    productAPI.getTopRated()
      .then((res) => {
        const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
        setTopRated(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        productAPI.getAll({ size: 8 }).then((res) => {
          const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
          setTopRated(Array.isArray(data) ? data : []);
        });
      })
      .finally(() => setLoadingTop(false));
  }, []);

  return (
    <div>
      <HeroSection />
      <CategoryGrid categories={categories} loading={loadingCats} />
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked deals just for you"
        products={featured}
        loading={loadingFeatured}
        viewAllLink="/products?featured=true"
      />
      <PromoBanner />
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh products added this week"
        products={newArrivals}
        loading={loadingNew}
        viewAllLink="/products?sort=createdAt,desc"
      />
      <ProductSection
        title="Top Rated"
        subtitle="Our highest-rated products by customers"
        products={topRated}
        loading={loadingTop}
        viewAllLink="/products?sort=averageRating,desc"
      />
      <Testimonials />
    </div>
  );
};

export default Home;
