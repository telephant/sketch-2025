'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps } from '@/types';

// Background floating elements - travel theme
const bgEmojis = [
  // Top-left area
  { emoji: '✈️', x: 8, y: 12, floatDuration: 11, floatDelay: 0 },
  { emoji: '🧳', x: 20, y: 25, floatDuration: 13, floatDelay: 1.2 },
  // Top-right area
  { emoji: '🗺️', x: 78, y: 10, floatDuration: 10, floatDelay: 0.5 },
  { emoji: '🏔️', x: 90, y: 28, floatDuration: 12, floatDelay: 1.8 },
  // Middle-left area
  { emoji: '🌴', x: 5, y: 50, floatDuration: 9.5, floatDelay: 0.8 },
  { emoji: '🚂', x: 15, y: 65, floatDuration: 11.5, floatDelay: 2 },
  // Middle-right area
  { emoji: '🏖️', x: 85, y: 48, floatDuration: 10.5, floatDelay: 1.5 },
  { emoji: '⛵', x: 75, y: 62, floatDuration: 12.5, floatDelay: 0.3 },
  // Bottom-left area
  { emoji: '🎒', x: 10, y: 80, floatDuration: 11.2, floatDelay: 1 },
  { emoji: '📸', x: 22, y: 88, floatDuration: 9.8, floatDelay: 2.2 },
  // Bottom-right area
  { emoji: '🌅', x: 82, y: 78, floatDuration: 10.8, floatDelay: 0.6 },
  { emoji: '🗼', x: 70, y: 85, floatDuration: 13.5, floatDelay: 1.3 },
];

// Four options
const travelOptions = [
  {
    id: 'none',
    emoji: '✈️',
    color: '#94a3b8',
    bgResponse: 'flyBy', // Plane flies across screen
  },
  {
    id: 'few',
    emoji: '🗺️',
    color: '#22c55e',
    bgResponse: 'mapUnfold', // Map unfolds
  },
  {
    id: 'some',
    emoji: '🌍',
    color: '#3b82f6',
    bgResponse: 'globeSpin', // Globe spins + plane orbits
  },
  {
    id: 'many',
    emoji: '🌏',
    color: '#a855f7',
    bgResponse: 'fullTravel', // Full travel trajectory animation
  },
];

export function Q2Travel({ onComplete }: QuestionProps) {
  const t = useTranslations('q2');
  const { dispatch } = useAnswers();

  const [selected, setSelected] = useState<string | null>(null);
  const [bgResponse, setBgResponse] = useState<string | null>(null);

  const handleSelect = (option: typeof travelOptions[0]) => {
    if (selected) return;

    setSelected(option.id);
    setBgResponse(option.bgResponse);

    // Delay 2 seconds before moving to next step
    setTimeout(() => {
      dispatch({
        type: 'SET_Q2',
        payload: {
          selected: option.id,
          emoji: option.emoji,
          color: option.color,
          frequency: option.id as 'rare' | 'sometimes' | 'often' | 'daily', // 兼容现有类型
        },
      });
      onComplete();
    }, 2000);
  };

  // Generate background animation based on selection
  const getBgEmojiAnimation = (index: number) => {
    if (!bgResponse) {
      // Default floating animation
      return {
        y: [0, -15, 0, 15, 0],
        x: [0, 8, 0, -8, 0],
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.05, 1],
        rotate: [0, 3, 0, -3, 0],
      };
    }

    switch (bgResponse) {
      case 'flyBy':
        // No travel - plane flies by, others fade out
        return {
          x: [0, 100, 200],
          opacity: [0.4, 0.6, 0],
          scale: [1, 1.1, 0.8],
        };
      case 'mapUnfold':
        // 1-2 times - map unfold effect
        return {
          scale: [1, 1.3, 1.2],
          rotate: [0, 10, 5],
          opacity: [0.4, 0.7, 0.5],
        };
      case 'globeSpin':
        // 3-5 times - globe spin
        return {
          rotate: [0, 360],
          scale: [1, 1.15, 1.1],
          opacity: [0.5, 0.8, 0.6],
        };
      case 'fullTravel':
        // 5+ times - all elements go crazy!
        return {
          scale: [1, 1.5, 1.2, 1.6, 1.3, 1.4],
          rotate: [0, 45, -30, 60, -20, 30],
          opacity: [0.5, 1, 0.8, 1, 0.9, 1],
          y: [0, -40, -20, -50, -30, -25],
          x: [0, 30, -20, 40, -30, 15],
        };
      default:
        return {};
    }
  };


  return (
    <>
      {/* Background floating emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        {bgEmojis.map((item, index) => (
          <motion.span
            key={index}
            className="absolute text-3xl select-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={getBgEmojiAnimation(index)}
            transition={{
              duration: bgResponse ? 2.5 : item.floatDuration,
              repeat: bgResponse ? 0 : Infinity,
              delay: bgResponse ? index * 0.1 : item.floatDelay,
              ease: 'easeInOut',
            }}
          >
            {item.emoji}
          </motion.span>
        ))}

        {/* Plane fly-by animation - when "No" is selected */}
        <AnimatePresence>
          {bgResponse === 'flyBy' && (
            <motion.div
              className="absolute text-6xl"
              style={{ top: '40%' }}
              initial={{ left: '-10%', opacity: 0 }}
              animate={{ left: '110%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            >
              ✈️
            </motion.div>
          )}
        </AnimatePresence>

        {/* Globe spin animation - when "3-5 times" or "5+ times" is selected */}
        <AnimatePresence>
          {(bgResponse === 'globeSpin' || bgResponse === 'fullTravel') && (
            <motion.div
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: bgResponse === 'fullTravel' ? '10rem' : '8rem'
              }}
              initial={{ scale: 0, rotate: 0, opacity: 0 }}
              animate={{
                scale: bgResponse === 'fullTravel' ? [0, 1.2, 1, 1.3, 1.1] : 1,
                rotate: bgResponse === 'fullTravel' ? [0, 720] : 360,
                opacity: bgResponse === 'fullTravel' ? 0.5 : 0.3
              }}
              transition={{ duration: bgResponse === 'fullTravel' ? 2.5 : 2, ease: 'easeOut' }}
            >
              🌍
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flight trajectory - when "5+ times" is selected */}
        <AnimatePresence>
          {bgResponse === 'fullTravel' && (
            <>
              {/* Multiple flight paths */}
              <motion.svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ zIndex: 1 }}
              >
                {/* Path 1 */}
                <motion.path
                  d="M 5% 70% Q 25% 20%, 50% 50% T 95% 30%"
                  fill="none"
                  stroke="rgba(168, 85, 247, 0.6)"
                  strokeWidth="3"
                  strokeDasharray="12 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
                {/* Path 2 */}
                <motion.path
                  d="M 10% 30% Q 40% 80%, 60% 40% T 90% 70%"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
                />
                {/* Path 3 */}
                <motion.path
                  d="M 15% 50% Q 50% 10%, 70% 60% T 85% 25%"
                  fill="none"
                  stroke="rgba(34, 197, 94, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeInOut', delay: 0.6 }}
                />
              </motion.svg>

              {/* Flying planes along paths */}
              <motion.div
                className="absolute text-3xl"
                initial={{ left: '5%', top: '70%', opacity: 0 }}
                animate={{
                  left: ['5%', '50%', '95%'],
                  top: ['70%', '35%', '30%'],
                  opacity: [0, 1, 0],
                  rotate: [0, -20, -10]
                }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              >
                ✈️
              </motion.div>
              <motion.div
                className="absolute text-2xl"
                initial={{ left: '10%', top: '30%', opacity: 0 }}
                animate={{
                  left: ['10%', '60%', '90%'],
                  top: ['30%', '60%', '70%'],
                  opacity: [0, 1, 0],
                  rotate: [0, 15, 25]
                }}
                transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
              >
                ✈️
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="relative glass-card p-8 overflow-hidden min-h-[500px]">
        {/* Title area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 relative z-10"
        >
          <h2
            className="font-bold mb-3 bg-clip-text text-transparent"
            style={{
              fontSize: 'var(--text-question)',
              backgroundImage: 'linear-gradient(90deg, #8faa96, #a098b0, #88aca8)'
            }}
          >
            {t('title')}
          </h2>
        </motion.div>

        {/* Four options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 relative z-10"
        >
          {travelOptions.map((option, index) => {
            const isSelected = selected === option.id;
            const isOther = selected && !isSelected;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isOther ? 0.4 : 1,
                  y: 0,
                  scale: isOther ? 0.95 : 1,
                }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.3,
                }}
                onClick={() => !selected && handleSelect(option)}
                disabled={!!selected}
                className={`
                  relative p-6 rounded-2xl border transition-all duration-300
                  ${isSelected
                    ? 'border-white/30 shadow-lg'
                    : 'border-white/10 hover:border-white/20'
                  }
                  ${!selected ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
                `}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${option.color}20, ${option.color}10)`
                    : 'rgba(255,255,255,0.03)',
                  boxShadow: isSelected ? `0 0 30px ${option.color}30` : 'none',
                }}
                whileHover={!selected ? { y: -2 } : {}}
                whileTap={!selected ? { scale: 0.98 } : {}}
              >
                {/* Selection ripple effect */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.7 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: `radial-gradient(circle, ${option.color}35, transparent)` }}
                    />
                  )}
                </AnimatePresence>

                {/* Emoji animation */}
                <motion.span
                  className="text-4xl block mb-3"
                  animate={
                    isSelected
                      ? option.id === 'none'
                        ? { x: [0, 50, 100], opacity: [1, 1, 0] } // Fly away
                        : option.id === 'few'
                        ? { scale: [1, 1.3, 1.2], rotate: [0, 10, 5] } // Unfold
                        : option.id === 'some'
                        ? { rotate: [0, 360], scale: [1, 1.2, 1.15] } // Spin
                        : { // 5+ times - WILD celebration!
                            scale: [1, 1.8, 1.4, 2, 1.6, 1.8],
                            rotate: [0, -30, 45, -60, 90, 0],
                            y: [0, -30, -15, -40, -20, -25],
                            x: [0, 15, -20, 25, -15, 0],
                          }
                      : {}
                  }
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                >
                  {option.emoji}
                </motion.span>

                {/* Text label */}
                <motion.span
                  className="text-sm font-medium"
                  style={{ color: isSelected ? option.color : 'rgba(255,255,255,0.7)' }}
                >
                  {t(`options.${option.id}`)}
                </motion.span>
              </motion.button>
            );
          })}
        </motion.div>

      </div>
    </>
  );
}
