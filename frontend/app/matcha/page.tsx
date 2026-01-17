'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import FloatingAvatar from '@/components/FloatingAvatar';

export default function MatchaPage() {
  return (
    <div className="min-h-screen bg-[#B8C5B0] relative">
      {/* Floating Avatar - animates to corner */}
      <FloatingAvatar mode="matcha" />

      <div className="p-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-8">Find your blend.</h1>

          {/* Search Bar */}
          <div className="relative mb-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
            <input
              type="text"
              placeholder="Find a hobby or relaxing activity..."
              className="w-full pl-16 pr-6 py-5 rounded-2xl text-lg border-none focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bg-white rounded-3xl h-80 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Add your card content here */}
                <div className="h-full flex items-center justify-center text-gray-400">
                  Activity Card {i}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}