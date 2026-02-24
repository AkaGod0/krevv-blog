"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, useAuth } from "@/app/context/AuthContext";
import {
  CreditCard,
  Shield,
  CheckCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  Clock,
  User,
  FileText,
  AlertCircle,
  Sparkles,
  Lock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PaymentRequest {
  _id: string;
  amount: number;
  type: "half_upfront" | "full_upfront" | "on_completion";
  status: "pending" | "accepted" | "paid";
}

interface Service {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedDeveloper?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const getPaymentTypeInfo = (type: string) => {
  const info = {
    half_upfront: {
      label: "50% Upfront Payment",
      description: "Pay half now, remaining on completion",
      icon: "💰",
      color: "from-blue-500 to-cyan-500",
    },
    full_upfront: {
      label: "100% Upfront Payment",
      description: "Full payment before work begins",
      icon: "⚡",
      color: "from-purple-500 to-pink-500",
    },
    on_completion: {
      label: "Payment on Completion",
      description: "Pay after project delivery",
      icon: "✨",
      color: "from-green-500 to-emerald-500",
    },
  };
  return info[type as keyof typeof info] || info.half_upfront;
};

export default function PaymentPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paypalOrderId, setPaypalOrderId] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchPaymentDetails();
    }
  }, [user, authLoading, serviceId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const serviceRes = await api.get(`/marketplace/services/${serviceId}`);
      const serviceData = serviceRes.data;
      setService(serviceData);

      // ✅ Check if user is the CLIENT
      if (serviceData.clientId._id !== user?._id) {
        setError("Only the client can make payments");
        return;
      }

      const messagesRes = await api.get(`/marketplace/services/${serviceId}/messages`);
      const messages = messagesRes.data || [];

      const latestPaymentRequest = messages
        .filter((msg: any) => msg.isPaymentRequest && msg.paymentDetails?.status === "pending")
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      if (latestPaymentRequest) {
        setPaymentRequest({
          _id: latestPaymentRequest._id,
          amount: latestPaymentRequest.paymentDetails.amount,
          type: latestPaymentRequest.paymentDetails.type,
          status: latestPaymentRequest.paymentDetails.status,
        });
      } else {
        setError("No pending payment request found");
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const createPayPalOrder = async () => {
    try {
      setProcessing(true);
      
      // Create order on your backend
      const response = await api.post(`/marketplace/services/${serviceId}/create-paypal-order`, {
        amount: paymentRequest?.amount,
        messageId: paymentRequest?._id,
      });

      setPaypalOrderId(response.data.orderId);
      return response.data.orderId;
    } catch (err) {
      console.error("Error creating PayPal order:", err);
      setError("Failed to create payment order");
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  const onPayPalApprove = async (data: any) => {
    try {
      setProcessing(true);

      // Capture payment on your backend
      const response = await api.post(`/marketplace/services/${serviceId}/capture-paypal-order`, {
        orderId: data.orderID,
        messageId: paymentRequest?._id,
      });

      if (response.data.success) {
        setPaymentSuccess(true);

        // Redirect after success
        setTimeout(() => {
          router.push(`/marketplace/chat/${serviceId}`);
        }, 3000);
      } else {
        throw new Error("Payment capture failed");
      }
    } catch (err: any) {
      console.error("Payment capture error:", err);
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const onPayPalError = (err: any) => {
    console.error("PayPal error:", err);
    setError("PayPal payment failed. Please try again.");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6"
          >
            <CreditCard className="w-full h-full text-blue-600" />
          </motion.div>
          <p className="text-gray-600 font-semibold text-base sm:text-lg">Loading payment details...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !paymentRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle size={40} className="sm:w-12 sm:h-12 text-red-600" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Access Denied</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push(`/marketplace/chat/${serviceId}`)}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
          >
            Back to Chat
          </button>
        </motion.div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <CheckCircle size={64} className="text-white" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-4xl font-black text-gray-900 mb-3"
          >
            Payment Successful!
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg text-gray-600 mb-6"
          >
            ${paymentRequest?.amount} has been sent to the developer
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-green-50 rounded-2xl p-4 border-2 border-green-200 mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-sm text-green-800 font-bold">Payment Completed</p>
            </div>
            <p className="text-xs text-green-700">
              Developer: {service?.assignedDeveloper?.firstName} {service?.assignedDeveloper?.lastName}
            </p>
          </motion.div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 mx-auto mb-4"
          >
            <Loader2 className="w-full h-full text-green-600" />
          </motion.div>

          <p className="text-sm text-gray-500">Redirecting to chat...</p>
        </motion.div>
      </div>
    );
  }

  const paymentInfo = getPaymentTypeInfo(paymentRequest?.type || "half_upfront");
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!paypalClientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-4">PayPal is not configured. Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID to your .env.local file.</p>
          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
          >
            Get PayPal Sandbox Credentials →
          </a>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-6 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 sm:mb-8"
          >
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold mb-4 sm:mb-6 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Chat
            </button>

            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring" }}
                className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${paymentInfo.color} rounded-2xl flex items-center justify-center shadow-xl`}
              >
                <span className="text-2xl sm:text-3xl">{paymentInfo.icon}</span>
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900">Pay Developer</h1>
                <p className="text-sm sm:text-base text-gray-600 font-semibold">Secure payment via PayPal</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Payment Amount Card */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-gray-100 relative overflow-hidden"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                  }}
                  transition={{ duration: 20, repeat: Infinity }}
                  className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${paymentInfo.color} opacity-10 rounded-full blur-3xl`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm sm:text-base text-gray-500 font-semibold mb-1">Amount to Pay</p>
                      <motion.h2
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.3 }}
                        className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                      >
                        ${paymentRequest?.amount}
                      </motion.h2>
                    </div>
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
                    >
                      <DollarSign size={32} className="sm:w-10 sm:h-10 text-white" />
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                    <Sparkles size={16} className="text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-black text-blue-900">{paymentInfo.label}</p>
                      <p className="text-xs text-blue-700 truncate">{paymentInfo.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* PayPal Payment Card */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900">Complete Payment</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Pay securely with PayPal</p>
                  </div>
                </div>

                {/* PayPal Buttons */}
                <div className="mb-6">
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "gold",
                      shape: "rect",
                      label: "paypal",
                      height: 55,
                    }}
                    createOrder={createPayPalOrder}
                    onApprove={onPayPalApprove}
                    onError={onPayPalError}
                    disabled={processing}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-semibold">{error}</p>
                  </motion.div>
                )}

                {processing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-3"
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                      <Loader2 size={20} className="text-blue-600" />
                    </motion.div>
                    <p className="text-sm text-blue-700 font-semibold">Processing payment...</p>
                  </motion.div>
                )}

                {/* Security Features */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { icon: Shield, text: "Buyer Protection", color: "text-green-600" },
                    { icon: Lock, text: "256-bit SSL", color: "text-blue-600" },
                    { icon: CheckCircle, text: "Verified Seller", color: "text-purple-600" },
                    { icon: Zap, text: "Instant Transfer", color: "text-amber-600" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"
                    >
                      <feature.icon size={16} className={`${feature.color} flex-shrink-0`} />
                      <span className="text-xs font-bold text-gray-700">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-4 sm:space-y-6">
              {/* Service Details */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-100"
              >
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Order Summary
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Service</p>
                    <p className="text-sm font-bold text-gray-900">{service?.title}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Category</p>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                      <TrendingUp size={12} />
                      {service?.category}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Total Budget</p>
                    <p className="text-lg font-black text-gray-900">${service?.budget}</p>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">You Pay</span>
                      <span className="text-xl font-black text-blue-600">${paymentRequest?.amount}</span>
                    </div>
                    {paymentRequest?.type === "half_upfront" && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-800 font-bold flex items-center gap-1">
                          <Clock size={12} />
                          Remaining ${(service?.budget || 0) - (paymentRequest?.amount || 0)} due on completion
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Developer Info - Who Receives Payment */}
              {service?.assignedDeveloper && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl p-6 border-2 border-green-200"
                >
                  <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
                    <User size={20} className="text-green-600" />
                    Payment Recipient
                  </h3>
                  <p className="text-xs text-green-700 mb-4 font-semibold">Funds will be sent to:</p>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0">
                      {service.assignedDeveloper.firstName[0]}{service.assignedDeveloper.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {service.assignedDeveloper.firstName} {service.assignedDeveloper.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{service.assignedDeveloper.email}</p>
                    </div>
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  </div>
                </motion.div>
              )}

              {/* Info Box */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-100"
              >
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-gray-900 mb-1">PayPal Buyer Protection</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Your payment is secured by PayPal. If there's an issue with the service, you can open a dispute within 180 days.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}