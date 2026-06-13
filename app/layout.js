import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "TCL Business Accounting Portal",
  description: "Interactive business accounting, invoicing, receipts, and performance reports for Titobiloba Consults Limited",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Load Chart.js and html2pdf.js globally for client side usage */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/chart.js" 
          strategy="beforeInteractive" 
        />
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" 
          strategy="lazyOnload" 
        />
      </head>
      <body className={outfit.className}>
        {children}
      </body>
    </html>
  );
}
