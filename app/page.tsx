"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Shirt,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: "fashion" | "gadget";
  price: number;
  oldPrice?: number;
  image: string;
  badge: string;
  sizes?: string[];
  specs?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
  selectedOption?: string;
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Oversized Cotton Hoodie",
    category: "fashion",
    price: 1450,
    oldPrice: 1850,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
    badge: "Best Seller",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "2",
    name: "ANC Wireless Noise-Cancelling Earbuds",
    category: "gadget",
    price: 2290,
    oldPrice: 2800,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    badge: "1 Year Warranty",
    specs: "36H Battery • Bluetooth 5.3 • IPX5",
  },
  {
    id: "3",
    name: "Minimalist Urban Bomber Jacket",
    category: "fashion",
    price: 2490,
    oldPrice: 3100,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
    badge: "New Arrival",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "4",
    name: "AMOLED Fitness & Call Smart Watch",
    category: "gadget",
    price: 3450,
    oldPrice: 4200,
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
    badge: "6 Months Warranty",
    specs: '1.96" AMOLED • BT Calling • 7-Day Battery',
  },
  {
    id: "5",
    name: "Classic Slim-Fit Oxford Shirt",
    category: "fashion",
    price: 1190,
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
    badge: "100% Cotton",
    sizes: ["M", "L", "XL"],
  },
  {
    id: "6",
    name: "20,000mAh 65W Fast Charging Power Bank",
    category: "gadget",
    price: 2850,
    oldPrice: 3300,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80",
    badge: "Laptop Support",
    specs: "65W PD Type-C • Digital Display",
  },
];

function normalizeCategory(rawCategory?: string): "fashion" | "gadget" {
  const val = (rawCategory || "").toLowerCase();
  if (val.includes("gadget") || val.includes("tech")) return "gadget";
  return "fashion";
}

export default function HomeStore() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "fashion" | "gadget"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<{ [id: string]: string }>({
    "1": "L",
    "3": "L",
    "5": "L",
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<"dhaka" | "outside">("dhaka");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;

        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const mapped: Product[] = data.products.map((item: any, idx: number) => {
            const cat = normalizeCategory(item.category);
            return {
              id: String(item._id || item.id || idx),
              name: item.name || "Unnamed Product",
              category: cat,
              price: Number(item.price) || 0,
              oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
              image:
                item.image ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
              badge:
                item.badge ||
                (cat === "fashion" ? "In Stock" : "Official Warranty"),
              sizes: cat === "fashion" ? item.sizes || ["M", "L", "XL"] : undefined,
              specs:
                cat === "gadget"
                  ? item.specs || item.description || "Original Tech Product"
                  : undefined,
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch products from DB:", err);
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const chosenSize =
      product.category === "fashion"
        ? selectedSizes[product.id] || product.sizes?.[0] || "L"
        : undefined;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedOption === chosenSize
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { product, quantity: 1, selectedOption: chosenSize }];
    });

    setOrderError("");
    setOrderSuccess(false);
    setIsCartOpen(true);
  };

  const updateQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryCharge =
    cart.length === 0 ? 0 : deliveryZone === "dhaka" ? 70 : 130;
  const grandTotal = subtotal + deliveryCharge;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress || cart.length === 0)
      return;

    setSubmittingOrder(true);
    setOrderError("");

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        address: `${customerAddress.trim()} (${
          deliveryZone === "dhaka" ? "Inside Dhaka - ৳70" : "Outside Dhaka - ৳130"
        })`,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.selectedOption || "",
          image: item.product.image,
        })),
        totalAmount: grandTotal,
        status: "Pending",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "অর্ডার প্লেস করা যায়নি");
      }

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setOrderSuccess(true);
    } catch (err: any) {
      setOrderError(err?.message || "অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-slate-900 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium">
        Cash on Delivery Nationwide • Dhaka 70 BDT & Outside Dhaka 130 BDT
      </div>

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
            <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
              FG
            </span>
            <span>
              Trend<span className="text-indigo-600">Tech</span>
            </span>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-80">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search fashion or gadgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div
            onClick={() => setSelectedCategory("fashion")}
            className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-orange-500 p-7 text-white shadow-md"
          >
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Shirt className="w-3.5 h-3.5" /> Fashion Collection
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Stylish Outfits & Daily Wear
            </h2>
            <p className="text-rose-100 text-sm mb-5">
              Hoodies, jackets, and casual shirts with 100% quality guarantee.
            </p>
            <span className="inline-block bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-lg group-hover:scale-105 transition">
              Shop Fashion
            </span>
          </div>

          <div
            onClick={() => setSelectedCategory("gadget")}
            className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 p-7 text-white shadow-md"
          >
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Smartphone className="w-3.5 h-3.5" /> Smart Gadgets
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Original Tech & Accessories
            </h2>
            <p className="text-indigo-200 text-sm mb-5">
              Smartwatches, ANC earbuds, and fast chargers with warranty.
            </p>
            <span className="inline-block bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg group-hover:scale-105 transition">
              Shop Gadgets
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {(["all", "fashion", "gadget"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategory(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition cursor-pointer ${
                  selectedCategory === tab
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab === "all"
                  ? "All Products"
                  : tab === "fashion"
                  ? "Fashion"
                  : "Gadgets"}
              </button>
            ))}
          </div>

          <div className="flex md:hidden items-center bg-white border border-slate-200 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-60 bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/85 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 mt-1">
                      {product.name}
                    </h3>

                    {product.category === "fashion" && product.sizes ? (
                      <div className="mt-3">
                        <span className="text-xs text-slate-500 block mb-1.5">
                          Select Size:
                        </span>
                        <div className="flex gap-2">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() =>
                                setSelectedSizes({
                                  ...selectedSizes,
                                  [product.id]: size,
                                })
                              }
                              className={`w-8 h-8 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                (selectedSizes[product.id] ||
                                  product.sizes?.[0] ||
                                  "L") === size
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-900"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded-lg font-medium">
                        {product.specs}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900">
                      ৳{product.price}
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs text-slate-400 line-through ml-2">
                        ৳{product.oldPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mt-14">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <Truck className="w-8 h-8 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Fast Home Delivery</h4>
              <p className="text-xs text-slate-500">
                2-4 days cash on delivery across the country
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">100% Authentic Products</h4>
              <p className="text-xs text-slate-500">
                Open parcel check before payment option
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Easy Return & Warranty</h4>
              <p className="text-xs text-slate-500">
                7-day size exchange and official gadget warranty
              </p>
            </div>
          </div>
        </div>
      </section>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between overflow-y-auto p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h2 className="text-lg font-extrabold">
                  Cart & Checkout ({totalCartCount})
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {orderSuccess ? (
                <div className="my-12 text-center bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-emerald-900">
                    Order Confirmed!
                  </h3>
                  <p className="text-sm text-emerald-700 mt-1">
                    Our team will call your phone number shortly to verify.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <p className="text-center text-slate-500 my-16 text-sm">
                  Your cart is empty. Add products to place an order!
                </p>
              ) : (
                <>
                  <div className="divide-y divide-slate-100 my-3">
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.product.id}-${item.selectedOption}`}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900">
                            {item.product.name}
                          </h4>
                          {item.selectedOption && (
                            <span className="text-xs text-slate-500">
                              Size: {item.selectedOption}
                            </span>
                          )}
                          <p className="text-sm font-bold text-indigo-600 mt-0.5">
                            ৳{item.product.price * item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(idx, -1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(idx, 1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItem(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded ml-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handlePlaceOrder}
                    className="mt-4 pt-4 border-t border-slate-200 space-y-3"
                  >
                    <h3 className="font-bold text-sm text-slate-800">
                      Delivery Details (Cash on Delivery)
                    </h3>

                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
                    />

                    <input
                      type="tel"
                      required
                      placeholder="Phone Number (e.g. 017XXXXXXXX) *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
                    />

                    <textarea
                      required
                      rows={2}
                      placeholder="Full Address (House, Road, Area, District) *"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryZone("dhaka")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                          deliveryZone === "dhaka"
                            ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        Inside Dhaka (৳70)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryZone("outside")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                          deliveryZone === "outside"
                            ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        Outside Dhaka (৳130)
                      </button>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span>৳{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery Charge:</span>
                        <span>৳{deliveryCharge}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-base text-slate-900 pt-1 border-t border-slate-200">
                        <span>Total (COD):</span>
                        <span>৳{grandTotal}</span>
                      </div>
                    </div>

                    {orderError && (
                      <p className="text-xs text-rose-600 font-medium">
                        {orderError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
                    >
                      {submittingOrder
                        ? "Placing Order..."
                        : `Confirm Order (৳${grandTotal})`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}