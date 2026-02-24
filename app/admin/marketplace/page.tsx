"use client";

import { JSX, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Loader2,
  TrendingUp,
  Users,
  Sparkles,
  Filter,
  Search,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Tag,
  Activity,
} from "lucide-react";
import { useAdmin, adminApi } from "../context/AdminContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  _id: string;
  title: string;
  description: string;
  price: number;
  platformFee: number;
  totalAmount: number;
  deliveryTime: number;
  status: string;
  serviceId: {
    _id: string;
    title: string;
    category: string;
    budget: number;
    clientId: {
      _id: string;
      firstName: string;
      lastName: string;
      companyName?: string;
      email: string;
    };
  };
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
  };
  developerId: {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
  };
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  deliveryNote?: string;
}

interface Stats {
  totalOrders: number;
  paidOrders: number;
  pendingPayment: number;
  inProgress: number;
  delivered: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  platformFees: number;
}

export default function AdminMarketplaceOrdersPage() {
  const {  loading: authLoading } = useAdmin();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; order: Order | null }>({
    show: false,
    order: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
   fetchOrders(); 
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await  adminApi.get("/admin/marketplace/orders");
      setOrders(res.data.orders || []);
      setStats(res.data.stats || null);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteModal.order) return;

    setDeleting(true);
    try {
      await adminApi.delete(`/admin/marketplace/orders/${deleteModal.order._id}`);
      setOrders(orders.filter(o => o._id !== deleteModal.order!._id));
      setDeleteModal({ show: false, order: null });
      alert("Order deleted successfully");
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_payment: "bg-yellow-100 text-yellow-700 border-yellow-300",
      paid: "bg-green-100 text-green-700 border-green-300",
      in_progress: "bg-blue-100 text-blue-700 border-blue-300",
      delivered: "bg-purple-100 text-purple-700 border-purple-300",
      completed: "bg-gray-100 text-gray-700 border-gray-300",
      cancelled: "bg-red-100 text-red-700 border-red-300",
    };

    const icons: Record<string, JSX.Element> = {
      pending_payment: <Clock size={14} />,
      paid: <DollarSign size={14} />,
      in_progress: <Activity size={14} />,
      delivered: <Package size={14} />,
      completed: <CheckCircle size={14} />,
      cancelled: <XCircle size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border-2 ${
          styles[status] || "bg-gray-100 text-gray-700 border-gray-300"
        }`}
      >
        {icons[status] || <AlertCircle size={14} />}
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.developerId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Marketplace Orders</h1>
              <p className="text-gray-600">Manage all marketplace orders and transactions</p>
            </div>
            <Link href="/admin/dashboard">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg">
                Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-gray-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Orders</p>
                  <ShoppingCart size={18} className="text-gray-400" />
                </div>
                <p className="text-3xl font-black text-gray-900">{stats.totalOrders}</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Paid Orders</p>
                  <DollarSign size={18} className="text-green-400" />
                </div>
                <p className="text-3xl font-black text-green-600">{stats.paidOrders}</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
                  <TrendingUp size={18} className="text-blue-400" />
                </div>
                <p className="text-2xl font-black text-blue-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Platform Fees</p>
                  <Sparkles size={18} className="text-purple-400" />
                </div>
                <p className="text-2xl font-black text-purple-600">${stats.platformFees.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">In Progress</p>
                  <Activity size={18} className="text-orange-400" />
                </div>
                <p className="text-3xl font-black text-orange-600">{stats.inProgress}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Search Orders</label>
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, service, client, or developer..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 bg-white placeholder:text-gray-400"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Status</label>
               <div className="relative">
  <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
   
    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none bg-white text-gray-900"
  >
    <option value="all" className="text-gray-900">All Statuses</option>
    <option value="pending_payment" className="text-gray-900">Pending Payment</option>
    <option value="paid" className="text-gray-900">Paid</option>
    <option value="in_progress" className="text-gray-900">In Progress</option>
    <option value="delivered" className="text-gray-900">Delivered</option>
    <option value="completed" className="text-gray-900">Completed</option>
    <option value="cancelled" className="text-gray-900">Cancelled</option>
  </select>
  
  {/* Add a chevron icon since you used appearance-none */}
  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
  </div>
</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here once clients make purchases"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase">
                            <Sparkles size={10} />
                            ORDER
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{order.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{order.description}</p>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-4 border-2 border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">Service Details</p>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-gray-900">{order.serviceId?.title}</p>
                        <p className="text-gray-600">
                          <Tag size={12} className="inline mr-1" />
                          {order.serviceId?.category?.replace("_", " ")}
                        </p>
                        <p className="text-gray-600">
                          <Users size={12} className="inline mr-1" />
                          Service Owner: {order.developerId?.companyName || 
                              `${order.developerId?.firstName} ${order.developerId?.lastName}`}
                        </p>
                      </div>
                    </div>

                    {/* Client & Developer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-100">
                        <p className="text-xs font-bold text-green-600 uppercase mb-2">Client (Buyer)</p>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-gray-900">
                            {order.clientId?.companyName || 
                              `${order.clientId?.firstName} ${order.clientId?.lastName}`}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Mail size={12} />
                            {order.clientId?.email}
                          </p>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                        <p className="text-xs font-bold text-purple-600 uppercase mb-2">Developer (Seller)</p>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-gray-900">
                            {order.developerId?.companyName || 
                              `${order.developerId?.firstName} ${order.developerId?.lastName}`}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Mail size={12} />
                            {order.developerId?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-100">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Order Amount</p>
                        <p className="text-lg font-black text-gray-900">${order.price}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Platform Fee</p>
                        <p className="text-lg font-black text-purple-600">+${order.platformFee}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Paid</p>
                        <p className="text-lg font-black text-green-600">${order.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Delivery</p>
                        <p className="text-sm font-bold text-gray-700">{order.deliveryTime} days</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Created: {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      {order.paidAt && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} />
                          Paid: {new Date(order.paidAt).toLocaleDateString()}
                        </div>
                      )}
                      {order.deliveredAt && (
                        <div className="flex items-center gap-1">
                          <Package size={12} />
                          Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                        </div>
                      )}
                      {order.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={12} />
                          Completed: {new Date(order.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, order })}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-8 rounded-t-3xl z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Order Details</h2>
                    <p className="text-gray-600">ID: {selectedOrder._id}</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <XCircle size={24} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100">
                  <h4 className="text-xs font-black uppercase text-blue-600 mb-4">Order Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Title</p>
                      <p className="text-lg font-bold text-gray-900">{selectedOrder.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Description</p>
                      <p className="text-gray-700 leading-relaxed">{selectedOrder.description}</p>
                    </div>
                    {selectedOrder.deliveryNote && (
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Delivery Note</p>
                        <p className="text-gray-700 leading-relaxed">{selectedOrder.deliveryNote}</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && deleteModal.order && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !deleting && setDeleteModal({ show: false, order: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <AlertCircle className="text-red-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Delete Order</h3>
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to delete order{" "}
                <span className="font-bold text-gray-800">"{deleteModal.order.title}"</span>? This
                action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, order: null })}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}