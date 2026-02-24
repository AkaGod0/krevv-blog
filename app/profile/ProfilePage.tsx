"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  CreditCard,
  Shield,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuth, api } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth(); // ✅ Add refreshUser if available
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    paypalEmail: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (user) {
      console.log("User data loaded:", user); // ✅ Debug log
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        paypalEmail: user.paypalEmail || "",
      });
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        paypalEmail: formData.paypalEmail,
      };

      console.log("Updating profile with:", updateData); // ✅ Debug log

      const response = await api.patch("/users/me", updateData);
      console.log("Update response:", response.data); // ✅ Debug log

      setSuccess(true);
      setEditing(false);

      // ✅ Refresh user data from server instead of reloading page
      setTimeout(async () => {
        setSuccess(false);
        try {
          const userResponse = await api.get("/users/me");
          console.log("Refreshed user data:", userResponse.data); // ✅ Debug log
          
          // Update form data with fresh user data
          setFormData({
            firstName: userResponse.data.firstName || "",
            lastName: userResponse.data.lastName || "",
            email: userResponse.data.email || "",
            phone: userResponse.data.phone || "",
            location: userResponse.data.location || "",
            bio: userResponse.data.bio || "",
            paypalEmail: userResponse.data.paypalEmail || "",
          });
          
          // Reload the page to update auth context
          window.location.reload();
        } catch (err) {
          console.error("Error refreshing user data:", err);
          window.location.reload();
        }
      }, 1500);
    } catch (err: any) {
      console.error("Profile update error:", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        paypalEmail: user.paypalEmail || "",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-6 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-4 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-amber-500 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0">
                {user.firstName?.[0] || 'U'}
                {user.lastName?.[0] || 'U'}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm md:text-base text-gray-500 break-all">{user.email}</p>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition w-full md:w-auto"
              >
                <Edit size={18} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
            >
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-sm md:text-base text-green-700 font-semibold">
                Profile updated successfully!
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm md:text-base text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg outline-none transition ${
                      editing
                        ? "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg outline-none transition ${
                      editing
                        ? "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              {/* Email - Always Read-Only */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-xs text-gray-500">(cannot be changed)</span>
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg outline-none bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter phone number"
                    className={`w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg outline-none transition ${
                      editing
                        ? "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter location"
                    className={`w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg outline-none transition ${
                      editing
                        ? "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              {/* PayPal Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-600" />
                  PayPal Email
                  {user.paypalVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    name="paypalEmail"
                    value={formData.paypalEmail}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="your-paypal@email.com"
                    className={`w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg outline-none transition ${
                      editing
                        ? "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                </div>
                
                {/* PayPal Info Box */}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold mb-1">Required for receiving payments</p>
                      <p className="text-blue-700 leading-relaxed">
                        When clients pay you for marketplace services, funds are sent directly to this PayPal account. 
                        Make sure this matches your PayPal account email exactly.
                      </p>
                      {!formData.paypalEmail && (
                        <p className="mt-2 font-semibold text-amber-700 flex items-center gap-1">
                          <AlertCircle size={14} />
                          You cannot request payments until you add your PayPal email
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* PayPal Account Link */}
                {!formData.paypalEmail && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 mb-2 font-semibold">
                      Don't have a PayPal account?
                    </p>
                    <a
                      href="https://www.paypal.com/us/webapps/mpp/account-selection"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      <Shield size={14} />
                      Create PayPal Account (Business or Personal)
                      <span className="text-gray-500">→</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className={`w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg outline-none transition resize-none ${
                      editing
                        ? "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                  <X size={20} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Link href="/applications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 md:p-6 cursor-pointer border-2 border-transparent hover:border-amber-500"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-blue-100 rounded-lg p-2 md:p-3 flex-shrink-0">
                  <Briefcase className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    My Applications
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    View and manage your job applications
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="../jobs/my-jobs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 md:p-6 cursor-pointer border-2 border-transparent hover:border-amber-500"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-green-100 rounded-lg p-2 md:p-3 flex-shrink-0">
                  <FileText className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">
                    My Posted Jobs
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    Manage jobs you've posted
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}