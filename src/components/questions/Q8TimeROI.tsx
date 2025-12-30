'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps, Particle } from '@/types';
import { ParticleCanvas, createCoinParticles } from '@/components/ParticleCanvas';

const roiOptions = [
  { id: 'skills', emoji: '💰', color: '#fbbf24' },
  { id: 'work', emoji: '💼', color: '#3b82f6' },
  { id: 'relationships', emoji: '❤️', color: '#ef4444' },
  { id: 'health', emoji: '🏃', color: '#22c55e' },
  { id: 'hobbies', emoji: '🎨', color: '#8b5cf6' },
];

export function Q8TimeROI({ onComplete, onBack }: QuestionProps) {
  const t = useTranslations('q8');
  const { dispatch } = useAnswers();
  const containerRef = useRef<HTMLDivElement>(null);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showingCoins, setShowingCoins] = useState<string | null>(null);

  const handleScoreChange = (id: string, score: number) => {
    setScores((prev) => ({ ...prev, [id]: score }));

    // Trigger coin animation for high scores
    if (score >= 8 && showingCoins !== id) {
      setShowingCoins(id);
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const newParticles = createCoinParticles(
          containerRect.width / 2,
          containerRect.height / 2,
          15
        );
        setParticles(newParticles);
      }
      setTimeout(() => setShowingCoins(null), 1000);
    }
  };

  const allScored = Object.keys(scores).length === roiOptions.length;
  const highestROI = Object.entries(scores).reduce(
    (max, [id, score]) => (score > max.score ? { id, score } : max),
    { id: '', score: 0 }
  );

  const handleSubmit = () => {
    if (!allScored) return;

    const option = roiOptions.find((o) => o.id === highestROI.id);
    dispatch({
      type: 'SET_Q8',
      payload: {
        category: highestROI.id,
        emoji: option?.emoji || '',
        score: highestROI.score,
      },
    });
    onComplete();
  };

  return (
    <div ref={containerRef} className="relative glass-card p-8">
      <ParticleCanvas particles={particles} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2
          className="font-bold mb-2 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent"
          style={{ fontSize: 'var(--text-question)' }}
        >
          {t('title')}
        </h2>
        <p className="text-white/50">{t('subtitle')}</p>
      </motion.div>

      {/* ROI Cards */}
      <div className="space-y-4 mb-8">
        {roiOptions.map((option, index) => {
          const score = scores[option.id] || 0;
          const isHighest = highestROI.id === option.id && allScored;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-2xl border transition-all ${
                isHighest
                  ? 'bg-yellow-500/20 border-yellow-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Emoji */}
                <motion.div
                  className="text-3xl"
                  animate={
                    score >= 8
                      ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  {option.emoji}
                </motion.div>

                {/* Label and slider */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{t(`options.${option.id}`)}</span>
                    <motion.span
                      key={score}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className={`font-bold text-lg ${
                        score >= 8
                          ? 'text-yellow-400'
                          : score >= 5
                          ? 'text-white'
                          : 'text-white/50'
                      }`}
                    >
                      {score > 0 ? score : '-'}
                    </motion.span>
                  </div>

                  {/* Score slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={score || 5}
                      onChange={(e) => handleScoreChange(option.id, Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${option.color} ${
                          ((score || 5) - 1) * 11.1
                        }%, rgba(255,255,255,0.1) ${((score || 5) - 1) * 11.1}%)`,
                      }}
                    />

                    {/* Score markers */}
                    <div className="flex justify-between px-1 mt-1">
                      {[1, 5, 10].map((mark) => (
                        <span key={mark} className="text-xs text-white/30">
                          {mark}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Crown for highest */}
              <AnimatePresence>
                {isHighest && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-2 -right-2 text-2xl"
                  >
                    👑
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {allScored && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
        >
          <p className="text-white/70">
            {t('roi')}:{' '}
            <span className="font-bold text-yellow-400">
              {roiOptions.find((o) => o.id === highestROI.id)?.emoji}{' '}
              {t(`options.${highestROI.id}`)} ({highestROI.score}/10)
            </span>
          </p>
        </motion.div>
      )}

      {/* Submit */}
      <motion.button
        onClick={handleSubmit}
        disabled={!allScored}
        className={`w-full py-4 rounded-2xl font-semibold ${
          allScored
            ? 'glass-button glass-button-primary'
            : 'glass-button opacity-50 cursor-not-allowed'
        }`}
        whileHover={allScored ? { scale: 1.02 } : {}}
        whileTap={allScored ? { scale: 0.98 } : {}}
      >
        {allScored
          ? t('title').includes('回报') ? '继续投资 →' : 'Continue investing →'
          : t('subtitle').includes('评分') ? '请为所有项目评分' : 'Rate all investments'}
      </motion.button>
    </div>
  );
}
