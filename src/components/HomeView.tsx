/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Flame, 
  Clock, 
  ThumbsUp, 
  Star, 
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Heart
} from "lucide-react";
import { Product, Banner } from "../types";
import { CATEGORIES, formatKz, formatUSD, convertUSDToKz } from "../data";

interface HomeViewProps {
  products: Product[];
  banners: Banner[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  onTriggerAISearch: (q: string) => void;
  aiSearching: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onAddToCart: (p: Product, qty: number, variant?: any) => void;
}

export default function HomeView({
  products,
  banners,
  favorites,
  toggleFavorite,
  onSelectProduct,
  searchQuery,
  onTriggerAISearch,
  aiSearching,
  selectedCategory,
  setSelectedCategory,
  onAddToCart
}: HomeViewProps) {
  // Banner Carousel State
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Filtering & Sorting State
  const [originFilter, setOriginFilter] = useState<"all" | "Shein" | "AliExpress">("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Auto rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  // Filter & sort logic
  let filteredProducts = products.filter((product) => {
    // Category match (subcat or parent)
    if (selectedCategory) {
      const matchCat = product.category.toLowerCase() === selectedCategory.toLowerCase() ||
                       product.category.toLowerCase().includes(selectedCategory.toLowerCase());
      if (!matchCat) return false;
    }

    // Origin match
    if (originFilter !== "all" && product.origin !== originFilter) {
      return false;
    }

    // Min Price
    if (minPrice && product.priceKz < Number(minPrice)) {
      return false;
    }

    // Max Price
    if (maxPrice && product.priceKz > Number(maxPrice)) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.priceKz - b.priceKz;
    if (sortBy === "price_desc") return b.priceKz - a.priceKz;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "recent") return a.deliveryDays - b.deliveryDays; // mock: faster shipping feels more recent
    return b.salesCount - a.salesCount; // default: popular
  });

  const clearFilters = () => {
    setOriginFilter("all");
    setSortBy("popular");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("");
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in" id="home-view-container">
      
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="relative h-[240px] sm:h-[420px] w-full overflow-hidden rounded-2xl shadow-xl group bg-zinc-900" id="hero-carousel">
          <div 
            className="w-full h-full bg-cover bg-center transition-all duration-1000 ease-in-out relative"
            style={{ backgroundImage: `url(${banners[currentBannerIndex]?.imageUrl})` }}
          >
            {/* Dark gradient overlay for typography readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-6 sm:px-16 text-white space-y-3 sm:space-y-4">
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start">
                Destaque Angolano
              </span>
              <h2 className="text-xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight max-w-xl text-balance">
                {banners[currentBannerIndex]?.title}
              </h2>
              <p className="text-xs sm:text-base text-gray-200 max-w-md line-clamp-2">
                {banners[currentBannerIndex]?.subtitle}
              </p>
              <button 
                onClick={() => {
                  setSelectedCategory(banners[currentBannerIndex]?.link || "");
                  window.scrollTo({ top: 500, behavior: "smooth" });
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-full w-fit flex items-center gap-2 shadow-lg hover:shadow-red-500/20 active:scale-95 transition-all"
              >
                <span>Comprar Agora</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-11 sm:w-11 bg-black/40 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-11 sm:w-11 bg-black/40 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-1.5 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBannerIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBannerIndex ? "w-5 bg-red-600" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category Horizontal Quick Grid */}
      <div className="space-y-4" id="quick-categories">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg sm:text-xl text-black dark:text-white">
            Explorar Categorias
          </h3>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory("")}
              className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline"
            >
              Ver Tudo
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
          <div 
            onClick={() => setSelectedCategory("")}
            className={`flex flex-col items-center gap-2 cursor-pointer shrink-0 snap-start py-1 ${!selectedCategory ? "scale-105" : ""}`}
          >
            <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center transition-all border ${
              !selectedCategory 
                ? "bg-red-600 text-white border-red-600 shadow-md" 
                : "bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-zinc-700"
            }`}>
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-center max-w-[70px] truncate">Todas</span>
          </div>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name || cat.subcategories.includes(selectedCategory);
            return (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.subcategories[0])} // select first subcat as representative
                className={`flex flex-col items-center gap-2 cursor-pointer shrink-0 snap-start py-1 ${isSelected ? "scale-105" : ""}`}
              >
                <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center transition-all border ${
                  isSelected 
                    ? "bg-red-600 text-white border-red-600 shadow-md" 
                    : "bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-zinc-700"
                }`}>
                  <span className="text-xs font-bold uppercase tracking-tighter truncate max-w-[40px]">
                    {cat.name.slice(0, 3)}
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-center text-gray-700 dark:text-gray-300 truncate max-w-[75px]">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shein and AliExpress Origin Promo cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="origin-promo-cards">
        <div 
          onClick={() => { setOriginFilter("Shein"); window.scrollTo({ top: 750, behavior: "smooth" }); }}
          className="bg-black text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden cursor-pointer shadow-lg hover:shadow-black/20 group hover:-translate-y-1 transition-all"
        >
          <div className="absolute right-4 bottom-0 top-0 w-1/3 opacity-30 group-hover:scale-110 transition-transform duration-500 bg-contain bg-right bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80')" }} />
          <div className="relative z-10 space-y-2 max-w-[65%]">
            <span className="bg-white text-black font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded">Shein Principal</span>
            <h4 className="text-xl sm:text-2xl font-display font-bold">Modas & Tendências</h4>
            <p className="text-xs text-gray-300">Vestidos, Moletons, Calçados e acessórios de moda feminina e masculina com envio internacional gratuito.</p>
            <span className="text-xs font-bold text-red-500 group-hover:underline inline-flex items-center gap-1 mt-2">
              Explorar Shein <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        <div 
          onClick={() => { setOriginFilter("AliExpress"); window.scrollTo({ top: 750, behavior: "smooth" }); }}
          className="bg-red-700 text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden cursor-pointer shadow-lg hover:shadow-red-700/20 group hover:-translate-y-1 transition-all"
        >
          <div className="absolute right-4 bottom-0 top-0 w-1/3 opacity-30 group-hover:scale-110 transition-transform duration-500 bg-contain bg-right bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80')" }} />
          <div className="relative z-10 space-y-2 max-w-[65%]">
            <span className="bg-yellow-400 text-black font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded">AliExpress</span>
            <h4 className="text-xl sm:text-2xl font-display font-bold">Gadgets & Eletrónicos</h4>
            <p className="text-xs text-red-100">Smartwatches, telemóveis, fones, luzes inteligentes e ferramentas premium de alta tecnologia.</p>
            <span className="text-xs font-bold text-yellow-300 group-hover:underline inline-flex items-center gap-1 mt-2">
              Explorar AliExpress <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & PRODUCTS GRID HEADER */}
      <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-zinc-900" id="catalog-section">
        
        {/* Active Filters Summary or Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-black dark:text-white flex items-center gap-2">
              <span>{selectedCategory ? `${selectedCategory}` : "Produtos Recomendados"}</span>
              {originFilter !== "all" && (
                <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">
                  {originFilter}
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500">
              Mostrando {sortedProducts.length} produtos disponíveis para envio internacional.
            </p>
          </div>

          {/* Filter Trigger Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border transition-all ${
                showFilters || originFilter !== "all" || minPrice || maxPrice
                  ? "bg-red-50 dark:bg-zinc-900 border-red-300 text-red-600"
                  : "bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filtros {showFilters ? "Fechar" : "Abrir"}</span>
            </button>

            {/* Quick Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
            >
              <option value="popular">Mais Vendidos 🔥</option>
              <option value="price_asc">Menor Preço ⬆️</option>
              <option value="price_desc">Maior Preço ⬇️</option>
              <option value="rating">Melhor Classificados ⭐</option>
              <option value="recent">Envio Rápido ⚡</option>
            </select>

            {(selectedCategory || originFilter !== "all" || minPrice || maxPrice || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors py-1 px-2"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel Expanded */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 p-4 sm:p-6 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-down">
            
            {/* Origin Platform Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Plataforma Fornecedora</label>
              <div className="flex gap-2">
                {(["all", "Shein", "AliExpress"] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setOriginFilter(plat)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      originFilter === plat
                        ? "bg-red-600 border-red-600 text-white shadow-sm"
                        : "bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {plat === "all" ? "Todas" : plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter (Kz) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Faixa de Preço (Kz)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Kz"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-black dark:text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                />
                <span className="text-gray-400 text-xs">até</span>
                <input
                  type="number"
                  placeholder="Max Kz"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-black dark:text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Free Shipping Badge Info */}
            <div className="space-y-2 flex flex-col justify-between">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Condições de Entrega</div>
              <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-2.5 rounded-lg text-[11px] text-gray-500 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span>Apenas produtos com Frete Grátis e Envio Internacional estão elegíveis na AngoExpress.</span>
              </div>
            </div>

          </div>
        )}

        {/* AI Intelligent Search Box Trigger for Custom Queries */}
        {searchQuery && (
          <div className="bg-gradient-to-r from-red-900/10 via-zinc-900/50 to-red-900/10 border border-red-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm" id="ai-search-helper">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-red-600 dark:text-red-500 font-bold text-sm">
                <Sparkles className="h-4 w-4 animate-bounce" />
                <span>Ponte de Pesquisa Inteligente Shein & AliExpress</span>
              </div>
              <h4 className="text-base font-display font-bold text-black dark:text-white">
                Procura algo específico do AliExpress ou da Shein?
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                A nossa inteligência artificial baseada no <strong>Gemini 3.5</strong> pode contactar os catálogos internacionais para simular e gerar em tempo real os produtos elegíveis de <span className="text-red-600 font-semibold">"{searchQuery}"</span> com preços já convertidos!
              </p>
            </div>
            
            <button
              onClick={() => onTriggerAISearch(searchQuery)}
              disabled={aiSearching}
              className="bg-black text-white hover:bg-zinc-900 dark:bg-red-600 dark:hover:bg-red-700 px-6 py-3 rounded-full text-xs font-semibold flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shrink-0"
            >
              {aiSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>A contactar AliExpress/Shein...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  <span>Pesquisar com Inteligência Artificial</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Dynamic Loader for AI Search */}
        {aiSearching && (
          <div className="w-full py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 border-4 border-red-200 dark:border-zinc-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-red-600 rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-red-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h5 className="font-display font-bold text-sm text-black dark:text-white">Gerando Produtos em Kwanzas</h5>
              <p className="text-xs text-gray-500 max-w-md">O Gemini está a mapear avaliações de compradores africanos, fotos de alta qualidade e variações ideais...</p>
            </div>
          </div>
        )}

        {/* PRODUCT GRID */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl space-y-3" id="no-products-found">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto" />
            <h4 className="font-display font-bold text-base text-gray-800 dark:text-gray-200">Nenhum produto correspondente</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">Tente limpar os filtros, usar outros termos ou clique no botão de <strong>Pesquisa Inteligente IA</strong> acima.</p>
            <button 
              onClick={clearFilters}
              className="text-xs text-red-600 font-semibold hover:underline bg-red-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full"
            >
              Mostrar Todos os Produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" id="products-grid">
            {sortedProducts.map((product) => {
              const isFavorite = favorites.includes(product.id);
              const prices = convertUSDToKz(product.priceUSD);
              
              return (
                <div 
                  key={product.id}
                  className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
                  id={`product-card-${product.id}`}
                >
                  
                  {/* Origin Tag Overlay */}
                  <span className={`absolute top-3 left-3 z-10 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase ${
                    product.origin === "Shein" 
                      ? "bg-black text-white" 
                      : "bg-red-600 text-white"
                  }`}>
                    {product.origin}
                  </span>

                  {/* Add to Favorite overlay button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-gray-500 hover:text-red-600 hover:scale-110 active:scale-95 shadow transition-all"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-600 text-red-600" : ""}`} />
                  </button>

                  {/* Product Image and hover Zoom */}
                  <div 
                    onClick={() => onSelectProduct(product)}
                    className="w-full aspect-[4/5] bg-gray-50 dark:bg-zinc-900 relative overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Free shipping banner */}
                    {product.freeShipping && (
                      <span className="absolute bottom-2 left-2 bg-green-500/95 dark:bg-green-600/95 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm uppercase tracking-wide">
                        <Star className="h-2 w-2 fill-white text-white animate-pulse" />
                        <span>Frete Grátis</span>
                      </span>
                    )}
                  </div>

                  {/* Info Details */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                    
                    <div className="space-y-1">
                      {/* Category in small */}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-mono tracking-wider">
                        {product.category}
                      </span>
                      {/* Name */}
                      <h4 
                        onClick={() => onSelectProduct(product)}
                        className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-red-600 line-clamp-2 cursor-pointer leading-snug"
                        title={product.name}
                      >
                        {product.name}
                      </h4>
                    </div>

                    {/* Rating & Sales */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        <Star className="h-3 w-3 fill-yellow-500" />
                        <span className="font-semibold">{product.rating}</span>
                      </div>
                      <span>{product.salesCount}+ vendidos</span>
                    </div>

                    {/* Dual Prices (USD Markup vs Final Kz) */}
                    <div className="pt-2 border-t border-gray-50 dark:border-zinc-900 flex flex-col">
                      <span className="text-xs text-gray-400 font-mono">
                        Original: {formatUSD(product.priceUSD)} × 1.07
                      </span>
                      <div className="flex items-baseline justify-between gap-1 mt-0.5">
                        <span className="text-sm sm:text-base font-display font-bold text-red-600 dark:text-red-500 leading-none">
                          {formatKz(product.priceKz)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          ({formatUSD(prices.usdWithMarkup)})
                        </span>
                      </div>
                    </div>

                    {/* Quick view button */}
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="w-full py-1.5 bg-gray-100 hover:bg-red-600 dark:bg-zinc-900 dark:hover:bg-red-600 text-gray-700 hover:text-white dark:text-gray-300 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-98"
                    >
                      Ver Detalhes
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
