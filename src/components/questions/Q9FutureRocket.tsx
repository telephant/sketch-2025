'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps, Particle } from '@/types';
import { ParticleCanvas, createStarParticles, createConfettiParticles } from '@/components/ParticleCanvas';

export function Q9FutureRocket({ onComplete, onBack }: QuestionProps) {
  const t = useTranslations('q9');
  const { dispatch } = useAnswers();
  const containerRef = useRef<HTMLDivElement>(null);

  const [goal, setGoal] = useState('');
  const [fueling, setFueling] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showStars, setShowStars] = useState(false);

  const handleLaunch = () => {
    if (!goal.trim()) return;

    setFueling(true);

    // Fueling animation
    setTimeout(() => {
      setLaunching(true);

      // Create trail particles
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        // Launch particles
        setTimeout(() => {
          const trailParticles = createStarParticles(
            containerRect.width / 2,
            containerRect.height - 100,
            '#f59e0b',
            30
          );
          setParticles(trailParticles);
        }, 500);

        // Star explosion at top
        setTimeout(() => {
          setLaunched(true);
          const starParticles = createConfettiParticles(
            containerRect.width / 2,
            100,
            80
          );
          setParticles(starParticles);
          setShowStars(true);
        }, 1500);
      }
    }, 1000);
  };

  const handleComplete = () => {
    dispatch({
      type: 'SET_Q9',
      payload: { goal: goal.trim() },
    });
    onComplete();
  };

  return (
    <div ref={containerRef} className="relative glass-card p-8 overflow-hidden min-h-[500px]">
      <ParticleCanvas particles={particles} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2
          className="font-bold mb-2 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"
          style={{ fontSize: 'var(--text-question)' }}
        >
          {t('title')}
        </h2>
        <p className="text-white/50">{t('subtitle')}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!fueling ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Rocket illustration */}
            <div className="flex justify-center">
              <motion.div
                className="text-8xl"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                🚀
              </motion.div>
            </div>

            {/* Goal input */}
            <div className="space-y-4">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={t('placeholder')}
                className="glass-input glass-textarea w-full text-center text-lg"
                rows={3}
              />
            </div>

            {/* Launch button */}
            <motion.button
              onClick={handleLaunch}
              disabled={!goal.trim()}
              className={`w-full py-5 rounded-2xl font-bold text-lg ${
                goal.trim()
                  ? 'glass-button glass-button-primary'
                  : 'glass-button opacity-50 cursor-not-allowed'
              }`}
              whileHover={goal.trim() ? { scale: 1.02 } : {}}
              whileTap={goal.trim() ? { scale: 0.98 } : {}}
              animate={
                goal.trim()
                  ? {
                      boxShadow: [
                        '0 0 20px rgba(139, 92, 246, 0.3)',
                        '0 0 40px rgba(139, 92, 246, 0.6)',
                        '0 0 20px rgba(139, 92, 246, 0.3)',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {t('launch')} 🚀
            </motion.button>
          </motion.div>
        ) : !launched ? (
          <motion.div
            key="launching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-80 flex flex-col items-center justify-end"
          >
            {/* Fuel text */}
            <AnimatePresence>
              {!launching && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                >
                  <motion.p
                    className="text-xl font-medium text-violet-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {t('fuel')}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-white/70 max-w-xs"
                  >
                    "{goal}"
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rocket with launch animation */}
            <motion.div
              className="text-8xl relative z-10"
              initial={{ y: 0 }}
              animate={
                launching
                  ? {
                      y: -500,
                      scale: [1, 1.2, 0.5],
                    }
                  : {
                      y: [0, -5, 0],
                    }
              }
              transition={
                launching
                  ? { duration: 1.5, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0.5, repeat: Infinity }
              }
            >
              🚀
            </motion.div>

            {/* Flame effect */}
            <AnimatePresence>
              {launching && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [1, 0], scale: [0, 3], y: [0, 50] }}
                  transition={{ duration: 1 }}
                  className="absolute bottom-16 text-6xl"
                >
                  🔥
                </motion.div>
              )}
            </AnimatePresence>

            {/* Launch pad */}
            <div className="w-32 h-4 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8 py-8"
          >
            {/* 2026 Stars formation */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="relative"
            >
              <motion.h3
                className="text-6xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200%' }}
              >
                2026
              </motion.h3>

              {/* Twinkling stars around */}
              {showStars &&
                ['✨', '⭐', '💫', '🌟', '✨', '⭐'].map((star, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-2xl"
                    style={{
                      left: `${10 + (i % 3) * 35}%`,
                      top: `${-20 + Math.floor(i / 3) * 140}%`,
                    }}
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    {star}
                  </motion.span>
                ))}
            </motion.div>

            {/* Goal display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 bg-violet-500/10 border border-violet-500/30 rounded-2xl"
            >
              <p className="text-white/50 text-sm mb-2">
                {t('title').includes('2026') ? '你的2026目标' : 'Your 2026 Goal'}
              </p>
              <p className="text-xl font-medium text-white">{goal}</p>
            </motion.div>

            {/* Complete button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleComplete}
              className="glass-button glass-button-primary w-full py-4 rounded-2xl font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('title').includes('推进') ? '查看你的报告 →' : 'View your report →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
