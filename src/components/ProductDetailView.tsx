/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Star, 
  Truck, 
  Globe, 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft,
  Check,
  Video,
  Play,
  Sparkles,
  Award,
  AlertCircle
} from "lucide-react";
import { Product, ProductReview } from "../types";
import { formatKz, formatUSD, convertUSDToKz } from "../data";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onBack: () => void;
  onAddToCart: (p: Product, qty: number, variant: { color?: string; size?: string; model?: string }) => void;
  onBuyNow: (p: Product, qty: number, variant: { color?: string; size?: string; model?: string }) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetailView({
  product,
  relatedProducts,
  favorites,
  toggleFavorite,
  onBack,
  onAddToCart,
  onBuyNow,
  onSelectProduct
}: ProductDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.variations.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.variations.sizes?.[0] || "");
  const [selectedModel, setSelectedModel] = useState(product.variations.models?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Zoom Ref and State
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${product.images[selectedImageIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "200%"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  const prices = convertUSDToKz(product.priceUSD);
  const isFavorite = favorites.includes(product.id);

  const handleAdd = () => {
    onAddToCart(product, quantity, {
      color: selectedColor,
      size: selectedSize,
      model: selectedModel
    });
  };

  const handleBuy = () => {
    onBuyNow(product, quantity, {
      color: selectedColor,
      size: selectedSize,
      model: selectedModel
    });
  };

  return (
    <div className="space-y-10 py-4 animate-fade-in" id="product-detail-container">
      
      {/* Back button breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400" id="breadcrumbs">
        <button 
          onClick={onBack}
          className="hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar ao Catálogo</span>
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate max-w-[150px]">{product.category}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12" id="detail-columns">
        
        {/* LEFT COLUMN: Image Gallery & Video Announcement */}
        <div className="lg:col-span-7 space-y-4 flex flex-col sm:flex-row gap-4" id="gallery-side">
          
          {/* Thumbnails list */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[420px] order-2 sm:order-1 scrollbar-none shrink-0">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => { setSelectedImageIndex(i); setIsVideoPlaying(false); }}
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  selectedImageIndex === i && !isVideoPlaying ? "border-red-600 scale-95" : "border-gray-200 dark:border-zinc-800 hover:border-gray-400"
                }`}
              >
                <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
            ))}

            {/* Video Thumbnail Button if available */}
            {product.videoUrl && (
              <button
                onClick={() => setIsVideoPlaying(true)}
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 bg-black text-white shrink-0 flex flex-col items-center justify-center gap-1 transition-all relative ${
                  isVideoPlaying ? "border-red-600 scale-95" : "border-gray-200 dark:border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <Video className="h-5 w-5 text-red-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold tracking-tighter uppercase">Vídeo</span>
              </button>
            )}
          </div>

          {/* Main Display Frame */}
          <div className="flex-1 order-1 sm:order-2 aspect-[4/5] bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-900 rounded-2xl overflow-hidden relative group">
            
            {!isVideoPlaying ? (
              /* Image display with simulated hover zoom */
              <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full relative cursor-crosshair overflow-hidden"
              >
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />

                {/* Simulated Zoom Magnifier Overlay */}
                <div 
                  className="absolute border border-gray-300 dark:border-zinc-700 pointer-events-none rounded-xl shadow-2xl bg-no-repeat"
                  style={{
                    ...zoomStyle,
                    width: "250px",
                    height: "250px",
                    left: "20px",
                    top: "20px"
                  }}
                />
                
                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-full font-medium">
                  Passe o rato para fazer zoom 🔍
                </span>
              </div>
            ) : (
              /* Inline Video Player playing Shein / AliExpress promo ad */
              <div className="w-full h-full bg-black relative flex items-center justify-center">
                <video
                  src={product.videoUrl || ""}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  Anúncio Original
                </span>
              </div>
            )}

            {/* Platform stamp */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
              <span className={`h-2.5 w-2.5 rounded-full ${product.origin === "Shein" ? "bg-white" : "bg-red-500 animate-pulse"}`} />
              <span className="text-white text-xs font-bold font-mono tracking-wider">{product.origin}</span>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Product Information & Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6" id="product-actions-side">
          
          <div className="space-y-4">
            {/* Rating / Sales count / Origin info */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-500 py-1 px-2.5 rounded-full font-semibold">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span>{product.rating}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 dark:text-gray-400 font-medium">{product.salesCount}+ Vendas Internacionais</span>
              <span className="text-gray-400">|</span>
              <span className="text-green-600 dark:text-green-400 font-bold uppercase flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Em Stock ({product.stock})</span>
              </span>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <span className="text-xs text-red-600 dark:text-red-400 font-mono tracking-widest uppercase font-bold">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Dynamic Price Calculation Board */}
            <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Preço Original de Venda (USD):</span>
                <span className="text-sm text-gray-800 dark:text-gray-200 font-mono font-medium">{formatUSD(product.priceUSD)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 border-b border-dashed border-gray-200 dark:border-zinc-800 pb-2">
                <span>Taxa de Intermediação Ango Express (+7%):</span>
                <span className="text-red-600 font-mono font-medium">+{formatUSD(product.priceUSD * 0.07)}</span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">Preço Final em Kwanzas</span>
                  <span className="text-lg sm:text-2xl font-display font-bold text-red-600 dark:text-red-500">
                    {formatKz(product.priceKz)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-mono block">Câmbio: 1 USD = 1.170 Kz</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-mono font-semibold">
                    ({formatUSD(prices.usdWithMarkup)} USD)
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Timeline info */}
            <div className="flex items-center gap-3 bg-red-500/10 dark:bg-red-500/5 border border-red-500/10 p-3 rounded-xl text-xs text-gray-700 dark:text-gray-300">
              <Truck className="h-5 w-5 text-red-600 shrink-0" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-red-600 dark:text-red-400">Tempo Estimado de Entrega em Luanda:</span>
                <span><strong>{product.deliveryDays} a {product.deliveryDays + 7} dias</strong> (Frete Internacional Gratuito)</span>
              </div>
            </div>

            {/* VARIATIONS SELECTORS */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-900">
              
              {/* Colors */}
              {product.variations.colors && product.variations.colors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Cor Selecionada: {selectedColor}</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variations.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selectedColor === color
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md"
                            : "bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.variations.sizes && product.variations.sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tamanho: {selectedSize}</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variations.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-9 min-w-9 px-2 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${
                          selectedSize === size
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow"
                            : "bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Models */}
              {product.variations.models && product.variations.models.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Modelo: {selectedModel}</span>
                  <div className="flex flex-col gap-1.5">
                    {product.variations.models.map((model) => (
                      <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
                          selectedModel === model
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow"
                            : "bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span>{model}</span>
                        {selectedModel === model && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Quantidade</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-600 dark:text-gray-400 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs text-black dark:text-white font-mono font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-600 dark:text-gray-400 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-400">Entrega rápida para Luanda, Lubango, Benguela e mais.</span>
                </div>
              </div>

            </div>

          </div>

          {/* DUAL ACTION BUTTONS (Buy Now vs Add to Cart) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-gray-100 dark:border-zinc-900" id="detail-actions">
            <button
              onClick={handleAdd}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Adicionar ao Carrinho</span>
            </button>

            <button
              onClick={handleBuy}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-red-500/10 transition-all active:scale-98"
            >
              <Check className="h-4 w-4" />
              <span>Comprar Já em Kwanzas</span>
            </button>

            {/* Toggle Favorite block */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="sm:col-span-2 w-full py-2 bg-transparent text-gray-500 hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-600 text-red-600" : ""}`} />
              <span>{isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}</span>
            </button>
          </div>

        </div>

      </div>

      {/* TABS COMPONENT: Description, Specifications, African reviews */}
      <div className="border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden" id="tabs-section">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
          <button
            onClick={() => setActiveTab("desc")}
            className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 text-center transition-all ${
              activeTab === "desc"
                ? "border-red-600 text-red-600 bg-white dark:bg-zinc-900"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Descrição do Produto
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 text-center transition-all ${
              activeTab === "specs"
                ? "border-red-600 text-red-600 bg-white dark:bg-zinc-900"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Ficha Técnica
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 text-center transition-all ${
              activeTab === "reviews"
                ? "border-red-600 text-red-600 bg-white dark:bg-zinc-900"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Comentários de Africanos ({product.reviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {activeTab === "desc" && (
            <div className="space-y-4 animate-fade-in">
              <p>{product.description}</p>
              <div className="bg-red-50 dark:bg-zinc-900 p-4 rounded-xl border border-red-500/10 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-red-600 dark:text-red-400">Nota de Intermediação AngoExpress:</h4>
                  <p className="text-xs text-gray-500">Ao clicar em comprar, o nosso administrador recebe a sua encomenda em Angola, trata de realizar o checkout original no fornecedor (<strong>{product.origin}</strong>), e faz a gestão do despacho alfandegário e frete até Luanda de forma totalmente transparente.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="animate-fade-in">
              <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-zinc-800">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 p-3 sm:p-4 text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{key}</span>
                    <span className="col-span-2 text-gray-600 dark:text-gray-400">{val}</span>
                  </div>
                ))}
                <div className="grid grid-cols-3 p-3 sm:p-4 text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Origem</span>
                  <span className="col-span-2 text-red-600 dark:text-red-400 font-bold uppercase">{product.origin} Marketplace</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-yellow-500/10 dark:bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-600 shrink-0" />
                <span className="text-xs text-yellow-800 dark:text-yellow-400 font-semibold">Mostrando comentários reais traduzidos e feedbacks de compradores africanos (Angola, Moçambique, Cabo Verde) na plataforma {product.origin}.</span>
              </div>

              <div className="space-y-4 divide-y divide-gray-100 dark:divide-zinc-900">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800">
                          <img src={rev.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block leading-none">{rev.authorName}</span>
                          <span className="text-[10px] text-red-600 font-medium">{rev.country}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-0.5 text-yellow-500 justify-end">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic pl-10">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="space-y-4" id="related-products">
        <h3 className="font-display font-bold text-lg sm:text-xl text-black dark:text-white">
          Produtos Relacionados
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {relatedProducts.slice(0, 4).map((rel) => (
            <div 
              key={rel.id}
              onClick={() => { onSelectProduct(rel); setSelectedImageIndex(0); setIsVideoPlaying(false); }}
              className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-xl overflow-hidden p-2.5 cursor-pointer shadow-sm hover:shadow-md transition-all space-y-2 group"
            >
              <div className="w-full aspect-square bg-gray-50 dark:bg-zinc-900 rounded-lg overflow-hidden">
                <img src={rel.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-102 transition-transform" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-red-600">{rel.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600">{formatKz(rel.priceKz)}</span>
                  <span className="text-[9px] bg-gray-100 dark:bg-zinc-800 text-gray-500 px-1 rounded uppercase font-bold font-mono">{rel.origin}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
