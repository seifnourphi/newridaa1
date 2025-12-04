'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { Grid, List, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  images: { url: string; alt?: string; altAr?: string }[];
  category: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
  };
  variants: {
    type: 'SIZE' | 'COLOR';
    value: string;
    valueAr?: string;
  }[];
  stockQuantity: number;
  createdAt?: string;
  views?: number;
}

interface ProductGridProps {
  products: Product[];
  categories: Array<{ id: string; name: string; nameAr: string; slug: string }>;
}

export function ProductGrid({ products, categories }: ProductGridProps) {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const handleFiltersChange = (filters: any) => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.nameAr.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category.id === filters.category);
    }

    // Price range filter
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter(product => {
        const price = product.salePrice || product.price;
        const min = filters.priceMin ? parseFloat(filters.priceMin) : 0;
        const max = filters.priceMax ? parseFloat(filters.priceMax) : Infinity;
        return price >= min && price <= max;
      });
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stockQuantity > 0);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || new Date()).getTime() - new Date(b.createdAt || new Date()).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProductFilters 
                onFiltersChange={handleFiltersChange}
                categories={categories}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#DAA520] mb-2">
                  {language === 'ar' ? 'المنتجات' : 'Products'}
                </h2>
                <p className="text-white/80">
                  {language === 'ar' 
                    ? `عرض ${filteredProducts.length} منتج`
                    : `Showing ${filteredProducts.length} products`
                  }
                </p>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-[#3e5258] text-white px-4 py-2 rounded-xl hover:bg-[#DAA520] transition-colors flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {language === 'ar' ? 'فلاتر' : 'Filters'}
                </button>

                {/* View Mode Toggle */}
                <div className="flex bg-[#2c2c2c] rounded-xl p-1 border border-[#DAA520]/20">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#DAA520] text-white'
                        : 'text-[#DAA520] hover:bg-[#DAA520]/20'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#DAA520] text-white'
                        : 'text-[#DAA520] hover:bg-[#DAA520]/20'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-8">
                <ProductFilters 
                  onFiltersChange={handleFiltersChange}
                  categories={categories}
                />
              </div>
            )}

            {/* Products Grid/List */}
            {currentProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a] rounded-3xl p-12 max-w-md mx-auto border border-[#DAA520]/20 shadow-2xl">
                  <div className="text-8xl mb-6 animate-float">🔍</div>
                  <h3 className="text-2xl font-bold text-[#DAA520] mb-4">
                    {language === 'ar' ? 'لا توجد منتجات' : 'No Products Found'}
                  </h3>
                  <p className="text-white/80 mb-8">
                    {language === 'ar' 
                      ? 'جرب تغيير الفلاتر أو البحث عن شيء آخر'
                      : 'Try adjusting your filters or search for something else'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {currentProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard 
                        product={product} 
                        viewMode={viewMode}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3e5258] text-white rounded-xl hover:bg-[#DAA520] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                            page === currentPage
                              ? 'bg-[#DAA520] text-white shadow-lg'
                              : 'bg-[#3e5258]/20 text-white hover:bg-[#DAA520] hover:text-white'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3e5258] text-white rounded-xl hover:bg-[#DAA520] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
