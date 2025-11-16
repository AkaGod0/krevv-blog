export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center text-white text-center px-6">
      <div className="animate-spin-slow mb-10">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#555"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M12 2 a10 10 0 0 1 0 20"
            stroke="#00ff88"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-bold mb-4">
        🚧 Website Under Maintenance
      </h1>

      <p className="text-gray-300 text-lg max-w-md">
        We're working hard to improve your experience.  
        The site will be back shortly!
      </p>

      <div className="mt-6 animate-pulse text-[#00ff88] font-semibold">
        Updating... Please wait
      </div>

      <style>
        {`
          .animate-spin-slow {
            animation: spin 6s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
