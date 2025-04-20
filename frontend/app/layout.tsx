import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RadAI - Image Processing',
  description: 'Process images with RadAI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-blue-600 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                RadAI
              </Link>
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/" className="hover:text-blue-200 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/image-processor" className="hover:text-blue-200 transition-colors">
                      Process Image
                    </Link>
                  </li>
                  <li>
                    <Link href="/images" className="hover:text-blue-200 transition-colors">
                      Gallery
                    </Link>
                  </li>
                  <li>
                    <Link href="/users" className="hover:text-blue-200 transition-colors">
                      Users
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-100 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} RadAI. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
} 