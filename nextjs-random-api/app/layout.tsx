// app/layout.tsx
import React from 'react';
import './globals.css'; // Pastikan untuk mengimpor CSS global
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="My Product Store - A place to buy the best products." />
        <meta name="author" content="My Product Store" />
        <title>My Product Store</title>
        <meta property="og:title" content="My Product Store" />
        <meta property="og:description" content="Shop the best products at My Product Store" />
        <meta property="og:image" content="URL to image" />
        <meta property="og:url" content="https://www.myproductstore.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@myproductstore" />
      </head>
      <body className={inter.className}>
        {/* Header */}
        <header className="bg-blue-600 text-white py-6 px-4 md:px-8 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-semibold sm:text-3xl">
              <Link href="/" className="hover:text-gray-200">
                My Product Store
              </Link>
            </h1>
            {/* Optional Navigation for bigger screens */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="hover:text-gray-200">
                Home
              </Link>
              <Link href="/products" className="hover:text-gray-200">
                Products
              </Link>
              <Link href="/contact" className="hover:text-gray-200">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6 text-center">
          <p className="text-sm sm:text-base">&copy; 2025 My Product Store. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
