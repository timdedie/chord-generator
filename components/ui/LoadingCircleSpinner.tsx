"use client";

import { motion } from "framer-motion";

function LoadingCircleSpinner() {
    return (
        <div className="flex justify-center items-center p-10 rounded">
            <motion.div
                className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
}

export default LoadingCircleSpinner;
