'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { AllAnswers } from '@/types';
import { trackReportGenerated } from '@/lib/analytics';

interface ResultsPageProps {
  onRestart: () => void;
}

// Q1 选项 emoji 映射
const q1Emojis: Record<string, string> = {
  found: '🎯',
  notFound: '🔍',
  notMyProblem: '🤷',
  dontKnow: '❓',
};

// Q2 旅行 emoji
const travelEmojis: Record<string, string> = {
  none: '🏠',
  few: '🗺️',
  some: '🌍',
  many: '🌏',
};

// Q5 心态 emoji
const mindsetEmojis: Record<string, string> = {
  optimistic: '✨',
  calm: '😌',
  anxious: '⚡',
  confident: '💪',
};

// Q6 身体 emoji
const bodyEmojis: Record<string, string> = {
  significant: '🏆',
  some: '📈',
  noChange: '➡️',
  regression: '📉',
};

// Q8 活动 emoji
const activityEmojis: Record<string, string> = {
  exercise: '🏃',
  hobbies: '🎨',
  learning: '📚',
  travel: '🌿',
  loved: '❤️',
  rest: '😴',
  socialDrain: '😓',
  work: '💼',
  procrastinate: '📱',
  overthink: '🌀',
  phone: '📵',
  chores: '🧹',
};

// 小熊形状模板 (1=填充, 0=空) - 🧸坐着的泰迪熊 18x20
const bearShape = [
  [0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0],
  [0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1],
  [1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1],
  [1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1],
];

// 小人形状模板 - 高精度 16x24
const personShape = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1],
  [1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
  [0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0],
  [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
];

// 收集所有答案的emoji
function collectEmojis(answers: AllAnswers): string[] {
  const emojis: string[] = [];

  if (answers.q1) emojis.push(q1Emojis[answers.q1.selected] || '🎯');
  if (answers.q2) emojis.push(travelEmojis[answers.q2.selected] || '✈️');
  if (answers.q3) emojis.push('🌱');
  if (answers.q4) emojis.push('🦋', '💥');
  if (answers.q5) emojis.push(mindsetEmojis[answers.q5.selected] || '✨');
  if (answers.q6) emojis.push(bodyEmojis[answers.q6.selected] || '💪');
  if (answers.q7) emojis.push('🏆', '⭐');
  if (answers.q8) {
    emojis.push('🔋', '⚡');
    answers.q8.chargingSources?.forEach(id => {
      if (activityEmojis[id]) emojis.push(activityEmojis[id]);
    });
    answers.q8.drainingSources?.forEach(id => {
      if (activityEmojis[id]) emojis.push(activityEmojis[id]);
    });
  }
  if (answers.q9) emojis.push('🚀', '🎯', '✨');

  // 确保至少有一些emoji
  if (emojis.length < 5) {
    emojis.push('✨', '🌟', '💫', '⭐', '🎉');
  }

  return emojis;
}

export function ResultsPage({ onRestart }: ResultsPageProps) {
  const t = useTranslations('results');
  const tQ1 = useTranslations('q1');
  const tQ2 = useTranslations('q2');
  const tQ3 = useTranslations('q3');
  const tQ5 = useTranslations('q5');
  const tQ6 = useTranslations('q6');
  const tQ8 = useTranslations('q8');
  const locale = useLocale();
  const { answers } = useAnswers();
  const hasTracked = useRef(false);

  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showEmojiArt, setShowEmojiArt] = useState(false);
  const [currentShape, setCurrentShape] = useState<'bear' | 'person'>('bear');
  const [emojiCopied, setEmojiCopied] = useState(false);

  // Track report generation (only once)
  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackReportGenerated(locale, answers as Record<string, unknown>);
    }
  }, [locale, answers]);

  // 收集的emoji列表
  const collectedEmojis = useMemo(() => collectEmojis(answers), [answers]);

  // 生成emoji形状
  const generateEmojiShape = (shape: number[][]) => {
    const cells: { emoji: string; delay: number }[] = [];
    let emojiIndex = 0;
    let cellIndex = 0;

    shape.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 1) {
          cells.push({
            emoji: collectedEmojis[emojiIndex % collectedEmojis.length],
            delay: cellIndex * 0.02,
          });
          emojiIndex++;
        } else {
          cells.push({ emoji: '', delay: 0 });
        }
        cellIndex++;
      });
    });

    return cells;
  };

  const handleGenerateArt = () => {
    setCurrentShape(Math.random() > 0.5 ? 'bear' : 'person');
    setShowEmojiArt(true);
    setEmojiCopied(false);
  };

  // 生成可复制的emoji文本
  const generateEmojiText = (shape: number[][]) => {
    let text = '';
    let emojiIndex = 0;

    shape.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 1) {
          text += collectedEmojis[emojiIndex % collectedEmojis.length];
          emojiIndex++;
        } else {
          text += '  '; // 两个空格代表空白
        }
      });
      text += '\n';
    });

    return text;
  };

  const handleCopyEmoji = async () => {
    const shape = currentShape === 'bear' ? bearShape : personShape;
    const emojiText = generateEmojiText(shape);

    try {
      await navigator.clipboard.writeText(emojiText);
      setEmojiCopied(true);
      setTimeout(() => setEmojiCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = emojiText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setEmojiCopied(true);
      setTimeout(() => setEmojiCopied(false), 2000);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setGenerating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const reportText = generateReportText();

    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = reportText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateReportText = () => {
    let text = `🚀 ${t('title')}\n\n`;

    if (answers.q1) {
      const q1Emoji = q1Emojis[answers.q1.selected] || '🎯';
      text += `${q1Emoji} ${t('sections.selfAwareness')}: ${tQ1(`options.${answers.q1.selected}`)}\n`;
    }
    if (answers.q2) {
      text += `${travelEmojis[answers.q2.selected] || '✈️'} ${t('sections.peak')}: ${tQ2(`options.${answers.q2.selected}`)}\n`;
    }
    if (answers.q3 && answers.q3.habit) {
      const durationText = answers.q3.duration ? ` (${tQ3(`duration.${answers.q3.duration}`)})` : '';
      text += `🌱 ${t('sections.growth')}: ${answers.q3.habit}${durationText}\n`;
    }
    if (answers.q4) {
      text += `🦋 ${t('sections.biggestChange')}: "${answers.q4.oldBelief || ''}" → "${answers.q4.newBelief || answers.q4.change}"\n`;
    }
    if (answers.q5) {
      text += `🧠 ${t('sections.mindset')}: ${tQ5(`options.${answers.q5.selected}`)}\n`;
    }
    if (answers.q6) {
      text += `💪 ${t('sections.body')}: ${tQ6(`options.${answers.q6.selected}`)}\n`;
    }
    if (answers.q7) {
      const thingsText = answers.q7.things.length > 30 ? answers.q7.things.substring(0, 30) + '...' : answers.q7.things;
      text += `🏆 ${t('sections.bestThing')}: ${thingsText}\n`;
    }
    if (answers.q8) {
      text += `🔋 ${t('sections.energy')}: ⚡${answers.q8.score}%\n`;
    }
    if (answers.q9) {
      text += `🚀 ${t('sections.goal')}: ${answers.q9.goal}\n`;
    }

    text += `\n✨ 2025 简笔画 | Sketch 2025`;
    return text;
  };

  // Get battery color
  const getBatteryColor = () => {
    if (!answers.q8) return '#22c55e';
    if (answers.q8.score >= 70) return '#22c55e';
    if (answers.q8.score >= 40) return '#fbbf24';
    return '#f97316';
  };

  if (generating) {
    return (
      <div className="glass-card p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <motion.div
          className="text-6xl mb-6"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <motion.p
          className="text-xl text-white/70"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {t('generating')}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent text-xl sm:text-2xl">
          🚀 {t('title')}
        </h1>
      </div>

      {/* Main Grid - 2 columns on mobile, compact layout */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Self Awareness */}
        {answers.q1 && (
          <CompactCard
            emoji={q1Emojis[answers.q1.selected]}
            label={t('sections.selfAwareness')}
            value={tQ1(`options.${answers.q1.selected}`)}
            delay={0}
          />
        )}

        {/* Travel */}
        {answers.q2 && (
          <CompactCard
            emoji={travelEmojis[answers.q2.selected]}
            label={t('sections.peak')}
            value={tQ2(`options.${answers.q2.selected}`)}
            delay={0.05}
          />
        )}

        {/* Mindset */}
        {answers.q5 && (
          <CompactCard
            emoji={mindsetEmojis[answers.q5.selected]}
            label={t('sections.mindset')}
            value={tQ5(`options.${answers.q5.selected}`)}
            delay={0.1}
          />
        )}

        {/* Body */}
        {answers.q6 && (
          <CompactCard
            emoji={bodyEmojis[answers.q6.selected]}
            label={t('sections.body')}
            value={tQ6(`options.${answers.q6.selected}`)}
            delay={0.15}
          />
        )}
      </div>

      {/* New Habit - Full width with progress */}
      {answers.q3 && answers.q3.habit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50">{t('sections.growth')}</p>
              <p className="text-sm font-medium text-white truncate">{answers.q3.habit}</p>
            </div>
            {answers.q3.duration && (
              <div className="flex-shrink-0">
                <HabitProgress duration={answers.q3.duration} />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Mental Breakthrough - Full width */}
      {answers.q4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🦋</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50">{t('sections.biggestChange')}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/40 line-through truncate max-w-[80px]">{answers.q4.oldBelief}</span>
                <span className="text-purple-400">→</span>
                <span className="text-green-400 font-medium truncate">{answers.q4.newBelief}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Energy Battery - Compact */}
      {answers.q8 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
        >
          <div className="flex items-center gap-4">
            {/* Mini Battery */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-20 rounded-lg border-2 overflow-hidden relative"
                style={{ borderColor: getBatteryColor() }}
              >
                {/* Battery cap */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2 rounded-t"
                  style={{ backgroundColor: getBatteryColor() }}
                />
                {/* Battery fill */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0"
                  style={{ backgroundColor: getBatteryColor() }}
                  initial={{ height: 0 }}
                  animate={{ height: `${answers.q8.score}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                {/* Percentage */}
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white z-10">
                  {answers.q8.score}%
                </span>
              </div>
            </div>

            {/* Energy Info */}
            <div className="flex-1">
              <p className="text-xs text-white/50 mb-1">{t('sections.energy')}</p>
              <p className="text-sm font-medium text-white mb-2">
                {tQ8(`result${answers.q8.category.charAt(0).toUpperCase() + answers.q8.category.slice(1)}`)}
              </p>
              {/* Charging/Draining sources */}
              <div className="flex flex-wrap gap-1">
                {answers.q8.chargingSources?.slice(0, 3).map((id) => (
                  <span key={id} className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                    +{tQ8(`activities.${id}`)}
                  </span>
                ))}
                {answers.q8.drainingSources?.slice(0, 2).map((id) => (
                  <span key={id} className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                    -{tQ8(`activities.${id}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Best Thing - Compact */}
      {answers.q7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50">{t('sections.bestThing')}</p>
              <p className="text-sm text-white line-clamp-2">{answers.q7.things}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2026 Goal - Highlighted */}
      {answers.q9 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-5 p-4 rounded-xl bg-gradient-to-r from-violet-500/15 to-purple-500/15 border border-violet-500/30"
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🚀
            </motion.span>
            <div className="flex-1">
              <p className="text-xs text-white/50">{t('sections.goal')}</p>
              <p className="text-base font-bold text-white">{answers.q9.goal}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3"
      >
        <motion.button
          onClick={handleShare}
          className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {copied ? t('shareSuccess') : t('share')} 📋
        </motion.button>
        <motion.button
          onClick={handleGenerateArt}
          className="py-3 px-4 rounded-xl text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🧸
        </motion.button>
        <motion.button
          onClick={onRestart}
          className="py-3 px-4 rounded-xl text-sm bg-white/10 text-white/70 hover:bg-white/15"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🔄
        </motion.button>
      </motion.div>

      {/* Emoji Art Modal */}
      <AnimatePresence>
        {showEmojiArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowEmojiArt(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4" style={{ transform: 'none' }}>
                <h3 className="text-lg font-bold text-white mb-1" style={{ transform: 'none' }}>
                  {currentShape === 'bear' ? '🧸 My 2025 Bear' : '🧍 My 2025 Me'}
                </h3>
                <p className="text-xs text-white/50">Made from your year&apos;s emojis</p>
              </div>

              {/* Emoji Shape Grid */}
              <div
                className="flex flex-col items-center justify-center mb-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${currentShape === 'bear' ? 18 : 16}, 1fr)`,
                  gap: '0px',
                }}
              >
                {generateEmojiShape(currentShape === 'bear' ? bearShape : personShape).map(
                  (cell, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: cell.emoji ? 1 : 0, opacity: cell.emoji ? 1 : 0 }}
                      transition={{ delay: cell.delay, type: 'spring', damping: 15 }}
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex items-center justify-center text-[10px] sm:text-xs leading-none"
                    >
                      {cell.emoji}
                    </motion.div>
                  )
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => {
                    setCurrentShape(currentShape === 'bear' ? 'person' : 'bear');
                    setEmojiCopied(false);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs bg-white/10 text-white/70 hover:bg-white/20"
                  whileTap={{ scale: 0.95 }}
                >
                  {currentShape === 'bear' ? '🧍' : '🧸'}
                </motion.button>
                <motion.button
                  onClick={handleCopyEmoji}
                  className="flex-1 py-2 rounded-xl text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold"
                  whileTap={{ scale: 0.95 }}
                >
                  {emojiCopied ? '✅ Copied!' : '📋 Copy'}
                </motion.button>
                <motion.button
                  onClick={() => setShowEmojiArt(false)}
                  className="py-2 px-4 rounded-xl text-xs bg-purple-500 text-white font-semibold"
                  whileTap={{ scale: 0.95 }}
                >
                  ✓
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact card component
function CompactCard({
  emoji,
  label,
  value,
  delay,
}: {
  emoji: string;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="p-3 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{emoji}</span>
        <span className="text-[10px] text-white/40 truncate">{label}</span>
      </div>
      <p className="text-xs font-medium text-white truncate">{value}</p>
    </motion.div>
  );
}

// Habit progress ring component
function HabitProgress({ duration }: { duration: string }) {
  const progressMap: Record<string, number> = {
    short: 15,
    months: 40,
    halfYear: 75,
    fullYear: 100,
  };
  const progress = progressMap[duration] || 0;
  const circumference = 2 * Math.PI * 14;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-10 h-10">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />
        <motion.circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-green-400">
        {progress}%
      </span>
    </div>
  );
}
