'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<'matcha' | 'coffee' | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="absolute top-8 left-8">
        <h1 className="text-2xl font-bold">Common Grounds</h1>
      </div>

      {/* Main Content */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-5xl font-bold mb-4">Welcome Back, Alex.</h2>
        <p className="text-xl text-gray-500 mb-12">
          Finding harmony in your daily grind.
        </p>

        {/* Mode Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/matcha">
            <motion.button
              className="px-12 py-4 rounded-full text-xl font-semibold bg-[#8BC34A] text-black hover:bg-[#7CB342] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Matcha
            </motion.button>
          </Link>

          <Link href="/coffee">
            <motion.button
              className="px-12 py-4 rounded-full text-xl font-semibold bg-[#A1887F] text-black hover:bg-[#8D6E63] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Coffee
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}