'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
};

export function MotionSection({
    children,
    className,
    variant = 'stagger',
    animate = 'whileInView',
}: {
    children: React.ReactNode;
    className?: string;
    variant?: 'stagger' | 'fadeInUp' | 'scaleIn';
    animate?: 'whileInView' | 'onMount';
}) {
    const variants = variant === 'stagger' ? staggerContainer : variant === 'scaleIn' ? scaleIn : fadeInUp;
    const animateProps = animate === 'onMount'
        ? { initial: 'hidden' as const, animate: 'visible' as const }
        : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: true, margin: '-100px' } };

    return (
        <motion.div variants={variants} className={className} {...animateProps}>
            {children}
        </motion.div>
    );
}

export function MotionItem({
    children,
    className,
    variant = 'fadeInUp',
}: {
    children: React.ReactNode;
    className?: string;
    variant?: 'fadeInUp' | 'scaleIn';
}) {
    const variants = variant === 'scaleIn' ? scaleIn : fadeInUp;
    return (
        <motion.div variants={variants} className={className}>
            {children}
        </motion.div>
    );
}

export function ScrollIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-start justify-center p-2"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
            </motion.div>
        </motion.div>
    );
}
