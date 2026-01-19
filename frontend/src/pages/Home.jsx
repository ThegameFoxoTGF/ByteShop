import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import CardProduct from '../components/CardProduct';
import productService from '../services/product.service';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [limit] = useState(12); // Show 12 items per page for grid
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts({
          page,
          limit,
          keyword: debouncedKeyword,
          is_active: true // Ensure we only show active products
        });
        setProducts(response.products || []);
        setPages(response.pages || 0);
        setPage(response.page || 1);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, debouncedKeyword]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Hero / Header Section */}
      <section className='bg-linear-to-b from-sea-primary/10 to-slate-50 pt-16 pb-12 px-4'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-sea-deep text-center mb-6'>
            Discover Premium <span className='text-sea-primary'>Gadgets</span>
          </h1>
          <p className='text-sea-subtext text-center max-w-2xl mx-auto mb-10 text-lg'>
            Explore our curated collection of high-quality electronics and accessories.
            Designed for performance, built for style.
          </p>

          {/* Search Bar */}
          <div className='max-w-xl mx-auto relative'>
            <input
              type="text"
              placeholder="Search for products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl shadow-sea-primary/10 transition-all focus:ring-4 focus:ring-sea-primary/20 text-sea-text outline-none'
            />
            <Icon icon="ic:round-search" className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl' />
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className='max-w-7xl mx-auto px-4 pb-20'>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-sea-muted font-medium">Loading amazing products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
              <Icon icon="ic:outline-sentiment-dissatisfied" className="text-slate-400 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-sea-text">No products found</h3>
            <p className="text-sea-subtext mt-2">Try adjusting your search terms.</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'>
              {products.map((product) => (
                <CardProduct key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-sea-primary hover:border-sea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Icon icon="ic:round-chevron-left" width="24" />
                </button>

                <span className="font-medium text-sea-text px-4">
                  Page {page} of {pages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-sea-primary hover:border-sea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Icon icon="ic:round-chevron-right" width="24" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Home;