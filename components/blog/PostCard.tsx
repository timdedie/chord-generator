// components/blog/PostCard.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Post } from '@/lib/blogData';

interface PostCardProps {
    post: Post;
}

export function PostCard({ post }: PostCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <Card className="h-full bg-white/50 dark:bg-black/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/10">
                <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{post.description}</p>
                </CardContent>
                <CardFooter>
                    <div className="flex items-center text-sm font-semibold text-primary">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}