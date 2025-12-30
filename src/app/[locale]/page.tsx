'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { trackPageView } from '@/lib/analytics';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProgressBar } from '@/components/ProgressBar';
import { Q1PressureSource } from '@/components/questions/Q1PressureSource';
import { Q2Travel } from '@/components/questions/Q2Travel';
import { Q3Habit } from '@/components/questions/Q3Habit';
import { Q4BiggestChange } from '@/components/questions/Q4BiggestChange';
import { Q5MindsetChange } from '@/components/questions/Q5MindsetChange';
import { Q6BodyState } from '@/components/questions/Q6BodyState';
import { Q7BestThing } from '@/components/questions/Q7BestThing';
import { Q8EnergyBattery } from '@/components/questions/Q8EnergyBattery';
import { Q9FutureRocket } from '@/components/questions/Q9FutureRocket';
import { ResultsPage } from '@/components/ResultsPage';
import { useAnswers } from '@/hooks/useAnswers';

type Stage = 'landing' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'results';

const pageVariants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

export default function Home() {
  const [stage, setStage] = useState<Stage>('landing');
  const t = useTranslations();
  const locale = useLocale();

  // Track page view on mount
  useEffect(() => {
    trackPageView(locale);
  }, [locale]);
  const { dispatch } = useAnswers();

  const stages: Stage[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
  const currentIndex = stages.indexOf(stage);

  const goNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < stages.length) {
      setStage(stages[nextIndex]);
    } else {
      setStage('results');
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setStage(stages[currentIndex - 1]);
    } else if (stage !== 'landing') {
      setStage('landing');
    }
  };

  const restart = () => {
    dispatch({ type: 'RESET' });
    setStage('landing');
  };

  const renderStage = () => {
    switch (stage) {
      case 'landing':
        return <LandingPage onStart={() => setStage('q1')} />;
      case 'q1':
        return <Q1PressureSource onComplete={goNext} onBack={goBack} />;
      case 'q2':
        return <Q2Travel onComplete={goNext} onBack={goBack} />;
      case 'q3':
        return <Q3Habit onComplete={goNext} onBack={goBack} />;
      case 'q4':
        return <Q4BiggestChange onComplete={goNext} onBack={goBack} />;
      case 'q5':
        return <Q5MindsetChange onComplete={goNext} onBack={goBack} />;
      case 'q6':
        return <Q6BodyState onComplete={goNext} onBack={goBack} />;
      case 'q7':
        return <Q7BestThing onComplete={goNext} onBack={goBack} />;
      case 'q8':
        return <Q8EnergyBattery onComplete={goNext} onBack={goBack} />;
      case 'q9':
        return <Q9FutureRocket onComplete={goNext} onBack={goBack} />;
      case 'results':
        return <ResultsPage onRestart={restart} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-[720px] mx-auto flex justify-between items-center">
          {stage !== 'landing' && stage !== 'results' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={goBack}
              className="glass-button !p-2 !rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
          <div className="flex-1" />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Progress Bar */}
      {stage !== 'landing' && stage !== 'results' && (
        <div className="fixed top-16 left-0 right-0 z-40 px-4">
          <div className="max-w-[720px] mx-auto">
            <ProgressBar current={currentIndex + 1} total={9} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full max-w-[720px]"
            style={{
              willChange: 'opacity, transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {renderStage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  const t = useTranslations('landing');

  // More organic, varied floating particles
  const floatingElements = [
    { emoji: '💡', x: 8, y: 15, duration: 7.2, delay: 0, scale: 1.1 },
    { emoji: '🌱', x: 85, y: 22, duration: 8.5, delay: 1.2, scale: 0.9 },
    { emoji: '🎯', x: 72, y: 68, duration: 6.8, delay: 0.8, scale: 1 },
    { emoji: '⚡', x: 18, y: 75, duration: 9.1, delay: 2.1, scale: 0.85 },
    { emoji: '🔥', x: 45, y: 12, duration: 7.9, delay: 0.3, scale: 1.05 },
    { emoji: '✨', x: 92, y: 48, duration: 8.2, delay: 1.7, scale: 0.95 },
    { emoji: '🧠', x: 5, y: 45, duration: 10.3, delay: 2.8, scale: 0.8 },
    { emoji: '💫', x: 55, y: 82, duration: 6.5, delay: 0.5, scale: 1.15 },
    { emoji: '🌟', x: 30, y: 35, duration: 11.2, delay: 3.2, scale: 0.75 },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 min-h-[80vh]">
      {/* Calm meditation orbs - CSS animations for mobile compatibility */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10"
      >
        {/* Main emoji with organic breathing - CSS animation */}
        <div className="text-7xl mb-8 rocket-breathe">
          🚀
        </div>

        <motion.h1
          className="font-bold mb-5"
          style={{ fontSize: 'var(--text-hero)' }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(90deg, #8faa96, #a098b0, #88aca8, #8faa96)',
              backgroundSize: '200% 100%'
            }}
          >
            {t('title')}
          </span>
        </motion.h1>

        <motion.p
          className="text-lg text-white/70 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t('subtitle')}
        </motion.p>

        <motion.p
          className="text-white/45 mb-14 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {t('description')}
        </motion.p>

        <motion.button
          onClick={onStart}
          className="group relative px-12 py-4 rounded-full font-semibold text-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
        >
          {/* Gradient background */}
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full" />

          {/* Animated glow - CSS animation */}
          <span
            className="absolute rounded-full btn-glow"
            style={{
              inset: '-8px',
              background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(236,72,153,0.3) 40%, transparent 70%)',
            }}
          />

          {/* Shimmer effect - CSS animation */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full btn-shimmer" />

          {/* Button text */}
          <span className="relative flex items-center gap-2 text-white">
            {t('start')}
            <span className="arrow-bounce">→</span>
          </span>
        </motion.button>
      </motion.div>

      {/* Floating emojis with organic movement - CSS animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((el, i) => (
          <span
            key={i}
            className="floating-emoji select-none"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              fontSize: `${1.5 * el.scale}rem`,
              '--duration': `${el.duration}s`,
              '--delay': `${el.delay}s`,
              '--scale': el.scale,
            } as React.CSSProperties}
          >
            {el.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
