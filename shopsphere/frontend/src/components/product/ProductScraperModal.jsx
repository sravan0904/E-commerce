import React, { useState } from 'react';
import { Globe, Download, Link2, Loader2, Sparkles, CheckCircle2, Search, Zap } from 'lucide-react';
import Modal from '../common/Modal';
import { productAPI } from '../../api';
import { useToast } from '../../context/ToastContext';

const ProductScraperModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState('all-world');
  const [url, setUrl] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { showToast, toast } = useToast();

  const handleImportAllWorld = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await productAPI.importAllWorld();
      const items = res.data?.data || res.data || [];
      const count = Array.isArray(items) ? items.length : 200;
      setResult({
        type: 'all-world',
        message: `Successfully imported ${count} worldwide products across 24+ global categories into ShopSphere!`,
        count,
      });
      (toast?.success || showToast)(`Imported ${count} worldwide products!`, 'success');
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      (toast?.error || showToast)(err?.response?.data?.message || 'Failed to extract global catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickScrape = async (limit = 30) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await productAPI.scrapeFeed(limit);
      const items = res.data?.data || res.data || [];
      const count = Array.isArray(items) ? items.length : limit;
      setResult({
        type: 'feed',
        message: `Successfully imported ${count} live e-commerce products with categories, pricing, and images!`,
        count,
      });
      (toast?.success || showToast)(`Scraped and imported ${count} online items!`, 'success');
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      (toast?.error || showToast)(err?.response?.data?.message || 'Failed to fetch online feed. Check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordExtract = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      // Backend getProducts with search param auto-imports matching global items
      const res = await productAPI.getProducts({ search: searchKeyword.trim(), size: 24 });
      const pageData = res.data?.data || res.data;
      const count = pageData?.totalElements || (pageData?.content ? pageData.content.length : 0);
      setResult({
        type: 'search',
        message: `Successfully extracted matching worldwide products for "${searchKeyword.trim()}"! Found & ready: ${count} items.`,
        count,
      });
      (toast?.success || showToast)(`Extracted global products for "${searchKeyword.trim()}"!`, 'success');
      setSearchKeyword('');
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      (toast?.error || showToast)(err?.response?.data?.message || 'Failed to extract keyword products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlScrape = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await productAPI.scrapeUrl(url.trim());
      const item = res.data?.data || res.data;
      setResult({
        type: 'url',
        message: `Successfully scraped: ${item.name || 'Product'}`,
        item,
      });
      (toast?.success || showToast)('Product scraped and added to catalog!', 'success');
      setUrl('');
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      (toast?.error || showToast)(err?.response?.data?.message || 'Could not parse product page metadata', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Product Extraction & Web Scraper"
      size="lg"
      footer={
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-6 py-1">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('all-world'); setResult(null); }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'all-world'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Globe className="w-4 h-4" /> 🌍 Extract All Worldwide Products
          </button>
          <button
            onClick={() => { setActiveTab('search'); setResult(null); }}
            className={`ml-5 pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'search'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Zap className="w-4 h-4" /> Search & Auto-Extract
          </button>
          <button
            onClick={() => { setActiveTab('url'); setResult(null); }}
            className={`ml-5 pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'url'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Link2 className="w-4 h-4" /> Scrape by URL
          </button>
        </div>

        {/* Tab 1: Extract All Worldwide Products */}
        {activeTab === 'all-world' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-200 rounded-2xl p-5 text-gray-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    Extract All Products in the World
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Instantly extracts and synchronizes complete global catalogs (200+ products) across 24 departments: 
                    <span className="font-semibold text-emerald-700"> Smartphones, Laptops, Fragrances, Skincare, Groceries, Furniture, Fashion, Shoes, Watches, Bags, Automotive, Motorcycle, Jewellery & Lighting</span>.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={handleImportAllWorld}
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Extracting Worldwide Products across All 24 Categories...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Extract & Import All Worldwide Products (200+ Items)
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleQuickScrape(30)}
                disabled={loading}
                className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl font-medium text-xs sm:text-sm transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-semibold">Quick Sync Top 30</div>
                  <div className="text-xs text-gray-500">Trending tech & apparel</div>
                </div>
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Download className="w-4 h-4 text-gray-600" />}
              </button>

              <button
                onClick={() => handleQuickScrape(60)}
                disabled={loading}
                className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl font-medium text-xs sm:text-sm transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-semibold">Sync Top 60</div>
                  <div className="text-xs text-gray-500">Popular items + decor</div>
                </div>
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Download className="w-4 h-4 text-gray-600" />}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Keyword Search & Auto-Extract */}
        {activeTab === 'search' && (
          <form onSubmit={handleKeywordExtract} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-blue-900 text-xs sm:text-sm">
              <p className="font-semibold flex items-center gap-1.5 mb-1 text-blue-800">
                <Zap className="w-4 h-4 text-blue-600" /> Live Global On-Demand Extraction
              </p>
              <p className="text-blue-700 leading-relaxed">
                Type any item you want to buy (e.g. <strong>"iPhone"</strong>, <strong>"Sneakers"</strong>, <strong>"Perfume"</strong>, <strong>"Sofa"</strong>, <strong>"Watch"</strong>). The system queries global e-commerce registries, extracts matching items, and puts them into the store catalog immediately for purchase.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Product Name or Global Keyword
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="e.g. iPhone 15, Rolex, Nike Air, Dior Sauvage, Electric Scooter..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !searchKeyword.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Searching & Extracting from Global Repositories...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Extract Matching Global Items
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Custom URL Scraper */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlScrape} className="space-y-4">
            <p className="text-xs text-gray-500">
              Paste the public URL of a product from an e-commerce website (Amazon, Flipkart, or online shop). The parser extracts OpenGraph and Schema.org metadata (title, price, image, description) and imports it into your store.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Product URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.example.com/product/item-name"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scraping & Parsing Product...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Scrape & Import This Item
                </>
              )}
            </button>
          </form>
        )}

        {/* Results Feedback */}
        {result && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-gray-800 flex-1">
              <p className="font-semibold text-emerald-800">{result.message}</p>
              <p className="text-emerald-700 mt-1">
                Products are now live in the store with full purchasing, cart, and checkout support!
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductScraperModal;
