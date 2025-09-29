"use client"

import { motion } from "framer-motion"

export function CreativeLoader() {
  return (
    <div className="flex min-h-screen h-full w-full items-center justify-center py-20">
      <div className="relative">
        {/* Main loader */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="h-16 w-16 rounded-full border-4 border-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          />

          <motion.div
            className="absolute h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />

          <motion.div
            className="absolute h-8 w-8 rounded-full border-4 border-r-primary border-l-transparent border-t-transparent border-b-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          {/* Center dot */}
          <motion.div
            className="absolute h-3 w-3 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -bottom-4 left-1/2 h-1 w-1 rounded-full bg-primary"
          animate={{
            x: [-30, 30, -30],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />

        <motion.div
          className="absolute -top-4 left-1/2 h-1 w-1 rounded-full bg-primary"
          animate={{
            x: [30, -30, 30],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
        />

        {/* Text */}
        <motion.p
          className="mt-8 text-center text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Crafting your analytics...
        </motion.p>
      </div>
    </div>
  )
}
