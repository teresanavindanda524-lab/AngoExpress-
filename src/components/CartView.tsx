/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShoppingBag, 
  Trash2, 
  Percent, 
  MapPin, 
  CreditCard, 
  Phone, 
  User, 
  ArrowLeft, 
  CheckCircle,
  Truck,
  Sparkles
} from "lucide-react";
import { CartItem, PaymentMethod, CustomerAddress, Coupon } from "../types";
import { formatKz, formatUSD, SEED_COUPONS } from "../data";

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onPlaceOrder: (order: {
    customer: CustomerAddress;
    paymentMethod: PaymentMethod;
    subtotalKz: number;
    discountKz: number;
    totalKz: number;
  }) => void;
  onBackToShopping: () => void;
  userEmail: string | null;
  onRequireLogin: () => void;
}

// Angolan Provinces List
const ANGOLAN_PROVINCES = [
  "Luanda", "Benguela", "Cabinda", "Huambo", "Huíla", "Cuanza Sul", "Cuanza Norte", 
  "Malanje", "Zaire", "Uíge", "Lunda Norte", "Lunda Sul", "Namibe", "Cunene", 
  "Cuando Cubango", "Moxico", "Bengo", "Bié"
];

export default function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onBackToShopping,
  userEmail,
  onRequireLogin
}: CartViewProps) {
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  // Customer Form State - Pre-fill from database session values
  const [fullName, setFullName] = useState(() => localStorage.getItem("ango_user_fullname") || "");
  const [phone, setPhone] = useState(() => localStorage.getItem("ango_user_phone") || "");
  const [street, setStreet] = useState("");
  const [province, setProvince] = useState("Luanda");
  const [municipality, setMunicipality] = useState("");
  const [bairro, setBairro] = useState("");

  // Synchronize name and phone after login
  React.useEffect(() => {
    if (userEmail) {
      setFullName(localStorage.getItem("ango_user_fullname") || "");
      setPhone(localStorage.getItem("ango_user_phone") || "");
    } else {
      setFullName("");
      setPhone("");
    }
  }, [userEmail]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("multicaixa_express");

  // Form Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations
  const subtotalKz = cartItems.reduce((acc, item) => acc + (item.product.priceKz * item.quantity), 0);
  
  let discountKz = 0;
  if (activeCoupon) {
    if (subtotalKz >= activeCoupon.minOrderValueKz) {
      if (activeCoupon.discountType === "percentage") {
        discountKz = Math.round(subtotalKz * (activeCoupon.value / 100));
      } else {
        discountKz = activeCoupon.value;
      }
    }
  }

  const totalKz = Math.max(0, subtotalKz - discountKz);

  // Apply Coupon
  const handleApplyCoupon = () => {
    setCouponError("");
    const matched = SEED_COUPONS.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    
    if (!matched) {
      setCouponError("Cupão inválido ou expirado.");
      setActiveCoupon(null);
      return;
    }

    if (!matched.isActive) {
      setCouponError("Este cupão não está ativo de momento.");
      setActiveCoupon(null);
      return;
    }

    if (subtotalKz < matched.minOrderValueKz) {
      setCouponError(`Compra mínima para este cupão é de ${formatKz(matched.minOrderValueKz)}`);
      setActiveCoupon(null);
      return;
    }

    setActiveCoupon(matched);
    setCouponCode("");
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
  };

  // Checkout submission validation
  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail) {
      onRequireLogin();
      return;
    }

    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Nome completo é obrigatório";
    if (!phone.trim()) {
      newErrors.phone = "Número de telefone é obrigatório";
    } else if (phone.trim().replace(/\s+/g, "").length < 9) {
      newErrors.phone = "Insira um número de telefone angolano válido (mín. 9 dígitos)";
    }
    if (!street.trim()) newErrors.street = "Endereço / Rua / Casa é obrigatório";
    if (!municipality.trim()) newErrors.municipality = "Município é obrigatório";
    if (!bairro.trim()) newErrors.bairro = "Bairro é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to checkout form
      const el = document.getElementById("checkout-form-header");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setErrors({});
    
    onPlaceOrder({
      customer: {
        fullName,
        phone: phone.trim(),
        street: street.trim(),
        province,
        municipality: municipality.trim(),
        bairro: bairro.trim()
      },
      paymentMethod,
      subtotalKz,
      discountKz,
      totalKz
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl space-y-4 max-w-lg mx-auto" id="empty-cart-state">
        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto" />
        <h3 className="font-display font-bold text-lg text-black dark:text-white">O seu Carrinho está vazio</h3>
        <p className="text-xs text-gray-500">Adicione produtos da Shein e AliExpress para comprar em Kwanzas com as melhores taxas.</p>
        <button
          onClick={onBackToShopping}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-6 py-2.5 rounded-full shadow transition-all active:scale-95"
        >
          Voltar a Comprar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="cart-view-container">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-900 pb-4">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-black dark:text-white">
            O Seu Carrinho de Compras
          </h2>
          <p className="text-xs text-gray-500">Reveja os seus itens antes de prosseguir para o checkout.</p>
        </div>
        <button
          onClick={onBackToShopping}
          className="text-xs text-gray-500 hover:text-red-600 font-medium flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continuar a Comprar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* LEFT COLUMN: Cart Items & Checkout Wizard */}
        <div className="lg:col-span-7 space-y-8" id="cart-left-side">
          
          {/* Cart Items List */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl overflow-hidden p-4 sm:p-6 space-y-4 shadow-sm" id="cart-items-panel">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Itens no Carrinho ({cartItems.length})</h3>
            
            <div className="divide-y divide-gray-100 dark:divide-zinc-900">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  
                  {/* Thumbnail */}
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-900 shrink-0 border border-gray-100 dark:border-zinc-900">
                    <img src={item.product.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>

                  {/* Info details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase ${item.product.origin === "Shein" ? "bg-black text-white" : "bg-red-600 text-white"}`}>
                          {item.product.origin}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-mono">{item.product.category}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">{item.product.name}</h4>
                      
                      {/* Selected Variations */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400">
                        {item.selectedColor && <span>Cor: <strong>{item.selectedColor}</strong></span>}
                        {item.selectedSize && <span>Tamanho: <strong>{item.selectedSize}</strong></span>}
                        {item.selectedModel && <span>Modelo: <strong>{item.selectedModel}</strong></span>}
                      </div>
                    </div>

                    {/* Price, Quantities & Delete action */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-500">
                        {formatKz(item.product.priceKz)} <span className="text-[10px] text-gray-400 font-mono">({formatUSD(item.product.priceUSD * 1.07)})</span>
                      </span>

                      <div className="flex items-center gap-4">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-900">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs text-black dark:text-white font-mono font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                          title="Remover Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Checkout Wizard Form */}
          <form onSubmit={handleSubmitCheckout} className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl overflow-hidden p-4 sm:p-6 space-y-6 shadow-sm" id="checkout-form-panel">
            
            {/* Form Section Header */}
            <div className="border-b border-gray-100 dark:border-zinc-900 pb-3" id="checkout-form-header">
              <h3 className="font-display font-bold text-base text-black dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <span>1. Dados de Envio e Entrega em Angola</span>
              </h3>
              <p className="text-xs text-gray-400">Insira a sua morada correta para o envio internacional da AliExpress / Shein.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <span>Nome Completo do Destinatário</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Helena Grácio da Costa"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full bg-white dark:bg-zinc-900 border text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 text-black dark:text-white ${
                    errors.fullName ? "border-red-500" : "border-gray-200 dark:border-zinc-800"
                  }`}
                />
                {errors.fullName && <span className="text-[10px] text-red-500 font-medium block">{errors.fullName}</span>}
              </div>

              {/* Phone (Kwanza money/SMS contact) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span>Telefone (Multicaixa / Unitel Money)</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 923 456 789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-white dark:bg-zinc-900 border text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 text-black dark:text-white ${
                    errors.phone ? "border-red-500" : "border-gray-200 dark:border-zinc-800"
                  }`}
                />
                {errors.phone && <span className="text-[10px] text-red-500 font-medium block">{errors.phone}</span>}
              </div>

              {/* Province Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Província de Destino</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none text-black dark:text-white"
                >
                  {ANGOLAN_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* Municipality */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Município</label>
                <input
                  type="text"
                  placeholder="Ex: Belas, Viana, Cazenga, Lobito"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className={`w-full bg-white dark:bg-zinc-900 border text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 text-black dark:text-white ${
                    errors.municipality ? "border-red-500" : "border-gray-200 dark:border-zinc-800"
                  }`}
                />
                {errors.municipality && <span className="text-[10px] text-red-500 font-medium block">{errors.municipality}</span>}
              </div>

              {/* Bairro */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Bairro</label>
                <input
                  type="text"
                  placeholder="Ex: Talatona, Benfica, Central"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className={`w-full bg-white dark:bg-zinc-900 border text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 text-black dark:text-white ${
                    errors.bairro ? "border-red-500" : "border-gray-200 dark:border-zinc-800"
                  }`}
                />
                {errors.bairro && <span className="text-[10px] text-red-500 font-medium block">{errors.bairro}</span>}
              </div>

              {/* Street / Details */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Endereço Completo (Rua, Casa nº, Pontos de Referência)</label>
                <input
                  type="text"
                  placeholder="Ex: Rua Direita de Talatona, Condomínio Girassol, Casa 12-B"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`w-full bg-white dark:bg-zinc-900 border text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 text-black dark:text-white ${
                    errors.street ? "border-red-500" : "border-gray-200 dark:border-zinc-800"
                  }`}
                />
                {errors.street && <span className="text-[10px] text-red-500 font-medium block">{errors.street}</span>}
              </div>
            </div>

            {/* PAYMENT METHODS SELECTOR SECTION */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-900">
              <div className="pb-1">
                <h3 className="font-display font-bold text-base text-black dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  <span>2. Método de Pagamento em Kwanzas (Kz)</span>
                </h3>
                <p className="text-xs text-gray-400">Selecione o método de pagamento angolano que irá utilizar.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Multicaixa Express */}
                <div 
                  onClick={() => setPaymentMethod("multicaixa_express")}
                  className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "multicaixa_express"
                      ? "border-red-600 bg-red-500/5 shadow-sm"
                      : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-black dark:text-white">Multicaixa Express</span>
                    <span className="text-[10px] text-gray-400">Pagamento direto por referência ou cartão</span>
                  </div>
                  {paymentMethod === "multicaixa_express" && <CheckCircle className="h-4 w-4 text-red-600 shrink-0" />}
                </div>

                {/* Unitel Money */}
                <div 
                  onClick={() => setPaymentMethod("unitel_money")}
                  className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "unitel_money"
                      ? "border-red-600 bg-red-500/5 shadow-sm"
                      : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-black dark:text-white">Unitel Money</span>
                    <span className="text-[10px] text-gray-400">Pagamento rápido via carteira móvel Unitel</span>
                  </div>
                  {paymentMethod === "unitel_money" && <CheckCircle className="h-4 w-4 text-red-600 shrink-0" />}
                </div>

                {/* PayPay Angola */}
                <div 
                  onClick={() => setPaymentMethod("paypay_angola")}
                  className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "paypay_angola"
                      ? "border-red-600 bg-red-500/5 shadow-sm"
                      : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-black dark:text-white">PayPay Angola</span>
                    <span className="text-[10px] text-gray-400">Transferência móvel e carteira PayPay</span>
                  </div>
                  {paymentMethod === "paypay_angola" && <CheckCircle className="h-4 w-4 text-red-600 shrink-0" />}
                </div>

                {/* Deposito BAI Agente */}
                <div 
                  onClick={() => setPaymentMethod("agent_bai")}
                  className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "agent_bai"
                      ? "border-red-600 bg-red-500/5 shadow-sm"
                      : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-black dark:text-white">Depósito num Agente BAI</span>
                    <span className="text-[10px] text-gray-400">Depósito físico em dinheiro num balcão/agente</span>
                  </div>
                  {paymentMethod === "agent_bai" && <CheckCircle className="h-4 w-4 text-red-600 shrink-0" />}
                </div>

                {/* Transferencia ATM */}
                <div 
                  onClick={() => setPaymentMethod("atm_transfer")}
                  className={`border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all sm:col-span-2 ${
                    paymentMethod === "atm_transfer"
                      ? "border-red-600 bg-red-500/5 shadow-sm"
                      : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-black dark:text-white">Transferência Bancária (ATM / IBAN)</span>
                    <span className="text-[10px] text-gray-400">Envio de comprovativo após transferência bancária</span>
                  </div>
                  {paymentMethod === "atm_transfer" && <CheckCircle className="h-4 w-4 text-red-600 shrink-0" />}
                </div>
              </div>
            </div>

            {/* Submit checkout button hidden in form, triggered by outside sidebar */}
            <button type="submit" id="hidden-submit-btn" className="hidden" />

          </form>

        </div>

        {/* RIGHT COLUMN: Order Summary panel & Promocode */}
        <div className="lg:col-span-5 space-y-6" id="cart-right-side">
          
          {/* Promocode Coupon Board */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cupão Promocional</h3>
            
            {activeCoupon ? (
              <div className="bg-green-500/10 dark:bg-green-500/5 border border-green-500/10 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 dark:text-green-400 font-bold">
                    Cupão Ativo: {activeCoupon.code} (-{activeCoupon.discountType === "percentage" ? `${activeCoupon.value}%` : formatKz(activeCoupon.value)})
                  </span>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  className="text-xs text-gray-400 hover:text-red-600 font-semibold"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: BENVINDO10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white uppercase focus:outline-none"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-black dark:bg-zinc-900 text-white hover:bg-zinc-900 dark:hover:bg-zinc-800 text-xs px-4 rounded-xl font-bold"
                >
                  Aplicar
                </button>
              </div>
            )}
            {couponError && <span className="text-[10px] text-red-500 font-medium block">{couponError}</span>}
            <span className="text-[10px] text-gray-400 block font-sans">
              Sugestão: Use <strong>BENVINDO10</strong> para 10% de desconto (min. 15.000 Kz) ou <strong>ANGO5000</strong> para poupar 5.000 Kz (min. 50.000 Kz).
            </span>
          </div>

          {/* Checkout Totals Summary Card */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-4 sm:p-6 shadow-md space-y-4" id="order-summary-card">
            <h3 className="font-display font-bold text-base text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-900">
              Resumo do Pedido
            </h3>

            <div className="space-y-2.5 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Produtos ({cartItems.reduce((acc, it) => acc + it.quantity, 0)} itens):</span>
                <span className="font-mono text-gray-800 dark:text-gray-200 font-medium">{formatKz(subtotalKz)}</span>
              </div>

              {discountKz > 0 && (
                <div className="flex items-center justify-between text-green-600 font-semibold bg-green-500/5 p-2 rounded-lg">
                  <span>Desconto de Cupão:</span>
                  <span className="font-mono">-{formatKz(discountKz)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Frete Internacional Rápido:</span>
                <span className="text-green-600 font-bold uppercase tracking-wider">Grátis (0 Kz)</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Despacho e Alfândega Angola:</span>
                <span className="text-green-600 font-bold uppercase tracking-wider">Incluídos (0 Kz)</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 dark:border-zinc-800 pt-3 flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Total a Pagar (Kz):</span>
                <span className="text-lg sm:text-2xl font-display font-bold text-red-600 dark:text-red-500">
                  {formatKz(totalKz)}
                </span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                Aprox. {formatUSD(totalKz / EXCHANGE_RATE_MOCK)} USD com taxa inclusa.
              </div>
            </div>

            <div className="bg-red-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-red-500/10 space-y-2" id="intermedia-disclaimer">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600">
                <Truck className="h-4 w-4" />
                <span>Garantia Ango Express</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-normal">
                Ao finalizar a compra, o seu pedido fica registado no nosso painel. Deverá realizar o pagamento por Kz para a conta do administrador e fornecer o comprovativo. Nós faremos a encomenda imediata na Shein / AliExpress e tratamos da entrega!
              </p>
            </div>

            {/* Main Submit Button (Clicks the hidden form button) */}
            {!userEmail ? (
              <div className="space-y-3">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <strong>Atenção:</strong> Para efetuar a sua compra com sucesso na AngoExpress, deve primeiro <strong>iniciar sessão</strong> ou <strong>criar uma conta</strong> no nosso banco de dados.
                </div>
                <button
                  type="button"
                  onClick={onRequireLogin}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 active:scale-98 transition-all"
                >
                  <User className="h-4 w-4" />
                  <span>Iniciar Sessão / Criar Conta</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const btn = document.getElementById("hidden-submit-btn");
                  if (btn) btn.click();
                }}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/20 active:scale-98 transition-all"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Confirmar Morada e Checkout</span>
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

const EXCHANGE_RATE_MOCK = 1170;
