// src/components/ui/LoadingIndicator.jsx
import { motion } from 'framer-motion';

const LoadingIndicator = ({ size = 48, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear"
          }}
          className="absolute inset-0 rounded-full border-4 border-blue-100"
        />
        
        {/* Inner pulsing dot */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-3 h-3 bg-blue-600 rounded-full" />
        </motion.div>
        
        {/* Floating graduation cap */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [-3, 3, -3]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Graduation cap SVG */}
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none"
              className="drop-shadow-lg"
            >
              {/* Cap top (board) */}
              <motion.path
                d="M12 3L2 8l10 5 10-5-10-5z"
                fill="#2563eb"
                stroke="#1e40af"
                strokeWidth="0.5"
                animate={{ 
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Cap base */}
              <motion.path
                d="M12 13v6M8 11v6c0 2 1.79 4 4 4s4-2 4-4v-6"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              
              {/* Tassel */}
              <motion.g
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  x: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: '18px 8px' }}
              >
                {/* Tassel string */}
                <line 
                  x1="18" 
                  y1="8" 
                  x2="18" 
                  y2="12"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Tassel end */}
                <circle 
                  cx="18" 
                  cy="13" 
                  r="1.5"
                  fill="#fbbf24"
                />
              </motion.g>
            </svg>
          </div>
        </motion.div>
        
        {/* Sparkles around the cap */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, (i - 1) * 15],
              y: [0, -15]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
            className="absolute top-0 left-1/2"
            style={{ transformOrigin: 'center' }}
          >
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LoadingIndicator;