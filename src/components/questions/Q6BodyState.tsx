'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps } from '@/types';

// Background floating elements - body/fitness theme
const bgEmojis = [
  // Fitness - for significant progress
  { emoji: '💪', x: 8, y: 12, floatDuration: 11, floatDelay: 0, group: 'significant' },
  { emoji: '🏋️', x: 20, y: 25, floatDuration: 13, floatDelay: 1.2, group: 'significant' },
  { emoji: '🏆', x: 90, y: 28, floatDuration: 12, floatDelay: 1.8, group: 'significant' },
  // Growth - for some progress
  { emoji: '🌱', x: 78, y: 10, floatDuration: 10, floatDelay: 0.5, group: 'some' },
  { emoji: '🌿', x: 5, y: 50, floatDuration: 9.5, floatDelay: 0.8, group: 'some' },
  { emoji: '🌻', x: 15, y: 65, floatDuration: 11.5, floatDelay: 2, group: 'some' },
  // Balance - for no change
  { emoji: '⚖️', x: 85, y: 48, floatDuration: 10.5, floatDelay: 1.5, group: 'noChange' },
  { emoji: '🧘', x: 75, y: 62, floatDuration: 12.5, floatDelay: 0.3, group: 'noChange' },
  { emoji: '☯️', x: 10, y: 80, floatDuration: 11.2, floatDelay: 1, group: 'noChange' },
  // Hourglass - for regression
  { emoji: '⏳', x: 82, y: 78, floatDuration: 10.8, floatDelay: 0.6, group: 'regression' },
  { emoji: '🔄', x: 70, y: 85, floatDuration: 13.5, floatDelay: 1.3, group: 'regression' },
  { emoji: '📉', x: 22, y: 88, floatDuration: 9.8, floatDelay: 2.2, group: 'regression' },
];

// Four body state options
const bodyOptions = [
  {
    id: 'significant',
    emoji: '💪',
    color: '#22c55e',
    bgResponse: 'fitness',
  },
  {
    id: 'some',
    emoji: '🌱',
    color: '#84cc16',
    bgResponse: 'growth',
  },
  {
    id: 'noChange',
    emoji: '⚖️',
    color: '#64748b',
    bgResponse: 'balance',
  },
  {
    id: 'regression',
    emoji: '⏳',
    color: '#f97316',
    bgResponse: 'hourglass',
  },
];

export function Q6BodyState({ onComplete }: QuestionProps) {
  const t = useTranslations('q6');
  const { dispatch } = useAnswers();

  const [selected, setSelected] = useState<string | null>(null);
  const [bgResponse, setBgResponse] = useState<string | null>(null);

  const handleSelect = (option: typeof bodyOptions[0]) => {
    if (selected) return;

    setSelected(option.id);
    setBgResponse(option.bgResponse);

    setTimeout(() => {
      dispatch({
        type: 'SET_Q6',
        payload: {
          selected: option.id,
          emoji: option.emoji,
        },
      });
      onComplete();
    }, 2000);
  };

  // Background animation based on selection
  const getBgEmojiAnimation = (index: number, group: string) => {
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

    // Highlight matching group, fade others
    const isMatching =
      (bgResponse === 'fitness' && group === 'significant') ||
      (bgResponse === 'growth' && group === 'some') ||
      (bgResponse === 'balance' && group === 'noChange') ||
      (bgResponse === 'hourglass' && group === 'regression');

    if (isMatching) {
      switch (bgResponse) {
        case 'fitness':
          return {
            scale: [1, 1.5, 1.3, 1.4],
            opacity: [0.5, 1, 0.9, 1],
            y: [0, -25, -15, -20],
            rotate: [0, 10, -10, 0],
          };
        case 'growth':
          return {
            scaleY: [1, 1.4, 1.3],
            opacity: [0.5, 0.9, 0.8],
            y: [0, -15, -12],
          };
        case 'balance':
          return {
            rotate: [0, 15, -15, 10, -10, 0],
            opacity: [0.5, 0.8, 0.7],
            scale: [1, 1.1, 1.05],
          };
        case 'hourglass':
          return {
            rotate: [0, 180],
            opacity: [0.5, 0.8, 0.6],
            scale: [1, 1.2, 1.1],
          };
      }
    }

    // Fade out non-matching
    return {
      scale: [1, 0.8, 0.6],
      opacity: [0.4, 0.2, 0],
    };
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
            animate={getBgEmojiAnimation(index, item.group)}
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
          {bodyOptions.map((option, index) => {
            const isSelected = selected === option.id;
            const isOther = selected && !isSelected;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isOther ? 0.3 : 1,
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
                      ? option.id === 'significant'
                        ? { scale: [1, 1.5, 1.3], y: [0, -15, -10], rotate: [0, 10, 0] }
                        : option.id === 'some'
                        ? { scaleY: [1, 1.4, 1.3], y: [0, -10, -8] }
                        : option.id === 'noChange'
                        ? { rotate: [0, 15, -15, 10, -10, 0] }
                        : { rotate: [0, 180], scale: [1, 1.2, 1.1] }
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
