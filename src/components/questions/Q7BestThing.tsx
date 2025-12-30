'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps } from '@/types';

// Background floating elements - achievement theme
const bgEmojis = [
  // Top-left area
  { emoji: '🎯', x: 8, y: 12, floatDuration: 11, floatDelay: 0 },
  { emoji: '🏆', x: 20, y: 25, floatDuration: 13, floatDelay: 1.2 },
  // Top-right area
  { emoji: '✨', x: 78, y: 10, floatDuration: 10, floatDelay: 0.5 },
  { emoji: '🌟', x: 90, y: 28, floatDuration: 12, floatDelay: 1.8 },
  // Middle-left area
  { emoji: '🏆', x: 5, y: 50, floatDuration: 9.5, floatDelay: 0.8 },
  { emoji: '🎯', x: 15, y: 65, floatDuration: 11.5, floatDelay: 2 },
  // Middle-right area
  { emoji: '✨', x: 85, y: 48, floatDuration: 10.5, floatDelay: 1.5 },
  { emoji: '⭐', x: 75, y: 62, floatDuration: 12.5, floatDelay: 0.3 },
  // Bottom-left area
  { emoji: '🌟', x: 10, y: 80, floatDuration: 11.2, floatDelay: 1 },
  { emoji: '💫', x: 22, y: 88, floatDuration: 9.8, floatDelay: 2.2 },
  // Bottom-right area
  { emoji: '🎯', x: 82, y: 78, floatDuration: 10.8, floatDelay: 0.6 },
  { emoji: '🏆', x: 70, y: 85, floatDuration: 13.5, floatDelay: 1.3 },
];

// Emoji matching based on keywords
const achievementEmojis = [
  { emoji: '✈️', keywords: ['旅行', 'travel', '旅游', 'trip', '出国'] },
  { emoji: '🏖️', keywords: ['度假', 'vacation', '海滩', 'beach'] },
  { emoji: '💼', keywords: ['工作', 'work', '项目', 'project', '晋升', 'promotion'] },
  { emoji: '📚', keywords: ['读书', 'read', '学习', 'learn', '书'] },
  { emoji: '🏃', keywords: ['跑步', 'run', '运动', 'exercise', '健身', 'fitness'] },
  { emoji: '🎓', keywords: ['毕业', 'graduate', '学位', 'degree'] },
  { emoji: '💰', keywords: ['存钱', 'save', '理财', 'invest', '赚'] },
  { emoji: '❤️', keywords: ['结婚', 'marry', '恋爱', 'love', '告白'] },
  { emoji: '👶', keywords: ['宝宝', 'baby', '孩子', 'child', '生'] },
  { emoji: '🏠', keywords: ['买房', 'house', '搬家', 'move', '装修'] },
  { emoji: '🎨', keywords: ['创作', 'create', '艺术', 'art', '画'] },
  { emoji: '🎸', keywords: ['音乐', 'music', '乐器', '唱歌', 'sing'] },
  { emoji: '🏆', keywords: ['成就', 'achievement', '完成', 'complete', '目标'] },
];

export function Q7BestThing({ onComplete }: QuestionProps) {
  const t = useTranslations('q7');
  const { dispatch } = useAnswers();

  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [matchedEmoji, setMatchedEmoji] = useState<string>('🏆');
  const [isFocused, setIsFocused] = useState(false);

  // Match emoji based on input
  const getMatchedEmoji = (text: string): string => {
    const lowerText = text.toLowerCase();
    for (const item of achievementEmojis) {
      if (item.keywords.some(keyword => lowerText.includes(keyword))) {
        return item.emoji;
      }
    }
    return '🏆'; // Default emoji
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.trim()) {
      setMatchedEmoji(getMatchedEmoji(value));
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim() || submitted) return;

    setSubmitted(true);

    setTimeout(() => {
      dispatch({
        type: 'SET_Q7',
        payload: {
          things: inputValue.trim(),
          emoji: matchedEmoji,
        },
      });
      onComplete();
    }, 2000);
  };

  // Background animation based on state
  const getBgEmojiAnimation = (index: number, emoji: string) => {
    if (submitted) {
      // When submitted, matching emoji highlights, others fade out
      if (emoji === matchedEmoji || emoji === '✨' || emoji === '🌟') {
        return {
          scale: [1, 1.5, 1.3],
          opacity: [0.5, 1, 0.8],
          y: [0, -20, -15],
          rotate: [0, 360],
        };
      }
      return {
        scale: [1, 0.8, 0.6],
        opacity: [0.4, 0.2, 0],
      };
    }

    // Default floating animation
    return {
      y: [0, -15, 0, 15, 0],
      x: [0, 8, 0, -8, 0],
      opacity: [0.3, 0.5, 0.3],
      scale: [1, 1.05, 1],
      rotate: [0, 3, 0, -3, 0],
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
            animate={getBgEmojiAnimation(index, item.emoji)}
            transition={{
              duration: submitted ? 2 : item.floatDuration,
              repeat: submitted ? 0 : Infinity,
              delay: submitted ? index * 0.1 : item.floatDelay,
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
          <p className="text-white/50 text-sm">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Input area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          {/* Matched emoji display */}
          <div className="flex justify-center mb-6">
            <motion.span
              className="text-6xl"
              animate={
                submitted
                  ? {
                      scale: [1, 1.5, 1.3],
                      y: [0, -20, -15],
                      rotate: [0, 360],
                    }
                  : inputValue.trim()
                  ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                  : {}
              }
              transition={{ duration: submitted ? 1.5 : 0.8, ease: 'easeInOut' }}
            >
              {matchedEmoji}
            </motion.span>
          </div>

          {/* Multi-line textarea */}
          <motion.div
            className="relative"
            animate={
              submitted
                ? { scale: 1.02, y: -5 }
                : {}
            }
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.textarea
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t('placeholder')}
              disabled={submitted}
              rows={4}
              className="w-full p-4 rounded-2xl bg-white/5 text-white placeholder-white/30
                focus:outline-none transition-all duration-300 resize-none"
              style={{
                border: isFocused
                  ? '2px solid transparent'
                  : '2px solid rgba(255,255,255,0.1)',
                backgroundImage: isFocused
                  ? 'linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05)), linear-gradient(90deg, #fbbf24, #f97316)'
                  : 'none',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
              animate={
                !submitted && !isFocused
                  ? { borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Submit ripple effect */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.7 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent)' }}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || submitted}
            className={`
              mt-6 w-full py-4 rounded-2xl font-semibold transition-all duration-300
              ${inputValue.trim() && !submitted
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
              }
            `}
            whileHover={inputValue.trim() && !submitted ? { scale: 1.02 } : {}}
            whileTap={inputValue.trim() && !submitted ? { scale: 0.98 } : {}}
          >
            {t('submit')}
          </motion.button>
        </motion.div>

      </div>
    </>
  );
}
