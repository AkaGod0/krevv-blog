"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, useAuth } from "@/app/context/AuthContext";
import {
  ArrowLeft,
  ShoppingCart,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  CreditCard,
  Package,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";

interface Service {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deliveryTime: number;
  category: string;
  features?: string[];
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    paypalEmail?: string;
  };
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchService();
    }
  }, [user, authLoading, id]);

 const fetchService = async () => {
    try {
      const res = await api.get(`/marketplace/services/${id}`);
      console.log("DEBUG: Service Data received:", res.data); // <-- ADD THIS
      
      setService(res.data);

      // 1. Check if clientId exists
      if (!res.data.clientId) {
        setError("Developer information is missing from this service.");
        return;
      }

      // 2. Check if the specific email field exists
      // Use optional chaining to be safe
      const email = res.data.clientId?.paypalEmail;
      
      if (!email) {
        setError("This developer hasn't set up their PayPal account yet. Please contact them to complete setup.");
      }
    } catch (err: any) {
      console.error("Error fetching service:", err);
      setError("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!service) return;

    // Check if developer has PayPal
    if (!service.clientId?.paypalEmail) {
      alert("The developer hasn't set up their PayPal email yet. Please ask them to add it in their profile settings.");
      return;
    }

    setProcessingPayment(true);
    setError("");

    try {
      // Step 1: Create custom order
      const orderRes = await api.post(`/marketplace/services/${id}/orders`, {
        title: service.title,
        description: service.description,
        price: service.budget,
       deliveryTime: parseInt(service.deliveryTime.toString(), 10),
      });

      const orderId = orderRes.data.order._id;

      // Step 2: Redirect to order payment page
      router.push(`/marketplace/orders/${orderId}/payment`);
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.response?.data?.message || "Failed to create order. Please try again.");
      setProcessingPayment(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-6">This service may have been removed.</p>
          <button
            onClick={() => router.push("/marketplace")}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const platformFee = service.budget * 0.05;
  const totalAmount = service.budget + platformFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <span className="font-bold text-gray-900">Review Order</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <span className="font-semibold text-gray-500">Payment</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <span className="font-semibold text-gray-500">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Order Summary</h2>
                  <p className="text-sm text-gray-600">Review your purchase details</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                {/* Service Info Grid */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Service Price</p>
                      <p className="font-bold text-gray-900">${service.budget}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery Time</p>
                      <p className="font-bold text-gray-900">{service.deliveryTime} Days</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">What's Included</h4>
                    <div className="space-y-2">
                      {service.features.slice(0, 5).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Developer Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Seller</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                   {service.clientId?.firstName?.[0] || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {service.clientId.firstName} {service.clientId.lastName}
                    </p>
                    <p className="text-sm text-gray-600">Professional Developer</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">How It Works</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <p>Your payment is held securely in escrow</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <p>Developer receives notification and starts work</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <p>Developer delivers work within {service.deliveryTime} days</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <p>You review and approve the delivery</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    5
                  </div>
                  <p>Payment is released to developer</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100 sticky top-4"
            >
              <h3 className="text-xl font-black text-gray-900 mb-6">Payment Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service Price</span>
                  <span className="font-bold text-gray-900">${service.budget.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform Fee (5%)</span>
                  <span className="font-bold text-gray-900">${platformFee.toFixed(2)}</span>
                </div>

                <div className="pt-4 border-t-2 border-gray-200 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <span className="text-3xl font-black text-gray-900">
                        {totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Developer receives ${service.budget.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={processingPayment || !!error}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black rounded-2xl shadow-xl transition-all disabled:cursor-not-allowed mb-4"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure escrow payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Money-back guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>24/7 support</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3">Secure payment via</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="px-4 py-2 bg-blue-50 rounded-lg">
                    <span className="text-sm font-bold text-blue-700">PayPal</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
