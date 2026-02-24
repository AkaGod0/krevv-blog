"use client";

import { use, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, useAuth } from "@/app/context/AuthContext";
import {
  Send,
  ArrowLeft,
  Sparkles,
  Loader2,
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Zap,
  Clock,
  ChevronDown,
  Info,
  XCircle,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useNotifications } from '@/app/hooks/useNotifications';

interface Message {
  _id: string;
  senderId: any;
  text: string;
  timestamp: string;
  isPaymentRequest?: boolean;
  paymentDetails?: {
    amount: number;
    type: "half_upfront" | "full_upfront" | "on_completion";
    status: "pending" | "accepted" | "paid" | "declined";
    orderId?: string;
  };
}

interface Service {
  _id: string;
  title: string;
  budget: number;
  category: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    avatar?: string;
  };
  assignedDeveloper?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    paypalEmail?: string;
  };
}

interface Application {
  _id: string;
  status: string;
  proposedRate?: number;
  developerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    paypalEmail?: string;
  };
}

interface Order {
  _id: string;
  status: string;
  totalAmount: number;
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
  const developerReceives = amount - platformFee;
  return { platformFee, developerReceives, total: amount };
};

export default function ServiceChatPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { markAsRead } = useNotifications(user?._id); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const initializingRef = useRef(false);
  const hasCheckedAccess = useRef(false);

  const [service, setService] = useState<Service | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && !hasCheckedAccess.current) {
      hasCheckedAccess.current = true;
      fetchServiceAndApplication();
    }

    return () => {
      if (socketRef.current) {
        const socket = socketRef.current;
        socket.emit("leaveServiceChat", { serviceId });
        socket.removeAllListeners();
        socket.disconnect();
        socketRef.current = null;
        initializingRef.current = false;
      }
    };
  }, [user, authLoading]);

  // ✅ Auto-mark notifications as read when chat opens
  useEffect(() => {
    if (serviceId && user?._id) {
      markAsRead(serviceId);
    }
  }, [serviceId, user?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchServiceAndApplication = async () => {
    try {
      setLoading(true);

      const serviceRes = await api.get(`/marketplace/services/${serviceId}`);
      const serviceData = serviceRes.data;
      setService(serviceData);

      const userIsDeveloper = serviceData.clientId._id === user?._id;
      setIsClient(!userIsDeveloper);

      let app = null;

      if (userIsDeveloper) {
        try {
          const appsRes = await api.get(`/marketplace/services/${serviceId}/applications`);
          const apps = appsRes.data || [];
          app = apps.find((a: any) => a.status === "accepted" || a.status === "reviewing") || apps[0];
        } catch (err) {
          console.error("Error fetching service applications:", err);
        }
      } else {
        try {
          const myAppsRes = await api.get(`/marketplace/my-applications`);
          const myApps = myAppsRes.data || [];
          app = myApps.find((a: any) => {
            const appServiceId = a.serviceId?._id || a.serviceId;
            return appServiceId === serviceId;
          });
        } catch (err) {
          console.error("Error fetching my applications:", err);
        }
      }

      setApplication(app);

      try {
        const ordersRes = await api.get(`/marketplace/services/${serviceId}/orders`);
        const orders = ordersRes.data || [];
        if (orders.length > 0) {
          const activeOrder = orders.find((o: Order) =>
            ["pending_payment", "paid", "in_progress", "delivered"].includes(o.status)
          ) || orders[0];
          setExistingOrder(activeOrder);
        }
      } catch (err) {
        console.log("No existing orders for this service");
      }

      await fetchMessages();

      if (!socketRef.current && !initializingRef.current) {
        initializeSocket();
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 404 || err.response?.status === 403) {
        router.push(`/marketplace/tasks/${serviceId}`);
      } else {
        router.push("/marketplace");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/marketplace/services/${serviceId}/messages`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  const initializeSocket = () => {
    if (initializingRef.current || socketRef.current) return;

    initializingRef.current = true;
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const socket = io(`${SOCKET_URL}/marketplace-chat`, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("joinServiceChat", { serviceId });
    });

    socket.on("connect_error", () => {
      setSocketConnected(false);
    });

    socket.on("disconnect", (reason) => {
      setSocketConnected(false);
      if (reason !== "io client disconnect") {
        initializingRef.current = false;
      }
    });

    socket.on("reconnect", () => {
      socket.emit("joinServiceChat", { serviceId });
    });

    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("paymentStatusUpdate", (data: { messageId: string; status: string; orderId?: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId && msg.paymentDetails
            ? {
                ...msg,
                paymentDetails: {
                  ...msg.paymentDetails,
                  status: data.status as any,
                  ...(data.orderId ? { orderId: data.orderId } : {}),
                },
              }
            : msg
        )
      );

      if (data.status === "accepted") {
        fetchServiceAndApplication();
      }
    });

    socketRef.current = socket;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    setSending(true);
    try {
      const res = await api.post(`/marketplace/services/${serviceId}/messages`, {
        text: messageText,
        senderId: user._id,
      });

      setMessageText("");

      if (socketRef.current?.connected) {
        socketRef.current.emit("sendMessage", {
          serviceId,
          message: res.data,
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleClientAction = async (messageId: string, action: "accept" | "decline") => {
    try {
      const response = await api.post(`/marketplace/messages/${messageId}/payment-action`, { action });
      if (action === "accept") {
        const orderId = response.data?.paymentDetails?.orderId;
        if (orderId) {
          router.push(`/marketplace/orders/${orderId}/payment`);
        } else {
          const message = messages.find(m => m._id === messageId);
          if (message?.paymentDetails?.orderId) {
            router.push(`/marketplace/orders/${message.paymentDetails.orderId}/payment`);
          } else {
            alert("Order accepted! Please wait for the page to update, then click 'Pay Now'.");
          }
        }
      }
    } catch (err) {
      console.error("Error handling payment:", err);
      alert("Failed to process payment request");
    }
  };

  const handleClientPayment = async (message: Message) => {
    setPaymentLoading(true);
    try {
      const orderId = message.paymentDetails?.orderId || existingOrder?._id;
      if (orderId) {
        router.push(`/marketplace/orders/${orderId}/payment`);
        return;
      }

      const ordersRes = await api.get(`/marketplace/services/${serviceId}/orders`);
      const orders = ordersRes.data || [];
      const pendingOrder = orders.find((o: Order) => o.status === "pending_payment") || orders[0];

      if (pendingOrder?._id) {
        router.push(`/marketplace/orders/${pendingOrder._id}/payment`);
        return;
      }

      const amount = message.paymentDetails?.amount || service?.budget || 0;
      const createRes = await api.post(`/marketplace/services/${serviceId}/orders`, {
        title: service?.title || "Service Payment",
        description: `Payment for: ${service?.title}`,
        price: amount,
        deliveryTime: 7,
      });

      const newOrderId = createRes.data?.order?._id || createRes.data?._id;
      if (newOrderId) {
        router.push(`/marketplace/orders/${newOrderId}/payment`);
      } else {
        throw new Error("Could not create or find order for payment");
      }
    } catch (err) {
      console.error("Error navigating to payment:", err);
      alert("Failed to open payment page. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl" />
            <Sparkles className="w-full h-full text-blue-600" />
          </motion.div>
          <p className="text-gray-600 font-semibold text-base sm:text-lg">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  if (!service) {
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
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Shield size={40} className="sm:w-12 sm:h-12 text-red-600" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Service Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
            This service could not be found or you don't have access to it.
          </p>
          <button
            onClick={() => router.push(`/marketplace/tasks/${serviceId}`)}
            className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Back to Service
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg"
        >
          <div className="px-3 sm:px-6 py-3 sm:py-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all flex-shrink-0"
                >
                  <ArrowLeft size={20} className="text-gray-700" />
                </motion.button>

                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm sm:text-xl shadow-xl relative overflow-hidden"
                    >
                      <span className="relative z-10">
                        {service.clientId.firstName?.[0]}{service.clientId.lastName?.[0]}
                      </span>
                    </motion.div>

                    <motion.div
                      animate={{
                        scale: socketConnected ? [1, 1.2, 1] : 1,
                        opacity: socketConnected ? 1 : 0.5,
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 sm:border-3 border-white ${
                        socketConnected ? "bg-emerald-500" : "bg-gray-400"
                      } shadow-lg`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <h2 className="font-black text-gray-900 text-sm sm:text-lg truncate">
                        {/* ✅ Show company name first, fallback to personal name */}
                        {service.clientId.companyName || 
                         `${service.clientId.firstName} ${service.clientId.lastName}`}
                      </h2>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black flex items-center gap-0.5 sm:gap-1 flex-shrink-0 bg-purple-100 text-purple-700"
                      >
                        <Zap size={8} className="sm:w-2.5 sm:h-2.5" />
                        SERVICE OWNER
                      </motion.div>
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-0.5 truncate"
                    >
                      <Sparkles size={10} className="sm:w-3 sm:h-3 text-purple-500 flex-shrink-0" />
                      <span className="font-semibold truncate">{service.title}</span>
                    </motion.p>
                  </div>
                </div>
              </div>

              {!isClient && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/marketplace/tasks/${serviceId}/create-order`)}
                  className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg transition-all text-xs sm:text-sm flex-shrink-0"
                >
                  <CreditCard size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Create Order</span>
                  <span className="sm:hidden">Order</span>
                </motion.button>
              )}
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: socketConnected ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
              className={`h-1 mt-3 sm:mt-4 rounded-full ${
                socketConnected
                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                  : "bg-gradient-to-r from-amber-400 to-orange-500"
              }`}
              style={{ transformOrigin: "left" }}
            />
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-4 sm:mb-8"
          >
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-8 max-w-lg text-center border-2 border-blue-100 relative overflow-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="relative w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-5 shadow-2xl"
              >
                <Sparkles size={28} className="sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <h3 className="relative font-black text-gray-900 mb-2 sm:mb-3 text-lg sm:text-2xl">
                Chat Started!
              </h3>
              <p className="relative text-xs sm:text-sm text-gray-700 leading-relaxed font-medium px-2">
                {isClient
                  ? "💼 Discuss the project and accept custom orders from the developer"
                  : "🎯 Create custom orders for your client to review and pay"}
              </p>
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const isMine = message.senderId === user?._id || (typeof message.senderId === 'object' && message.senderId?._id === user?._id);
              
              const senderData = typeof message.senderId === 'object' && message.senderId !== null
                ? message.senderId
                : null;

              let senderRole = "";
              let senderName = "";
              let showSenderBadge = false;

              if (senderData && senderData._id) {
                showSenderBadge = true;
                const isDeveloper = senderData._id === service.clientId._id;
                senderRole = isDeveloper ? "DEVELOPER" : "CLIENT";
                senderName = (senderData as any).companyName || 
                             `${(senderData as any).firstName || ""} ${(senderData as any).lastName || ""}`.trim();
              }

              const roleColor = senderRole === "DEVELOPER"
                ? "bg-purple-100 text-purple-700 border-purple-300"
                : "bg-green-100 text-green-700 border-green-300";

              if (message.isPaymentRequest) {
                const fees = calculateFee(message.paymentDetails!.amount);
                const isPending = message.paymentDetails?.status === "pending";
                const isAccepted = message.paymentDetails?.status === "accepted";
                const isPaid = message.paymentDetails?.status === "paid";
                const isDeclined = message.paymentDetails?.status === "declined";

                return (
                  <motion.div
                    key={message._id}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ delay: index * 0.05, type: "spring" }}
                    className="flex justify-center"
                  >
                    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 max-w-md w-full border-2 border-purple-300 relative overflow-hidden">
                      <div className="relative">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <motion.div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                            <DollarSign size={24} className="sm:w-8 sm:h-8 text-white" />
                          </motion.div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-gray-900 text-base sm:text-xl flex items-center gap-2 mb-1">
                              📋 Custom Order
                            </h4>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg">
                              <span className="text-[10px] sm:text-xs font-bold text-gray-700">
                                {getPaymentTypeLabel(message.paymentDetails?.type!)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 border border-purple-200">
                          <h5 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                            {message.text.split(' - ')[0] || 'Custom Order'}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {message.text.split(' - ')[1] || message.text}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 shadow-inner space-y-3">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <span className="text-xs sm:text-sm font-bold text-gray-600">Total Amount</span>
                            <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                              ${fees.total}
                            </span>
                          </div>
                        </div>

                        {!isMine && isClient && isPending && (
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <motion.button 
                              onClick={() => handleClientAction(message._id, "accept")} 
                              className="flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl"
                            >
                              <CheckCircle size={16} />
                              Accept
                            </motion.button>
                            <motion.button 
                              onClick={() => handleClientAction(message._id, "decline")} 
                              className="px-5 py-4 bg-red-100 text-red-700 font-black rounded-2xl border-2 border-red-300"
                            >
                              Decline
                            </motion.button>
                          </div>
                        )}

                        {!isMine && isClient && isAccepted && (
                          <motion.button 
                            onClick={() => handleClientPayment(message)} 
                            disabled={paymentLoading} 
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2"
                          >
                            {paymentLoading ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                Opening Payment...
                              </>
                            ) : (
                              <>
                                <CreditCard size={20} />
                                Pay Now via PayPal
                              </>
                            )}
                          </motion.button>
                        )}
                        
                        {isPaid && (
                          <div className="p-4 bg-green-100 border-2 border-green-300 rounded-xl flex items-center justify-center gap-2">
                            <CheckCircle size={20} className="text-green-600" />
                            <span className="text-sm font-bold text-green-800">Payment Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, x: isMine ? 30 : -30, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, type: "spring" }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] sm:max-w-md ${isMine ? "items-end" : "items-start"} flex flex-col gap-1 sm:gap-2`}>
                    {showSenderBadge && (
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3">
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                          className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black border shadow-sm ${roleColor}`}
                        >
                          {senderRole === "DEVELOPER" ? (
                            <Zap size={10} className="sm:w-3 sm:h-3" />
                          ) : (
                            <User size={10} className="sm:w-3 sm:h-3" />
                          )}
                          <span>{senderRole} - {senderName}</span>
                        </motion.span>
                      </div>
                    )}

                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-lg backdrop-blur-sm relative ${
                        isMine 
                          ? "bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-blue-200 rounded-tr-md" 
                          : "bg-white text-gray-900 border-2 border-gray-100 shadow-gray-200 rounded-tl-md"
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed font-medium relative z-10">{message.text}</p>
                      <div className={`text-[10px] sm:text-[11px] mt-1.5 sm:mt-2 flex items-center gap-1 ${isMine ? "text-blue-200" : "text-gray-500"}`}>
                        <Clock size={10} />
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-xl border-t-2 border-gray-200/50 p-3 sm:p-5 shadow-2xl"
        >
          <form onSubmit={sendMessage} className="flex items-center gap-2 sm:gap-4">
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(e))}
              placeholder={socketConnected ? "Type your message..." : "Connecting..."}
              rows={1}
              disabled={!socketConnected}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base text-gray-900 placeholder-gray-400 transition-all shadow-inner"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!messageText.trim() || sending || !socketConnected}
              className="px-4 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-black rounded-xl sm:rounded-2xl shadow-xl transition-all disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
            >
              {sending ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 size={18} className="sm:w-5 sm:h-5" />
                </motion.div>
              ) : (
                <>
                  <Send size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </motion.button>
          </form>

          {!socketConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 sm:mt-3 flex items-center justify-center gap-2 text-amber-600 font-semibold text-xs sm:text-sm"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={12} className="sm:w-3.5 sm:h-3.5" />
              </motion.div>
              Reconnecting...
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll to Bottom */}
      {messages.length > 5 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToBottom}
          className="fixed bottom-20 sm:bottom-28 right-4 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-10"
        >
          <ChevronDown size={20} className="sm:w-6 sm:h-6" />
        </motion.button>
      )}
    </div>
  );
}