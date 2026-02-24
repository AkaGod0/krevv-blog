"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Tag,
  Trash2,
  MessageCircle,
  Package,
  Sparkles,
  Bell,
  X,
} from "lucide-react";
import { useAuth, api } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotifications } from '@/app/hooks/useNotifications';

interface Application {
  _id: string;
  coverLetter: string;
  resumeUrl?: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string;

  job?: {
    _id: string;
    title: string;
    slug: string;
    company: string;
    location: string;
    salary: string;
    type: string;
  } | null;
}

interface Order {
  _id: string;
  title: string;
  description: string;
  price: number;
  totalAmount: number;
  deliveryTime: number;
  status: "pending_payment" | "paid" | "in_progress" | "delivered" | "completed" | "cancelled";
  serviceId: {
    _id: string;
    title: string;
    category: string;
    budget: number;
  };
  developerId: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName: string;
  };
  clientId?: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  deliveryNote?: string;
}

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { unreadCount, unreadMessages, markAsRead } = useNotifications(user?._id);
  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageAlert, setShowMessageAlert] = useState(false);
  const [jobStats, setJobStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    paid: 0,
    in_progress: 0,
    delivered: 0,
    completed: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchAllData();
    }
  }, [user, authLoading, router]);

  // ✅ Show alert when new unread messages arrive
  useEffect(() => {
    if (unreadMessages.length > 0) {
      setShowMessageAlert(true);
      const timer = setTimeout(() => setShowMessageAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [unreadMessages.length]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch job applications
      const jobsRes = await api.get('/applications/my-applications');
      setApplications(jobsRes.data);

      const totalJobStats = jobsRes.data.reduce((acc: any, app: Application) => {
        acc.total++;
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, { total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0 });
      setJobStats(totalJobStats);

      // ✅ Fetch all my marketplace orders
      try {
        const ordersRes = await api.get('/marketplace/my-orders');
        const allOrders = ordersRes.data || [];

        // Sort by most recent first
        allOrders.sort((a: Order, b: Order) => 
          new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime()
        );

        setOrders(allOrders);

        // Calculate order stats
        const totalOrderStats = allOrders.reduce((acc: any, order: Order) => {
          acc.total++;
          const status = order.status as keyof typeof acc;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { total: 0, paid: 0, in_progress: 0, delivered: 0, completed: 0 });
        
        totalOrderStats.paid = allOrders.length;
        
        setOrderStats(totalOrderStats);
      } catch (err) {
        console.error("Error fetching marketplace orders:", err);
        setOrders([]);
        setOrderStats({ total: 0, paid: 0, in_progress: 0, delivered: 0, completed: 0 });
      }

    } catch (err: any) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get unread count for specific service
  const getServiceUnreadCount = (serviceId: string) => {
    return unreadMessages.filter(n => n.serviceId === serviceId).length;
  };

  // ✅ Handle clicking chat button - mark as read
  const handleChatClick = async (serviceId: string) => {
    await markAsRead(serviceId);
  };

  // ✅ Handle notification click
  const handleNotificationClick = async () => {
    if (unreadMessages.length > 0) {
      const firstMessage = unreadMessages[0];
      await markAsRead(firstMessage.serviceId);
      router.push(`/marketplace/chat/${firstMessage.serviceId}`);
      setShowMessageAlert(false);
    }
  };

  const getJobStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      reviewing: "bg-blue-100 text-blue-700 border-blue-300",
      accepted: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getOrderStatusColor = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-700 border-green-300",
      in_progress: "bg-blue-100 text-blue-700 border-blue-300",
      delivered: "bg-purple-100 text-purple-700 border-purple-300",
      completed: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getJobStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock size={16} />,
      reviewing: <Eye size={16} />,
      accepted: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />,
    };
    return icons[status as keyof typeof icons] || <AlertCircle size={16} />;
  };

  const getOrderStatusIcon = (status: string) => {
    const icons = {
      paid: <DollarSign size={16} />,
      in_progress: <Clock size={16} />,
      delivered: <Package size={16} />,
      completed: <CheckCircle size={16} />,
    };
    return icons[status as keyof typeof icons] || <AlertCircle size={16} />;
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-6 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* ✅ Message Notification Alert */}
        <AnimatePresence>
          {showMessageAlert && unreadMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-4 right-4 z-50 bg-blue-600 text-white rounded-2xl shadow-2xl p-4 max-w-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">New Message!</h3>
                  <p className="text-xs text-blue-100 line-clamp-1">
                    {unreadMessages[0].message || 'You have a new message'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowMessageAlert(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <button
                onClick={handleNotificationClick}
                className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 text-center rounded-lg text-sm font-semibold transition-colors"
              >
                View Chat
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Bell Icon */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-6 md:mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">My Applications & Orders</h1>
            <p className="text-sm md:text-base text-gray-600">Track your job applications and marketplace orders</p>
          </div>

          {/* ✅ Persistent Notification Bell */}
          <button 
            onClick={handleNotificationClick}
            className="relative p-3 hover:bg-white rounded-xl transition-colors shadow-sm"
          >
            <Bell size={24} className="text-gray-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>
        </motion.div>

        {/* Job Applications Stats */}
        {applications.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-amber-500" />
              Job Applications
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
              {[
                { label: "Total", val: jobStats.total, color: "border-gray-500", text: "text-gray-800" },
                { label: "Pending", val: jobStats.pending, color: "border-yellow-500", text: "text-yellow-600" },
                { label: "Reviewing", val: jobStats.reviewing, color: "border-blue-500", text: "text-blue-600" },
                { label: "Accepted", val: jobStats.accepted, color: "border-green-500", text: "text-green-600" },
                { label: "Rejected", val: jobStats.rejected, color: "border-red-500", text: "text-red-600" },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${stat.color}`}
                >
                  <p className="text-xs text-gray-500 uppercase font-semibold">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.text}`}>{stat.val}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Marketplace Orders Stats */}
        {orders.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 mt-8">
              <Sparkles size={20} className="text-purple-500" />
              Marketplace Orders
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
              {[
                { label: "Total", val: orderStats.total, color: "border-gray-500", text: "text-gray-800" },
                { label: "Paid", val: orderStats.paid, color: "border-green-500", text: "text-green-600" },
                { label: "In Progress", val: orderStats.in_progress, color: "border-blue-500", text: "text-blue-600" },
                { label: "Delivered", val: orderStats.delivered, color: "border-purple-500", text: "text-purple-600" },
                { label: "Completed", val: orderStats.completed, color: "border-gray-500", text: "text-gray-600" },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${stat.color}`}
                >
                  <p className="text-xs text-gray-500 uppercase font-semibold">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.text}`}>{stat.val}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {applications.length === 0 && orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Applications or Orders Yet</h3>
            <p className="text-gray-500 mb-6">Start applying to jobs or browse marketplace services</p>
            <div className="flex gap-3 justify-center">
              <Link href="/jobs">
                <button className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
                  Browse Jobs
                </button>
              </Link>
              <Link href="/marketplace">
                <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                  Browse Services
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Job Applications List */}
            {applications.length > 0 && (
              <div className="space-y-4">
                {applications.map((app, idx) => {
                  const jobData = app.job;

                  if (!jobData) {
                    return (
                      <div key={app._id} className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300 opacity-60">
                        <p className="text-gray-500 italic flex items-center gap-2">
                          <Trash2 size={16}/> Job posting removed or reference broken.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-xl shadow-md p-6 border-2 border-amber-100 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">
                                  <Briefcase size={10} /> JOB
                                </span>
                              </div>
                              <Link href={`/jobs/${jobData.slug}`}>
                                <h3 className="text-xl font-bold text-gray-900 hover:text-amber-600 transition">
                                  {jobData.title}
                                </h3>
                              </Link>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${getJobStatusColor(app.status)}`}>
                              {getJobStatusIcon(app.status)} {app.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <Building2 size={14}/> {jobData.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14}/> {jobData.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={14}/> {jobData.salary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14}/> {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2">
                              <FileText size={14} className="text-amber-500" /> Cover Letter
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 italic">"{app.coverLetter}"</p>
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2 min-w-[160px]">
                          <Link href={`/jobs/${jobData.slug}`} className="flex-1">
                            <button className="w-full py-2 bg-amber-500 text-white rounded-lg font-semibold text-sm hover:bg-amber-600 transition">
                              View Job
                            </button>
                          </Link>
                          
                          {app.resumeUrl && (
                            <a href={app.resumeUrl} target="_blank" className="flex-1">
                              <button className="w-full py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                <FileText size={16} /> Resume
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Marketplace Orders List */}
            {orders.length > 0 && (
              <div className="space-y-4 mt-8">
                {orders.map((order, idx) => {
                  const canChat = ["paid", "in_progress", "delivered"].includes(order.status);
                  const serviceUnreadCount = getServiceUnreadCount(order.serviceId._id);

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">
                                  <Sparkles size={10} /> MARKETPLACE ORDER
                                </span>
                                {canChat && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                                    <MessageCircle size={10} /> CHAT ACTIVE
                                  </span>
                                )}
                              </div>
                              <Link href={`/marketplace/tasks/${order.serviceId._id}`}>
                                <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition">
                                  {order.title}
                                </h3>
                              </Link>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${getOrderStatusColor(order.status)}`}>
                              {getOrderStatusIcon(order.status)} {order.status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1 font-semibold text-green-600">
                              <DollarSign size={14}/> Paid: ${order.totalAmount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 size={14}/> {order.serviceId.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14}/> {order.deliveryTime} days
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag size={14}/> Developer: {order.developerId.companyName || `${order.developerId.firstName} ${order.developerId.lastName}`}
                            </span>
                          </div>

                          <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100 mb-3">
                            <h4 className="text-xs font-bold text-purple-600 uppercase mb-1 flex items-center gap-2">
                              <Package size={14} /> Order Description
                            </h4>
                            <p className="text-sm text-gray-700 line-clamp-2">{order.description}</p>
                          </div>

                          {order.deliveryNote && (
                            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-3">
                              <h4 className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-2">
                                <FileText size={14} /> Delivery Note from Developer
                              </h4>
                              <p className="text-sm text-blue-900 leading-relaxed">{order.deliveryNote}</p>
                              {order.deliveredAt && (
                                <p className="text-xs text-blue-600 mt-2">
                                  Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}

                          {order.paidAt && (
                            <div className="text-xs text-gray-500">
                              Paid on: {new Date(order.paidAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="flex lg:flex-col gap-2 min-w-[160px]">
                          {/* ✅ Chat Button with Badge */}
                          {canChat && (
                            <Link 
                              href={`/marketplace/chat/${order.serviceId._id}`}
                              onClick={() => handleChatClick(order.serviceId._id)}
                              className="flex-1 relative"
                            >
                              <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                <MessageCircle size={16} /> Open Chat
                                
                                {/* ✅ Badge on Chat Button */}
                                {serviceUnreadCount > 0 && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    {serviceUnreadCount}
                                  </motion.span>
                                )}
                              </button>
                            </Link>
                          )}

                          <Link href={`/marketplace/tasks/${order.serviceId._id}`} className="flex-1">
                            <button className="w-full py-2 bg-purple-500 text-white rounded-lg font-semibold text-sm hover:bg-purple-600 transition">
                              View Service
                            </button>
                          </Link>

                          {order.status === "delivered" && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.post(`/marketplace/orders/${order._id}/accept-delivery`, {
                                    review: "Order completed successfully",
                                    rating: 5,
                                  });
                                  
                                  setOrders(orders.map(o => 
                                    o._id === order._id 
                                      ? { ...o, status: "completed" as any, completedAt: new Date().toISOString() } 
                                      : o
                                  ));
                                  
                                  alert("Delivery accepted! Order is now complete.");
                                } catch (err) {
                                  console.error("Error accepting delivery:", err);
                                  alert("Failed to accept delivery");
                                }
                              }}
                              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={16} /> Accept Delivery
                            </button>
                          )}

                          {order.status === "completed" && (
                            <div className="text-center py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                              ✓ COMPLETED
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}