// app/blog/BlogIndexClient.tsx

'use client'; // This directive STAYS HERE. This is the interactive part.

import React from 'react';
import { motion } from 'framer-motion';
import { posts } from '@/lib/blogData';
import { PostCard } from '@/components/blog/PostCard';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
        },
    },
};

// We renamed the function for clarity. The code inside is identical.
export default function BlogIndexClient() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto max-w-4xl px-4 py-16 sm:py-24"
        >
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                    The ChordGen Blog
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Songwriting tips, music theory insights, and product updates to help you create better music.
                </p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {posts.map((post) => (
                    <motion.div variants={itemVariants} key={post.slug}>
                        <PostCard post={post} />
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}