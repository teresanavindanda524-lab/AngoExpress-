/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProductOrigin = "AliExpress" | "Shein";

export interface ProductReview {
  id: string;
  authorName: string;
  country: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

export interface ProductVariations {
  colors?: string[];
  sizes?: string[];
  models?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  origin: ProductOrigin;
  priceUSD: number; // Original price
  priceKz: number;  // Display price in Kwanzas, including the 7% fee: (USD * 1.07) * 1170
  images: string[];
  videoUrl?: string | null;
  rating: number;
  salesCount: number;
  stock: number;
  deliveryDays: number;
  variations: ProductVariations;
  freeShipping: boolean;
  specifications: Record<string, string>;
  reviews: ProductReview[];
}

export interface CartItem {
  id: string; // unique cart item id (e.g. productId + color + size)
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedModel?: string;
}

export type PaymentMethod = 
  | "unitel_money" 
  | "multicaixa_express" 
  | "paypay_angola" 
  | "agent_bai" 
  | "atm_transfer";

export type OrderStatus =
  | "pending"             // Pagamento pendente
  | "confirmed"           // Pagamento confirmado
  | "purchased"           // Compra realizada (na AliExpress/Shein)
  | "preparing"           // Em preparação
  | "shipped"             // Enviado pelo fornecedor
  | "transit"             // Em trânsito
  | "arrived_angola"      // Chegou em Angola
  | "distribution"        // Em distribuição
  | "delivered";          // Entregue

export interface CustomerAddress {
  fullName: string;
  phone: string;
  street: string;
  province: string;
  municipality: string;
  bairro: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  origin: ProductOrigin;
  quantity: number;
  priceKz: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedModel?: string;
}

export interface TrackingEvent {
  id: string;
  status: string;      // e.g. "Em Armazém", "Trânsito Internacional", "Alfândega", "Entrega Local"
  location: string;    // e.g. "Guangzhou, China"
  timestamp: string;   // ISO datetime string
  description: string; // Detail description of the tracking step
}

export interface Order {
  id: string; // AE-XXXXX-AO
  customer: CustomerAddress;
  items: OrderItem[];
  subtotalKz: number;
  discountKz: number;
  totalKz: number;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  trackingCode?: string;
  notes?: string;
  trackingHistory?: TrackingEvent[];
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  minOrderValueKz: number;
  isActive: boolean;
}

export interface AdminStats {
  totalSalesKz: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  ordersByStatus: Record<OrderStatus, number>;
  salesByOrigin: Record<ProductOrigin, number>;
  recentOrders: Order[];
}
