/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Seed data
import { 
  SEED_PRODUCTS, 
  SEED_BANNERS, 
  SEED_COUPONS, 
  CATEGORIES, 
  convertUSDToKz, 
  generateReviews 
} from "./src/data";
import { Product, Order, Banner, Coupon } from "./src/types";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Local Disk DB Initialization
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: SEED_PRODUCTS,
      orders: [] as Order[],
      banners: SEED_BANNERS,
      coupons: SEED_COUPONS,
      categories: CATEGORIES,
      settings: {
        usdToKzRate: 1170,
        markupFactor: 1.07,
        iban: "AO06.0040.0000.1234.5678.9012.3",
        beneficiary: "ANGO EXPRESS LIMITADA (Agente BAI)",
        phone: "+244 923 456 789",
        email: "suporte@angoexpress.ao"
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
    console.log("Database initialized with seed data.");
  }
}

initDB();

function readDB() {
  try {
    const content = fs.readFileSync(DB_FILE, "utf8");
    const data = JSON.parse(content);
    if (!data.users) {
      data.users = [];
    }
    // Seed default admin if no users exist
    if (data.users.length === 0) {
      data.users.push({
        email: "promindset520@gmail.com",
        password: "admin123",
        fullName: "Administrador AngoExpress",
        phone: "+244 923 884 102"
      });
    }
    return data;
  } catch (error) {
    console.error("Error reading database, re-initializing", error);
    return {
      products: SEED_PRODUCTS,
      orders: [],
      banners: SEED_BANNERS,
      coupons: SEED_COUPONS,
      categories: CATEGORIES,
      users: [
        {
          email: "promindset520@gmail.com",
          password: "admin123",
          fullName: "Administrador AngoExpress",
          phone: "+244 923 884 102"
        }
      ],
      settings: {
        usdToKzRate: 1170,
        markupFactor: 1.07,
        iban: "AO06.0040.0000.1234.5678.9012.3",
        beneficiary: "ANGO EXPRESS LIMITADA (Agente BAI)",
        phone: "+244 923 456 789",
        email: "suporte@angoexpress.ao"
      }
    };
  }
}

function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Initialize Gemini Client
const aiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (aiApiKey && aiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini client successfully initialized.");
  } catch (err) {
    console.error("Error initializing Gemini client", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, AI intelligence features will use mock backup.");
}

// --- API ROUTES ---

// Auth Endpoints
app.post("/api/auth/register", (req, res) => {
  const db = readDB();
  const { email, password, fullName, phone } = req.body;

  if (!email || !password || !fullName || !phone) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingUser = db.users.find((u: any) => u.email === cleanEmail);

  if (existingUser) {
    return res.status(400).json({ error: "Este endereço de e-mail já está registado." });
  }

  const newUser = {
    email: cleanEmail,
    password,
    fullName: fullName.trim(),
    phone: phone.trim()
  };

  db.users.push(newUser);
  writeDB(db);

  res.status(201).json({
    email: newUser.email,
    fullName: newUser.fullName,
    phone: newUser.phone
  });
});

app.post("/api/auth/login", (req, res) => {
  const db = readDB();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e palavra-passe são obrigatórios." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.users.find((u: any) => u.email === cleanEmail);

  if (!user || user.password !== password) {
    return res.status(400).json({ error: "E-mail ou palavra-passe incorretos." });
  }

  res.json({
    email: user.email,
    fullName: user.fullName,
    phone: user.phone
  });
});

// 1. Get Categories
app.get("/api/categories", (req, res) => {
  const db = readDB();
  res.json(db.categories);
});

// 2. Get Banners
app.get("/api/banners", (req, res) => {
  const db = readDB();
  res.json(db.banners.filter((b: Banner) => b.isActive));
});

app.post("/api/banners", (req, res) => {
  const db = readDB();
  const banner = req.body;
  if (!banner.id) banner.id = `ban-${Date.now()}`;
  db.banners.push(banner);
  writeDB(db);
  res.json(banner);
});

app.delete("/api/banners/:id", (req, res) => {
  const db = readDB();
  db.banners = db.banners.filter((b: any) => b.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 3. Get Coupons
app.get("/api/coupons", (req, res) => {
  const db = readDB();
  res.json(db.coupons);
});

app.post("/api/coupons", (req, res) => {
  const db = readDB();
  const coupon = req.body;
  db.coupons = db.coupons.filter((c: any) => c.code !== coupon.code);
  db.coupons.push(coupon);
  writeDB(db);
  res.json(coupon);
});

app.delete("/api/coupons/:code", (req, res) => {
  const db = readDB();
  db.coupons = db.coupons.filter((c: any) => c.code !== req.params.code);
  writeDB(db);
  res.json({ success: true });
});

// 4. Get Products (with Search & Filters)
app.get("/api/products", (req, res) => {
  const db = readDB();
  let productsList: Product[] = db.products;

  const { search, category, origin, sort, minPrice, maxPrice } = req.query;

  // Filter by category
  if (category) {
    const catStr = String(category).toLowerCase();
    productsList = productsList.filter(
      p => p.category.toLowerCase() === catStr || p.category.toLowerCase().includes(catStr)
    );
  }

  // Filter by origin (Shein or AliExpress)
  if (origin) {
    productsList = productsList.filter(p => p.origin.toLowerCase() === String(origin).toLowerCase());
  }

  // Filter by search string
  if (search) {
    const searchStr = String(search).toLowerCase();
    productsList = productsList.filter(
      p => p.name.toLowerCase().includes(searchStr) || 
           p.description.toLowerCase().includes(searchStr) ||
           p.category.toLowerCase().includes(searchStr)
    );
  }

  // Price range filter
  if (minPrice) {
    productsList = productsList.filter(p => p.priceKz >= Number(minPrice));
  }
  if (maxPrice) {
    productsList = productsList.filter(p => p.priceKz <= Number(maxPrice));
  }

  // Sorting
  if (sort) {
    if (sort === "price_asc") {
      productsList.sort((a, b) => a.priceKz - b.priceKz);
    } else if (sort === "price_desc") {
      productsList.sort((a, b) => b.priceKz - a.priceKz);
    } else if (sort === "rating") {
      productsList.sort((a, b) => b.rating - a.rating);
    } else if (sort === "popular") {
      productsList.sort((a, b) => b.salesCount - a.salesCount);
    } else if (sort === "recent") {
      productsList.sort((a, b) => b.deliveryDays - a.deliveryDays); // simple mock for novelty
    }
  }

  res.json(productsList);
});

// Get single product
app.get("/api/products/:id", (req, res) => {
  const db = readDB();
  const product = db.products.find((p: Product) => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Create product manually
app.post("/api/products", (req, res) => {
  const db = readDB();
  const product = req.body;
  if (!product.id) product.id = `prod-${Date.now()}`;
  
  // Calculate price with markup
  const prices = convertUSDToKz(product.priceUSD);
  product.priceKz = prices.kz;
  
  if (!product.reviews || product.reviews.length === 0) {
    product.reviews = generateReviews(product.category.toLowerCase().includes("moda") ? "moda" : "tech", 3);
  }

  db.products.unshift(product);
  writeDB(db);
  res.json(product);
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const db = readDB();
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 5. Intelligent AI Search (Shein/AliExpress Bridge using Gemini)
app.post("/api/search/ai", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  const db = readDB();

  // If Gemini is not set up, we return a smart simulated generator to keep things running beautifully
  if (!aiClient) {
    console.log("Using local simulation for AI Search");
    const simulatedProducts = generateSimulatedAIProducts(query, db.categories);
    return res.json(simulatedProducts);
  }

  try {
    const prompt = `You are the e-commerce AI assistant of Ango Express, an Angolan platform.
The user is searching for "${query}" on AliExpress or Shein.
Generate a JSON array of exactly 2 simulated products that represent realistic, highly popular items the user might find on those platforms. 

Follow these rules:
1. Translate or align the search with either Shein (mostly fashion, clothes, bags, home blankets) or AliExpress (electronics, gadgets, watches, smart home, automotive, tools).
2. Each product must be represented as a JSON object with:
   - id: string starting with "prod-ai-" followed by a random slug
   - name: beautiful Portuguese title (e.g. "Relógio Desportivo Inteligente à Prova de Água", "Vestido de Festa Longo Elegante")
   - description: engaging Portuguese product description detailing why it is high quality
   - category: select one of these exact categories: ${db.categories.map((c: any) => c.subcategories).flat().slice(0, 40).join(", ")}
   - origin: "Shein" or "AliExpress"
   - priceUSD: a realistic USD original price (e.g. between $6.00 and $120.00)
   - images: 2 high-quality Unsplash image URLs related directly to the product. Use standard Unsplash search term URLs like: "https://images.unsplash.com/photo-X?auto=format&fit=crop&w=600&q=80" where X is a real photo ID or keyword search related to the product
   - rating: a realistic rating between 4.4 and 4.9
   - salesCount: realistic high number e.g. 500-12000
   - stock: realistic number e.g. 30-500
   - deliveryDays: between 14 and 25
   - variations: object with "colors" (array of strings, in Portuguese) and "sizes" (array of strings) or "models" (array of strings)
   - freeShipping: true
   - specifications: Record of key-value pairs in Portuguese (e.g. "Material": "Algodão", "Garantia": "12 meses")
   - reviews: Array of 2 reviews with:
     - id: "rev-ai-X"
     - authorName: realistic Angolan first name & last initial (e.g., "Manuel S.", "Joana D.", "Eurico K.", "Fátima M.")
     - country: "Angola (Luanda)", "Angola (Benguela)", "Angola (Cabinda)", "Angola (Huambo)", or "Angola (Lubango)"
     - rating: 4 or 5
     - comment: review text in Portuguese, mentioning they bought from Angola, the delivery time, how they paid in Kwanzas, and how happy they are
     - date: "12/07/2026" (or similar date)
     - avatar: a beautiful Unsplash portrait avatar or empty

Return ONLY the JSON array. Do not wrap it in markdown code blocks or extra text. Make sure the JSON is perfectly valid.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const jsonText = response.text || "[]";
    const parsedProducts = JSON.parse(jsonText.trim());

    // Inject Kwanza calculated prices
    const productsWithPrices = parsedProducts.map((p: any) => {
      const prices = convertUSDToKz(p.priceUSD);
      return {
        ...p,
        priceKz: prices.kz,
        freeShipping: true // standard requirement
      };
    });

    // Save these generated products to the db so they are search-retrievable and can be ordered!
    db.products.push(...productsWithPrices);
    writeDB(db);

    res.json(productsWithPrices);
  } catch (error) {
    console.error("Error in Gemini AI Search:", error);
    // Fallback to high-quality local generator
    const simulatedProducts = generateSimulatedAIProducts(query, db.categories);
    res.json(simulatedProducts);
  }
});

// Helper to generate simulated products when API Key is missing or fails
function generateSimulatedAIProducts(query: string, categories: any[]): Product[] {
  const isFashion = /vestido|blusa|roupa|moletom|calça|casaco|shein|moda|bolsa|sapato|saia/i.test(query);
  const origin = isFashion ? "Shein" : "AliExpress";
  const subcats = categories.map((c: any) => c.subcategories).flat();
  const category = isFashion ? "Moletons Femininos" : "Telemóveis & Acessórios";
  
  const p1_usd = Math.round(15 + Math.random() * 45);
  const p2_usd = Math.round(50 + Math.random() * 80);

  const product1: Product = {
    id: `prod-ai-sim-1-${Date.now()}`,
    name: `${query.charAt(0).toUpperCase() + query.slice(1)} Premium Importado ${origin}`,
    description: `Este produto representa a melhor escolha em "${query}" directamente importado do marketplace internacional ${origin}. Fabricado com materiais de primeira qualidade e disponível para envio imediato. Totalmente elegível para compra em Kwanzas com taxas inclusas.`,
    category,
    origin,
    priceUSD: p1_usd,
    priceKz: convertUSDToKz(p1_usd).kz,
    images: [
      isFashion 
        ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
        : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.8,
    salesCount: 850,
    stock: 120,
    deliveryDays: 16,
    variations: {
      colors: ["Preto", "Branco Clássico", "Azul Marinho"],
      sizes: ["S", "M", "L", "XL"]
    },
    freeShipping: true,
    specifications: {
      "Material": isFashion ? "Algodão & Poliéster" : "Liga de Alumínio & Plástico Reforçado",
      "Origem": `${origin} Internacional`,
      "Envio": "Internacional Grátis com Rastreamento",
      "Garantia": "Garantia de Entrega Ango Express"
    },
    reviews: generateReviews(isFashion ? "moda" : "tech", 2)
  };

  const product2: Product = {
    id: `prod-ai-sim-2-${Date.now()}`,
    name: `${query.charAt(0).toUpperCase() + query.slice(1)} Pro Conforto Ultra ${origin}`,
    description: `A versão Pro de luxo de "${query}" de alta procura na ${origin}. Possui características aprimoradas, acabamento sofisticado e excelente índice de avaliações por compradores africanos. Uma solução de alto desempenho trazida pela Ango Express.`,
    category,
    origin,
    priceUSD: p2_usd,
    priceKz: convertUSDToKz(p2_usd).kz,
    images: [
      isFashion
        ? "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"
        : "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.9,
    salesCount: 1940,
    stock: 45,
    deliveryDays: 14,
    variations: {
      colors: ["Cinzento Especial", "Vermelho Rubi"],
      models: ["Edição Standard", "Edição Pro Completa"]
    },
    freeShipping: true,
    specifications: {
      "Certificação": "Internacional CE / Shein Quality Verified",
      "Durabilidade": "Classificação de alta resistência",
      "Modelo": "Edição Especial 2026",
      "Peso": "Leve e Ergonómico"
    },
    reviews: generateReviews(isFashion ? "moda" : "tech", 2)
  };

  return [product1, product2];
}

// 6. Orders Management (Client placement and Admin view)
app.get("/api/orders", (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// Get orders for a specific phone (client order lookup)
app.get("/api/orders/customer/:phone", (req, res) => {
  const db = readDB();
  const customerOrders = db.orders.filter(
    (o: Order) => o.customer.phone.replace(/\s+/g, "") === req.params.phone.replace(/\s+/g, "")
  );
  res.json(customerOrders);
});

// Place order
app.post("/api/orders", (req, res) => {
  const db = readDB();
  const { customer, items, subtotalKz, discountKz, totalKz, paymentMethod } = req.body;

  if (!customer || !items || items.length === 0) {
    return res.status(400).json({ error: "Dados incompletos para criação do pedido" });
  }

  // Create internal order code e.g. AE-84321-AO
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const orderId = `AE-${randNum}-AO`;

  const newOrder: Order = {
    id: orderId,
    customer,
    items,
    subtotalKz,
    discountKz,
    totalKz,
    paymentMethod,
    orderStatus: "pending", // Default to Pagamento pendente
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);

  // LOG PURCHASE NOTIFICATION FOR promindset520@gmail.com
  if (!db.notifications) {
    db.notifications = [];
  }
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: "purchase",
    message: `📧 [E-mail para Admin] Novo pedido ${orderId} realizado por ${customer.fullName} (${customer.phone}). Método: ${paymentMethod}. Total: ${totalKz} Kz.`,
    timestamp: new Date().toISOString(),
    email: "promindset520@gmail.com",
    read: false
  });

  writeDB(db);

  // Auto-reduce stock of products
  db.products = db.products.map((p: Product) => {
    const itemOrdered = items.find((it: any) => it.productId === p.id);
    if (itemOrdered) {
      return {
        ...p,
        stock: Math.max(0, p.stock - itemOrdered.quantity),
        salesCount: p.salesCount + itemOrdered.quantity
      };
    }
    return p;
  });
  writeDB(db);

  res.json(newOrder);
});

// Update order status or tracking code (Admin action - patch endpoint)
app.patch("/api/orders/:id", (req, res) => {
  const db = readDB();
  const { orderStatus, trackingCode, notes, trackingHistory } = req.body;
  
  const orderIndex = db.orders.findIndex((o: Order) => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }

  const updatedOrder = {
    ...db.orders[orderIndex],
    ...(orderStatus && { orderStatus }),
    ...(trackingCode !== undefined && { trackingCode }),
    ...(notes !== undefined && { notes }),
    ...(trackingHistory !== undefined && { trackingHistory })
  };

  db.orders[orderIndex] = updatedOrder;
  writeDB(db);
  res.json(updatedOrder);
});

// Handle order status update via POST (from client-side App.tsx)
app.post("/api/orders/:id/status", (req, res) => {
  const db = readDB();
  const { status, trackingCode, notes, trackingHistory } = req.body;
  
  const orderIndex = db.orders.findIndex((o: Order) => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }

  const updatedOrder = {
    ...db.orders[orderIndex],
    ...(status && { orderStatus: status }),
    ...(trackingCode !== undefined && { trackingCode }),
    ...(notes !== undefined && { notes }),
    ...(trackingHistory !== undefined && { trackingHistory })
  };

  db.orders[orderIndex] = updatedOrder;
  writeDB(db);
  res.json(updatedOrder);
});

// Handle receipt submission POST (from client-side App.tsx)
app.post("/api/orders/:id/receipt", (req, res) => {
  const db = readDB();
  const { reference, fileAttached } = req.body;

  const orderIndex = db.orders.findIndex((o: Order) => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }

  const updatedOrder = {
    ...db.orders[orderIndex],
    orderStatus: "confirmed", // Auto-confirm or advance status
    notes: `Comprovativo enviado pelo cliente. Ref: ${reference || "N/D"}. Anexo: ${fileAttached ? "Sim" : "Não"}`
  };

  db.orders[orderIndex] = updatedOrder;

  // Notification for receipt submission
  if (!db.notifications) {
    db.notifications = [];
  }
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: "purchase",
    message: `📧 [E-mail para Admin] Comprovativo de pagamento submetido para o pedido ${req.params.id}. Ref: ${reference || "N/D"}`,
    timestamp: new Date().toISOString(),
    email: "promindset520@gmail.com",
    read: false
  });

  writeDB(db);
  res.json(updatedOrder);
});

// Log cart addition notification (simulated email dispatch)
app.post("/api/admin/notify-cart-addition", (req, res) => {
  const db = readDB();
  const { productName, priceKz, quantity } = req.body;

  if (!db.notifications) {
    db.notifications = [];
  }

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: "cart_addition",
    message: `📧 [E-mail para Admin] Um cliente adicionou ao carrinho: "${productName}" (${quantity} unidade(s) x ${priceKz} Kz)`,
    timestamp: new Date().toISOString(),
    email: "promindset520@gmail.com",
    read: false
  });

  writeDB(db);
  res.json({ success: true });
});

// Retrieve notifications list (simulated email inbox for promindset520@gmail.com)
app.get("/api/admin/notifications", (req, res) => {
  const db = readDB();
  res.json(db.notifications || []);
});

// Clear notifications
app.post("/api/admin/notifications/clear", (req, res) => {
  const db = readDB();
  db.notifications = [];
  writeDB(db);
  res.json({ success: true });
});

// Delete order
app.delete("/api/orders/:id", (req, res) => {
  const db = readDB();
  db.orders = db.orders.filter((o: any) => o.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// 7. Admin Settings & Billing Stats
app.get("/api/settings", (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

app.post("/api/settings", (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

app.get("/api/admin/stats", (req, res) => {
  const db = readDB();
  const orders: Order[] = db.orders;

  let totalSalesKz = 0;
  let totalOrdersCount = orders.length;
  let pendingOrdersCount = 0;
  let completedOrdersCount = 0;

  const ordersByStatus: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    purchased: 0,
    preparing: 0,
    shipped: 0,
    transit: 0,
    arrived_angola: 0,
    distribution: 0,
    delivered: 0
  };

  const salesByOrigin: Record<string, number> = {
    AliExpress: 0,
    Shein: 0
  };

  orders.forEach(order => {
    // Only count sales for confirmed payments onwards
    if (order.orderStatus !== "pending") {
      totalSalesKz += order.totalKz;
    }

    if (order.orderStatus === "pending") {
      pendingOrdersCount++;
    } else if (order.orderStatus === "delivered") {
      completedOrdersCount++;
    }

    ordersByStatus[order.orderStatus] = (ordersByStatus[order.orderStatus] || 0) + 1;

    // Calculate sales by origin
    order.items.forEach(item => {
      salesByOrigin[item.origin] = (salesByOrigin[item.origin] || 0) + (item.priceKz * item.quantity);
    });
  });

  res.json({
    totalSalesKz,
    totalOrdersCount,
    pendingOrdersCount,
    completedOrdersCount,
    ordersByStatus,
    salesByOrigin,
    recentOrders: orders.slice(0, 5)
  });
});

// Vite Server Configuration for Dev & Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ango Express Server running on port ${PORT}`);
  });
}

startServer();
