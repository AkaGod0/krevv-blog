"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, useAuth } from "@/app/context/AuthContext";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CreditCard,
  DollarSign,
  Package,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  Send,
} from "lucide-react";

interface Service {
  _id: string;
  title: string;
  budget: number;
  category: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

type PaymentType = "half_upfront" | "full_upfront" | "on_completion";

const getPaymentTypeLabel = (type: PaymentType) => {
  const labels = {
    half_upfront: "50% Upfront",
    full_upfront: "100% Upfront",
    on_completion: "On Completion",
  };
  return labels[type];
};

const calculateFee = (amount: number) => {
  const platformFee = amount * 0.05; 
  const totalAmount = amount + platformFee; 
  const developerReceives = amount; 
  return { 
    platformFee, 
    developerReceives, 
    total: totalAmount //  Client pays this amount
  };
};

export default function CreateCustomOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [orderTitle, setOrderTitle] = useState("");
  const [orderDescription, setOrderDescription] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [paymentType, setPaymentType] = useState<PaymentType>("half_upfront");
  const [revisions, setRevisions] = useState("2");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && id) {
      fetchService();
    }
  }, [user, authLoading, id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/marketplace/services/${id}`);
      const serviceData = res.data;

      // Check if user is the service owner (developer)
      if (serviceData.clientId._id !== user?._id) {
        alert("Only the service owner can create custom orders");
        router.push(`/marketplace/tasks/${id}`);
        return;
      }

      setService(serviceData);
      // Pre-fill with service details
      setOrderTitle(serviceData.title);
      setOrderPrice(serviceData.budget.toString());
    } catch (err) {
      console.error("Error fetching service:", err);
      router.push("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderTitle.trim() || !orderDescription.trim() || !orderPrice) {
      alert("Please fill in all required fields");
      return;
    }

    const price = parseFloat(orderPrice);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    const days = parseInt(deliveryDays);
    if (isNaN(days) || days <= 0) {
      alert("Please enter valid delivery days");
      return;
    }

    setCreating(true);

    try {
      await api.post(`/marketplace/services/${id}/orders`, {
        title: orderTitle,
        description: orderDescription,
        price,
        deliveryTime: days,
        paymentType,
        revisions: parseInt(revisions),
      });

      setShowSuccess(true);

      // Redirect to chat after 2 seconds
      setTimeout(() => {
        router.push(`/marketplace/chat/${id}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error creating custom order:", err);
      alert(err.response?.data?.message || "Failed to create custom order");
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full opacity-20 blur-xl" />
            <Sparkles className="w-full h-full text-purple-600" />
          </motion.div>
          <p className="text-gray-600 font-semibold text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const currentPrice = parseFloat(orderPrice) || 0;
  const fees = calculateFee(currentPrice);
  const actualAmount =
    paymentType === "half_upfront" ? currentPrice / 2 : currentPrice;
  const actualFees = calculateFee(actualAmount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-black text-gray-900 mb-3">
                Order Created!
              </h2>
              <p className="text-gray-600 mb-6">
                Your custom order has been sent to the client's chat.
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-semibold">Redirecting to chat...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-purple-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black text-gray-900 mb-1">
                  Create Custom Order
                </h1>
                <p className="text-gray-600 font-medium">
                  For: <span className="font-bold text-purple-600">{service.title}</span>
                </p>
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-900 font-medium">
                This custom order will be sent directly to the client's chat. They can
                review, accept, and pay for it.
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleCreateOrder}>
          <div className="space-y-6">
            {/* Order Details Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-purple-100"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <FileText className="w-7 h-7 text-purple-600" />
                Order Details
              </h2>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Order Title *
                  </label>
                  <input
                    type="text"
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    placeholder="e.g., Custom Website Development"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    placeholder="Describe what's included in this order..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium resize-none"
                    required
                  />
                </div>

                {/* Price and Delivery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={orderPrice}
                        onChange={(e) => setOrderPrice(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Delivery Time (Days) *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(e.target.value)}
                        placeholder="7"
                        min="1"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Revisions */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Number of Revisions
                  </label>
                  <input
                    type="number"
                    value={revisions}
                    onChange={(e) => setRevisions(e.target.value)}
                    placeholder="2"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Terms Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-purple-100"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-purple-600" />
                Payment Terms
              </h2>

              <div className="space-y-4">
                {[
                  {
                    id: "half_upfront" as PaymentType,
                    label: "50% Upfront",
                    desc: "Client pays half now, rest on delivery",
                    icon: "💰",
                  },
                  {
                    id: "full_upfront" as PaymentType,
                    label: "100% Upfront",
                    desc: "Client pays full amount now",
                    icon: "⚡",
                  },
                  {
                    id: "on_completion" as PaymentType,
                    label: "On Completion",
                    desc: "Client pays after you deliver",
                    icon: "✨",
                  },
                ].map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentType(option.id)}
                    className={`w-full p-5 rounded-2xl border-3 transition-all text-left relative overflow-hidden ${
                      paymentType === option.id
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-xl shadow-purple-200"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30"
                    }`}
                  >
                    {paymentType === option.id && (
                      <motion.div
                        layoutId="payment-selected"
                        className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 opacity-50"
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{option.icon}</span>
                        <div>
                          <h4 className="font-black text-gray-900 text-lg">
                            {option.label}
                          </h4>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                      </div>
                      {paymentType === option.id && (
                        <CheckCircle className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Price Breakdown Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-purple-200"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <DollarSign className="w-7 h-7 text-purple-600" />
                Price Breakdown
              </h2>

              <div className="bg-white rounded-2xl p-6 space-y-4">
  <div className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
    <span className="text-sm font-bold text-gray-600">
      {paymentType === "half_upfront" ? "Initial Payment (50%)" : "Total Amount"}
    </span>
    <span className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
      ${actualAmount.toFixed(2)}
    </span>
  </div>

  <div className="space-y-3 text-sm">
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Order Amount:</span>
      <span className="font-bold text-gray-900">
        ${currentPrice.toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Platform Fee (5%):</span>
      <span className="font-bold text-purple-600">
        +${fees.platformFee.toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
      <span className="font-bold text-gray-700">Client Pays:</span>
      <span className="font-black text-blue-600 text-xl">
        ${fees.total.toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="font-bold text-gray-700">You Receive:</span>
      <span className="font-black text-green-600 text-xl">
        ${fees.developerReceives.toFixed(2)}
      </span>
    </div>
  </div>

  {paymentType === "half_upfront" && (
    <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
      <p className="text-xs text-blue-900 font-medium">
        <Clock className="w-4 h-4 inline mr-1" />
        Remaining ${((fees.total) / 2).toFixed(2)} due on delivery
      </p>
    </div>
  )}

  <div className="mt-4 text-xs text-gray-500 text-center">
    Payment processed via PayPal
  </div>
</div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={creating}
                whileHover={{ scale: creating ? 1 : 1.02 }}
                whileTap={{ scale: creating ? 1 : 0.98 }}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-black text-lg rounded-2xl shadow-2xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    Send Custom Order to Client
                  </>
                )}
              </motion.button>

              <p className="text-center text-sm text-gray-500 mt-4">
                The client will receive this order in their chat and can accept or decline it.
              </p>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}