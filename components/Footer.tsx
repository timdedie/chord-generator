// components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component

export function Footer() {
    return (
        <footer className="w-full bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Column 1: Brand */}
                    <div className="space-y-3 col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/chordgen_logo.png"
                                alt="ChordGen Logo"
                                width={1024}  // Use the actual native width
                                height={1024} // Use the actual native height
                                className="h-7 w-7 dark:invert" // Style it as a square
                            />
                            <span className="font-bold text-xl text-gray-900 dark:text-gray-100">ChordGen</span>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Free AI-powered chord progression & MIDI generator for music creators.
                        </p>
                    </div>

                    {/* Link Columns */}
                    <div className="col-span-2 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Product</h4>
                            <nav className="flex flex-col space-y-2 text-sm">
                                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Generator Tool</Link>
                                <Link href="/how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">How It Works</Link>
                            </nav>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Resources</h4>
                            <nav className="flex flex-col space-y-2 text-sm">
                                <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Blog</Link>
                                <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">FAQ</Link>
                                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Contact Us</Link>
                            </nav>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Legal</h4>
                            <nav className="flex flex-col space-y-2 text-sm">
                                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Terms of Service</Link>
                            </nav>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} ChordGen. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}