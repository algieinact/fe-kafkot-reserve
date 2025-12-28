import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import { Menu, MenuCategory } from "../../types";
import { mockMenus } from "../../data/mockData";
import { useCart } from "../../context/CartContext";
import { formatCurrency, formatMenuCategory } from "../../utils/formatters";
import { Card } from "../../components/ui/card";
import Button from "../../components/ui/button/Button";

const MenuPage: React.FC = () => {
  const { addItem, cartItems, totalItems, totalPrice } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter menus
  const filteredMenus = useMemo(() => {
    let filtered = mockMenus;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((menu) => menu.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((menu) =>
        menu.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.filter((menu) => menu.is_available);
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (menu: Menu) => {
    addItem(menu, 1);
  };

  const getItemQuantity = (menuId: string) => {
    const item = cartItems.find((item) => item.menu.id === menuId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Menu Kami</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Pilih menu favorit Anda untuk reservasi
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-dark dark:text-white"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                selectedCategory === "all"
                  ? "bg-brand-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedCategory(MenuCategory.DRINK)}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                selectedCategory === MenuCategory.DRINK
                  ? "bg-brand-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Minuman
            </button>
            <button
              onClick={() => setSelectedCategory(MenuCategory.FOOD)}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                selectedCategory === MenuCategory.FOOD
                  ? "bg-brand-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Makanan
            </button>
            <button
              onClick={() => setSelectedCategory(MenuCategory.DESSERT)}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                selectedCategory === MenuCategory.DESSERT
                  ? "bg-brand-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Dessert
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMenus.map((menu) => {
            const quantity = getItemQuantity(menu.id);
            return (
              <Card key={menu.id}>
                <div className="flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={menu.image_url || "https://via.placeholder.com/400x300"}
                      alt={menu.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-2 top-2">
                      <span className="inline-flex rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                        {formatMenuCategory(menu.category)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-4 flex flex-1 flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {menu.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {menu.description}
                    </p>
                    <div className="mt-auto pt-4">
                      <div className="mb-3 text-xl font-bold text-brand-500">
                        {formatCurrency(menu.price)}
                      </div>
                      {quantity > 0 ? (
                        <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-500/10">
                          <span className="text-sm font-medium text-brand-700 dark:text-brand-400">
                            {quantity}x di keranjang
                          </span>
                          <button
                            onClick={() => handleAddToCart(menu)}
                            className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(menu)}
                          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
                        >
                          Tambah ke Keranjang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMenus.length === 0 && (
          <div className="py-16 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Menu tidak ditemukan
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Coba cari dengan kata kunci lain atau pilih kategori berbeda
            </p>
          </div>
        )}

        {/* Floating Cart Summary */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-dark">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {totalItems} item{totalItems > 1 ? "s" : ""} di keranjang
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalPrice)}
                </div>
              </div>
              <Link to="/reservation">
                <Button size="md">Lanjut ke Reservasi</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
