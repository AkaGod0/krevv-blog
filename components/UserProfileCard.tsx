"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, MapPin, Phone, Briefcase, Star } from "lucide-react";
import { api } from "@/app/context/AuthContext";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  role: string;
}

interface UserProfileCardProps {
  userId: string;
  userName: string;
  children: React.ReactNode;
}

export default function UserProfileCard({ userId, userName, children }: UserProfileCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isHovered && !profile && !loading) {
      fetchProfile();
    }
  }, [isHovered]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${userId}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 z-50 w-80"
          >
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : profile ? (
                <div>
                  {/* Profile Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={`${profile.firstName} ${profile.lastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="text-amber-600" size={32} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">{profile.role}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {profile.bio}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-amber-500" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-amber-500" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-amber-500" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>

                  {/* View Profile Link */}
                  <a
                    href={`/profile/${userId}`}
                    className="block w-full text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Full Profile
                  </a>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Profile not available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}