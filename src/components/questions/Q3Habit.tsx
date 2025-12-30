'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps } from '@/types';

// Duration options for follow-up question
const durationOptions = [
  {
    id: 'short',
    emoji: '⏳',
    color: '#94a3b8',
    animation: { rotate: [-10, 10, -10], y: [0, -5, 0] }, // Hourglass wobble
  },
  {
    id: 'months',
    emoji: '🏃',
    color: '#f59e0b',
    animation: { x: [-5, 5, -5, 5, 0], y: [0, -8, 0] }, // Running motion
  },
  {
    id: 'halfYear',
    emoji: '🌱',
    color: '#22c55e',
    animation: { scaleY: [1, 1.3, 1.2], y: [0, -10, -8] }, // Growing up
  },
  {
    id: 'fullYear',
    emoji: '💪',
    color: '#a855f7',
    animation: { scale: [1, 1.4, 1.3], rotate: [0, 10, 0] }, // Power up with glow
  },
];

// Background floating habit emojis
const habitEmojis = [
  // Top area
  { emoji: '🏃‍♂️', x: 15, y: 12, floatDuration: 10, floatDelay: 0, keywords: ['run', 'exercise', 'jog', '跑步', '运动', '锻炼'] },
  { emoji: '🌱', x: 75, y: 8, floatDuration: 11, floatDelay: 0.8, keywords: ['grow', 'plant', 'garden', '种植', '成长', '养花'] },
  { emoji: '🧘‍♀️', x: 88, y: 25, floatDuration: 12, floatDelay: 1.5, keywords: ['yoga', 'meditat', 'calm', '瑜伽', '冥想', '放松'] },
  // Middle area
  { emoji: '📖', x: 8, y: 45, floatDuration: 9.5, floatDelay: 0.5, keywords: ['read', 'book', 'study', '读书', '阅读', '学习'] },
  { emoji: '🥗', x: 85, y: 50, floatDuration: 10.5, floatDelay: 1.2, keywords: ['eat', 'healthy', 'diet', 'food', '饮食', '健康', '吃'] },
  { emoji: '💪', x: 20, y: 60, floatDuration: 11.5, floatDelay: 2, keywords: ['gym', 'workout', 'strength', '健身', '力量', '举重'] },
  // Bottom area
  { emoji: '😴', x: 70, y: 72, floatDuration: 10.8, floatDelay: 0.3, keywords: ['sleep', 'rest', 'early', '睡眠', '早睡', '休息'] },
  { emoji: '💧', x: 12, y: 80, floatDuration: 9.8, floatDelay: 1.8, keywords: ['water', 'drink', 'hydrat', '喝水', '补水'] },
  { emoji: '📝', x: 82, y: 85, floatDuration: 12.5, floatDelay: 0.6, keywords: ['write', 'journal', 'note', 'diary', '写作', '日记', '笔记'] },
  { emoji: '🎨', x: 45, y: 15, floatDuration: 11.2, floatDelay: 2.2, keywords: ['art', 'draw', 'paint', 'creat', '画画', '艺术', '创作'] },
  { emoji: '🎵', x: 55, y: 78, floatDuration: 10.2, floatDelay: 1, keywords: ['music', 'play', 'instrument', '音乐', '乐器', '弹'] },
  { emoji: '☕', x: 30, y: 35, floatDuration: 9.2, floatDelay: 1.6, keywords: ['coffee', 'morning', 'routine', '咖啡', '早起', '晨间'] },
];

export function Q3Habit({ onComplete }: QuestionProps) {
  const t = useTranslations('q3');
  const { dispatch } = useAnswers();

  const [habit, setHabit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedEmojis, setMatchedEmojis] = useState<number[]>([]);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  // Check for matching emojis based on input
  useEffect(() => {
    if (!habit.trim()) {
      setMatchedEmojis([]);
      return;
    }

    const lowerHabit = habit.toLowerCase();
    const matches: number[] = [];

    habitEmojis.forEach((item, index) => {
      const hasMatch = item.keywords.some(keyword =>
        lowerHabit.includes(keyword.toLowerCase())
      );
      if (hasMatch) {
        matches.push(index);
      }
    });

    setMatchedEmojis(matches);
  }, [habit]);

  const handleSubmit = () => {
    if (!habit.trim()) return;

    setIsSubmitting(true);

    // Show follow-up question after animation
    setTimeout(() => {
      setIsSubmitting(false);
      setShowFollowUp(true);
    }, 1200);
  };

  const handleSkip = () => {
    // No new habit - skip to next question
    dispatch({
      type: 'SET_Q3',
      payload: {
        selected: 'none',
        emoji: '🤷',
      },
    });
    onComplete();
  };

  const handleDurationSelect = (option: typeof durationOptions[0]) => {
    if (selectedDuration) return;

    setSelectedDuration(option.id);

    // Get matched emoji for result
    const matchedEmoji = matchedEmojis.length > 0
      ? habitEmojis[matchedEmojis[0]].emoji
      : '✨';

    setTimeout(() => {
      dispatch({
        type: 'SET_Q3',
        payload: {
          selected: habit,
          emoji: matchedEmoji,
          habit: habit,
          duration: option.id as 'short' | 'months' | 'halfYear' | 'fullYear',
        },
      });
      onComplete();
    }, 1500);
  };

  // Get background animation based on state
  const getBgEmojiAnimation = (index: number) => {
    const isMatched = matchedEmojis.includes(index);

    if (isSubmitting) {
      // Submitting - all matched emojis float up and glow
      if (isMatched) {
        return {
          y: [0, -80, -120],
          scale: [1, 1.5, 1.8],
          opacity: [0.8, 1, 0],
          rotate: [0, 20, 40],
        };
      }
      return {
        opacity: [0.3, 0.1, 0],
        scale: [1, 0.8, 0.5],
      };
    }

    if (isMatched) {
      // Matched - highlight and pulse
      return {
        scale: [1, 1.4, 1.3, 1.5, 1.35],
        opacity: [0.6, 1, 0.9, 1, 0.95],
        y: [0, -25, -15, -30, -20],
        rotate: [0, 10, -5, 15, 5],
      };
    }

    // Default floating animation
    return {
      y: [0, -12, 0, 12, 0],
      x: [0, 6, 0, -6, 0],
      opacity: [0.25, 0.4, 0.25],
      scale: [1, 1.05, 1],
      rotate: [0, 3, 0, -3, 0],
    };
  };

  return (
    <>
      {/* Background floating emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        {habitEmojis.map((item, index) => {
          const isMatched = matchedEmojis.includes(index);
          return (
            <motion.span
              key={index}
              className="absolute select-none"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: isMatched ? '2.5rem' : '2rem',
                filter: isMatched ? 'drop-shadow(0 0 10px rgba(143, 170, 150, 0.8))' : 'none',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={getBgEmojiAnimation(index)}
              transition={{
                duration: isSubmitting ? 1.5 : (isMatched ? 2 : item.floatDuration),
                repeat: isSubmitting ? 0 : Infinity,
                delay: isSubmitting ? index * 0.05 : item.floatDelay,
                ease: 'easeInOut',
              }}
            >
              {item.emoji}
            </motion.span>
          );
        })}

        {/* Habit cloud effect when submitting */}
        <AnimatePresence>
          {isSubmitting && matchedEmojis.length > 0 && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="flex gap-4 text-6xl">
                {matchedEmojis.map((idx) => (
                  <motion.span
                    key={idx}
                    animate={{
                      y: [0, -20, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: idx * 0.1,
                    }}
                  >
                    {habitEmojis[idx].emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative glass-card p-8 overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          {!showFollowUp ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
            >
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
                <p className="text-white/50 text-sm">
                  {t('subtitle')}
                </p>
              </motion.div>

              {/* Input area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 space-y-6"
              >
                {/* Text input with pulsing border */}
                <motion.div
                  className="relative"
                  animate={
                    habit.trim()
                      ? { boxShadow: ['0 0 0 2px rgba(143, 170, 150, 0.3)', '0 0 0 4px rgba(143, 170, 150, 0.5)', '0 0 0 2px rgba(143, 170, 150, 0.3)'] }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ borderRadius: '1rem' }}
                >
                  <input
                    type="text"
                    value={habit}
                    onChange={(e) => setHabit(e.target.value)}
                    placeholder={t('placeholder')}
                    disabled={isSubmitting}
                    className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-lg focus:outline-none focus:border-white/30 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />

                  {/* Character reveal animation */}
                  <AnimatePresence>
                    {habit && (
                      <motion.div
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        {matchedEmojis.length > 0 ? habitEmojis[matchedEmojis[0]].emoji : '✨'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Matched emojis preview */}
                <AnimatePresence>
                  {matchedEmojis.length > 0 && !isSubmitting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-center gap-3"
                    >
                      {matchedEmojis.map((idx) => (
                        <motion.span
                          key={idx}
                          className="text-3xl"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                          {habitEmojis[idx].emoji}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex gap-3">
                  {/* Skip button */}
                  <motion.button
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="flex-1 py-4 rounded-2xl font-semibold glass-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('noHabit')}
                  </motion.button>

                  {/* Submit button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!habit.trim() || isSubmitting}
                    className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${
                      habit.trim() && !isSubmitting
                        ? 'glass-button glass-button-primary'
                        : 'glass-button opacity-50 cursor-not-allowed'
                    }`}
                    animate={
                      isSubmitting
                        ? { scale: [1, 1.05, 1], boxShadow: ['0 0 20px rgba(143, 170, 150, 0.3)', '0 0 40px rgba(143, 170, 150, 0.6)', '0 0 20px rgba(143, 170, 150, 0.3)'] }
                        : {}
                    }
                    transition={{ duration: 0.8, repeat: isSubmitting ? Infinity : 0 }}
                    whileHover={habit.trim() && !isSubmitting ? { scale: 1.02, y: -2 } : {}}
                    whileTap={habit.trim() && !isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {t('continue')}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="followup"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Follow-up: Duration question */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6 relative z-10"
              >
                {/* Show the habit they entered */}
                <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-white/5 rounded-2xl">
                  <span className="text-3xl">
                    {matchedEmojis.length > 0 ? habitEmojis[matchedEmojis[0]].emoji : '✨'}
                  </span>
                  <span className="text-lg text-white/80">{habit}</span>
                </div>

                <h2
                  className="font-bold mb-3 bg-clip-text text-transparent"
                  style={{
                    fontSize: 'var(--text-question)',
                    backgroundImage: 'linear-gradient(90deg, #8faa96, #a098b0, #88aca8)'
                  }}
                >
                  {t('followUpTitle')}
                </h2>
              </motion.div>

              {/* Duration options */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4 relative z-10"
              >
                {durationOptions.map((option, index) => {
                  const isSelected = selectedDuration === option.id;
                  const isOther = selectedDuration && !isSelected;

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
                      onClick={() => handleDurationSelect(option)}
                      disabled={!!selectedDuration}
                      className={`
                        relative p-6 rounded-2xl border transition-all duration-300
                        ${isSelected
                          ? 'border-white/30 shadow-lg'
                          : 'border-white/10 hover:border-white/20'
                        }
                        ${!selectedDuration ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
                      `}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${option.color}20, ${option.color}10)`
                          : 'rgba(255,255,255,0.03)',
                        boxShadow: isSelected ? `0 0 30px ${option.color}30` : 'none',
                      }}
                      whileHover={!selectedDuration ? { y: -2 } : {}}
                      whileTap={!selectedDuration ? { scale: 0.98 } : {}}
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
                        animate={isSelected ? option.animation : {}}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      >
                        {option.emoji}
                      </motion.span>

                      {/* Text label */}
                      <motion.span
                        className="text-sm font-medium"
                        style={{ color: isSelected ? option.color : 'rgba(255,255,255,0.7)' }}
                      >
                        {t(`duration.${option.id}`)}
                      </motion.span>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Selection confirmation */}
              <AnimatePresence>
                {selectedDuration && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8 relative z-10"
                  >
                    <p className="text-white/50 text-sm">
                      {t('persistence')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
