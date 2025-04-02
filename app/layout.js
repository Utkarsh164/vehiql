import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const inter=Inter({subsets:['latin']})
export const metadata = {
  title: "Vehiql",
  description: "Find your dream vehical",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Header/>
        <main className="min-h-screen">{children}</main>
       <footer className="bg-blue-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p></p>
        </div>
       </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
