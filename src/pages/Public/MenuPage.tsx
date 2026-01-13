import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { Menu, MenuCategory } from "../../types";
import { useCart } from "../../context/CartContext";
import { formatCurrency, formatMenuCategory } from "../../utils/formatters";
import MenuCard from "../../components/ui/card/MenuCard";
import Button from "../../components/ui/button/Button";
import { menuApi } from "../../services/api";

// Carousel images for cafe advertising
const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop",
    title: "Selamat Datang di Ruang Dugamasa",
    subtitle: "Nikmati kopi terbaik dengan suasana nyaman"
  },
  {
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=400&fit=crop",
    title: "Promo Spesial Hari Ini",
    subtitle: "Diskon 20% untuk semua menu kopi"
  },
  {
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&h=400&fit=crop",
    title: "Reservasi Mudah & Cepat",
    subtitle: "Pesan meja Anda sekarang juga"
  }
];

const MenuPage: React.FC = () => {
  const { addItem, cartItems, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);

  // Variant selection bottom sheet state
  const [showVariantSheet, setShowVariantSheet] = useState(false);
  const [selectedMenuForVariant, setSelectedMenuForVariant] = useState<Menu | null>(null);
  const [selectedSugar, setSelectedSugar] = useState<"less" | "normal" | "plus">("normal");
  const [selectedIce, setSelectedIce] = useState<"less" | "normal" | "plus">("normal");
  const [variantQuantity, setVariantQuantity] = useState(1);

  // API state
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menus from API
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        console.log("📡 Fetching menus from API...");
        setLoading(true);
        setError(null);
        const response = await menuApi.getMenus({
          available_only: true,
        });

        console.log("📦 API Response received:", response);
        console.log("response.success:", response.success);
        console.log("response.data:", response.data);
        console.log("response.data type:", typeof response.data);
        console.log("Is response.data an array?", Array.isArray(response.data));

        if (response.success && response.data) {
          // Ensure data is an array
          const menuData = Array.isArray(response.data) ? response.data : [];
          console.log("✅ Setting menus to state:", menuData);
          console.log("menuData.length:", menuData.length);
          setMenus(menuData);
          console.log("✅ State set complete");
        } else {
          console.log("❌ Response not successful or no data");
          setError(response.error || "Failed to fetch menus");
        }
      } catch (err) {
        console.log("❌ Error caught:", err);
        setError("Failed to connect to server");
        console.error("Error fetching menus:", err);
      } finally {
        console.log("🏁 Setting loading to false");
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  // Filter menus
  const filteredMenus = useMemo(() => {
    console.log("🔍 Filtering menus...");
    console.log("menus state:", menus);
    console.log("menus.length:", menus.length);
    console.log("selectedCategory:", selectedCategory);
    console.log("searchQuery:", searchQuery);

    // Ensure menus is always an array
    if (!Array.isArray(menus)) {
      console.log("❌ Not an array!");
      return [];
    }

    let filtered = menus;
    console.log("✅ Starting with", filtered.length, "menus");

    if (selectedCategory !== "all") {
      filtered = filtered.filter((menu) => menu.category === selectedCategory);
      console.log("After category filter:", filtered.length);
    }

    if (searchQuery) {
      filtered = filtered.filter((menu) =>
        menu.menu_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("After search filter:", filtered.length);
    }

    const result = filtered.filter((menu) => menu.is_available);
    console.log("After is_available filter:", result.length);
    console.log("Final filtered menus:", result);

    return result;
  }, [menus, selectedCategory, searchQuery]);

  console.log("🎯 Component render:");
  console.log("loading:", loading);
  console.log("error:", error);
  console.log("menus.length:", menus.length);
  console.log("filteredMenus.length:", filteredMenus.length);

  const handleAddToCart = (menu: Menu) => {
    // Open variant selection bottom sheet
    setSelectedMenuForVariant(menu);
    setSelectedSugar("normal");
    setSelectedIce("normal");
    setVariantQuantity(1);
    setShowVariantSheet(true);
  };

  const handleConfirmVariant = () => {
    if (!selectedMenuForVariant) return;
    
    // Add to cart with selected variants
    // TODO: Update addItem to accept variants when API is ready
    addItem(selectedMenuForVariant, variantQuantity);
    
    // Close bottom sheet and reset
    setShowVariantSheet(false);
    setSelectedMenuForVariant(null);
    setSelectedSugar("normal");
    setSelectedIce("normal");
    setVariantQuantity(1);
  };

  const handleIncreaseQuantity = (menuId: number) => {
    const item = cartItems.find((item) => item.menu.id === menuId);
    if (item) {
      updateQuantity(menuId, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (menuId: number) => {
    const item = cartItems.find((item) => item.menu.id === menuId);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(menuId, item.quantity - 1);
      } else {
        removeItem(menuId);
      }
    }
  };



  const getItemQuantity = (menuId: number) => {
    const item = cartItems.find((item) => item.menu.id === menuId);
    return item ? item.quantity : 0;
  };

  // Get category color based on menu category
  const getCategoryColor = (category: MenuCategory) => {
    switch (category) {
      case "drink":
        return "bg-blue-700"; // Blue for drinks
      case "food":
        return "bg-brand-500"; // Orange for food
      case "dessert":
        return "bg-red-700"; // Pink for dessert
      default:
        return "bg-brand-500"; // Default brand color
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Carousel */}
        <div className="relative mb-4 mt-6 overflow-hidden rounded-2xl">
          <div className="relative h-64 sm:h-80 md:h-96">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                  <h2 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">{image.title}</h2>
                  <p className="text-sm sm:text-base md:text-lg">{image.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-lg transition hover:bg-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-lg transition hover:bg-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition ${index === currentSlide ? "bg-white w-8" : "bg-white/50"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="mb-2 py-4">
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
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${selectedCategory === "all"
                ? "bg-brand-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedCategory("drink")}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${selectedCategory === "drink"
                ? "bg-brand-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              Minuman
            </button>
            <button
              onClick={() => setSelectedCategory("food")}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${selectedCategory === "food"
                ? "bg-brand-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              Makanan
            </button>
            <button
              onClick={() => setSelectedCategory("dessert")}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${selectedCategory === "dessert"
                ? "bg-brand-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              Dessert
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat menu...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-16 text-center">
            <svg
              className="mx-auto h-16 w-16 text-error-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Gagal memuat menu
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-brand-500 px-6 py-2 text-white transition hover:bg-brand-600"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Menu Grid - 2 columns on mobile, 2 on sm, 3 on lg, 5 on xl */}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
            {filteredMenus.map((menu) => {
              return (
                <MenuCard key={menu.id}>
                  <div className="flex flex-col">
                    {/* Image - No padding, full width */}
                    <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-100">
                      <img
                        src={menu.image_url || "https://via.placeholder.com/400x300"}
                        alt={menu.menu_name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-3 top-3">
                        <span className={`inline-flex rounded-full ${getCategoryColor(menu.category)} px-3 py-1 text-[0.6rem] xl:text-xs font-medium text-white`}>
                          {formatMenuCategory(menu.category)}
                        </span>
                      </div>
                    </div>

                    {/* Content - With padding */}
                    <div className="px-3 pb-3 pt-3 flex flex-1 flex-col sm:px-4 sm:pb-4">
                      {/* Title - Single line with ellipsis */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 min-h-[1.75rem]">
                        {menu.menu_name}
                      </h3>
                      
                      {/* Description - Always takes 2 lines of space */}
                      {/* <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                        {menu.description}
                      </p> */}
                      
                      {/* Price and Button - Pushed to bottom */}
                      <div className="mt-auto pt-0">
                        <div className="mb-3 text-md xl:text-xl font-bold text-brand-500">
                          {formatCurrency(menu.price)}
                        </div>
                        <button
                          onClick={() => handleAddToCart(menu)}
                          className="w-full rounded-full border-2 border-brand-500 bg-white px-2 xl:px-4 py-1 xl:py-2 text-md font-medium text-brand-500 transition hover:bg-brand-600 hover:text-white"
                        >
                          Pesan
                        </button>
                      </div>
                    </div>
                  </div>
                </MenuCard>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredMenus.length === 0 && (
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
              <button
                onClick={() => setShowCartModal(true)}
                className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-2 transition hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="relative">
                  <svg className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    {totalItems}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {totalItems} item{totalItems > 1 ? "s" : ""}
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalPrice)}
                  </div>
                </div>
              </button>
              <Link to="/reservation">
                <Button size="md">Lanjut ke Reservasi</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {showCartModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-dark sm:rounded-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Keranjang Belanja ({totalItems} item{totalItems > 1 ? "s" : ""})
                </h3>
                <button
                  onClick={() => setShowCartModal(false)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {cartItems.map((item) => (
                  <div key={item.menu.id} className="mb-4 flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <img
                      src={item.menu.image_url || "https://via.placeholder.com/80"}
                      alt={item.menu.menu_name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.menu.menu_name}</h4>
                      <p className="text-sm text-brand-500">{formatCurrency(item.menu.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleDecreaseQuantity(item.menu.id)}
                          className="flex h-7 w-7 items-center justify-center rounded bg-error-500 text-white transition hover:bg-error-600"
                        >
                          {item.quantity === 1 ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </button>
                        <span className="flex h-7 min-w-[2.5rem] items-center justify-center rounded bg-brand-50 px-2 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(item.menu.id)}
                          className="flex h-7 w-7 items-center justify-center rounded bg-brand-500 text-white transition hover:bg-brand-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.menu.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-brand-500">{formatCurrency(totalPrice)}</span>
                </div>
                <Link to="/reservation" onClick={() => setShowCartModal(false)}>
                  <Button className="w-full" size="md">Lanjut ke Reservasi</Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Variant Selection Bottom Sheet */}
        {showVariantSheet && selectedMenuForVariant && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-dark sm:rounded-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-dark border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pilih Varian
                </h3>
                <button
                  onClick={() => setShowVariantSheet(false)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Info */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-3">
                  <img
                    src={selectedMenuForVariant.image_url || "https://via.placeholder.com/80"}
                    alt={selectedMenuForVariant.menu_name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {selectedMenuForVariant.menu_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {selectedMenuForVariant.description}
                    </p>
                    <p className="mt-1 text-lg font-bold text-brand-500">
                      {formatCurrency(selectedMenuForVariant.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant Options */}
              <div className="p-4 space-y-6">
                {/* Sugar Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Tingkat Gula
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["less", "normal", "plus"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedSugar(level)}
                        className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition ${
                          selectedSugar === level
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                            : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        {level === "less" ? "Kurang Manis" : level === "normal" ? "Normal" : "Lebih Manis"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ice Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Tingkat Es
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["less", "normal", "plus"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedIce(level)}
                        className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition ${
                          selectedIce === level
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                            : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        {level === "less" ? "Sedikit Es" : level === "normal" ? "Normal" : "Banyak Es"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Jumlah
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setVariantQuantity(Math.max(1, variantQuantity - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-200 text-gray-700 transition hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-300"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="flex h-10 min-w-[4rem] items-center justify-center rounded-lg bg-gray-50 px-4 text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                      {variantQuantity}
                    </span>
                    <button
                      onClick={() => setVariantQuantity(variantQuantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-brand-500 text-brand-500 transition hover:bg-brand-500 hover:text-white"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-dark border-t border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-xl font-bold text-brand-500">
                    {formatCurrency(selectedMenuForVariant.price * variantQuantity)}
                  </span>
                </div>
                <Button 
                  className="w-full" 
                  size="md"
                  onClick={handleConfirmVariant}
                >
                  Tambah ke Keranjang
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
