import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
    return (
        <footer className="w-full bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <Image
                            src="/chordgen_logo_small.png"
                            alt="ChordGen Logo"
                            width={64}
                            height={64}
                            className="h-6 w-6 dark:invert"
                        />
                        <span className="font-bold text-gray-900 dark:text-gray-100">ChordGen</span>
                    </div>

                    {/* Links */}
                    <nav className="flex items-center gap-6 text-sm">
                        <Link
                            href="/app"
                            className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                        >
                            Generator
                        </Link>
                        <a
                            href="mailto:contact@chordgen.org"
                            className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                        >
                            Contact
                        </a>
                    </nav>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-500">
                    <p>&copy; {new Date().getFullYear()} ChordGen. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
