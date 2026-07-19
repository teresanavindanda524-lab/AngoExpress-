/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Banner, Coupon } from "./types";

// Conversao de precos
export const MARKUP_FACTOR = 1.07; // +7%
export const EXCHANGE_RATE = 1170; // 1 USD = 1170 Kz

export function convertUSDToKz(usd: number): { usdWithMarkup: number; kz: number } {
  const usdWithMarkup = usd * MARKUP_FACTOR;
  const kz = Math.round(usdWithMarkup * EXCHANGE_RATE);
  return { usdWithMarkup, kz };
}

export function formatKz(val: number): string {
  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(val).replace("AOA", "Kz");
}

export function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

// Categorias organizadas (Centenas de categorias simuladas em estrutura hierarquica)
export interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryGroup[] = [
  {
    id: "moda-feminina",
    name: "Moda Feminina",
    icon: "ShoppingBag",
    subcategories: [
      "Vestidos", "Blusas & Tops", "Moletons Femininos", "Casacos & Jaquetas", "Calças", "Saias", "Shorts", 
      "Conjuntos", "Macacões", "Moda de Praia", "Ringer T-shirts", "Lingerie", "Roupa de Noite", "Blazers"
    ]
  },
  {
    id: "moda-masculina",
    name: "Moda Masculina",
    icon: "Shirt",
    subcategories: [
      "Moletons Masculinos", "Camisas & Polos", "T-shirts", "Casacos", "Calças Jeans", "Calções", "Fatos de Treino",
      "Roupas de Cama & Banho", "Roupa Interior", "Blazers Masculinos", "Sobretudos", "Parkas", "Camisolas de Lã"
    ]
  },
  {
    id: "calcado",
    name: "Calçado",
    icon: "Footprints",
    subcategories: [
      "Sapatilhas Desportivas", "Sapatos Sociais", "Saltos Altos", "Sandálias", "Botas", "Mocassins",
      "Sapatos de Lona", "Chinelos", "Calçado de Bebé", "Calçado de Proteção", "Chuteiras", "Sapatilhas Casuais"
    ]
  },
  {
    id: "telemoveis",
    name: "Telemóveis & Acessórios",
    icon: "Smartphone",
    subcategories: [
      "Smartphones Android", "iPhones", "Capas Protetoras", "Películas de Vidro", "Carregadores Rápidos", 
      "Cabos USB", "Powerbanks", "Suportes para Carro", "Cartões de Memória", "Peças de Reposição"
    ]
  },
  {
    id: "computadores",
    name: "Computadores & Escritório",
    icon: "Laptop",
    subcategories: [
      "Laptops", "Tablets", "Teclados Mecânicos", "Ratos sem Fios", "Monitores Gaming", "Pendrives",
      "Discos Externos", "Componentes PC", "Impressoras", "Acessórios de Escritório", "Cabos de Rede"
    ]
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: "Gamepad2",
    subcategories: [
      "Consolas", "Comandos & Joysticks", "Auscultadores Gaming", "Cadeiras Gaming", "Teclados de Jogo",
      "Tapetes de Rato RGB", "Acessórios PS5", "Acessórios Xbox", "Placas de Captura"
    ]
  },
  {
    id: "relogios-joias",
    name: "Relógios, Colares & Joias",
    icon: "Watch",
    subcategories: [
      "Relógios Inteligentes (Smartwatches)", "Relógios de Luxo", "Relógios Desportivos", "Colares de Prata",
      "Anéis de Noivado", "Brincos de Ouro", "Pulseiras", "Joias Unissexo", "Organizadores de Joias"
    ]
  },
  {
    id: "beleza-saude",
    name: "Beleza & Saúde",
    icon: "Sparkles",
    subcategories: [
      "Maquilhagem", "Cuidados com a Pele", "Secadores de Cabelo", "Modeladores", "Perfumes",
      "Massajadores", "Escovas de Dentes Elétricas", "Termómetros", "Suplementos", "Aparadores de Barba"
    ]
  },
  {
    id: "casa-cozinha",
    name: "Casa, Cozinha & Cobertas",
    icon: "Home",
    subcategories: [
      "Utensílios de Cozinha", "Panelas & Frigideiras", "Cobertas & Edredons", "Almofadas Decorativas",
      "Organizadores de Casa", "Decoração de Parede", "Toalhas", "Cortinas", "Copos & Canecas"
    ]
  },
  {
    id: "smart-home-iluminacao",
    name: "Smart Home & Iluminação",
    icon: "Lightbulb",
    subcategories: [
      "Lâmpadas Inteligentes", "Fitas LED RGB", "Câmaras de Segurança Wi-Fi", "Sensores de Movimento",
      "Interruptores Inteligentes", "Dispositivos Alexa/Google Home", "Luminárias de Mesa", "Projetores de Estrelas"
    ]
  },
  {
    id: "bolsas-mochilas",
    name: "Bolsas & Mochilas",
    icon: "Briefcase",
    subcategories: [
      "Mochilas Escolares", "Mochilas de Viagem", "Bolsas de Ombro", "Carteiras Femininas", "Carteiras de Couro",
      "Malas de Viagem", "Bolsas Desportivas", "Mochilas para Portáteis", "Bolsas Transversais"
    ]
  },
  {
    id: "desporto-jardim",
    name: "Desporto & Jardim",
    icon: "Compass",
    subcategories: [
      "Roupa Desportiva", "Equipamentos de Treino", "Garrafas de Água", "Óculos de Ciclismo", "Luvas de Fitness",
      "Sementes & Flores", "Ferramentas de Jardinagem", "Vasos Decorativos", "Mangueiras de Rega"
    ]
  },
  {
    id: "brinquedos-criancas",
    name: "Brinquedos, Crianças & Bebés",
    icon: "Baby",
    subcategories: [
      "Brinquedos Educativos", "Figuras de Ação", "Peluches", "Roupa para Bebé", "Carrinhos de Bebé",
      "Biberões & Chupetas", "Jogos de Tabuleiro", "Puzzles", "Acessórios de Segurança"
    ]
  },
  {
    id: "automoveis-ferramentas",
    name: "Automóvel & Ferramentas",
    icon: "Wrench",
    subcategories: [
      "Ferramentas Manuais", "Aparafusadoras Elétricas", "Acessórios de Carro", "Luzes LED Automóveis",
      "Aspiradores de Pó para Carro", "Carregadores de Bateria", "Suportes OBD2", "Decoração Interior de Carros"
    ]
  }
];

// Comentarios de Africanos simulados (Shein e AliExpress comments)
const AFRICAN_REVIEWS: Record<string, string[]> = {
  moda: [
    "O tamanho ficou perfeito! Comprei de Luanda e chegou super rápido. O tecido do moletom é muito aconchegante, super recomendo para as noites frescas de Angola.",
    "Excelente qualidade! A costura é bem feita. Recomendo comprar um tamanho acima se preferes folgado. Chegou em perfeitas condições em Benguela.",
    "Gostei imenso! O tecido é macio, as cores são iguaizinhas às fotos da Shein. O frete grátis facilitou imenso.",
    "Chegou hoje em Cabinda. Fiz o pagamento por Multicaixa Express e o administrador da Ango Express enviou as atualizações todas. Muito profissional!",
    "Minha esposa adorou o vestido. Perfeito para o clima quente de Luanda, tecido muito fresco e de boa qualidade."
  ],
  tech: [
    "Muito bom mesmo! O som é super limpo e a bateria do relógio dura quase uma semana. Excelente alternativa para quem está em Luanda.",
    "Telemóvel espetacular! Embalagem original, tudo lacrado. Comprar em Kwanzas aqui na AngoExpress foi super simples, sem precisar de cartões internacionais.",
    "A iluminação LED da lâmpada inteligente é ótima e conecta perfeitamente com a Alexa. Ótima compra para o meu quarto em Viana.",
    "Funciona super bem, comprei para o meu filho jogar no PC e ele adorou. Chegou com frete internacional grátis até à central de distribuição em Luanda.",
    "Carregador extremamente rápido, resolveu o meu problema. Excelente atendimento da Ango Express."
  ],
  casa: [
    "As cobertas são de uma suavidade extrema! Muito macias e quentes. Aprovado pela família aqui no Huambo.",
    "Os organizadores ajudaram imenso a arrumar a minha cozinha. Material plástico de alta resistência. Muito satisfeito.",
    "Design moderno e elegante. Fica muito bonito na sala. Recomendo imenso a compra, super prático."
  ]
};

const AFRICAN_NAMES = [
  { name: "Helena G.", country: "Angola (Luanda)", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80" },
  { name: "Mateus J.", country: "Angola (Benguela)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  { name: "Cláudio P.", country: "Angola (Lubango)", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
  { name: "Isabel S.", country: "Angola (Cabinda)", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { name: "Afonso K.", country: "Angola (Viana)", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&q=80" },
  { name: "Teresa N.", country: "Angola (Lobito)", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" },
  { name: "Danilo M.", country: "Moçambique (Maputo)", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80" },
  { name: "Filomena B.", country: "Cabo Verde (Praia)", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80" }
];

export function generateReviews(type: "moda" | "tech" | "casa", count = 4) {
  const reviewsList = AFRICAN_REVIEWS[type];
  const shuffledNames = [...AFRICAN_NAMES].sort(() => 0.5 - Math.random());
  const results = [];
  
  for (let i = 0; i < Math.min(count, shuffledNames.length); i++) {
    const text = reviewsList[Math.floor(Math.random() * reviewsList.length)];
    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
    results.push({
      id: `rev-${type}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      authorName: shuffledNames[i].name,
      country: shuffledNames[i].country,
      rating,
      comment: text,
      date: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-AO"),
      avatar: shuffledNames[i].avatar
    });
  }
  return results;
}

// Seed de produtos de teste iniciais
export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-shein-moletom-01",
    name: "Moletom Feminino de Lã com Capuz Ajustável Casual Conforto",
    description: "Moletom de alta qualidade da Shein, fabricado com mistura de lã e algodão super aconchegante. Possui cordão ajustável, bolso canguru frontal, punhos canelados para ajuste perfeito e interior escovado extremamente macio. Perfeito para looks casuais e dias mais frescos.",
    category: "Moletons Femininos",
    origin: "Shein",
    priceUSD: 18.50,
    priceKz: convertUSDToKz(18.50).kz,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    rating: 4.8,
    salesCount: 1240,
    stock: 45,
    deliveryDays: 18,
    variations: {
      colors: ["Preto Elegante", "Cinzento Mesclado", "Rosa Pastel", "Bege Areia"],
      sizes: ["S (P)", "M", "L (G)", "XL (GG)"]
    },
    freeShipping: true,
    specifications: {
      "Material": "65% Poliéster, 35% Algodão",
      "Tipo de Tecido": "Lã Escovada (Fleece)",
      "Estilo": "Casual / Desportivo",
      "Cuidados de Lavagem": "Lavável à máquina a frio, ciclo suave"
    },
    reviews: generateReviews("moda", 5)
  },
  {
    id: "prod-shein-vestido-02",
    name: "Vestido Elegante de Verão Floral com Costas Abertas e Babados",
    description: "Deslumbre com este vestido longo com padrão floral e alças finas reguláveis. Estilo Shein refinado, com detalhes de folhos e decote cruzado nas costas. Feito de tecido fluido e leve que proporciona excelente respirabilidade e frescura nos dias mais quentes de Angola.",
    category: "Vestidos",
    origin: "Shein",
    priceUSD: 24.99,
    priceKz: convertUSDToKz(24.99).kz,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: null,
    rating: 4.9,
    salesCount: 3410,
    stock: 120,
    deliveryDays: 15,
    variations: {
      colors: ["Vermelho Paixão", "Azul Oceano", "Preto Clássico"],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    freeShipping: true,
    specifications: {
      "Material": "100% Viscose de Seda",
      "Comprimento": "Longo / Maxi",
      "Estampa": "Floral Boho",
      "Transparência": "Não transparente (possui forro duplo)"
    },
    reviews: generateReviews("moda", 4)
  },
  {
    id: "prod-aliexpress-smartwatch-03",
    name: "Smartwatch AMOLED IP68 Monitor de Saúde e GPS Integrado 2026 Edition",
    description: "Relógio inteligente topo de gama do AliExpress com ecrã AMOLED de 1.43 polegadas sempre ativo. Monitor de ritmo cardíaco contínuo, saturação de oxigénio (SpO2), acompanhamento de sono e mais de 120 modos desportivos. IP68 à prova de água e bateria ultra duradoura de até 10 dias.",
    category: "Relógios Inteligentes (Smartwatches)",
    origin: "AliExpress",
    priceUSD: 42.00,
    priceKz: convertUSDToKz(42.00).kz,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    rating: 4.7,
    salesCount: 9850,
    stock: 230,
    deliveryDays: 20,
    variations: {
      colors: ["Preto Carbono", "Prateado Metálico", "Ouro Rosa"],
      models: ["Versão Standard", "Versão Pro (+ Bracelete de Aço Extra)"]
    },
    freeShipping: true,
    specifications: {
      "Ecrã": "1.43\" AMOLED, Resolução 466x466",
      "Bateria": "380 mAh (Até 10 dias de uso médio)",
      "Resistência à água": "IP68 (Suporta natação)",
      "Compatibilidade": "Android 6.0+ / iOS 11.0+"
    },
    reviews: generateReviews("tech", 6)
  },
  {
    id: "prod-shein-moletom-masc-04",
    name: "Moletom Masculino Minimalista de Gola Alta com Fecho Frontal",
    description: "Moletom masculino contemporâneo com fecho zip de alta resistência, gola subida protetora e acabamento interno aveludado de altíssimo conforto. Excelente caimento, mangas raglan e design despojado moderno. Ideal para uso diário ou treinos ao ar livre.",
    category: "Moletons Masculinos",
    origin: "Shein",
    priceUSD: 22.00,
    priceKz: convertUSDToKz(22.00).kz,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: null,
    rating: 4.6,
    salesCount: 890,
    stock: 55,
    deliveryDays: 16,
    variations: {
      colors: ["Preto", "Cinzento Escuro", "Verde Militar", "Branco Pérola"],
      sizes: ["M", "L", "XL", "XXL"]
    },
    freeShipping: true,
    specifications: {
      "Material": "70% Algodão Premium, 30% Poliéster",
      "Espessura": "Média-Alta",
      "Tipo de Fecho": "Zip YKK Metálico",
      "Bolsos": "2 bolsos laterais discretos"
    },
    reviews: generateReviews("moda", 3)
  },
  {
    id: "prod-aliexpress-lampada-05",
    name: "Lâmpada Inteligente LED RGB Wi-Fi Smart Home Compatível Alexa/Google",
    description: "Controle a iluminação da sua casa pelo telemóvel! Esta lâmpada LED inteligente liga-se diretamente à sua rede Wi-Fi de 2.4GHz sem necessidade de hub externo. Suporta 16 milhões de cores, ajuste de branco quente e frio, sincronização rítmica com música e controlo de voz inteligente.",
    category: "Lâmpadas Inteligentes",
    origin: "AliExpress",
    priceUSD: 8.90,
    priceKz: convertUSDToKz(8.90).kz,
    images: [
      "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: null,
    rating: 4.5,
    salesCount: 15400,
    stock: 1200,
    deliveryDays: 22,
    variations: {
      models: ["Casquilho E27 (Mais Comum)", "Casquilho B22 (Baioneta)"],
      colors: ["1 Unidade", "Pacote Económico de 3x", "Pacote Casa Completa 5x"]
    },
    freeShipping: true,
    specifications: {
      "Potência": "9W (Equivalente a 80W incandescente)",
      "Brilho": "850 Lúmenes",
      "Ligação": "Wi-Fi IEEE 802.11 b/g/n 2.4GHz",
      "Vida Útil": "Mais de 30.000 horas"
    },
    reviews: generateReviews("tech", 4)
  },
  {
    id: "prod-aliexpress-auscultador-06",
    name: "Auscultadores Gaming Sem Fio 7.1 Surround Graves Profundos e Microfone",
    description: "Sinta a imersão completa nos seus jogos e músicas favoritas com o auscultador de alta fidelidade e latência zero. Conectividade tripla de alta performance: 2.4Ghz Wireless Dongle, Bluetooth 5.3 e cabo de 3.5mm. Almofadas de espuma de memória macia com isolamento acústico.",
    category: "Auscultadores Gaming",
    origin: "AliExpress",
    priceUSD: 35.50,
    priceKz: convertUSDToKz(35.50).kz,
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    rating: 4.8,
    salesCount: 3120,
    stock: 88,
    deliveryDays: 17,
    variations: {
      colors: ["Preto RGB Matte", "Branco Gelo RGB", "Rosa Neon RGB"]
    },
    freeShipping: true,
    specifications: {
      "Som": "Som Virtual Surround 7.1",
      "Drivers": "Ímanes de Neodímio de 50mm",
      "Microfone": "Unidirecional, Cancelamento de Ruído, Dobrável",
      "Autonomia": "Até 40 horas sem iluminação RGB"
    },
    reviews: generateReviews("tech", 5)
  },
  {
    id: "prod-shein-coberta-07",
    name: "Coberta de Cama Macia de Lã e Veludo Flanela Super Quente",
    description: "Coberta aconchegante de microfibra de alta densidade da Shein. Toque de veludo térmico que preserva a temperatura corporal perfeitamente. Acabamento anti-borboto e anti-estático, hipoalergénico e ideal para camas de casal ou solteiro.",
    category: "Cobertas & Edredons",
    origin: "Shein",
    priceUSD: 29.99,
    priceKz: convertUSDToKz(29.99).kz,
    images: [
      "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: null,
    rating: 4.9,
    salesCount: 2200,
    stock: 40,
    deliveryDays: 19,
    variations: {
      colors: ["Cinzento Chumbo", "Verde Esmeralda", "Bege Quente", "Azul Marinho"],
      sizes: ["Solteiro (150x200cm)", "Casal Standard (200x230cm)", "King Size (220x240cm)"]
    },
    freeShipping: true,
    specifications: {
      "Material": "100% Poliéster Flanela Super Macio",
      "Densidade": "350 GSM (Gramas por Metro Quadrado)",
      "Certificação": "OEKO-TEX Standard 100",
      "Instruções": "Lavar a frio, secar em temperatura baixa"
    },
    reviews: generateReviews("casa", 4)
  },
  {
    id: "prod-aliexpress-telemovel-08",
    name: "Smartphone Android 5G Pro Ecrã de 6.7'' FHD+ Câmara de 108MP",
    description: "Incrível smartphone topo de gama com processador octa-core de última geração, 8GB de RAM física + 8GB virtuais, e 256GB de armazenamento rápido. Câmara principal de 108 Megapixels alimentada por IA para fotografias deslumbrantes mesmo à noite. Ecrã fluido de 120Hz e carregamento de 67W.",
    category: "Smartphones Android",
    origin: "AliExpress",
    priceUSD: 145.00,
    priceKz: convertUSDToKz(145.00).kz,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80"
    ],
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    rating: 4.7,
    salesCount: 4320,
    stock: 95,
    deliveryDays: 24,
    variations: {
      colors: ["Preto Meteoro", "Azul Aurora", "Verde Floresta"],
      models: ["8GB RAM + 256GB ROM", "12GB RAM + 512GB ROM (+ 35 USD)"]
    },
    freeShipping: true,
    specifications: {
      "Ecrã": "6.7 polegadas IPS LCD, 120Hz, FHD+",
      "Processador": "MediaTek Dimensity 7050 Octa-Core",
      "Bateria": "5000 mAh, Carregamento SuperVOOC 67W",
      "Sistema Operativo": "Android 14 com suporte OTA"
    },
    reviews: generateReviews("tech", 8)
  }
];

export const SEED_BANNERS: Banner[] = [
  {
    id: "ban-01",
    title: "Ango Express - Compre em Angola do Seu Jeito!",
    subtitle: "A sua ponte de confiança para a Shein e AliExpress. Compre em Kwanzas, sem burocracias e com frete internacional grátis garantido.",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    link: "moda-feminina",
    isActive: true
  },
  {
    id: "ban-02",
    title: "Especial Shein Angola - Tendências de Moda 2026",
    subtitle: "Moletons, vestidos, calçado e acessórios com os melhores preços. Descontos automáticos de 7% em produtos selecionados.",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    link: "moda-feminina",
    isActive: true
  },
  {
    id: "ban-03",
    title: "Gadgets Inovadores AliExpress - Envio Grátis",
    subtitle: "Smartwatches, fones Bluetooth, lâmpadas inteligentes e acessórios gaming para elevar o seu dia-a-dia tecnológico.",
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80",
    link: "telemoveis",
    isActive: true
  }
];

export const SEED_COUPONS: Coupon[] = [
  {
    code: "BENVINDO10",
    discountType: "percentage",
    value: 10,
    minOrderValueKz: 15000,
    isActive: true
  },
  {
    code: "ANGO5000",
    discountType: "fixed",
    value: 5000,
    minOrderValueKz: 50000,
    isActive: true
  },
  {
    code: "FRETEEXP",
    discountType: "percentage",
    value: 5,
    minOrderValueKz: 10000,
    isActive: true
  }
];
