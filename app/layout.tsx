import "./globals.css";
import ConditionalNavbar from "../components/ConditionalNavbar";
import Footer from "../components/Footer";
import CookieNotice from "../components/CookieNotice";

export const metadata = {
  title: {
    default: "My Blog — Inspiring Stories & Ideas",
    template: "%s | My Blog",
  },
  description:
    "Discover inspiring stories, tutorials, and creative insights about life, tech, and creativity.",
  keywords: [
    "blog",
    "stories",
    "inspiration",
    "tech",
    "tutorials",
    "creative writing",
    "lifestyle",
  ],
  metadataBase: new URL("https://yourdomain.com"), // ✅ replace with your real domain
  authors: [{ name: "My Blog Team", url: "https://yourdomain.com" }],
  creator: "My Blog Team",
  publisher: "My Blog",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "My Blog — Inspiring Stories & Ideas",
    description:
      "Discover inspiring stories, tutorials, and creative insights about life, tech, and creativity.",
    url: "https://yourdomain.com",
    siteName: "My Blog",
    images: [
      {
        url: "https://yourdomain.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "My Blog preview image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Blog — Inspiring Stories & Ideas",
    description:
      "Discover inspiring stories, tutorials, and creative insights about life, tech, and creativity.",
    creator: "@yourhandle", // replace with your Twitter handle
    images: ["https://yourdomain.com/twitter-card.png"],
  },
  alternates: {
    canonical: "https://yourdomain.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-gray-800 flex flex-col min-h-screen">
        <ConditionalNavbar />
        <main className="flex-1">
          {children}
          <CookieNotice />
        </main>
        <Footer />
      </body>
    </html>
  );
}
