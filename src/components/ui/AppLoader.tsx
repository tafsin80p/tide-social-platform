"use client";

import { motion } from "framer-motion";

export function AppLoader() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent relative z-50">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary border-r-primary shadow-[0_0_15px_rgba(38,100,236,0.3)]"
        />
        
        {/* Inner pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="absolute w-20 h-20 rounded-full border-2 border-primary/40 border-dashed"
        />

        {/* Center Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-2xl overflow-hidden relative shadow-lg z-10 bg-background flex items-center justify-center"
        >
          <img
            src="/logo.jpg"
            alt="Loading..."
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-sm font-medium text-text-secondary tracking-widest uppercase"
      >
        Loading...
      </motion.p>
    </div>
  );
}
