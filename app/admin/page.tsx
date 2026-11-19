"use client";

import React, { useEffect, useState } from "react";

interface ProductItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
  stock?: number;
}

interface OrderItem {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    size?: string;
  }[];
  totalAmount: number;
  status: string;
  createdAt?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Add Product Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("10");
  const [creatingProduct, setCreatingProduct] = useState(false);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (ordData.success) setOrders(ordData.orders || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("admin_authed");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("admin_authed", "true");
        setIsAuthenticated(true);
        setPassword("");
        fetchDashboardData();
      } else {
        setAuthError(data.message || "ভুল পাসওয়ার্ড!");
      }
    } catch {
      setAuthError("লগইন করতে সমস্যা হয়েছে");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image) return;
    setCreatingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          image,
          description,
          stock: Number(stock) || 10,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        setPrice("");
        setImage("");
        setDescription("");
        setStock("10");
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Add product failed:", err);
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Delete product failed:", err);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error("Order status update failed:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4"
        >
          <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500">
            অ্যাডমিন প্যানেলে ঢুকতে পাসওয়ার্ড দিন।
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full border rounded-lg px-3 py-2 text-gray-900"
            required
          />
          {authError && <p className="text-sm text-red-600">{authError}</p>}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {authLoading ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Store Admin Panel</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "orders"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === "products"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_authed");
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-600">
            Loading data...
          </div>
        ) : activeTab === "orders" ? (
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Customer Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm">এখনো কোনো অর্ডার আসেনি।</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">
                        {order.customerName} — {order.phone}
                      </p>
                      <p className="text-sm text-gray-600">{order.address}</p>
                      <p className="text-sm text-gray-800">
                        Items:{" "}
                        {order.items
                          .map(
                            (i) =>
                              `${i.name}${i.size ? ` (${i.size})` : ""} x${
                                i.quantity
                              }`
                          )
                          .join(", ")}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        Total: ৳{order.totalAmount}
                      </p>
                    </div>
                    <div>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleAddProduct}
              className="bg-white p-6 rounded-xl shadow-sm space-y-3 h-fit"
            >
              <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
              >
                <option value="Fashion">Fashion</option>
                <option value="Gadgets">Gadgets</option>
              </select>
              <input
                type="number"
                placeholder="Price (BDT)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                required
              />
              <input
                type="text"
                placeholder="Image URL (e.g. /images/jacket.jpg or https://...)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                rows={3}
              />
              <button
                type="submit"
                disabled={creatingProduct}
                className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {creatingProduct ? "Adding..." : "Add Product"}
              </button>
            </form>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900">All Products</h2>
              {products.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  ডাটাবেজে এখনো কোনো প্রোডাক্ট নেই। বাম পাশ থেকে যোগ করুন।
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((prod) => (
                    <div
                      key={prod._id}
                      className="border rounded-lg p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-14 h-14 object-cover rounded-md bg-gray-100"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {prod.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {prod.category} • ৳{prod.price}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}