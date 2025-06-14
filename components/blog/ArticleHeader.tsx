// components/blog/ArticleHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface ArticleHeaderProps {
    title: string;
    date: string;
}

export function ArticleHeader({ title, date }: ArticleHeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
        >
            <div className="mb-6">
                <Link
                    href="/blog"
                    className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Blog
                </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-slate-900 dark:text-slate-50">
                {title}
            </h1>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Published on {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </motion.header>
    );
}