/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Lock, 
  Bell, 
  MessageSquare, 
  Search, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  Circle,
  Truck,
  ExternalLink,
  ShieldCheck,
  Package,
  Clock,
  Calendar
} from "lucide-react";
import { Order, Product, OrderStatus } from "../types";
import { formatKz, formatUSD } from "../data";

// Helper to get automatic detailed checkpoints based on current status
function getAutomaticCheckpoints(order: Order): { id?: string; status: string; location: string; timestamp: string; description: string }[] {
  const steps: { id?: string; status: string; location: string; timestamp: string; description: string }[] = [];
  const dateBase = new Date(order.createdAt);

  const addStep = (status: string, location: string, daysOffset: number, description: string) => {
    const stepDate = new Date(dateBase);
    stepDate.setDate(stepDate.getDate() + daysOffset);
    steps.unshift({
      status,
      location,
      timestamp: stepDate.toISOString(),
      description
    });
  };

  // Base step for any order
  addStep(
    "Pedido Registado",
    "AngoExpress Luanda",
    0,
    "O seu pedido de importação foi registado no sistema AngoExpress e aguarda validação bancária."
  );

  const currentStatus = order.orderStatus;
  const allStatuses = [
    "pending", "confirmed", "purchased", "preparing", "shipped", "transit", "arrived_angola", "distribution", "delivered"
  ];
  const currentIndex = allStatuses.indexOf(currentStatus);

  if (currentIndex >= 1) { // confirmed
    addStep(
      "Pagamento Verificado",
      "AngoExpress Financeiro",
      1,
      "O seu pagamento em Kwanzas foi verificado com sucesso pela nossa equipa financeira. Iniciando o processo de compra internacional."
    );
  }
  if (currentIndex >= 2) { // purchased
    addStep(
      "Compra Realizada",
      "Guangzhou, China",
      2,
      "A sua compra Shein/AliExpress foi efetuada pelo nosso agente oficial na China. O produto segue para o centro de triagem."
    );
  }
  if (currentIndex >= 3) { // preparing
    addStep(
      "Recebido no Armazém",
      "Armazém de Guangzhou, China",
      3,
      "O produto foi recebido, inspecionado por controlo de qualidade e acondicionado no nosso armazém principal de Guangzhou."
    );
  }
  if (currentIndex >= 4) { // shipped
    addStep(
      "Despachado para o Porto/Aeroporto",
      "Consolidação de Guangzhou",
      5,
      "A encomenda foi agrupada em contentores aéreos da AngoExpress e enviada para o terminal de carga internacional."
    );
  }
  if (currentIndex >= 5) { // transit
    addStep(
      "Trânsito Internacional",
      "Espaço Aéreo de Guangzhou",
      7,
      "O voo internacional de carga contendo o lote da AngoExpress descolou com destino à alfândega de Luanda."
    );
  }
  if (currentIndex >= 6) { // arrived_angola
    addStep(
      "Chegou ao Aeroporto de Luanda",
      "Alfândega de Luanda, Angola",
      11,
      "A encomenda deu entrada na estância aduaneira do Aeroporto de Luanda e encontra-se no processo formal de desalfandegamento."
    );
  }
  if (currentIndex >= 7) { // distribution
    addStep(
      "Desalfandegado com Sucesso",
      "Distribuição AngoExpress Luanda",
      14,
      "A encomenda foi libertada pelas autoridades aduaneiras de Angola e encaminhada para entrega ao domicílio ou posto de recolha."
    );
  }
  if (currentIndex >= 8) { // delivered
    addStep(
      "Entregue com Sucesso",
      "Morada de Destino",
      16,
      "A encomenda Shein/AliExpress foi entregue em perfeitas condições ao destinatário final. Obrigado por comprar connosco!"
    );
  }

  return steps;
}

interface ClientAreaViewProps {
  orders: Order[];
  onFetchCustomerOrders: (phone: string) => void;
  favorites: Product[];
  toggleFavorite: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (p: Product, qty: number, variant?: any) => void;
  initialPhone?: string;
}

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; desc: string; color: string; bg: string }> = {
  pending: { label: "Pagamento Pendente", desc: "Aguardando confirmação do talão de depósito ou transferência pelo administrador.", color: "text-amber-500", bg: "bg-amber-500" },
  confirmed: { label: "Pagamento Confirmado", desc: "O pagamento em Kwanzas foi verificado e aprovado com sucesso.", color: "text-blue-500", bg: "bg-blue-500" },
  purchased: { label: "Compra Realizada", desc: "O administrador efetuou a compra do produto na conta oficial Shein/AliExpress.", color: "text-purple-500", bg: "bg-purple-500" },
  preparing: { label: "Em Preparação", desc: "O fornecedor internacional está a embalar e a tratar do despacho da encomenda.", color: "text-indigo-500", bg: "bg-indigo-500" },
  shipped: { label: "Enviado pelo Fornecedor", desc: "A encomenda foi despachada do armazém internacional de origem.", color: "text-cyan-500", bg: "bg-cyan-500" },
  transit: { label: "Em Trânsito Internacional", desc: "O pacote encontra-se em trânsito aéreo/marítimo rumo a Angola.", color: "text-yellow-600", bg: "bg-yellow-600" },
  arrived_angola: { label: "Chegou em Angola", desc: "A mercadoria chegou ao aeroporto/porto de Luanda e encontra-se no processo alfandegário.", color: "text-orange-500", bg: "bg-orange-500" },
  distribution: { label: "Em Distribuição Local", desc: "A encomenda foi desalfandegada e está em trânsito para a morada selecionada.", color: "text-pink-500", bg: "bg-pink-500" },
  delivered: { label: "Entregue", desc: "O produto foi entregue ao destinatário em Angola. Obrigado pela sua confiança!", color: "text-green-600", bg: "bg-green-600" }
};

const ORDER_STATUS_STEPS: OrderStatus[] = [
  "pending", "confirmed", "purchased", "preparing", "shipped", "transit", "arrived_angola", "distribution", "delivered"
];

export default function ClientAreaView({
  orders,
  onFetchCustomerOrders,
  favorites,
  toggleFavorite,
  onSelectProduct,
  onAddToCart,
  initialPhone = ""
}: ClientAreaViewProps) {
  const [activeTab, setActiveTab] = useState<"tracking" | "favorites" | "profile" | "notifications">("tracking");
  const [searchPhone, setSearchPhone] = useState(initialPhone);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form Profile State (Simulado)
  const [userProfile, setUserProfile] = useState({
    name: "Helena Grácio",
    phone: initialPhone || "923 456 789",
    province: "Luanda",
    bairro: "Talatona",
    password: "••••••••••••"
  });
  const [passwordForm, setPasswordForm] = useState({ old: "", newPass: "", confirm: "" });
  const [passSuccess, setPassSuccess] = useState("");

  useEffect(() => {
    if (initialPhone) {
      setSearchPhone(initialPhone);
      onFetchCustomerOrders(initialPhone);
    }
  }, [initialPhone]);

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    onFetchCustomerOrders(searchPhone.trim());
    setSelectedOrder(null);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      alert("As novas palavras-passe não coincidem!");
      return;
    }
    setPassSuccess("Palavra-passe alterada com sucesso!");
    setPasswordForm({ old: "", newPass: "", confirm: "" });
    setTimeout(() => setPassSuccess(""), 3000);
  };

  // Simulated notifications
  const [messages, setMessages] = useState([
    { id: 1, title: "Atualização de Encomenda", body: "O seu pedido AE-84321-AO passou do estado 'Em Preparação' para 'Enviado pelo Fornecedor'.", date: "Há 2 horas", read: false },
    { id: 2, title: "Pagamento Confirmado", body: "Confirmámos com sucesso o depósito de 12.519 Kz para a sua primeira compra.", date: "Há 1 dia", read: true },
    { id: 3, title: "Bem-vindo à Ango Express", body: "Siga as novidades e acompanhe as suas compras Shein e AliExpress em Kwanzas com segurança.", date: "Há 3 dias", read: true }
  ]);

  const markAllRead = () => {
    setMessages(messages.map(m => ({ ...m, read: true })));
  };

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 animate-fade-in" id="client-area-container">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="lg:col-span-3 space-y-4" id="client-sidebar">
        
        {/* Profile Card Summary */}
        <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-black dark:text-white">{userProfile.name}</h3>
            <span className="text-[10px] text-gray-400 font-mono">ID Cliente: #9432-{searchPhone ? searchPhone.slice(-4) : "00"}</span>
          </div>
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-2 rounded-xl text-[10px] text-gray-500 font-mono">
            {searchPhone ? `Telemóvel: ${searchPhone}` : "Sem telemóvel carregado"}
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl overflow-hidden p-2 shadow-sm flex flex-row lg:flex-col gap-1 overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => setActiveTab("tracking")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all shrink-0 ${
              activeTab === "tracking"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Rastrear Pedidos</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all shrink-0 ${
              activeTab === "favorites"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Lista de Favoritos</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all shrink-0 ${
              activeTab === "profile"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Meus Dados & Segurança</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2.5 text-xs font-bold py-3 px-4 rounded-xl transition-all relative shrink-0 ${
              activeTab === "notifications"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Mensagens</span>
            {messages.filter(m => !m.read).length > 0 && (
              <span className="absolute top-3.5 right-4 bg-red-600 text-white text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white">
                {messages.filter(m => !m.read).length}
              </span>
            )}
          </button>

        </div>

      </div>

      {/* RIGHT DISPLAY VIEWPORTS */}
      <div className="lg:col-span-9 space-y-6" id="client-viewport">
        
        {/* VIEW 1: ORDER TRACKING TIMELINE PANEL */}
        {activeTab === "tracking" && (
          <div className="space-y-6 animate-fade-in" id="tracking-viewport">
            
            {/* Phone lookup Search box */}
            <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-black dark:text-white flex items-center gap-1.5">
                  <Compass className="h-5 w-5 text-red-600 animate-spin" />
                  <span>Procurar Encomendas por Telemóvel</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Insira o número de telemóvel registado no checkout para recuperar os seus talões de compras.
                </p>
              </div>

              <form onSubmit={handlePhoneSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: 923456789 ou 912345678"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-1 shadow transition-all shrink-0"
                >
                  <Search className="h-4 w-4" />
                  <span>Pesquisar</span>
                </button>
              </form>
            </div>

            {/* Results orders list */}
            {orders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="orders-lookup-results">
                
                {/* Orders list left column */}
                <div className="md:col-span-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Suas Encomendas ({orders.length})</h4>
                  
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {orders.map((ord) => {
                      const statusInfo = ORDER_STATUS_MAP[ord.orderStatus];
                      const itemsCount = ord.items.reduce((acc, it) => acc + it.quantity, 0);
                      const isSelected = selectedOrder?.id === ord.id;
                      
                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? "border-red-600 bg-red-500/5 shadow-sm" 
                              : "border-gray-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">{ord.id}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(ord.createdAt).toLocaleDateString("pt-AO")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[11px] text-gray-500">{itemsCount} produto(s)</span>
                            <span className={`text-[10px] font-bold ${statusInfo?.color}`}>
                              {statusInfo?.label}
                            </span>
                          </div>
                          <div className="mt-2 text-right">
                            <span className="text-xs font-bold text-red-600 font-display">{formatKz(ord.totalKz)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking detailed timeline right column */}
                <div className="md:col-span-7" id="timeline-detail-col">
                  {selectedOrder ? (
                    <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
                      
                      {/* Order brief detail card */}
                      <div className="border-b border-gray-100 dark:border-zinc-900 pb-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-mono">Número do Pedido</span>
                          <span className="text-xs text-red-600 font-mono font-bold uppercase">{selectedOrder.paymentMethod.replace("_", " ")}</span>
                        </div>
                        <h4 className="font-display font-bold text-base text-gray-900 dark:text-white flex items-center justify-between">
                          <span>{selectedOrder.id}</span>
                          <span className="text-sm font-bold text-red-600">{formatKz(selectedOrder.totalKz)}</span>
                        </h4>
                        
                        {selectedOrder.trackingCode && (
                          <div className="bg-gray-50 dark:bg-zinc-900 p-2.5 rounded-lg text-xs flex items-center justify-between font-mono text-gray-600 dark:text-gray-400">
                            <span>Código Rastreio Fornecedor:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer">
                              {selectedOrder.trackingCode}
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Timeline status list */}
                      <div className="space-y-4">
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Estado do Rastreamento</h5>
                        
                        <div className="relative pl-6 space-y-6" id="vertical-timeline-steps">
                          {/* Vertical connector line */}
                          <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-gray-200 dark:bg-zinc-800" />
                          
                          {ORDER_STATUS_STEPS.map((statusStep, index) => {
                            const isCurrent = selectedOrder.orderStatus === statusStep;
                            const isCompleted = getStepIndex(selectedOrder.orderStatus) >= index;
                            const stepDetails = ORDER_STATUS_MAP[statusStep];
                            
                            return (
                              <div key={statusStep} className="relative flex gap-4 text-xs">
                                {/* Bullet indicator */}
                                <div className="absolute -left-[24px] top-0.5">
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-red-600 fill-white dark:fill-zinc-950 z-10 relative" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-300 fill-white dark:fill-zinc-950 z-10 relative" />
                                  )}
                                </div>

                                <div className="space-y-0.5 flex-1">
                                  <span className={`font-bold block text-xs ${
                                    isCurrent 
                                      ? "text-red-600" 
                                      : isCompleted 
                                        ? "text-gray-800 dark:text-gray-200" 
                                        : "text-gray-400"
                                  }`}>
                                    {stepDetails?.label} {isCurrent && "📍 (Atual)"}
                                  </span>
                                  {isCompleted && (
                                    <p className="text-[11px] text-gray-500 leading-normal">{stepDetails?.desc}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Detailed tracking history logs */}
                      <div className="border-t border-gray-100 dark:border-zinc-900 pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-red-600 animate-pulse" />
                            <span>Histórico Detalhado do Percurso</span>
                          </h5>
                          <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full font-mono font-semibold">
                            {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 ? "Atualizações Reais" : "Estimado"}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-normal">
                          Abaixo encontram-se os registos de percurso de entrada e saída nos nossos armazéns internacionais e postos aduaneiros em Luanda.
                        </p>

                        <div className="relative pl-6 space-y-6 mt-2" id="detailed-checkpoints-timeline">
                          {/* Timeline central connector line */}
                          <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-red-100 dark:bg-zinc-800" />

                          {(selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 
                            ? selectedOrder.trackingHistory 
                            : getAutomaticCheckpoints(selectedOrder)
                          ).map((event, eventIdx) => {
                            const isLatest = eventIdx === 0;
                            return (
                              <div key={event.id || eventIdx} className="relative flex flex-col gap-1 text-xs">
                                {/* Timeline Indicator Bullet */}
                                <div className="absolute -left-[24px] top-1">
                                  {isLatest ? (
                                    <span className="flex h-4 w-4 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border border-white dark:border-zinc-950"></span>
                                    </span>
                                  ) : (
                                    <div className="h-3.5 w-3.5 rounded-full bg-gray-300 dark:bg-zinc-700 border border-white dark:border-zinc-950 z-10 relative" />
                                  )}
                                </div>

                                {/* Event Header */}
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className={`font-bold text-xs ${isLatest ? "text-red-600 font-sans" : "text-gray-800 dark:text-gray-200"}`}>
                                    {event.status}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono bg-gray-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-red-500" />
                                    <span>{event.location}</span>
                                  </span>
                                </div>

                                {/* Event Description */}
                                <p className="text-[11px] text-gray-500 leading-normal dark:text-gray-400">
                                  {event.description}
                                </p>

                                {/* Event Timestamp */}
                                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span>{new Date(event.timestamp).toLocaleString("pt-AO")}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Optional admin comments */}
                      {selectedOrder.notes && (
                        <div className="bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-xs text-amber-800 dark:text-amber-400 space-y-1">
                          <span className="font-bold flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                            <span>Observações da Administração:</span>
                          </span>
                          <p className="italic">"{selectedOrder.notes}"</p>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-12 text-center text-gray-400 space-y-2">
                      <Package className="h-10 w-10 mx-auto text-gray-300" />
                      <p className="text-xs">Selecione uma das suas encomendas listadas à esquerda para detalhar a rota e ver a timeline de envio.</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 rounded-2xl p-12 text-center space-y-3 shadow-sm" id="no-tracking-history">
                <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto" />
                <h4 className="font-display font-bold text-sm text-black dark:text-white">Sem histórico de encomendas</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Introduza o seu telemóvel e clique em pesquisar para carregar as suas encomendas guardadas e acompanhar a entrega.</p>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: FAVORITES MANAGER */}
        {activeTab === "favorites" && (
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 animate-fade-in" id="favorites-viewport">
            <div>
              <h3 className="font-display font-bold text-base text-black dark:text-white">A sua Lista de Desejos</h3>
              <p className="text-xs text-gray-500">Produtos salvos da Shein e AliExpress para checkout rápido.</p>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-12 space-y-3 text-gray-400">
                <Heart className="h-10 w-10 text-gray-300 mx-auto" />
                <p className="text-xs">Não tem nenhum produto guardado na sua lista de desejos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {favorites.map((product) => (
                  <div key={product.id} className="border border-gray-100 dark:border-zinc-900 rounded-xl overflow-hidden p-2.5 flex flex-col justify-between group">
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-900">
                      <img src={product.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-102 transition-transform" />
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-red-600 shadow-sm"
                      >
                        <Heart className="h-3.5 w-3.5 fill-red-600" />
                      </button>
                    </div>

                    <div className="pt-2 space-y-2">
                      <h4 
                        onClick={() => onSelectProduct(product)}
                        className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 hover:text-red-600 cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <span className="text-xs font-bold text-red-600 block">{formatKz(product.priceKz)}</span>
                      
                      <button
                        onClick={() => onAddToCart(product, 1)}
                        className="w-full py-1.5 bg-black dark:bg-red-600 text-white text-[10px] font-bold rounded-lg shadow-sm"
                      >
                        Adicionar ao Carrinho
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PROFILE & SECURITY CREDENTIALS */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" id="profile-viewport">
            
            {/* Personal Data details */}
            <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-black dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-900">
                Dados Pessoais
              </h3>
              
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 block font-mono">Nome de Perfil</span>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 px-3.5 py-2.5 rounded-xl text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 block font-mono">Telemóvel Principal</span>
                  <input
                    type="text"
                    disabled
                    value={userProfile.phone}
                    className="w-full bg-gray-100 dark:bg-zinc-900/20 border border-gray-200 dark:border-zinc-850 px-3.5 py-2.5 rounded-xl text-gray-500 text-xs focus:outline-none cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-400">O número de telemóvel é verificado pela morada de envio das encomendas.</span>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 block font-mono">Província Padrão</span>
                  <input
                    type="text"
                    value={userProfile.province}
                    onChange={(e) => setUserProfile({ ...userProfile, province: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 px-3.5 py-2.5 rounded-xl text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <button 
                  onClick={() => alert("Perfil atualizado localmente!")}
                  className="bg-black dark:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Guardar Alterações
                </button>
              </div>
            </div>

            {/* Change Password Panel */}
            <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-black dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-900 flex items-center gap-1.5">
                <Lock className="h-5 w-5 text-red-600" />
                <span>Alterar Palavra-passe</span>
              </h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                {passSuccess && (
                  <div className="p-2.5 bg-green-500/10 text-green-600 rounded-lg font-semibold text-[11px]">
                    {passSuccess}
                  </div>
                )}
                
                <div className="space-y-1">
                  <span className="text-gray-400 block font-mono">Palavra-passe Antiga</span>
                  <input
                    type="password"
                    required
                    placeholder="Introduza antiga palavra-passe"
                    value={passwordForm.old}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 px-3.5 py-2.5 rounded-xl text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 block font-mono">Nova Palavra-passe</span>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo de 6 caracteres"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 px-3.5 py-2.5 rounded-xl text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 block font-mono">Confirmar Nova Palavra-passe</span>
                  <input
                    type="password"
                    required
                    placeholder="Repita a palavra-passe"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 px-3.5 py-2.5 rounded-xl text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl w-full"
                >
                  Alterar Palavra-passe
                </button>
              </form>
            </div>

          </div>
        )}

        {/* VIEW 4: NOTIFICATIONS & MESSAGES */}
        {activeTab === "notifications" && (
          <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4 animate-fade-in" id="notifications-viewport">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-900 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-black dark:text-white">Histórico de Mensagens</h3>
                <p className="text-xs text-gray-500">Notificações enviadas pelo administrador AngoExpress sobre as suas compras.</p>
              </div>
              <button 
                onClick={markAllRead}
                className="text-xs text-red-600 font-semibold hover:underline"
              >
                Marcar todas como lidas
              </button>
            </div>

            <div className="space-y-3.5 divide-y divide-gray-100 dark:divide-zinc-900">
              {messages.map((msg) => (
                <div key={msg.id} className="pt-3.5 first:pt-0 flex gap-3 text-xs">
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${
                    msg.read ? "bg-gray-100 dark:bg-zinc-900 text-gray-400" : "bg-red-100 dark:bg-red-950/40 text-red-600 animate-pulse"
                  }`}>
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`font-bold block ${msg.read ? "text-gray-800 dark:text-gray-200" : "text-black dark:text-white"}`}>
                        {msg.title} {!msg.read && <span className="text-[9px] bg-red-600 text-white font-bold font-mono px-1 rounded uppercase">Novo</span>}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{msg.date}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 leading-normal italic">
                      "{msg.body}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
