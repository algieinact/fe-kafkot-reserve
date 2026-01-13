import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { Menu, MenuCategory, Banner, MenuWithVariations, SelectedVariation } from "../../types";
import { useCart } from "../../context/CartContext";
import { formatCurrency, formatMenuCategory } from "../../utils/formatters";

import Button from "../../components/ui/button/Button";
import { menuApi, bannerApi } from "../../services/api";

const MenuPage: React.FC = () => {
  const { addItem, cartItems, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);

  // Variation modal state
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedMenuDetail, setSelectedMenuDetail] = useState<MenuWithVariations | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<Record<number, number[]>>({});
  const [modalQuantity, setModalQuantity] = useState(1);


  // API state
  const [menus, setMenus] = useState<Menu[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
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

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerApi.getBanners();

        if (response.success && response.data) {
          setBanners(response.data);
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
        // Don't show error for banners, just use empty array
      }
    };

    fetchBanners();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [banners.length]);

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

  // Helper to handle variation selection
  const handleVariationChange = (groupId: number, optionId: number, type: "single_choice" | "multiple_choice") => {
    setSelectedVariations(prev => {
      if (type === "single_choice") {
        return { ...prev, [groupId]: [optionId] };
      } else {
        const current = prev[groupId] || [];
        const exists = current.includes(optionId);
        if (exists) {
          return { ...prev, [groupId]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [groupId]: [...current, optionId] };
        }
      }
    });
  };

  // Auto-select required single-choice variations when modal opens
  useEffect(() => {
    if (showVariationModal && selectedMenuDetail?.variation_groups) {
      const initialVariations: Record<number, number[]> = {};
      let hasChanges = false;

      selectedMenuDetail.variation_groups.forEach(group => {
        // If strict required + single choice, auto select the first option
        if (group.is_required && group.type === "single_choice" && group.options && group.options.length > 0) {
          initialVariations[group.id] = [group.options[0].id];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setSelectedVariations(prev => ({ ...prev, ...initialVariations }));
      }
    }
  }, [showVariationModal, selectedMenuDetail]); // Only run when modal opens or menu changes

  // Helper to calculate total price of selected item
  const calculatedPrice = useMemo(() => {
    if (!selectedMenuDetail) return 0;

    const basePrice = Number(selectedMenuDetail.price) || 0;
    let variationsPrice = 0;

    if (selectedMenuDetail.variation_groups) {
      selectedMenuDetail.variation_groups.forEach(group => {
        const selectedOptionIds = selectedVariations[group.id] || [];
        group.options.forEach(option => {
          if (selectedOptionIds.includes(option.id)) {
            variationsPrice += Number(option.price_adjustment) || 0;
          }
        });
      });
    }

    return (basePrice + variationsPrice) * modalQuantity;
  }, [selectedMenuDetail, selectedVariations, modalQuantity]);

  // Handle Add to Cart from Modal
  const handleConfirmVariation = () => {
    if (!selectedMenuDetail) return;

    // Validate required groups
    const missingRequired = selectedMenuDetail.variation_groups?.filter(
      group => group.is_required && (!selectedVariations[group.id] || selectedVariations[group.id].length === 0)
    );

    if (missingRequired && missingRequired.length > 0) {
      alert(`Mohon pilih variasi untuk: ${missingRequired.map(g => g.name).join(", ")}`);
      return;
    }

    // Transform selectedVariations state into SelectedVariation array for cart
    const finalVariations: SelectedVariation[] = [];

    selectedMenuDetail.variation_groups?.forEach(group => {
      const selectedOptionIds = selectedVariations[group.id] || [];
      selectedOptionIds.forEach(optionId => {
        const option = group.options.find(o => o.id === optionId);
        if (option) {
          finalVariations.push({
            group_name: group.name,
            option_name: option.name,
            price: Number(option.price_adjustment)
          });
        }
      });
    });

    addItem(selectedMenuDetail, modalQuantity, finalVariations);

    setShowVariationModal(false);
  };

  const handleAddToCart = async (menu: Menu) => {
    try {
      // Fetch menu details to check if it has variations
      const response = await menuApi.getMenuById(menu.id.toString());

      if (response.success && response.data) {
        const menuWithVariations = response.data as MenuWithVariations;

        // Check if menu has variation groups
        if (menuWithVariations.variation_groups && menuWithVariations.variation_groups.length > 0) {
          // Show variation modal
          setSelectedMenuDetail(menuWithVariations);
          setSelectedVariations({});
          setModalQuantity(1);
          setShowVariationModal(true);
        } else {
          // No variations, add directly to cart
          addItem(menu, 1, []);
        }
      }
    } catch (error) {
      console.error("Error fetching menu details:", error);
      // Fallback: add to cart without variations
      addItem(menu, 1, []);
    } finally {
      // setLoadingMenuDetail(false);
    }
  };

  const handleIncreaseQuantity = (cartItemId: string) => {
    const item = cartItems.find((item) => item.id === cartItemId);
    if (item) {
      updateQuantity(cartItemId, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (cartItemId: string) => {
    const item = cartItems.find((item) => item.id === cartItemId);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(cartItemId, item.quantity - 1);
      } else {
        removeItem(cartItemId);
      }
    }
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
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Carousel */}
        {banners.length > 0 && (
          <div className="relative mb-4 mt-6 overflow-hidden rounded-2xl">
            <div className="relative h-64 sm:h-80 md:h-96">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                >
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                    <h2 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">{banner.title}</h2>
                    <p className="text-sm sm:text-base md:text-lg">{banner.subtitle}</p>
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
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 rounded-full transition ${index === currentSlide ? "bg-white w-8" : "bg-white/50"
                    }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-0 py-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Menu Kami
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Pilih menu favorit Anda untuk reservasi
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${selectedCategory === "all"
                ? "bg-brand-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedCategory("drink")}
              className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${selectedCategory === "drink"
                ? "bg-brand-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              Minuman
            </button>
            <button
              onClick={() => setSelectedCategory("food")}
              className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${selectedCategory === "food"
                ? "bg-brand-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              Makanan
            </button>
            <button
              onClick={() => setSelectedCategory("dessert")}
              className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${selectedCategory === "dessert"
                ? "bg-brand-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
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

        {/* Menu Grid - Minimalist Design */}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5 pb-24">
            {filteredMenus.map((menu) => {
              return (
                <div
                  key={menu.id}
                  onClick={() => handleAddToCart(menu)}
                  className="group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={menu.image_url || "https://via.placeholder.com/400x400"}
                      alt={menu.menu_name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Floating Category Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex rounded-full ${getCategoryColor(menu.category)} px-2 py-0.5 text-[0.6rem] font-medium text-white shadow-lg`}>
                        {formatMenuCategory(menu.category)}
                      </span>
                    </div>

                    {/* Hover Overlay with Add Button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Info - Minimal */}
                  <div className="px-2 py-2 bg-white dark:bg-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                      {menu.menu_name}
                    </h3>
                    <p className="text-brand-500 font-bold text-base">
                      {formatCurrency(menu.price)}
                    </p>
                  </div>
                </div>
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
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-lg rounded-t-2xl bg-white dark:bg-gray-900 sm:rounded-2xl shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Keranjang Belanja
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {totalItems} item
                  </p>
                </div>
                <button
                  onClick={() => setShowCartModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="max-h-[55vh] overflow-y-auto px-5 py-3">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-800">
                      {/* Image */}
                      <img
                        src={item.menu.image_url || "https://via.placeholder.com/80"}
                        alt={item.menu.menu_name}
                        className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1 truncate">
                          {item.menu.menu_name}
                        </h4>

                        {/* Variations */}
                        {item.variations && item.variations.length > 0 && (
                          <div className="mb-1.5 flex flex-wrap gap-1">
                            {item.variations.map((v, idx) => (
                              <span key={idx} className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                {v.option_name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm font-semibold text-brand-500">
                            {formatCurrency((item.total_price || 0) / item.quantity)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDecreaseQuantity(item.id)}
                              className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-600 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {item.quantity === 1 ? (
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              ) : (
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              )}
                            </button>
                            <span className="flex h-6 min-w-[1.5rem] items-center justify-center text-xs font-semibold text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncreaseQuantity(item.id)}
                              className="flex h-6 w-6 items-center justify-center rounded bg-brand-500 text-white transition hover:bg-brand-600"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="flex flex-col justify-between items-end">
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.total_price || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 py-3.5 dark:border-gray-800">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-xl font-bold text-brand-500">{formatCurrency(totalPrice)}</span>
                </div>
                <Link to="/reservation" onClick={() => setShowCartModal(false)}>
                  <button className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600">
                    Lanjut ke Reservasi
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}


        {/* Variation Modal */}
        {showVariationModal && selectedMenuDetail && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center p-0 sm:p-4">
            <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-xl">

              {/* Modal Header */}
              <div className="border-b border-gray-100 px-5 py-3.5 dark:border-gray-800 flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedMenuDetail.menu_name}
                  </h3>
                  <p className="text-sm text-brand-500 font-medium mt-0.5">
                    {formatCurrency(selectedMenuDetail.price)}
                  </p>
                </div>
                <button
                  onClick={() => setShowVariationModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 flex-shrink-0"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-3">
                <div className="space-y-4">
                  {/* Image */}
                  {selectedMenuDetail.image_url && (
                    <div className="rounded-lg overflow-hidden aspect-video w-full bg-gray-100">
                      <img
                        src={selectedMenuDetail.image_url}
                        alt={selectedMenuDetail.menu_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {selectedMenuDetail.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {selectedMenuDetail.description}
                    </p>
                  )}

                  {/* Variation Groups */}
                  {selectedMenuDetail.variation_groups?.map((group, groupIndex) => (
                    <div key={group.id} className={`${groupIndex > 0 ? 'pt-4 border-t border-gray-100 dark:border-gray-800' : ''}`}>
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {group.name}
                          {group.is_required && <span className="text-error-500 ml-1">*</span>}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {group.type === "single_choice" ? "Pilih salah satu" : "Bisa pilih lebih dari satu"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {group.options.map(option => {
                          const isSelected = (selectedVariations[group.id] || []).includes(option.id);
                          return (
                            <label
                              key={option.id}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                              <div className="flex items-center gap-2.5 flex-1">
                                <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${isSelected
                                  ? 'border-brand-500 bg-brand-500'
                                  : 'border-gray-300 dark:border-gray-600'
                                  }`}>
                                  {isSelected && (
                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                  )}
                                </div>
                                <input
                                  type={group.type === "single_choice" ? "radio" : "checkbox"}
                                  name={`group-${group.id}`}
                                  checked={isSelected}
                                  onChange={() => handleVariationChange(group.id, option.id, group.type)}
                                  className="sr-only"
                                />
                                <span className={`text-sm ${isSelected ? 'font-medium text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-white'}`}>
                                  {option.name}
                                </span>
                              </div>
                              {option.price_adjustment > 0 && (
                                <span className="text-xs font-medium text-brand-500 ml-2">
                                  +{formatCurrency(option.price_adjustment)}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 px-5 py-3.5 dark:border-gray-800">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Jumlah</span>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50 transition hover:bg-gray-50"
                      disabled={modalQuantity <= 1}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-sm font-semibold w-6 text-center text-gray-900 dark:text-white">
                      {modalQuantity}
                    </span>
                    <button
                      onClick={() => setModalQuantity(modalQuantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition hover:bg-gray-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleConfirmVariation}
                  className="w-full bg-brand-500 text-white font-semibold py-2.5 rounded-lg hover:bg-brand-600 transition flex justify-between items-center px-5 text-sm"
                >
                  <span>Tambah ke Keranjang</span>
                  <span>{formatCurrency(calculatedPrice)}</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
