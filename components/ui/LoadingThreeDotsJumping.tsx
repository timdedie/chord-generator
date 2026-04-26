"use client";

import { motion, type Variants } from "framer-motion";

function LoadingThreeDotsJumping() {
    const dotVariants: Variants = {
        jump: {
            y: -20,
            transition: { duration: 0.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        },
    };

    return (
        <motion.div animate="jump" transition={{ staggerChildren: -0.2, staggerDirection: -1 }} className="flex gap-2">
            <motion.div className="w-3 h-3 rounded-full bg-black" variants={dotVariants} />
            <motion.div className="w-3 h-3 rounded-full bg-black" variants={dotVariants} />
            <motion.div className="w-3 h-3 rounded-full bg-black" variants={dotVariants} />
        </motion.div>
    );
}

export default LoadingThreeDotsJumping;