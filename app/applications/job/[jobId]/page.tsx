"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, api } from "@/app/context/AuthContext";

interface Application {
  _id: string;
  coverLetter: string;
  resumeUrl: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  appliedAt: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    profileImage?: string;
  };
}

interface Job {
  _id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  type: string;
}

export default function JobApplicationsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  });
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchApplications();
      fetchJob();
    }
  }, [user, authLoading, jobId]);

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.data);
      
      // Calculate stats
      const stats = {
        total: res.data.length,
        pending: res.data.filter((app: Application) => app.status === "pending").length,
        reviewing: res.data.filter((app: Application) => app.status === "reviewing").length,
        accepted: res.data.filter((app: Application) => app.status === "accepted").length,
        rejected: res.data.filter((app: Application) => app.status === "rejected").length,
      };
      setStats(stats);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      if (err.response?.status === 403) {
        alert("You don't have permission to view these applications");
        router.push("/jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${jobId}`);
      setJob(res.data);
    } catch (err) {
      console.error("Error fetching job:", err);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: "pending" | "reviewing" | "accepted" | "rejected"
  ) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus,
      });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      // Recalculate stats
      const updatedApps = applications.map((app) =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      );
      const newStats = {
        total: updatedApps.length,
        pending: updatedApps.filter((app) => app.status === "pending").length,
        reviewing: updatedApps.filter((app) => app.status === "reviewing").length,
        accepted: updatedApps.filter((app) => app.status === "accepted").length,
        rejected: updatedApps.filter((app) => app.status === "rejected").length,
      };
      setStats(newStats);

      alert("Application status updated successfully!");
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      reviewing: "bg-blue-100 text-blue-700 border-blue-300",
      accepted: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock size={16} />,
      reviewing: <Eye size={16} />,
      accepted: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />,
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* Header */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="mb-6 md:mb-8"
>
  <Link 
    href={job ? `/jobs/${job.slug}` : "/jobs"}
    className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4 font-medium transition"
  >
    <ArrowLeft size={20} />
    {job ? "Back to Job Details" : "Back to Jobs"}
  </Link>

  {job && (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        Applications for {job.title}
      </h1>
      <p className="text-sm md:text-base text-gray-600">
        {job.company} • {job.location} • {job.type}
      </p>
    </>
  )}
</motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-gray-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">
              {stats.total}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-yellow-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-blue-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Reviewing</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">
              {stats.reviewing}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-green-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Accepted</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">
              {stats.accepted}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-3 md:p-4 border-l-4 border-red-500"
          >
            <p className="text-xs md:text-sm text-gray-600 mb-1">Rejected</p>
            <p className="text-2xl md:text-3xl font-bold text-red-600">
              {stats.rejected}
            </p>
          </motion.div>
        </div>

        {/* Applications List */}
   {/* Applications List */}
{applications.length === 0 ? (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center"
  >
    <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
    <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
      No Applications Yet
    </h3>
    <p className="text-sm md:text-base text-gray-500 mb-6">
      No one has applied to this job yet.
    </p>
  </motion.div>
) : (
  <div className="space-y-4">
    {applications.map((application, idx) => {
      // ✅ Safety check - skip if user data is missing
      if (!application.user) {
        console.error('❌ Application missing user data:', application._id);
        return null;
      }

      return (
        <motion.div
          key={application._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.05 }}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 md:p-6"
        >
          <div className="flex flex-col gap-4">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Applicant Info */}
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <User className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {application.user.firstName || 'N/A'} {application.user.lastName || ''}
                  </h3>
                  <div className="flex flex-col gap-1 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <a
                        href={`mailto:${application.user.email}`}
                        className="hover:text-amber-600 transition"
                      >
                        {application.user.email || 'No email'}
                      </a>
                    </div>
                    {application.user.phone && (
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <span>{application.user.phone}</span>
                      </div>
                    )}
                    {application.user.location && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{application.user.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Date */}
              <div className="flex flex-col items-start md:items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(
                    application.status
                  )}`}
                >
                  {getStatusIcon(application.status)}
                  {application.status.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={14} />
                  Applied {new Date(application.appliedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Cover Letter Preview */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                Cover Letter
              </p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {application.coverLetter || 'No cover letter provided'}
              </p>
              {application.coverLetter && (
                <button
                  onClick={() => setSelectedApplication(application)}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2"
                >
                  Read More →
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {application.resumeUrl && (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-sm flex items-center gap-2"
                >
                  <Download size={16} />
                  View Resume
                </a>
              )}

              {/* Status Update Buttons */}
              {application.status !== "reviewing" && (
                <button
                  onClick={() =>
                    updateApplicationStatus(application._id, "reviewing")
                  }
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition text-sm disabled:opacity-50"
                >
                  Mark as Reviewing
                </button>
              )}

              {application.status !== "accepted" && (
                <button
                  onClick={() =>
                    updateApplicationStatus(application._id, "accepted")
                  }
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition text-sm disabled:opacity-50"
                >
                  Accept
                </button>
              )}

              {application.status !== "rejected" && (
                <button
                  onClick={() =>
                    updateApplicationStatus(application._id, "rejected")
                  }
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition text-sm disabled:opacity-50"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>
)}

        {/* Modal for Full Cover Letter */}
        {/* Modal for Full Cover Letter */}
{selectedApplication && selectedApplication.user && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={() => setSelectedApplication(null)}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {selectedApplication.user.firstName || 'N/A'}{" "}
            {selectedApplication.user.lastName || ''}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedApplication.user.email || 'No email'}
          </p>
        </div>
        <button
          onClick={() => setSelectedApplication(null)}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <FileText size={20} className="text-amber-500" />
          Cover Letter
        </h4>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {selectedApplication.coverLetter || 'No cover letter provided'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {selectedApplication.resumeUrl && (
          <a
            href={selectedApplication.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-center"
          >
            View Resume
          </a>
        )}
        <button
          onClick={() => setSelectedApplication(null)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
        >
          Close
        </button>
      </div>
    </motion.div>
  </div>
)}
      </div>
    </div>
  );
}