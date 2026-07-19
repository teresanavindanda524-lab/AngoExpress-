/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { CATEGORIES } from "../data";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  cartCount: number;
  favoritesCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string, useAI: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  userEmail: string | null;
  onLogin: (email: string) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({
  darkMode,
  setDarkMode,
  currentView,
  setCurrentView,
  cartCount,
  favoritesCount,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  selectedCategory,
  setSelectedCategory,
  isAdmin,
  setIsAdmin,
  userEmail,
  onLogin,
  onLogout,
  onOpenAuth
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit(searchQuery, false);
    }
  };

  const handleCategorySelect = (subcat: string) => {
    setSelectedCategory(subcat);
    setCurrentView("home");
    setShowCatDropdown(false);
    onSearchSubmit("", false); // reset search, filter by cat
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-200" id="header-nav">
      {/* Top Banner Alert */}
      <div className="bg-red-600 dark:bg-red-700 text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-2 font-medium" id="top-banner-alert">
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
        <span>Preços originais AliExpress/Shein convertidos em Kwanzas +7%. Envio Internacional Grátis!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => { setCurrentView("home"); setSelectedCategory(""); setSearchQuery(""); }}
            className="flex items-center gap-2 cursor-pointer shrink-0"
            id="logo-container"
          >
            <div className="h-10 w-10 bg-black dark:bg-red-600 flex items-center justify-center rounded-lg shadow-md border border-red-500/10">
              <span className="text-white font-display font-bold text-xl tracking-wider">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl text-black dark:text-white tracking-tight leading-none">
                ANGO<span className="text-red-600">EXPRESS</span>
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono tracking-widest uppercase">
                Intermediário Oficial
              </span>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg items-center relative" id="desktop-search">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pesquise roupas, telemóveis, relógios... pesquisa Shein/AliExpress"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full pl-4 pr-24 py-2 border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-black dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 text-sm transition-all"
              />
              <button
                onClick={() => onSearchSubmit(searchQuery, false)}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400"
                title="Pesquisa Simples"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSearchSubmit(searchQuery, true)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-red-600 text-white hover:bg-red-700 text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm transition-all"
                title="Pesquisa Inteligente usando IA Gemini"
              >
                <Sparkles className="h-3 w-3 animate-bounce" />
                <span>IA</span>
              </button>
            </div>
          </div>

          {/* Right Icons menu */}
          <div className="flex items-center gap-1 sm:gap-3" id="nav-actions">
            
            {/* Category Dropdown Toggle */}
            <div className="relative hidden lg:block">
              <button 
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
                id="cat-dropdown-btn"
              >
                <span>Categorias</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showCatDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-4 grid grid-cols-1 gap-4 max-h-[480px] overflow-y-auto">
                  {CATEGORIES.map((catGroup) => (
                    <div key={catGroup.id} className="border-b border-gray-100 dark:border-zinc-800 pb-2 last:border-b-0 last:pb-0">
                      <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <span>{catGroup.name}</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 dark:text-gray-400">
                        {catGroup.subcategories.slice(0, 6).map((sub) => (
                          <span 
                            key={sub} 
                            onClick={() => handleCategorySelect(sub)}
                            className="cursor-pointer hover:text-red-600 hover:underline py-0.5 truncate"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
              title="Alternar Tema"
              id="theme-toggler"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Favorites Icon */}
            <button
              onClick={() => setCurrentView("favorites")}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
              title="Favoritos"
              id="favorites-nav-btn"
            >
              <Heart className={`h-5 w-5 ${favoritesCount > 0 ? "fill-red-600 text-red-600" : ""}`} />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setCurrentView("cart")}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
              title="Carrinho de Compras"
              id="cart-nav-btn"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Client Area Icon */}
            <button
              onClick={() => setCurrentView("client-area")}
              className={`p-2 rounded-full transition-colors flex items-center gap-1.5 ${
                currentView === "client-area" 
                  ? "bg-red-50 dark:bg-zinc-900 text-red-600" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900"
              }`}
              title="Área de Cliente"
              id="client-nav-btn"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline text-xs font-medium">Acompanhar</span>
            </button>

            {/* Session Identification Status (Required by user instructions) */}
            <button
              onClick={() => {
                if (userEmail) {
                  if (confirm(`Deseja terminar a sessão de "${userEmail}"?`)) {
                    onLogout();
                  }
                } else {
                  onOpenAuth();
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                userEmail 
                  ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/40 dark:text-green-400" 
                  : "bg-gray-50 border-gray-200 text-gray-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 hover:bg-gray-100"
              }`}
              title={userEmail ? `Sessão Iniciada: ${userEmail}` : "Entrar / Iniciar Sessão"}
              id="user-session-btn"
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate">
                {userEmail ? userEmail.split("@")[0] : "Iniciar Sessão"}
              </span>
            </button>

            {/* Admin Panel Toggle - STRICTLY REMOVED / HIDDEN for non-admin e-mails */}
            {userEmail === "promindset520@gmail.com" && (
              <button
                onClick={() => {
                  setIsAdmin(!isAdmin);
                  setCurrentView(isAdmin ? "home" : "admin");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all animate-pulse ${
                  isAdmin 
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow" 
                    : "bg-red-600 border-transparent text-white hover:bg-red-700 font-bold shadow-sm"
                }`}
                id="admin-nav-toggle"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{isAdmin ? "Sair Admin" : "Painel Admin ⭐"}</span>
              </button>
            )}

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full md:hidden"
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu & Search */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-4 py-4 space-y-4 shadow-xl" id="mobile-menu-panel">
          {/* Mobile Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Pesquise roupas, eletrónicos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full pl-4 pr-24 py-2 border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-black dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
            />
            <button
              onClick={() => { onSearchSubmit(searchQuery, false); setMobileMenuOpen(false); }}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => { onSearchSubmit(searchQuery, true); setMobileMenuOpen(false); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-red-600 text-white hover:bg-red-700 text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow"
            >
              <Sparkles className="h-3 w-3 animate-bounce" />
              <span>IA</span>
            </button>
          </div>

          {/* Quick Categories list for Mobile */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">Categorias Populares</h4>
            <div className="grid grid-cols-2 gap-1 px-2">
              {CATEGORIES.map((catGroup) => (
                <button
                  key={catGroup.id}
                  onClick={() => {
                    handleCategorySelect(catGroup.subcategories[0]);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-xs py-1.5 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 truncate"
                >
                  {catGroup.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
