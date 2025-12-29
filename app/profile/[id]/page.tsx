"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ArrowLeft,
  Loader2,
  Briefcase,
  Globe,
  Award,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";
import axios from "axios";

interface UserProfile {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  company?: string;
  position?: string;
  website?: string;
  bio?: string;
  profileImage?: string;
  skills?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfileIdPage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${params.id}`
        );
        console.log("Fetched user profile:", res.data);
        setProfile(res.data);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-red-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This user profile doesn't exist"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Handle different name formats
  const displayName = profile.name || 
                     (profile.firstName && profile.lastName 
                       ? `${profile.firstName} ${profile.lastName}` 
                       : profile.firstName || profile.lastName || "User");
  
  const initials = displayName?.charAt(0)?.toUpperCase() || "U";

  const fullAddress = [
    profile.address,
    profile.city,
    profile.state,
    profile.zipCode,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              {profile.isActive && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {displayName}
              </h1>
              {profile.position && profile.company && (
                <p className="text-blue-100 flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <Briefcase size={18} />
                  {profile.position} at {profile.company}
                </p>
              )}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {profile.isVerified && (
                  <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                    <UserCheck size={14} />
                    Verified
                  </span>
                )}
                
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User size={24} className="text-blue-600" />
              Contact Information
            </h2>

            <div className="space-y-4">
              {/* Email */}
              {profile.email && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium">
                      Email Address
                    </p>
                    <p className="text-gray-800 font-semibold break-all">
                      {profile.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {profile.phone && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-green-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium">
                      Phone Number
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {profile.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Address */}
              {fullAddress && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    <p className="text-gray-800 font-semibold">{fullAddress}</p>
                  </div>
                </div>
              )}

              {/* Website */}
              {profile.website && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="text-indigo-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Website</p>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline break-all"
                    >
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}

              {/* Company & Position */}
              {(profile.company || profile.position) && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="text-orange-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium">
                      Employment
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {profile.position}
                      {profile.position && profile.company && " at "}
                      {profile.company}
                    </p>
                  </div>
                </div>
              )}

              {/* Full Name (if different from display name) */}
              {(profile.firstName || profile.lastName) && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="text-pink-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Full Name</p>
                    <p className="text-gray-800 font-semibold">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Account Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock size={24} className="text-blue-600" />
              Account Details
            </h2>

            <div className="space-y-4">
              

              {/* Verification Status */}
              {profile.isVerified !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">
                    Verification
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        profile.isVerified ? "bg-blue-500" : "bg-gray-400"
                      }`}
                    ></div>
                    <span
                      className={`font-semibold ${
                        profile.isVerified ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {profile.isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                </div>
              )}

              {/* Member Since */}
              {profile.createdAt && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
                    <Calendar size={14} />
                    Member Since
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {/* Last Updated */}
              {profile.updatedAt && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2 flex items-center gap-1">
                    <Calendar size={14} />
                    Last Updated
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              
            </div>
          </motion.div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={24} className="text-blue-600" />
              About
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          </motion.div>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award size={24} className="text-blue-600" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}