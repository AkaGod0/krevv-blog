export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      {/* Animated Icon */}
      <div className="animate-pulse mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-24 h-24 text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2"
            d="M12 9v2m0 4h.01M5.29 17h13.42c1.13 0 1.86-1.22 1.35-2.23l-6.7-13.42c-.56-1.12-2.14-1.12-2.7 0L3.94 14.77A1.6 1.6 0 0 0 5.29 17Z"
          />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
        🚧 We’re Performing Maintenance
      </h1>

      {/* Description */}
      <p className="text-gray-300 text-center max-w-lg leading-relaxed">
        We’re upgrading <span className="text-yellow-300 font-semibold">Krevv</span> 
        to serve you better.  
        <br />
        Please check back soon — we'll be right back.
      </p>

      {/* Loading Animation */}
      <div className="flex space-x-2 mt-8">
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
      </div>

      {/* Footer Note */}
      <p className="text-gray-400 text-sm mt-10">
        &copy; {new Date().getFullYear()} Krevv — All rights reserved.
      </p>
    </div>
  );
}
