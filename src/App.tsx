/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  ArrowLeft, 
  HelpCircle,
  TrendingUp,
  Award,
  Lock,
  X,
  Eye,
  EyeOff,
  Mail,
  User,
  Phone
} from "lucide-react";
import Navbar from "./components/Navbar";
import HomeView from "./components/HomeView";
import ProductDetailView from "./components/ProductDetailView";
import CartView from "./components/CartView";
import CheckoutView from "./components/CheckoutView";
import ClientAreaView from "./components/ClientAreaView";
import AdminPanel from "./components/AdminPanel";

import { Product, CartItem, Order, Banner, Coupon, OrderStatus, PaymentMethod } from "./types";
import { formatKz, formatUSD, SEED_COUPONS } from "./data";

const BANK_DETAILS = {
  iban: "AO06.0040.0000.9917.0890.1013.7",
  accountNumber: "3011252481890",
  beneficiary: "ANGO EXPRESS LIMITADA (Agente BAI)",
  phone: "+244 923 884 102",
  email: "suporte@angoexpress.com"
};

export default function App() {
  // Navigation & Views
  const [view, setView] = useState<"home" | "detail" | "cart" | "checkout" | "client" | "admin">("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Core Store States
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // Local Storage states
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("ango_cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("ango_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Global UI status
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("ango_theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [clientSearchPhone, setClientSearchPhone] = useState("");

  // User Authentication Identity (promindset520@gmail.com restriction)
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem("ango_user_email");
  });

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Toast banner helper
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = (email: string, fullName?: string, phone?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setUserEmail(cleanEmail);
    localStorage.setItem("ango_user_email", cleanEmail);
    if (fullName) localStorage.setItem("ango_user_fullname", fullName);
    if (phone) localStorage.setItem("ango_user_phone", phone);

    if (cleanEmail === "promindset520@gmail.com") {
      showToast("Sessão iniciada como Administrador Principal! Painel de Gestão desbloqueado. ⭐", "success");
    } else {
      showToast(`Sessão iniciada com sucesso. Bem-vindo de volta, ${fullName || cleanEmail.split("@")[0]}!`, "success");
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem("ango_user_email");
    localStorage.removeItem("ango_user_fullname");
    localStorage.removeItem("ango_user_phone");
    if (view === "admin") {
      setView("home");
    }
    showToast("Sessão terminada.", "info");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const endpoint = authModalTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authModalTab === "login" 
        ? { email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword, fullName: authFullName, phone: authPhone };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Ocorreu um erro ao processar a autenticação.");
        setLoading(false);
        return;
      }

      // Success
      handleLogin(data.email, data.fullName, data.phone);
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthFullName("");
      setAuthPhone("");
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg("Falha na ligação com o servidor do banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("ango_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ango_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("ango_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("ango_theme", "light");
    }
  }, [darkMode]);

  // Load Store Data from Backend Express APIs
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Erro a carregar produtos:", e);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (e) {
      console.error("Erro a carregar banners:", e);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error("Erro a carregar cupões:", e);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Erro a carregar pedidos:", e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchCoupons();
    fetchAllOrders();
  }, []);

  // Fetch client orders
  const handleFetchCustomerOrders = async (phone: string) => {
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data);
        setClientSearchPhone(phone);
        showToast(`Carregados ${data.length} pedidos encontrados para o telemóvel ${phone}!`, "info");
      }
    } catch (e) {
      console.error("Erro a carregar encomendas do cliente:", e);
      showToast("Erro ao ligar ao servidor de encomendas.", "error");
    }
  };

  // Search Engine handling
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setView("home");
    setSelectedProduct(null);
  };

  // Trigger Gemini AI intelligent search
  const handleTriggerAISearch = async (query: string) => {
    if (!query.trim()) return;
    setIsAiSearching(true);
    try {
      const res = await fetch("/api/products/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query })
      });
      if (res.ok) {
        const data = await res.json();
        // Append generated products if they exist
        if (data && data.length > 0) {
          showToast(`O Gemini encontrou ${data.length} correspondências no AliExpress/Shein!`, "success");
          fetchProducts(); // reload full products catalog containing newly seeded items
        } else {
          showToast("A inteligência artificial não encontrou produtos elegíveis de momento.", "info");
        }
      } else {
        showToast("Esgotou as chamadas AI. Exibindo catálogo local.", "error");
      }
    } catch (err) {
      console.error("Erro na pesquisa inteligente Gemini:", err);
      showToast("Pesquisa Inteligente AI indisponível de momento.", "error");
    } finally {
      setIsAiSearching(false);
    }
  };

  // Favorites Handler
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast("Produto removido dos favoritos.", "info");
        return prev.filter(item => item !== id);
      } else {
        showToast("Produto adicionado aos favoritos! 💖");
        return [...prev, id];
      }
    });
  };

  // Shopping Cart logic
  const handleAddToCart = (product: Product, qty: number, variant?: { color?: string; size?: string; model?: string }) => {
    // Notify admin email promindset520@gmail.com of cart addition
    fetch("/api/admin/notify-cart-addition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: product.name,
        priceKz: product.priceKz,
        quantity: qty
      })
    }).catch(err => console.error("Error sending admin notification:", err));

    setCart(prev => {
      const existingIdx = prev.findIndex(item => 
        item.product.id === product.id && 
        item.selectedColor === (variant?.color || "") &&
        item.selectedSize === (variant?.size || "") &&
        item.selectedModel === (variant?.model || "")
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        showToast(`Quantidade de "${product.name}" aumentada no carrinho!`);
        return updated;
      } else {
        showToast(`"${product.name}" adicionado ao carrinho! 🛒`);
        return [...prev, {
          id: `${product.id}-${Date.now()}`,
          product,
          quantity: qty,
          selectedColor: variant?.color,
          selectedSize: variant?.size,
          selectedModel: variant?.model
        }];
      }
    });
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast("Produto removido do carrinho.", "info");
  };

  // Direct checkout purchase
  const handleBuyNow = (product: Product, qty: number, variant?: { color?: string; size?: string; model?: string }) => {
    // Add item first
    const mockId = `${product.id}-${Date.now()}`;
    setCart([{
      id: mockId,
      product,
      quantity: qty,
      selectedColor: variant?.color,
      selectedSize: variant?.size,
      selectedModel: variant?.model
    }]);
    setView("cart");
  };

  // Place order flow
  const handlePlaceOrder = async (orderData: {
    customer: any;
    paymentMethod: PaymentMethod;
    subtotalKz: number;
    discountKz: number;
    totalKz: number;
  }) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: orderData.customer,
          items: cart,
          paymentMethod: orderData.paymentMethod,
          subtotalKz: orderData.subtotalKz,
          discountKz: orderData.discountKz,
          totalKz: orderData.totalKz
        })
      });

      if (res.ok) {
        const createdOrder = await res.json();
        setLastPlacedOrder(createdOrder);
        setCart([]); // Clear cart
        setView("checkout");
        showToast("Pedido registado com sucesso! Efetue o pagamento em Kwanzas.", "success");
        fetchAllOrders(); // Reload admin order board
        setClientSearchPhone(orderData.customer.phone); // save phone to access client area quickly
      } else {
        showToast("Erro ao submeter o seu pedido. Tente novamente.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Falha de rede ao submeter pedido.", "error");
    }
  };

  // Upload/Submit receipt references
  const handleReceiptSubmitted = async (orderId: string, reference: string, fileAttached: boolean) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, fileAttached })
      });

      if (res.ok) {
        const updated = await res.json();
        if (lastPlacedOrder && lastPlacedOrder.id === orderId) {
          setLastPlacedOrder(updated);
        }
        showToast("Comprovativo recebido pela equipa financeira!");
        fetchAllOrders(); // Refresh lists
        if (clientSearchPhone) {
          handleFetchCustomerOrders(clientSearchPhone);
        }
      } else {
        showToast("Erro ao registar comprovativo.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Erro na ligação ao servidor.", "error");
    }
  };

  // Administrator Status Updates
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, trackingCode?: string, notes?: string, trackingHistory?: any[]) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingCode, notes, trackingHistory })
      });

      if (res.ok) {
        showToast("Estado do pedido alterado com sucesso!");
        fetchAllOrders();
        if (clientSearchPhone) {
          handleFetchCustomerOrders(clientSearchPhone);
        }
      } else {
        showToast("Erro ao atualizar pedido no servidor.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Administrator catalog operations
  const handleAddProduct = async (prodData: Omit<Product, "id" | "priceKz">) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prodData)
      });
      if (res.ok) {
        fetchProducts();
        showToast("Produto adicionado com sucesso!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
        showToast("Produto removido com sucesso!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Administrator Banners Operations
  const handleAddBanner = async (bannerData: Omit<Banner, "id">) => {
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerData)
      });
      if (res.ok) {
        fetchBanners();
        showToast("Banner adicionado!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBanners();
        showToast("Banner removido!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Administrator Coupons Operations
  const handleAddCoupon = async (couponData: Omit<Coupon, "isActive">) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponData)
      });
      if (res.ok) {
        fetchCoupons();
        showToast("Cupão adicionado com sucesso!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/${code}`, { method: "DELETE" });
      if (res.ok) {
        fetchCoupons();
        showToast("Cupão removido!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Related products helper
  const getRelatedProducts = (prod: Product) => {
    return products.filter(p => p.id !== prod.id && p.category === prod.category);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 animate-fade-in ${
          toast.type === "error" 
            ? "bg-red-600 border-red-500 text-white" 
            : toast.type === "info" 
              ? "bg-blue-600 border-blue-500 text-white" 
              : "bg-zinc-900 border-zinc-800 text-white dark:bg-zinc-900 dark:border-zinc-800"
        }`}>
          <CheckCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span className="text-xs font-bold font-sans">{toast.msg}</span>
        </div>
      )}

      {/* Primary Navigation Header */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentView={view === "client" ? "client-area" : view}
        setCurrentView={(v) => {
          if (v === "client-area") {
            setView("client");
          } else {
            setView(v as any);
          }
        }}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        favoritesCount={favorites.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={(q, useAI) => {
          if (useAI) {
            handleTriggerAISearch(q);
          } else {
            handleSearch(q);
          }
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isAdmin={view === "admin"}
        setIsAdmin={(val) => {
          if (val) {
            setView("admin");
          } else {
            setView("home");
          }
        }}
        userEmail={userEmail}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAuth={() => { setAuthModalTab("login"); setShowAuthModal(true); }}
      />

      {/* Main Viewport Content block */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: HOME CATALOG VIEW */}
        {view === "home" && (
          <HomeView
            products={products}
            banners={banners}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onSelectProduct={(p) => { setSelectedProduct(p); setView("detail"); }}
            searchQuery={searchQuery}
            onTriggerAISearch={handleTriggerAISearch}
            aiSearching={isAiSearching}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onAddToCart={(p, q) => handleAddToCart(p, q)}
          />
        )}

        {/* VIEW 2: PRODUCT DETAIL DETAILED CARD */}
        {view === "detail" && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            relatedProducts={getRelatedProducts(selectedProduct)}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onBack={() => setView("home")}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {/* VIEW 3: CART VIEW & WIZARD */}
        {view === "cart" && (
          <CartView
            cartItems={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onPlaceOrder={handlePlaceOrder}
            onBackToShopping={() => setView("home")}
            userEmail={userEmail}
            onRequireLogin={() => {
              setAuthModalTab("login");
              setShowAuthModal(true);
            }}
          />
        )}

        {/* VIEW 4: POST-PURCHASE DEPOSIT RECEIPT UPLOADER */}
        {view === "checkout" && lastPlacedOrder && (
          <CheckoutView
            order={lastPlacedOrder}
            bankDetails={BANK_DETAILS}
            onReceiptSubmitted={handleReceiptSubmitted}
            onTrackOrder={(phone) => {
              handleFetchCustomerOrders(phone);
              setView("client");
            }}
          />
        )}

        {/* VIEW 5: CUSTOMER LOCKER HUB */}
        {view === "client" && (
          <ClientAreaView
            orders={customerOrders}
            onFetchCustomerOrders={handleFetchCustomerOrders}
            favorites={products.filter(p => favorites.includes(p.id))}
            toggleFavorite={toggleFavorite}
            onSelectProduct={(p) => { setSelectedProduct(p); setView("detail"); }}
            onAddToCart={(p, q) => handleAddToCart(p, q)}
            initialPhone={clientSearchPhone}
          />
        )}

        {/* VIEW 6: ADMINISTRATIVE BOARD */}
        {view === "admin" && (
          userEmail === "promindset520@gmail.com" ? (
            <AdminPanel
              orders={orders}
              products={products}
              banners={banners}
              coupons={coupons}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddBanner={handleAddBanner}
              onDeleteBanner={handleDeleteBanner}
              onAddCoupon={handleAddCoupon}
              onDeleteCoupon={handleDeleteCoupon}
              onShowToast={showToast}
            />
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="text-red-500 font-bold text-lg">Acesso Restrito</div>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Esta secção é restrita apenas ao Administrador Principal da plataforma AngoExpress (<span className="font-mono font-bold">promindset520@gmail.com</span>).
              </p>
              <button
                onClick={() => setView("home")}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                Voltar à Página Inicial
              </button>
            </div>
          )
        )}

      </main>

      {/* Humblest & Cleanest Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-red-600 font-bold uppercase tracking-wider font-display">
            <span>Ango Express</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            Intermediação Segura e Despacho de Compras Internacionais (AliExpress & Shein) para Angola em Kwanzas.
          </p>
          <div className="text-[10px] text-gray-400 font-mono">
            &copy; {new Date().getFullYear()} AngoExpress. Todos os direitos reservados. 1 USD = 1.170 Kz.
          </div>
        </div>
      </footer>

      {/* CUSTOM DATABASE-DRIVEN HIGH-FIDELITY AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="auth-modal-overlay">
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setErrorMsg("");
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <User className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-black dark:text-white">
                {authModalTab === "login" ? "Iniciar Sessão na AngoExpress" : "Criar Conta na AngoExpress"}
              </h4>
              <p className="text-xs text-gray-500">
                {authModalTab === "login" 
                  ? "Introduza os seus dados para aceder à sua conta e efetuar compras." 
                  : "Registe-se em segundos para encomendar produtos internacionais em Kwanzas!"}
              </p>
            </div>

            {/* Tab selector */}
            <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab("login");
                  setErrorMsg("");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authModalTab === "login"
                    ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Iniciar Sessão
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab("register");
                  setErrorMsg("");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authModalTab === "register"
                    ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Criar Conta
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-2.5 rounded-xl text-xs text-red-600 dark:text-red-400 text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authModalTab === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nome Completo</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Ex: Helena Grácio da Costa"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Telefone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 923 456 789"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Endereço de E-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Ex: exemplo@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Palavra-passe (Senha)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Ex: senhamuitosegura"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-red-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>A processar...</span>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{authModalTab === "login" ? "Iniciar Sessão" : "Criar Conta AngoExpress"}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-[10px] text-gray-400">
              {authModalTab === "login" ? (
                <p>
                  Não tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab("register");
                      setErrorMsg("");
                    }}
                    className="text-red-500 font-bold hover:underline"
                  >
                    Crie uma aqui
                  </button>
                </p>
              ) : (
                <p>
                  Já tem conta na AngoExpress?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab("login");
                      setErrorMsg("");
                    }}
                    className="text-red-500 font-bold hover:underline"
                  >
                    Inicie sessão aqui
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
