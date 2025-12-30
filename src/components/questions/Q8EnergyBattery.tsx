'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps } from '@/types';

// Activity items with charging/draining values
const activities = [
  // Charging activities
  { id: 'exercise', emoji: '🏃', value: 12, type: 'charge' },
  { id: 'hobbies', emoji: '🎨', value: 10, type: 'charge' },
  { id: 'learning', emoji: '📚', value: 10, type: 'charge' },
  { id: 'travel', emoji: '🌍', value: 12, type: 'charge' },
  { id: 'loved', emoji: '❤️', value: 15, type: 'charge' },
  { id: 'rest', emoji: '😌', value: 10, type: 'charge' },
  // Draining activities
  { id: 'socialDrain', emoji: '🤝', value: -10, type: 'drain' },
  { id: 'work', emoji: '💼', value: -12, type: 'drain' },
  { id: 'procrastinate', emoji: '🔄', value: -10, type: 'drain' },
  { id: 'overthink', emoji: '🤔', value: -12, type: 'drain' },
  { id: 'phone', emoji: '📱', value: -10, type: 'drain' },
  { id: 'chores', emoji: '📦', value: -8, type: 'drain' },
];

export function Q8EnergyBattery({ onComplete }: QuestionProps) {
  const t = useTranslations('q8');
  const { dispatch } = useAnswers();

  const [energy, setEnergy] = useState(50);
  const [usedActivities, setUsedActivities] = useState<string[]>([]);
  const [chargingSources, setChargingSources] = useState<string[]>([]);
  const [drainingSources, setDrainingSources] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<'charge' | 'drain' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [absorbingEmoji, setAbsorbingEmoji] = useState<string | null>(null);

  // Get battery face based on energy level
  const getBatteryFace = () => {
    if (energy >= 80) return '😊';
    if (energy >= 50) return '🙂';
    if (energy >= 30) return '😐';
    return '😵‍💫';
  };

  // Get battery color based on energy level
  const getBatteryColor = () => {
    if (energy >= 70) return '#22c55e'; // Green
    if (energy >= 40) return '#fbbf24'; // Yellow
    return '#f97316'; // Orange-red
  };

  // Handle tap/click on activity - mobile friendly
  const handleActivityTap = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity || usedActivities.includes(activity.id)) return;

    // Show absorbing animation
    setAbsorbingEmoji(activity.emoji);

    // Update used activities
    setUsedActivities(prev => [...prev, activity.id]);

    // Update energy with bounds
    const newEnergy = Math.max(0, Math.min(100, energy + activity.value));

    // Delay the energy update for animation
    setTimeout(() => {
      setEnergy(newEnergy);
      setAbsorbingEmoji(null);
    }, 400);

    // Track charging/draining sources
    if (activity.type === 'charge') {
      setChargingSources(prev => [...prev, activity.id]);
      setLastAction('charge');
    } else {
      setDrainingSources(prev => [...prev, activity.id]);
      setLastAction('drain');
    }

    // Show feedback
    const sign = activity.value > 0 ? '+' : '';
    setFeedbackText(`${activity.emoji} ${t(`activities.${activity.id}`)} ${sign}${activity.value}%`);
    setTimeout(() => setFeedbackText(null), 2000);

    // Reset last action after animation
    setTimeout(() => setLastAction(null), 1500);
  };

  // Handle completion
  const handleComplete = () => {
    setIsComplete(true);

    setTimeout(() => {
      // Determine energy type
      const energyType = energy >= 60 ? 'charging' : energy <= 40 ? 'draining' : 'balanced';

      dispatch({
        type: 'SET_Q8',
        payload: {
          category: energyType,
          emoji: getBatteryFace(),
          score: energy,
          chargingSources,
          drainingSources,
        },
      });
      onComplete();
    }, 2500);
  };

  const availableActivities = activities.filter(a => !usedActivities.includes(a.id));

  return (
    <div className="relative glass-card p-8 overflow-hidden min-h-[600px]">
      {/* Background glow based on last action */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: lastAction === 'charge'
            ? 'radial-gradient(circle at 50% 40%, rgba(34, 197, 94, 0.15), transparent 70%)'
            : lastAction === 'drain'
            ? 'radial-gradient(circle at 50% 40%, rgba(249, 115, 22, 0.15), transparent 70%)'
            : 'transparent'
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <h2
          className="font-bold mb-2 bg-clip-text text-transparent"
          style={{
            fontSize: 'var(--text-question)',
            backgroundImage: 'linear-gradient(90deg, #22c55e, #fbbf24, #f97316)'
          }}
        >
          {t('title')}
        </h2>
        <p className="text-white/50 text-sm">{t('subtitle')}</p>
      </motion.div>

      {/* Battery Container */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        {/* Energy percentage */}
        <motion.div
          className="text-2xl font-bold mb-4 flex items-center gap-2"
          animate={{ color: getBatteryColor() }}
        >
          <span>⚡</span>
          <motion.span
            key={energy}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {energy}%
          </motion.span>
        </motion.div>

        {/* Battery */}
        <motion.div
          className="relative w-32 h-48 rounded-2xl border-4 overflow-hidden"
          style={{ borderColor: getBatteryColor() }}
          animate={{
            scale: absorbingEmoji ? 1.08 : 1,
            boxShadow: absorbingEmoji
              ? `0 0 40px ${getBatteryColor()}80`
              : `0 0 15px ${getBatteryColor()}30`,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Battery cap */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-t-lg"
            style={{ backgroundColor: getBatteryColor() }}
          />

          {/* Battery liquid */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            style={{
              background: `linear-gradient(to top, ${getBatteryColor()}, ${getBatteryColor()}80)`,
            }}
            animate={{
              height: `${energy}%`,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Liquid wave effect */}
            <motion.div
              className="absolute inset-x-0 top-0 h-4"
              style={{
                background: `linear-gradient(to bottom, ${getBatteryColor()}40, transparent)`,
                borderRadius: '50% 50% 0 0',
              }}
              animate={{
                y: [-3, 3, -3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Energy ripples when charging */}
            <AnimatePresence>
              {lastAction === 'charge' && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-x-0 h-2 bg-white/30"
                      initial={{ bottom: 0, opacity: 0.5 }}
                      animate={{ bottom: '100%', opacity: 0 }}
                      transition={{
                        duration: 1,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Battery face */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-4xl"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {getBatteryFace()}
          </motion.div>

          {/* Shake effect when draining */}
          <AnimatePresence>
            {lastAction === 'drain' && (
              <motion.div
                className="absolute inset-0 border-2 border-orange-500 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: [-5, 5, -5, 5, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Absorbing emoji animation */}
          <AnimatePresence>
            {absorbingEmoji && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-4xl z-20"
                initial={{ scale: 2, opacity: 1, y: -50 }}
                animate={{ scale: 0.5, opacity: 0, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeIn' }}
              >
                {absorbingEmoji}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feedback text */}
        <AnimatePresence>
          {feedbackText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: lastAction === 'charge' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                color: lastAction === 'charge' ? '#22c55e' : '#f97316',
              }}
            >
              {feedbackText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Activity pool */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        <p className="text-center text-white/50 text-sm mb-4">{t('dragHint')}</p>

        <div className="flex flex-wrap justify-center gap-3">
          {availableActivities.map((activity, index) => (
            <motion.button
              key={activity.id}
              onClick={() => handleActivityTap(activity.id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex flex-col items-center gap-1 px-4 py-3 rounded-2xl cursor-pointer
                ${activity.type === 'charge'
                  ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20'
                  : 'bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20'}
              `}
            >
              <span className="text-2xl">{activity.emoji}</span>
              <span className={`text-xs ${activity.type === 'charge' ? 'text-green-400/80' : 'text-orange-400/80'}`}>
                {t(`activities.${activity.id}`)}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Empty state */}
        {availableActivities.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/50 text-sm py-8"
          >
            {t('allUsed')}
          </motion.p>
        )}
      </motion.div>

      {/* Complete button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: usedActivities.length >= 3 ? 1 : 0.5 }}
        className="mt-8 relative z-10"
      >
        <motion.button
          onClick={handleComplete}
          disabled={usedActivities.length < 3 || isComplete}
          className={`
            w-full py-4 rounded-2xl font-semibold transition-all duration-300
            ${usedActivities.length >= 3 && !isComplete
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
            }
          `}
          whileHover={usedActivities.length >= 3 && !isComplete ? { scale: 1.02 } : {}}
          whileTap={usedActivities.length >= 3 && !isComplete ? { scale: 0.98 } : {}}
        >
          {t('complete')}
        </motion.button>
        {usedActivities.length < 3 && (
          <p className="text-center text-white/40 text-xs mt-2">
            {t('minActivities', { count: 3 - usedActivities.length })}
          </p>
        )}
      </motion.div>

      {/* Completion overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {getBatteryFace()}
              </motion.div>
              <motion.div
                className="text-3xl font-bold mb-2"
                style={{ color: getBatteryColor() }}
              >
                ⚡ {energy}%
              </motion.div>
              <p className="text-white/70">
                {energy >= 60 ? t('resultCharging') : energy <= 40 ? t('resultDraining') : t('resultBalanced')}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
