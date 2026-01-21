import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useLocation } from 'react-router-dom';
import CardProduct from '../components/CardProduct';
import productService from '../services/product.service';
import categoryService from '../services/category.service';
import brandService from '../services/brand.service';

const FilterSection = ({ title, icon, children, defaultOpen = false, isDynamic = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <div className="flex items-center gap-2">
          {icon && <Icon icon={icon} className="text-sea-primary" />}
          <h3 className={`font-bold ${isDynamic ? 'text-sm uppercase tracking-wider' : 'text-sea-deep'} group-hover:text-sea-primary transition-colors`}>{title}</h3>
        </div>
        <Icon
          icon="ic:round-keyboard-arrow-down"
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';

  // Pagination State
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [limit] = useState(12);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: '', max: '' });
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sort, setSort] = useState('newest');

  // Dynamic Filters State
  const [dynamicFilters, setDynamicFilters] = useState([]); // [{ key, label, options: [] }]
  const [activeDynamicFilters, setActiveDynamicFilters] = useState({}); // { key: value }

  // Fetch initial data (Categories & Brands)
  const [initialBrands, setInitialBrands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brds] = await Promise.all([
          categoryService.getCategories(),
          brandService.getBrands()
        ]);
        setCategories(cats.categories || (Array.isArray(cats) ? cats : []));
        const allBrands = brds.brands || (Array.isArray(brds) ? brds : []);
        setBrands(allBrands);
        setInitialBrands(allBrands);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    fetchData();
  }, []);

  // Update Dynamic Filters AND Brands when Category changes
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (selectedCategory) {
        try {
          // Fetch dynamic specs
          const filtersData = await productService.getCategoryFilters(selectedCategory);
          setDynamicFilters(filtersData);

          // Fetch relevant brands
          const brandsData = await productService.getCategoryBrands(selectedCategory);
          setBrands(brandsData);

          // Clear selected brand if it's not in the new list
          // logic: if(selectedBrand && !brandsData.find(b=>b._id === selectedBrand)) setSelectedBrand('');
          // But `selectedBrand` state update inside async might be tricky if checked before setBrands propagation.
          // Effectively, if the old brand isn't in new list, it just filters to 0 products (correct behavior) or we force clear it.
          // Let's force clear it IF it's not valid, but getting state synchronously is hard here.
          // A separate useEffect for validation could work, or just let the user see 0 results.

        } catch (error) {
          console.error('Error fetching category data:', error);
          setDynamicFilters([]);
          setBrands(initialBrands); // Fallback? Or empty? Better fallback to all? No, if error, maybe empty.
        }
      } else {
        setDynamicFilters([]);
        setActiveDynamicFilters({});
        setBrands(initialBrands); // Reset to all brands
      }
    };
    fetchCategoryData();
  }, [selectedCategory, initialBrands]); // Add initialBrands dep

  // Reset active dynamic filters ONLY when category changes
  useEffect(() => {
    setActiveDynamicFilters({});
  }, [selectedCategory]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          keyword: keyword,
          sort,
          is_active: true
        };

        // 3. Logic: Send all current filters (Category, Brand, Price, Dynamic) to Backend
        if (selectedCategory) params.category = selectedCategory;
        if (selectedBrand) params.brand = selectedBrand;
        if (appliedPriceRange.min) params.minPrice = appliedPriceRange.min;
        if (appliedPriceRange.max) params.maxPrice = appliedPriceRange.max;

        // Add dynamic filters to params
        if (Object.keys(activeDynamicFilters).length > 0) {
          params.filters = JSON.stringify(activeDynamicFilters);
        }

        const response = await productService.getProducts(params);
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
  }, [page, limit, keyword, selectedCategory, selectedBrand, appliedPriceRange, activeDynamicFilters, sort]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [keyword, selectedCategory, selectedBrand, appliedPriceRange, activeDynamicFilters, sort]);

  const handleApplyPrice = () => {
    setAppliedPriceRange(priceRange);
    setShowMobileFilter(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setAppliedPriceRange({ min: '', max: '' });
    setActiveDynamicFilters({});
    setShowMobileFilter(false);
    // Note: Keyword clearing is handled by navigation in real app, staying simple here
  };

  // Fetch Category Specific Filters (Dynamic)
  useEffect(() => {
    const fetchDynamicFilters = async () => {
      if (selectedCategory) {
        try {
          const params = {};
          if (keyword) params.keyword = keyword;
          if (selectedBrand) params.brand = selectedBrand;
          if (appliedPriceRange.min) params.minPrice = appliedPriceRange.min;
          if (appliedPriceRange.max) params.maxPrice = appliedPriceRange.max;

          if (Object.keys(activeDynamicFilters).length > 0) {
            params.filters = JSON.stringify(activeDynamicFilters);
          }

          const filters = await productService.getCategoryFilters(selectedCategory, params);
          setDynamicFilters(filters);
        } catch (error) {
          console.error('Error fetching category filters:', error);
          setDynamicFilters([]);
        }
      } else {
        setDynamicFilters([]);
      }
    };
    fetchDynamicFilters();
  }, [selectedCategory, selectedBrand, appliedPriceRange, keyword, activeDynamicFilters]);

  // Reset active dynamic filters ONLY when category changes
  useEffect(() => {
    setActiveDynamicFilters({});
  }, [selectedCategory]);

  const toggleDynamicFilter = (key, value) => {
    setActiveDynamicFilters(prev => {
      const newState = { ...prev };
      if (newState[key] === value) {
        delete newState[key]; // Deselect if already selected
      } else {
        newState[key] = value; // Select new value (replace existing)
      }
      return newState;
    });
  };


  return (
    <div className='min-h-screen bg-slate-50'>
      <section className='bg-linear-to-b from-sea-primary/10 to-slate-50 pt-16 pb-8 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-sea-deep mb-6'>
            ค้นพบสินค้า <span className='text-sea-primary'>พรีเมียม</span> สำหรับคุณ
          </h1>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="md:hidden flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-white rounded-full text-sea-text font-medium shadow-sm border border-slate-200"
          >
            <Icon icon="ic:round-filter-list" />
            ตัวกรอง
          </button>
        </div>
      </section>

      <div className='max-w-7xl mx-auto px-4 pb-20 flex flex-col md:flex-row gap-8'>

        {/* Sidebar Filters */}
        {/* Sidebar Filters */}
        <aside className={`fixed inset-0 z-50 bg-white md:bg-white md:static md:z-0 md:w-1/4 p-6 md:p-6 md:rounded-2xl md:shadow-sm md:border md:border-slate-100 overflow-y-auto md:overflow-visible transition-transform duration-300 ${showMobileFilter ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} `}>
          <div className="flex items-center justify-between md:hidden mb-6">
            <h2 className="text-xl font-bold text-sea-text">ตัวกรอง</h2>
            <button onClick={() => setShowMobileFilter(false)} className="p-2">
              <Icon icon="ic:round-close" width="24" />
            </button>
          </div>

          {/* Filter Sections */}
          <div className="space-y-4">

            {/* Categories Section (Moved to Bottom) */}
            <FilterSection title="หมวดหมู่สินค้า" icon="ic:round-category" defaultOpen={true}>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-xl transition-all ${selectedCategory === '' ? 'bg-sea-primary text-white shadow-md shadow-sea-primary/30 transform scale-[1.02]' : 'hover:bg-slate-50 text-slate-600'} `}>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCategory === '' ? 'border-white' : 'border-slate-300'} `}>
                    {selectedCategory === '' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                  <input type="radio" name="category" className="hidden" checked={selectedCategory === ''} onChange={() => setSelectedCategory('')} />
                  <span className="font-medium">หมวดหมู่ทั้งหมด</span>
                </label>
                {categories.map(cat => (
                  <label key={cat._id} className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-xl transition-all ${selectedCategory === cat._id ? 'bg-sea-primary text-white shadow-md shadow-sea-primary/30 transform scale-[1.02]' : 'hover:bg-slate-50 text-slate-600'} `}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCategory === cat._id ? 'border-white' : 'border-slate-300'} `}>
                      {selectedCategory === cat._id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <input type="radio" name="category" className="hidden" checked={selectedCategory === cat._id} onChange={() => setSelectedCategory(cat._id)} />
                    <span className="font-medium">{cat.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range Section */}
            <FilterSection title="ช่วงราคา" icon="ic:round-attach-money" defaultOpen={true}>
              <div className="flex gap-2 items-center mb-3">
                <input
                  type="number"
                  placeholder="ต่ำสุด"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary text-sm"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="สูงสุด"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary text-sm"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                />
              </div>
              <button
                onClick={handleApplyPrice}
                className="w-full py-2.5 bg-sea-primary text-white hover:bg-sea-deep hover:shadow-lg hover:shadow-sea-primary/30 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5"
              >
                ตกลง
              </button>
            </FilterSection>

            {/* Brands Section */}
            {brands.length > 0 && (
              <FilterSection title="แบรนด์สินค้า" icon="ic:round-branding-watermark" defaultOpen={true}>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  <label className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-xl transition-all ${selectedBrand === '' ? 'bg-sea-primary text-white shadow-md shadow-sea-primary/30' : 'hover:bg-slate-50 text-slate-600'} `}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedBrand === '' ? 'border-white bg-white' : 'border-slate-300'} `}>
                      {selectedBrand === '' && <Icon icon="ic:round-check" className="text-sea-primary text-xs" />}
                    </div>
                    <input type="radio" name="brand" className="hidden" checked={selectedBrand === ''} onChange={() => setSelectedBrand('')} />
                    <span className="text-sm font-medium">แบรนด์ทั้งหมด</span>
                  </label>
                  {brands.map(brand => (
                    <label key={brand._id} className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-xl transition-all ${selectedBrand === brand._id ? 'bg-sea-primary text-white shadow-md shadow-sea-primary/30' : 'hover:bg-slate-50 text-slate-600'} `}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedBrand === brand._id ? 'border-white bg-white' : 'border-slate-300'} `}>
                        {selectedBrand === brand._id && <Icon icon="ic:round-check" className="text-sea-primary text-xs" />}
                      </div>
                      <input type="radio" name="brand" className="hidden" checked={selectedBrand === brand._id} onChange={() => setSelectedBrand(brand._id)} />
                      <span className="text-sm font-medium">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Dynamic Filters */}
            {selectedCategory && dynamicFilters.length > 0 && dynamicFilters.map(filter => (
              <FilterSection key={filter.key} title={filter.label} defaultOpen={true} isDynamic>


                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {filter.options.map((option, idx) => {
                    const isChecked = activeDynamicFilters[filter.key] === option;
                    return (
                      <label key={idx} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${isChecked ? 'text-sea-primary font-bold bg-sea-primary/5' : 'hover:text-sea-deep text-slate-600'} `}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'border-sea-primary bg-sea-primary' : 'border-slate-300'} `}>
                          {isChecked && <Icon icon="ic:round-check" className="text-white text-[10px]" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={() => toggleDynamicFilter(filter.key, option)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    );
                  })}
                </div>
              </FilterSection>
            ))}

            <button
              onClick={handleClearFilters}
              className="w-full py-2.5 border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Icon icon="ic:round-refresh" /> ล้างตัวกรองทั้งหมด
            </button>
          </div>
        </aside>

        {/* Categories Mobile Overlay Backdrop */}
        {showMobileFilter && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMobileFilter(false)} />
        )}

        {/* Main Content */}
        <main className='w-full md:w-3/4'>
          {/* Active Filters Summary */}
          {(selectedCategory || selectedBrand || appliedPriceRange.min || appliedPriceRange.max || Object.keys(activeDynamicFilters).length > 0) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 mr-2">ตัวกรองที่เลือก:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-sea-primary/10 text-sea-primary rounded-full text-xs font-bold">
                  หมวดหมู่: {categories.find(c => c._id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('')}><Icon icon="ic:round-close" /></button>
                </span>
              )}
              {Object.keys(activeDynamicFilters).map(key => (
                <span key={key} className="inline-flex items-center gap-1 px-3 py-1 bg-sea-primary/10 text-sea-primary rounded-full text-xs font-bold capitalize">
                  {key.replace('_', ' ')}: {activeDynamicFilters[key]}
                  <button onClick={() => toggleDynamicFilter(key, activeDynamicFilters[key])}><Icon icon="ic:round-close" /></button>
                </span>
              ))}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-sea-primary/10 text-sea-primary rounded-full text-xs font-bold">
                  แบรนด์: {brands.find(b => b._id === selectedBrand)?.name}
                  <button onClick={() => setSelectedBrand('')}><Icon icon="ic:round-close" /></button>
                </span>
              )}
              {(appliedPriceRange.min || appliedPriceRange.max) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-sea-primary/10 text-sea-primary rounded-full text-xs font-bold">
                  ราคา: {appliedPriceRange.min || '0'} - {appliedPriceRange.max || '∞'}
                  <button onClick={() => { setAppliedPriceRange({ min: '', max: '' }); setPriceRange({ min: '', max: '' }); }}><Icon icon="ic:round-close" /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <div className="w-12 h-12 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-sea-muted font-medium">กำลังโหลดสินค้า...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 min-h-[400px] flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-4">
                <Icon icon="ic:outline-filter-alt-off" className="text-slate-400 text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-sea-text">ไม่พบสินค้า</h3>
              <p className="text-sea-subtext mt-2 max-w-xs mx-auto">เราไม่พบสินค้าที่ตรงตามเงื่อนไขที่คุณเลือก ลองลบตัวกรองบางส่วนออก</p>
              <button onClick={handleClearFilters} className="mt-6 text-sea-primary font-bold hover:underline">ล้างตัวกรองทั้งหมด</button>
            </div>
          ) : (
            <>
              {/* Sort Dropdown */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sea-subtext text-sm">
                  แสดงทั้งหมด <span className="font-bold text-sea-deep">{products.length}</span> รายการ
                </p>
                <select
                  className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-sea-deep focus:outline-none focus:border-sea-primary cursor-pointer shadow-sm hover:border-sea-primary transition-colors"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">มาใหม่ล่าสุด</option>
                  <option value="price_asc">ราคา: ต่ำไปสูง</option>
                  <option value="price_desc">ราคา: สูงไปต่ำ</option>
                  <option value="name_asc">ชื่อ: A-Z</option>
                </select>
              </div>

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
                    หน้า {page} จาก {pages}
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
        </main>
      </div>
    </div>
  );
}

export default Home;