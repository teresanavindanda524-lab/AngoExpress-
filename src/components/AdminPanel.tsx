/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  ShoppingBag, 
  Tag, 
  Image, 
  Truck, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  Award,
  PlusCircle,
  Clock,
  Eye,
  CheckCircle,
  FileText,
  Mail,
  Bell
} from "lucide-react";
import { Product, Order, Banner, Coupon, OrderStatus, TrackingEvent } from "../types";
import { formatKz, formatUSD, SEED_COUPONS } from "../data";

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  banners: Banner[];
  coupons: Coupon[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingCode?: string, notes?: string, trackingHistory?: TrackingEvent[]) => void;
  onAddProduct: (product: Omit<Product, "id" | "priceKz">) => void;
  onDeleteProduct: (id: string) => void;
  onAddBanner: (banner: Omit<Banner, "id">) => void;
  onDeleteBanner: (id: string) => void;
  onAddCoupon: (coupon: Omit<Coupon, "isActive">) => void;
  onDeleteCoupon: (code: string) => void;
  onShowToast?: (msg: string, type?: "success" | "error" | "info") => void;
}

const ALL_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pagamento Pendente", color: "bg-amber-500" },
  { value: "confirmed", label: "Pagamento Confirmado", color: "bg-blue-500" },
  { value: "purchased", label: "Compra Realizada", color: "bg-purple-500" },
  { value: "preparing", label: "Em Preparação", color: "bg-indigo-500" },
  { value: "shipped", label: "Enviado pelo Fornecedor", color: "bg-cyan-500" },
  { value: "transit", label: "Em Trânsito", color: "bg-yellow-600" },
  { value: "arrived_angola", label: "Chegou em Angola", color: "bg-orange-500" },
  { value: "distribution", label: "Em Distribuição", color: "bg-pink-500" },
  { value: "delivered", label: "Entregue", color: "bg-green-600" }
];

export default function AdminPanel({
  orders,
  products,
  banners,
  coupons,
  onUpdateOrderStatus,
  onAddProduct,
  onDeleteProduct,
  onAddBanner,
  onDeleteBanner,
  onAddCoupon,
  onDeleteCoupon,
  onShowToast
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "orders" | "products" | "banners" | "coupons" | "notifications" | "guide">("stats");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleClearNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications/clear", { method: "POST" });
      if (res.ok) {
        setNotifications([]);
        if (onShowToast) onShowToast("E-mails limpos com sucesso!", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status updating form state
  const [editingStatus, setEditingStatus] = useState<OrderStatus>("pending");
  const [editTrackingCode, setEditTrackingCode] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [editTrackingHistory, setEditTrackingHistory] = useState<TrackingEvent[]>([]);

  // States for adding a new tracking event
  const [newEventStatus, setNewEventStatus] = useState("Em Armazém");
  const [newEventLocation, setNewEventLocation] = useState("Armazém de Guangzhou, China");
  const [newEventDesc, setNewEventDesc] = useState("A encomenda foi recebida no nosso armazém de consolidação e está em processamento para envio.");

  // Product Creator Form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPriceUSD, setNewProdPriceUSD] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Vestuário");
  const [newProdOrigin, setNewProdOrigin] = useState<"Shein" | "AliExpress">("Shein");
  const [newProdImages, setNewProdImages] = useState("");
  const [newProdStock, setNewProdStock] = useState("20");
  const [newProdVideoUrl, setNewProdVideoUrl] = useState("");
  const [newProdColors, setNewProdColors] = useState("Preto, Branco, Vermelho");
  const [newProdSizes, setNewProdSizes] = useState("S, M, L, XL");
  const [newProdSpecs, setNewProdSpecs] = useState("Material: Algodão Premium\nEstilo: Casual");

  // Banner Form State
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSub, setBannerSub] = useState("");
  const [bannerImg, setBannerImg] = useState("");
  const [bannerLink, setBannerLink] = useState("");

  // Coupon Form State
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percentage" | "fixed">("percentage");
  const [couponVal, setCouponVal] = useState("");
  const [couponMinVal, setCouponMinVal] = useState("");

  // Calculations for Stats Card
  const totalSalesKz = orders.reduce((acc, ord) => acc + (ord.orderStatus !== "pending" ? ord.totalKz : 0), 0);
  const pendingSalesKz = orders.reduce((acc, ord) => acc + (ord.orderStatus === "pending" ? ord.totalKz : 0), 0);
  const conversionRatePercent = orders.length > 0 ? Math.round((orders.filter(o => o.orderStatus !== "pending").length / orders.length) * 100) : 0;
  
  // Filtered Orders
  const filteredOrders = orders.filter((ord) => {
    if (orderSearch && !ord.id.toLowerCase().includes(orderSearch.toLowerCase()) && !ord.customer.phone.includes(orderSearch)) {
      return false;
    }
    if (orderStatusFilter !== "all" && ord.orderStatus !== orderStatusFilter) {
      return false;
    }
    return true;
  });

  const selectOrderToEdit = (ord: Order) => {
    setSelectedOrder(ord);
    setEditingStatus(ord.orderStatus);
    setEditTrackingCode(ord.trackingCode || "");
    setEditAdminNotes(ord.notes || "");
    setEditTrackingHistory(ord.trackingHistory || []);
  };

  const handlePresetStatusChange = (status: string) => {
    setNewEventStatus(status);
    if (status === "Em Armazém") {
      setNewEventLocation("Armazém de Guangzhou, China");
      setNewEventDesc("A encomenda foi recebida no nosso armazém de consolidação e está em processamento para envio.");
    } else if (status === "Trânsito Internacional") {
      setNewEventLocation("Trânsito Internacional (China - Angola)");
      setNewEventDesc("O pacote foi despachado do aeroporto internacional e encontra-se em trânsito aéreo rumo a Luanda.");
    } else if (status === "Alfândega") {
      setNewEventLocation("Alfândega de Luanda, Angola");
      setNewEventDesc("A encomenda chegou ao aeroporto de Luanda e encontra-se no processo de desalfandegamento legal.");
    } else if (status === "Entrega Local") {
      setNewEventLocation("Centro de Distribuição de Luanda");
      setNewEventDesc("A encomenda foi desalfandegada com sucesso e está na rota de entrega final para a morada selecionada.");
    } else if (status === "Disponível para Levantamento") {
      setNewEventLocation("Escritório Central da AngoExpress, Luanda");
      setNewEventDesc("O seu produto internacional Shein/AliExpress já está disponível para levantamento presencial no nosso escritório.");
    }
  };

  const handleAddTrackingEvent = () => {
    if (!newEventStatus || !newEventLocation) return;
    const newEvent: TrackingEvent = {
      id: `track-${Date.now()}`,
      status: newEventStatus,
      location: newEventLocation,
      timestamp: new Date().toISOString(),
      description: newEventDesc
    };
    setEditTrackingHistory(prev => [newEvent, ...prev]);
    if (onShowToast) {
      onShowToast("Evento de seguimento adicionado à lista local! Grave para persistir.", "info");
    }
  };

  const handleRemoveTrackingEvent = (id: string) => {
    setEditTrackingHistory(prev => prev.filter(e => e.id !== id));
    if (onShowToast) {
      onShowToast("Evento removido da lista local! Grave para persistir.", "info");
    }
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    onUpdateOrderStatus(selectedOrder.id, editingStatus, editTrackingCode.trim(), editAdminNotes.trim(), editTrackingHistory);
    
    if (onShowToast) {
      onShowToast("Estado da encomenda atualizado com sucesso!", "success");
    } else {
      alert("Pedido atualizado com sucesso!");
    }

    // Update local selection references
    setSelectedOrder({
      ...selectedOrder,
      orderStatus: editingStatus,
      trackingCode: editTrackingCode.trim(),
      notes: editAdminNotes.trim(),
      trackingHistory: editTrackingHistory
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPriceUSD) {
      if (onShowToast) {
        onShowToast("Por favor preencha os dados obrigatórios do produto.", "error");
      } else {
        alert("Por favor preencha os dados obrigatórios do produto.");
      }
      return;
    }

    const imagesArray = newProdImages.split(",").map(i => i.trim()).filter(Boolean);
    const colorsArray = newProdColors.split(",").map(c => c.trim()).filter(Boolean);
    const sizesArray = newProdSizes.split(",").map(s => s.trim()).filter(Boolean);
    
    // Parse specs key value
    const specsMap: Record<string, string> = {};
    newProdSpecs.split("\n").forEach(line => {
      const [key, val] = line.split(":");
      if (key && val) {
        specsMap[key.trim()] = val.trim();
      }
    });

    onAddProduct({
      name: newProdName,
      description: newProdDesc,
      priceUSD: Number(newProdPriceUSD),
      category: newProdCategory,
      origin: newProdOrigin,
      images: imagesArray.length > 0 ? imagesArray : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"],
      stock: Number(newProdStock),
      rating: 4.8,
      salesCount: 0,
      deliveryDays: 14,
      freeShipping: true,
      videoUrl: newProdVideoUrl.trim() || undefined,
      variations: {
        colors: colorsArray,
        sizes: sizesArray,
        models: []
      },
      specifications: specsMap,
      reviews: []
    });

    // Reset Form
    setNewProdName("");
    setNewProdDesc("");
    setNewProdPriceUSD("");
    setNewProdVideoUrl("");
    setShowProductForm(false);
    
    if (onShowToast) {
      onShowToast("Produto adicionado ao catálogo AngoExpress!", "success");
    } else {
      alert("Produto adicionado ao catálogo AngoExpress!");
    }
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImg) return;
    onAddBanner({
      title: bannerTitle,
      subtitle: bannerSub,
      imageUrl: bannerImg,
      link: bannerLink,
      isActive: true
    });
    setBannerTitle("");
    setBannerSub("");
    setBannerImg("");
    setBannerLink("");
    setShowBannerForm(false);

    if (onShowToast) {
      onShowToast("Banner adicionado com sucesso!", "success");
    } else {
      alert("Banner adicionado com sucesso!");
    }
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponVal) return;
    onAddCoupon({
      code: couponCode.trim().toUpperCase(),
      discountType: couponType,
      value: Number(couponVal),
      minOrderValueKz: Number(couponMinVal) || 0
    });
    setCouponCode("");
    setCouponVal("");
    setCouponMinVal("");
    setShowCouponForm(false);

    if (onShowToast) {
      onShowToast("Cupão de desconto criado com sucesso!", "success");
    } else {
      alert("Cupão criado com sucesso!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 animate-fade-in" id="admin-panel-container">
      
      {/* LEFT NAVIGATION COLUMN */}
      <div className="lg:col-span-3 space-y-4" id="admin-sidebar">
        
        {/* Administrator profile banner */}
        <div className="bg-zinc-900 text-white rounded-2xl p-5 shadow text-center space-y-3 border border-red-500/20">
          <div className="h-14 w-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">Administrador Ango</h3>
            <span className="text-[10px] text-red-500 font-mono uppercase tracking-widest font-bold">Modo Supervisor</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl text-[10px] text-gray-400 font-mono">
            Ligado a: data/db.json
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-2 shadow-sm flex flex-row lg:flex-col gap-1 overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all shrink-0 ${
              activeTab === "stats"
                ? "bg-red-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard Estatísticas</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all relative shrink-0 ${
              activeTab === "orders"
                ? "bg-red-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Gerir Pedidos ({orders.length})</span>
            {orders.filter(o => o.orderStatus === "pending").length > 0 && (
              <span className="absolute top-3 right-4 h-2.5 w-2.5 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all shrink-0 ${
              activeTab === "products"
                ? "bg-red-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Catálogo Produtos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("banners")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all shrink-0 ${
              activeTab === "banners"
                ? "bg-red-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <Image className="h-4 w-4" />
            <span>Banners Homepage ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all shrink-0 ${
              activeTab === "coupons"
                ? "bg-red-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Cupões Desconto ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all relative shrink-0 ${
              activeTab === "notifications"
                ? "bg-red-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <Mail className="h-4 w-4 text-orange-500" />
            <span>Mensagens & E-mails</span>
            {notifications.length > 0 && (
              <span className="bg-orange-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full ml-auto">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all shrink-0 ${
              activeTab === "guide"
                ? "bg-red-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <FileText className="h-4 w-4 text-red-500" />
            <span>Guia e Manual ADM</span>
          </button>

        </div>

      </div>

      {/* RIGHT WORKPLACE COLUMN */}
      <div className="lg:col-span-9 space-y-6" id="admin-workplace">
        
        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === "stats" && (
          <div className="space-y-6 animate-fade-in" id="admin-stats-view">
            
            {/* Upper stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Confirmed Revenue (Kwanzas) */}
              <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 rounded-2xl shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Vendas Confirmadas</span>
                <div className="space-y-0.5">
                  <h4 className="text-base sm:text-lg font-display font-bold text-green-600 dark:text-green-400">{formatKz(totalSalesKz)}</h4>
                  <span className="text-[10px] text-gray-400 block font-mono">({formatUSD(totalSalesKz / 1170)})</span>
                </div>
              </div>

              {/* Pending orders revenue */}
              <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 rounded-2xl shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Aguardando Confirmação</span>
                <div className="space-y-0.5">
                  <h4 className="text-base sm:text-lg font-display font-bold text-amber-500">{formatKz(pendingSalesKz)}</h4>
                  <span className="text-[10px] text-gray-400 block font-mono">({formatUSD(pendingSalesKz / 1170)})</span>
                </div>
              </div>

              {/* Total orders counts */}
              <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 rounded-2xl shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Pedidos Totais</span>
                <div className="space-y-0.5">
                  <h4 className="text-base sm:text-lg font-display font-bold text-black dark:text-white">{orders.length} Encomendas</h4>
                  <span className="text-[10px] text-gray-400 block font-mono">({orders.filter(o => o.orderStatus === "pending").length} pendentes)</span>
                </div>
              </div>

              {/* Conversion factor */}
              <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 rounded-2xl shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Taxa de Conversão</span>
                <div className="space-y-0.5">
                  <h4 className="text-base sm:text-lg font-display font-bold text-red-600 dark:text-red-500">{conversionRatePercent}%</h4>
                  <span className="text-[10px] text-gray-400 block font-mono">Média global de talões validados</span>
                </div>
              </div>

            </div>

            {/* Custom Responsive SVG line chart representing trends */}
            <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-gray-900 dark:text-white">Curva de Receitas da AngoExpress</h3>
                  <p className="text-xs text-gray-400">Representação da evolução semanal de pedidos.</p>
                </div>
                <div className="flex items-center gap-1 bg-red-50 dark:bg-zinc-900 px-3 py-1 rounded-full text-xs font-bold text-red-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+12.4% margem</span>
                </div>
              </div>

              <div className="h-[200px] w-full flex items-end">
                <svg viewBox="0 0 500 200" className="w-full h-full text-red-600">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-900" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-900" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-900" />
                  
                  {/* Revenue Line */}
                  <path
                    d="M 20 180 Q 100 120, 180 150 T 340 70 T 480 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="text-red-600"
                  />
                  
                  {/* Glowing line points */}
                  <circle cx="20" cy="180" r="5" fill="#e11d48" />
                  <circle cx="180" cy="150" r="5" fill="#e11d48" />
                  <circle cx="340" cy="70" r="5" fill="#e11d48" />
                  <circle cx="480" cy="40" r="5" fill="#e11d48" />

                  {/* Under curve gradient area */}
                  <path
                    d="M 20 180 Q 100 120, 180 150 T 340 70 T 480 40 L 480 200 L 20 200 Z"
                    fill="currentColor"
                    className="text-red-500/5 dark:text-red-500/10"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Semana 1</span>
                <span>Semana 2</span>
                <span>Semana 3</span>
                <span>Semana atual</span>
              </div>
            </div>

            {/* Admin overview instructions */}
            <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-red-600 block">Dicas de Gestão de Intermediação</span>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Quando um cliente submete o comprovativo de pagamento bancário, verifique os seus dados na secção "Gerir Pedidos". Logo após confirmar a entrada do Kwanza no ATM ou no Banco, mude o estado para <strong>"Pagamento Confirmado"</strong>. Faça o login na AliExpress ou Shein com a nossa conta corporativa e faça a encomenda do produto fornecendo a morada do destinatário em Angola. Cole aqui o código de rastreio oficial (ex: CN03841920HK) para o cliente monitorizar!
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT LEDGER */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fade-in" id="admin-orders-ledger">
            
            {/* Filter ledger bar */}
            <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por Código de Pedido ou Telefone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs pl-10 pr-4 py-3 rounded-xl text-black dark:text-white focus:outline-none"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-4 py-3 rounded-xl text-black dark:text-white focus:outline-none shrink-0"
              >
                <option value="all">Todos os Estados 📍</option>
                {ALL_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>

            {/* Core split layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: orders matching query list */}
              <div className="md:col-span-5 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Resultados da Filtragem ({filteredOrders.length})</h4>
                
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 italic text-xs bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-xl">
                    Nenhum pedido encontrado.
                  </div>
                ) : (
                  filteredOrders.map((ord) => {
                    const activeSt = ALL_STATUSES.find(s => s.value === ord.orderStatus);
                    return (
                      <div
                        key={ord.id}
                        onClick={() => selectOrderToEdit(ord)}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                          selectedOrder?.id === ord.id
                            ? "border-red-600 bg-red-500/5 shadow-sm"
                            : "border-gray-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">{ord.id}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(ord.createdAt).toLocaleDateString("pt-AO")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-xs font-bold text-red-600 font-display">{formatKz(ord.totalKz)}</span>
                          <span className={`text-[9px] font-bold uppercase text-white px-2 py-0.5 rounded ${activeSt?.color}`}>
                            {activeSt?.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Active Order Editor form */}
              <div className="md:col-span-7">
                {selectedOrder ? (
                  <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
                    
                    {/* Header */}
                    <div className="border-b border-gray-100 dark:border-zinc-900 pb-3 flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-base text-black dark:text-white">{selectedOrder.id}</h4>
                        <span className="text-xs text-gray-400">Cliente: {selectedOrder.customer.fullName} ({selectedOrder.customer.phone})</span>
                      </div>
                      <span className="text-xs font-mono bg-red-50 dark:bg-zinc-900 text-red-600 font-bold px-2 py-1 rounded">
                        {selectedOrder.paymentMethod.replace("_", " ")}
                      </span>
                    </div>

                    {/* Customer Dossier Morada details */}
                    <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-xl text-xs space-y-2">
                      <h5 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span>Dossier de Envio</span>
                      </h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-sans text-gray-600 dark:text-gray-400">
                        <span><strong>Província:</strong> {selectedOrder.customer.province}</span>
                        <span><strong>Município:</strong> {selectedOrder.customer.municipality}</span>
                        <span><strong>Bairro:</strong> {selectedOrder.customer.bairro}</span>
                        <span className="col-span-2"><strong>Rua / Casa:</strong> {selectedOrder.customer.street}</span>
                      </div>
                    </div>

                    {/* Receipt Status and Talão info */}
                    <div className="border-t border-gray-100 dark:border-zinc-900 pt-4 space-y-2">
                      <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Comprovativo de Pagamento</h5>
                      
                      {selectedOrder.receiptReference ? (
                        <div className="p-3 bg-green-500/10 border border-green-500/10 rounded-xl text-xs text-green-700 dark:text-green-400 space-y-1">
                          <span className="font-bold">Comprovativo Anexado ou Referenciado! ✅</span>
                          <p className="font-mono"><strong>Referência:</strong> {selectedOrder.receiptReference}</p>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/10 rounded-xl text-xs text-amber-800 dark:text-amber-400">
                          Ainda não foi anexado talão ou número de referência para este pedido.
                        </div>
                      )}
                    </div>

                    {/* State workflow Updater form */}
                    <form onSubmit={handleSaveStatus} className="border-t border-gray-100 dark:border-zinc-900 pt-4 space-y-4">
                      
                      {/* State list select */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Alterar Estado da Rota</label>
                        <select
                          value={editingStatus}
                          onChange={(e) => setEditingStatus(e.target.value as OrderStatus)}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st.value} value={st.value}>{st.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tracking code input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Código Rastreio Original (AliExpress/Shein)</label>
                        <input
                          type="text"
                          placeholder="Ex: AE-CHN-003842183-AO"
                          value={editTrackingCode}
                          onChange={(e) => setEditTrackingCode(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                        />
                      </div>

                      {/* Admin notes */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Notas Administrativas (Fica visível para o cliente)</label>
                        <textarea
                          placeholder="Ex: O seu pagamento Unitel Money foi verificado. A encomenda já foi comprada na Shein, aguardando saída do armazém da China."
                          rows={2}
                          value={editAdminNotes}
                          onChange={(e) => setEditAdminNotes(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                        />
                      </div>

                      {/* Detailed Tracking Timeline Section */}
                      <div className="border-t border-gray-100 dark:border-zinc-900 pt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span>Linha Temporal de Rastreamento Real</span>
                          </h5>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {editTrackingHistory.length} checkpoints
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal">
                          Adicione marcos físicos (ex: Em Armazém, Trânsito Internacional, Alfândega, Entrega Local) para detalhar ao cliente a localização exata do pacote.
                        </p>

                        {/* Interactive Form to add checkpoint */}
                        <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-850 space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-gray-400 uppercase">Predefinição / Estado</label>
                              <select
                                value={newEventStatus}
                                onChange={(e) => handlePresetStatusChange(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-[11px] px-2 py-1.5 rounded-lg text-black dark:text-white"
                              >
                                <option value="Em Armazém">📦 Em Armazém</option>
                                <option value="Trânsito Internacional">✈️ Trânsito Internacional</option>
                                <option value="Alfândega">🛃 Alfândega</option>
                                <option value="Entrega Local">🛵 Entrega Local</option>
                                <option value="Disponível para Levantamento">🏢 Disponível para Levantamento</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-gray-400 uppercase">Localização Física</label>
                              <input
                                type="text"
                                placeholder="Ex: Guangdong, China"
                                value={newEventLocation}
                                onChange={(e) => setNewEventLocation(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-[11px] px-2 py-1.5 rounded-lg text-black dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase">Descrição Detalhada do Evento</label>
                            <textarea
                              placeholder="Ex: O pacote foi consolidado e seguiu para o aeroporto internacional."
                              rows={2}
                              value={newEventDesc}
                              onChange={(e) => setNewEventDesc(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-[11px] px-2 py-1.5 rounded-lg text-black dark:text-white"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleAddTrackingEvent}
                            className="w-full py-2 bg-black dark:bg-zinc-800 hover:bg-zinc-900 text-white text-[11px] font-bold rounded-lg transition-all"
                          >
                            + Adicionar Checkpoint à Lista
                          </button>
                        </div>

                        {/* List of current checkpoints */}
                        {editTrackingHistory.length > 0 ? (
                          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                            {editTrackingHistory.map((item) => (
                              <div key={item.id} className="p-2.5 bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-lg flex items-start justify-between gap-3 text-xs">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-red-600 font-sans text-[11px]">
                                      {item.status}
                                    </span>
                                    <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded font-mono">
                                      {item.location}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-500">{item.description}</p>
                                  <span className="text-[9px] text-gray-400 font-mono block">
                                    {new Date(item.timestamp).toLocaleString("pt-AO")}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTrackingEvent(item.id)}
                                  className="text-gray-400 hover:text-red-500 p-1"
                                  title="Remover este checkpoint"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-[11px] text-gray-400">
                            Sem checkpoints manuais definidos. O cliente verá os marcos automáticos baseados no estado do pedido.
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-98"
                      >
                        Gravar Alterações do Pedido
                      </button>

                    </form>

                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-12 text-center text-gray-400 space-y-2">
                    <Truck className="h-10 w-10 mx-auto text-gray-300" />
                    <p className="text-xs">Selecione uma encomenda à esquerda para ver os detalhes da morada, referências e atualizar o estado da timeline.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: PRODUCTS INVENTORY CATALOG */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fade-in" id="admin-inventory">
            
            {/* Catalog list header with Add button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-black dark:text-white">Gerir Catálogo de Produtos</h3>
                <p className="text-xs text-gray-500">Adicione novos produtos da Shein e AliExpress ou remova os existentes.</p>
              </div>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="bg-black dark:bg-red-600 text-white hover:bg-zinc-900 text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" />
                <span>{showProductForm ? "Fechar Formulário" : "Novo Produto"}</span>
              </button>
            </div>

            {/* Product Creator Form */}
            {showProductForm && (
              <form onSubmit={handleProductSubmit} className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <h4 className="font-display font-bold text-sm text-black dark:text-white sm:col-span-2 flex items-center gap-1 text-red-600">
                  <PlusCircle className="h-5 w-5" />
                  <span>Introduzir Novo Produto no Catálogo</span>
                </h4>

                {/* Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Nome Completo do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vestido de Noite Elegante Shein Floral"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                {/* Price original USD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Preço Original (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 19.99"
                    value={newProdPriceUSD}
                    onChange={(e) => setNewProdPriceUSD(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 font-mono block">O sistema converterá automaticamente com markup de 7% e taxa de 1.170 Kz.</span>
                </div>

                {/* Origin Marketplace */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Fornecedor / Origem</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewProdOrigin("Shein")}
                      className={`flex-1 py-2 px-3 text-xs font-bold border rounded-lg ${newProdOrigin === "Shein" ? "bg-black text-white" : "bg-white text-black border-gray-200"}`}
                    >
                      Shein
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProdOrigin("AliExpress")}
                      className={`flex-1 py-2 px-3 text-xs font-bold border rounded-lg ${newProdOrigin === "AliExpress" ? "bg-red-600 text-white border-red-600" : "bg-white text-black border-gray-200"}`}
                    >
                      AliExpress
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Vestuário, Gadgets, Eletrónicos"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                {/* Stock limit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Stock Inicial</label>
                  <input
                    type="number"
                    placeholder="Ex: 50"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                {/* Image urls */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">URLs das Imagens (Separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                    value={newProdImages}
                    onChange={(e) => setNewProdImages(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                {/* Video url */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">URL do Vídeo Promocional (Opcional - MP4)</label>
                  <input
                    type="text"
                    placeholder="Ex: https://assets.mixkit.co/videos/preview/mixkit-fashion-girl-in-casual-wear-40332-large.mp4"
                    value={newProdVideoUrl}
                    onChange={(e) => setNewProdVideoUrl(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                {/* Colors & Sizes variations */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Cores (Separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: Preto, Azul, Vermelho"
                    value={newProdColors}
                    onChange={(e) => setNewProdColors(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tamanhos (Separados por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: S, M, L, XL"
                    value={newProdSizes}
                    onChange={(e) => setNewProdSizes(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Descrição Completa</label>
                  <textarea
                    rows={2}
                    placeholder="Escreva detalhes sobre o caimento, funcionalidades..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none"
                  />
                </div>

                {/* Specifications */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Especificações Ficha Técnica (Linha a linha - Chave:Valor)</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Material: Poliéster&#10;Resistência: IP68 à prova d'água"
                    value={newProdSpecs}
                    onChange={(e) => setNewProdSpecs(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="sm:col-span-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-98"
                >
                  Gravar Produto no Catálogo Oficial
                </button>
              </form>
            )}

            {/* Catalog Grid list to inspect and delete products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="admin-inventory-list">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-3.5 rounded-xl flex gap-3 shadow-sm justify-between">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-900">
                      <img src={prod.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5 max-w-[150px] sm:max-w-none">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">{prod.origin} | {prod.category}</span>
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{prod.name}</h4>
                      <span className="text-xs font-bold text-red-600 block">{formatKz(prod.priceKz)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setProductToDelete(prod)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-900 rounded-lg transition-all shrink-0 self-start"
                    title="Remover Produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: HERO BANNERS */}
        {activeTab === "banners" && (
          <div className="space-y-6 animate-fade-in" id="admin-banners-view">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-black dark:text-white">Gerir Banners da Homepage</h3>
                <p className="text-xs text-gray-500">Configure as promoções rotativas que aparecem no topo do site.</p>
              </div>
              <button
                onClick={() => setShowBannerForm(!showBannerForm)}
                className="bg-black dark:bg-red-600 text-white hover:bg-zinc-900 text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1 shadow"
              >
                <Plus className="h-4 w-4" />
                <span>{showBannerForm ? "Fechar Formulário" : "Novo Slide"}</span>
              </button>
            </div>

            {showBannerForm && (
              <form onSubmit={handleBannerSubmit} className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-5 rounded-2xl shadow-sm space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 font-mono">Título Principal</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Campanha Especial Shein"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-mono">Subtítulo Descritivo</span>
                  <input
                    type="text"
                    placeholder="Ex: 10% de Desconto em toda a moda e calçado com frete grátis."
                    value={bannerSub}
                    onChange={(e) => setBannerSub(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-mono">URL da Imagem do Slide</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: https://images.unsplash.com/photo-..."
                    value={bannerImg}
                    onChange={(e) => setBannerImg(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-mono">Link de Categoria de Redirecionamento</span>
                  <input
                    type="text"
                    placeholder="Ex: Vestuário, Eletrónicos"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Criar e Ativar Slide Carousel
                </button>
              </form>
            )}

            {/* Active slides list */}
            <div className="space-y-3" id="admin-banners-list">
              {banners.map((ban) => (
                <div key={ban.id} className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 rounded-2xl flex gap-4 items-center justify-between shadow-sm">
                  <div className="flex gap-4 items-center flex-1">
                    <div className="h-16 w-28 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                      <img src={ban.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{ban.title}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{ban.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteBanner(ban.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-900 rounded-lg shrink-0"
                    title="Remover Slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 5: DISCOUNT COUPONS */}
        {activeTab === "coupons" && (
          <div className="space-y-6 animate-fade-in" id="admin-coupons-view">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-black dark:text-white">Gerir Cupões de Desconto</h3>
                <p className="text-xs text-gray-500">Crie códigos ativos de desconto fixo ou percentual para checkout.</p>
              </div>
              <button
                onClick={() => setShowCouponForm(!showCouponForm)}
                className="bg-black dark:bg-red-600 text-white hover:bg-zinc-900 text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1 shadow"
              >
                <Plus className="h-4 w-4" />
                <span>{showCouponForm ? "Fechar Formulário" : "Novo Cupão"}</span>
              </button>
            </div>

            {showCouponForm && (
              <form onSubmit={handleCouponSubmit} className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-5 rounded-2xl shadow-sm space-y-4 text-xs">
                
                <div className="space-y-1">
                  <span className="text-gray-400 font-mono">Código do Cupão</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SPECIAL5K"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 px-3.5 py-2.5 rounded-xl text-black dark:text-white uppercase font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-mono">Tipo de Desconto</span>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                  >
                    <option value="percentage">Percentagem (%)</option>
                    <option value="fixed">Fixo em Kwanzas (Kz)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-mono">Valor do Desconto</span>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 10 ou 5000"
                    value={couponVal}
                    onChange={(e) => setCouponVal(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-mono">Valor Mínimo da Compra (Kz)</span>
                  <input
                    type="number"
                    placeholder="Ex: 15000"
                    value={couponMinVal}
                    onChange={(e) => setCouponMinVal(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 px-3.5 py-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Gravar Cupão Promocional
                </button>
              </form>
            )}

            {/* Coupons list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="admin-coupons-list">
              {coupons.map((coup) => (
                <div key={coup.code} className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-black dark:text-white font-mono bg-gray-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-gray-200 dark:border-zinc-800">
                        {coup.code}
                      </span>
                      {coup.isActive && (
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 font-sans space-y-0.5">
                      <span className="block"><strong>Desconto:</strong> {coup.discountType === "percentage" ? `${coup.value}%` : formatKz(coup.value)}</span>
                      <span className="block"><strong>Compra Mínima:</strong> {formatKz(coup.minOrderValueKz)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteCoupon(coup.code)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-900 rounded-lg shrink-0"
                    title="Excluir Cupão"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 6: NOTIFICATIONS / MAILBOX */}
        {activeTab === "notifications" && (
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm space-y-6" id="admin-notifications-tab">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-900">
              <div className="space-y-1">
                <h2 className="font-display font-bold text-lg text-black dark:text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <span>Notificações por E-mail (Admin)</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Mensagens em tempo real enviadas para <strong className="text-gray-700 dark:text-gray-300 font-mono">promindset520@gmail.com</strong> ao adicionar produtos ao carrinho e efetuar compras.
                </p>
              </div>
              <button
                onClick={handleClearNotifications}
                disabled={notifications.length === 0}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Limpar Caixa de Entrada
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-400 flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6" />
                </div>
                <p className="text-xs text-gray-500">Nenhuma mensagem ou notificação recebida por e-mail até ao momento.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                      notif.type === "cart_addition"
                        ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/40"
                        : "bg-green-50/50 dark:bg-green-950/10 border-green-100 dark:border-green-950/40"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      notif.type === "cart_addition"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    }`}>
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900 dark:text-zinc-100">
                          {notif.type === "cart_addition" ? "🛒 Adição ao Carrinho" : "💰 Nova Compra"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-sans">{notif.message}</p>
                      <div className="pt-1 flex items-center gap-1.5 text-[9px] font-mono text-gray-400">
                        <span>Destinatário:</span>
                        <span className="bg-white dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-gray-100 dark:border-zinc-900 text-red-500 font-bold">
                          {notif.email}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: DETAILED ADMIN OPERATIONAL GUIDE */}
        {activeTab === "guide" && (
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-6 sm:p-8 rounded-2xl shadow-sm space-y-8 animate-fade-in text-xs leading-relaxed text-gray-700 dark:text-gray-300" id="admin-operational-guide-view">
            
            {/* Header section with brand accent */}
            <div className="border-b border-gray-100 dark:border-zinc-900 pb-5 space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                <Award className="h-3 w-3" />
                <span>Manual do Administrador Principal v2.0</span>
              </div>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-black dark:text-white">
                Guia de Operação e Logística — AngoExpress
              </h3>
              <p className="text-xs text-gray-500">
                Este manual contém instruções cruciais para a gerência de encomendas, controlo de pagamentos em Kwanzas (AOA) e atualização de rastreamento para o cliente final.
              </p>
            </div>

            {/* Quick overview metric blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 space-y-1">
                <span className="font-bold text-black dark:text-white text-xs block">1. Validar Pagamentos</span>
                <p className="text-[11px] text-gray-500">
                  Os clientes compram no site e anexam o comprovativo de transferência bancária para o seu IBAN angolano. O fluxo só avança após validação manual do ADM.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 space-y-1">
                <span className="font-bold text-black dark:text-white text-xs block">2. Comprar na China</span>
                <p className="text-[11px] text-gray-500">
                  Com os Kwanzas validados na sua conta, utilize o seu cartão internacional ou agente de câmbio para comprar as peças em USD/RMB na Shein ou AliExpress.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 space-y-1">
                <span className="font-bold text-black dark:text-white text-xs block">3. Atualizar o Rastreio</span>
                <p className="text-[11px] text-gray-500">
                  À medida que o lote viaja de Guangzhou para Luanda, alimente a linha temporal do cliente no painel para diminuir a ansiedade e dar segurança à compra.
                </p>
              </div>
            </div>

            {/* Complete workflow instructions accordion style */}
            <div className="space-y-6">
              
              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>O Modelo de Negócio da AngoExpress</span>
                </h4>
                <div className="pl-7 text-gray-600 dark:text-gray-400 space-y-2">
                  <p>
                    A AngoExpress atua como um facilitador de <strong>importação de retalho porta-a-porta</strong> focado em Angola. A maioria dos cidadãos angolanos não possui cartões Visa/Mastercard internacionais, nem moradas de consolidação de frete na Ásia.
                  </p>
                  <p>
                    <strong>Como faturamos?</strong> O preço dos produtos expostos no site já inclui uma margem embutida que cobre o serviço de facilitação cambial e a taxa de frete estimada base. Isto permite que o cliente pague confortavelmente em <strong>Kwanzas angolanos</strong> através de transferência ou depósito, sem se preocupar com taxas de câmbio ocultas ou burocracias de desalfandegamento.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Fluxo Completo dos Estados de um Pedido</span>
                </h4>
                <div className="pl-7 space-y-3">
                  <p className="text-gray-600 dark:text-gray-400">
                    Ao gerir uma encomenda no painel, pode mudar o estado para as seguintes fases de forma sequencial:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <strong className="text-amber-700 dark:text-amber-400">1. Pagamento Pendente:</strong> O cliente submeteu o pedido mas ainda não anexou ou você ainda não confirmou o comprovativo bancário na sua conta Multicaixa/IBAN.
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <strong className="text-blue-700 dark:text-blue-400">2. Pagamento Confirmado:</strong> O dinheiro entrou na sua conta de banco em Angola. Está autorizado a iniciar a compra dos produtos no exterior.
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <strong className="text-purple-700 dark:text-purple-400">3. Compra Realizada:</strong> O seu agente na China comprou os produtos e obteve o código de tracking do fornecedor internacional.
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <strong className="text-indigo-700 dark:text-indigo-400">4. Em Preparação:</strong> Os produtos chegaram ao seu armazém de consolidação em Guangzhou e estão prontos para embalagem.
                    </div>
                    <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                      <strong className="text-cyan-700 dark:text-cyan-400">5. Enviado pelo Fornecedor:</strong> Despachado do armazém asiático oficial a caminho do aeroporto de carga internacional.
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                      <strong className="text-yellow-700 dark:text-yellow-400">6. Em Trânsito:</strong> O voo internacional está ativo a carregar a mercadoria com destino a Luanda (LAD).
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                      <strong className="text-orange-700 dark:text-orange-400">7. Chegou em Angola:</strong> O pacote deu entrada no terminal de carga em Luanda e está a aguardar o processo legal aduaneiro.
                    </div>
                    <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-xl border border-pink-100 dark:border-pink-900/30">
                      <strong className="text-pink-700 dark:text-pink-400">8. Em Distribuição:</strong> Mercadoria desalfandegada com sucesso! Está na carrinha de entrega ao domicílio ou aguarda recolha no escritório central em Luanda.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Como Gerir o Histórico de Rastreamento (Tracking)</span>
                </h4>
                <div className="pl-7 text-gray-600 dark:text-gray-400 space-y-3">
                  <p>
                    Acabámos de implementar um <strong>sistema de histórico real de tracking em linha temporal visual</strong>. Para alimentar esta linha do tempo, siga os passos abaixo:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-[11px] bg-gray-50 dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-850">
                    <li>Abra o separador <strong className="text-black dark:text-white">Gerir Pedidos</strong> no menu esquerdo.</li>
                    <li>Clique no botão <strong>Editar Estado / Tracking</strong> na linha do pedido correspondente.</li>
                    <li>No formulário lateral que se abrirá, desça até à secção <strong>Linha Temporal de Rastreamento Real</strong>.</li>
                    <li>Selecione o estado predefinido (ex: <i>Em Armazém</i>, <i>Trânsito Internacional</i>, <i>Alfândega</i>) ou escreva uma localização física personalizada.</li>
                    <li>Introduza uma descrição detalhada em português de fácil compreensão para o cliente (ex: <i>"O contentor da AngoExpress chegou ao Aeroporto de Luanda e foi entregue à delegação aduaneira para vistoria."</i>).</li>
                    <li>Clique no botão <strong className="text-red-600">+ Adicionar Checkpoint à Lista</strong>.</li>
                    <li><strong>MUITO IMPORTANTE:</strong> Os checkpoints criados são acumulados temporariamente. Tem de clicar no botão vermelho de submissão do formulário (<strong className="text-red-600">Atualizar Estado e Tracking</strong>) no fundo da barra para gravar definitivamente as alterações na base de dados (ficheiro <code>db.json</code>).</li>
                  </ol>
                  <div className="bg-amber-50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl text-[11px] text-amber-700 dark:text-amber-400">
                    <strong>Nota Automática:</strong> Se o administrador ainda não tiver definido nenhum checkpoint real manual para uma encomenda recém-criada, o site gerará automaticamente um histórico estimado inteligente com base no estado atual do pedido para que a página do cliente nunca pareça vazia. Assim que adicionar o primeiro checkpoint real, a simulação automática desativa-se e passa a exibir apenas os seus registos oficiais.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>Estatísticas de Receita e Conversão</span>
                </h4>
                <div className="pl-7 text-gray-600 dark:text-gray-400 space-y-2">
                  <p>
                    O painel inicial de estatísticas calcula as métricas com base no seguinte critério:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li><strong>Vendas Confirmadas:</strong> Soma total apenas de pedidos que não estejam no estado <code>pending</code>. Representa a receita líquida que já deu entrada no seu banco de dados oficial.</li>
                    <li><strong>Aguardando Confirmação:</strong> Soma dos valores totais dos pedidos que estão no estado <code>pending</code>.</li>
                    <li><strong>Taxa de Conversão:</strong> Percentagem de pedidos finalizados e confirmados sobre o total acumulado.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-black dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
                  <span>Guia de Publicação e Deploy do Site (Produção)</span>
                </h4>
                <div className="pl-7 text-gray-600 dark:text-gray-400 space-y-3">
                  <p>
                    Para colocar este site/aplicativo oficial da AngoExpress no ar e acessível por qualquer pessoa na internet, tem à disposição as seguintes alternativas de publicação:
                  </p>
                  
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-black dark:text-white">Opção A: Exportar Código Fonte (Fácil e Rápido)</h5>
                    <p className="text-[11px]">
                      Pode descarregar o código completo deste projeto num ficheiro <strong>ZIP</strong> ou exportá-lo diretamente para uma conta <strong>GitHub</strong> através do menu <strong>Definições / Configurações</strong> no canto superior da sua consola de desenvolvimento AI Studio.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-black dark:text-white">Opção B: Hospedar de Graça na Vercel ou Netlify (Apenas Front-end)</h5>
                    <p className="text-[11px]">
                      Se quiser hospedar apenas o design estático interativo do site, pode ligar o seu repositório exportado do GitHub à <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-red-500 font-bold hover:underline">Vercel</a> ou <a href="https://netlify.com" target="_blank" rel="noreferrer" className="text-red-500 font-bold hover:underline">Netlify</a>. O processo de build detetará o Vite e criará o site estático instantaneamente de forma gratuita. No entanto, para o banco de dados funcionar, necessita de hospedar a API express do servidor Node.js.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-black dark:text-white">Opção C: Deploy Completo Full-Stack no Render.com, Railway ou Fly.io</h5>
                    <p className="text-[11px]">
                      Como a AngoExpress utiliza uma arquitetura full-stack (Servidor Express em <code>server.ts</code> que lê e escreve no ficheiro <code>db.json</code> local), para manter o banco de dados ativo de forma simples:
                    </p>
                    <ul className="list-disc list-inside text-[11px] space-y-1.5 pl-2">
                      <li>Crie uma conta gratuita em <a href="https://render.com" target="_blank" rel="noreferrer" className="text-red-500 font-bold hover:underline">Render.com</a> ou <a href="https://railway.app" target="_blank" rel="noreferrer" className="text-red-500 font-bold hover:underline">Railway.app</a>.</li>
                      <li>Ligue o seu repositório exportado do GitHub.</li>
                      <li>Configure o comando de Build como: <code>npm run build</code></li>
                      <li>Configure o comando de Inicialização (Start Command) como: <code>npm run start</code></li>
                      <li>No Render, crie um <strong>Persistent Disk (Disco Persistente)</strong> montado na pasta onde guarda o <code>db.json</code>, garantindo assim que os seus pedidos de clientes e catálogo de produtos nunca sejam apagados quando o servidor reiniciar!</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-black dark:text-white">Opção D: Deploy Profissional em VPS com Docker (Ideal para Angola)</h5>
                    <p className="text-[11px]">
                      Para máxima performance e soberania de dados, pode contratar uma VPS económica na Contabo ou DigitalOcean, instalar o Docker e executar a aplicação em contentores independentes.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Support Callout */}
            <div className="bg-zinc-900 text-white rounded-2xl p-5 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h5 className="font-display font-bold text-xs text-white">Precisa de suporte com o painel AngoExpress?</h5>
                <p className="text-[10px] text-gray-400">
                  Os dados estão guardados em segurança na raiz do servidor. Pode editar o ficheiro JSON diretamente a qualquer momento.
                </p>
              </div>
              <span className="text-[10px] bg-red-600 text-white font-mono font-bold px-3 py-1.5 rounded-xl uppercase shrink-0">
                Supervisor: Ativo
              </span>
            </div>

          </div>
        )}

      </div>

      {/* CUSTOM BEAUTIFUL REMOVAL MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold text-sm text-black dark:text-white">Remover Produto</h4>
              <p className="text-xs text-gray-500">Tem a certeza que quer remover <strong className="text-gray-800 dark:text-gray-200">"{productToDelete.name}"</strong> do catálogo oficial?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 px-3 text-xs font-bold border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  if (onShowToast) {
                    onShowToast(`Produto "${productToDelete.name}" removido do catálogo!`, "info");
                  }
                  setProductToDelete(null);
                }}
                className="flex-1 py-2 px-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
