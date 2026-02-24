"use client";
import { useState, useEffect } from "react";
import { api, useAuth } from "../../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Clock,
  DollarSign,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();

  // Form State aligned with Backend
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState<number>(0);
  const [proposedTimeline, setProposedTimeline] = useState<number>(3);
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // UI State
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchServiceBrief();
  }, [id]);

  const fetchServiceBrief = async () => {
    try {
      const res = await api.get(`/marketplace/services/${id}`);
      setService(res.data);
      setProposedRate(res.data.budget);
    } catch (err) {
      console.error("Failed to fetch service brief");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Payload matches your backend keys exactly
      await api.post(`/marketplace/services/${id}/apply`, {
        coverLetter,
        proposedRate,
        proposedTimeline,
        portfolioUrl,
      });
      setSuccess(true);
    } catch (err) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="h-1.5 w-full bg-slate-200">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: "66%" }} 
          className="h-full bg-blue-600"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid lg:grid-cols-3 gap-10"
            >
              <div className="lg:col-span-1">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
                >
                  <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                  Cancel Application
                </button>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Project Brief</h2>
                  <h1 className="text-xl font-bold text-slate-900 mb-4">{service?.title}</h1>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-4">
                    {service?.description}
                  </p>
                  
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Client Budget</span>
                      <span className="font-bold text-slate-900">${service?.budget}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start">
                  <ShieldCheck className="text-blue-600 mr-3 shrink-0" size={20} />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Your proposal is private. Funds are held in escrow once the client hires you.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="bg-slate-900 p-8 text-white">
                    <h2 className="text-2xl font-bold">Submit Your Proposal</h2>
                    <p className="text-slate-400 text-sm">Professional applications get hired 3x faster.</p>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Cover Letter */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Cover Letter</label>
                      <textarea
                        required
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Detail your approach and relevant experience..."
                        className="w-full min-h-[200px] p-5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-slate-700"
                      />
                    </div>

                    {/* Portfolio URL */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Portfolio / Resume URL</label>
                      <div className="relative">
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="url"
                          placeholder="https://behance.net/yourname"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                          className="w-full pl-10 pr-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Proposed Rate */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Proposed Rate ($)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="number"
                            required
                            value={proposedRate}
                            onChange={(e) => setProposedRate(Number(e.target.value))}
                            className="w-full pl-10 pr-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                          />
                        </div>
                      </div>

                      {/* Proposed Timeline */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Estimated Days</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="number"
                            required
                            value={proposedTimeline}
                            onChange={(e) => setProposedTimeline(Number(e.target.value))}
                            className="w-full pl-10 pr-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-tighter">Days</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={submitting}
                      className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                        submitting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                      }`}
                    >
                      {submitting ? (
                        <div className="w-6 h-6 border-3 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Submit Proposal
                          <Send size={20} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <SuccessMessage serviceTitle={service?.title} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SuccessMessage({ serviceTitle }: { serviceTitle: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto text-center py-20"
    >
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
        <CheckCircle2 size={48} className="text-green-600" />
      </div>
      <h2 className="text-4xl font-black text-slate-900 mb-4">Proposal Sent!</h2>
      <p className="text-slate-600 mb-10 text-lg leading-relaxed">
        Your application for <span className="font-bold text-slate-900">"{serviceTitle}"</span> has been delivered to the client.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/applications" className="flex-1">
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all">
            Track Status
          </button>
        </Link>
        <Link href="/marketplace" className="flex-1">
          <button className="w-full bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Browse Tasks
          </button>
        </Link>
      </div>
    </motion.div>
  );
}