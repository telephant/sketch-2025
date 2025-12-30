'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps } from '@/types';

// 背景漂浮 Emoji - 均匀分布在整个屏幕背景（更慢更持续的动画）
const bgEmojis = [
  // 左上区域
  { emoji: '💭', color: '#a3a3a3', floatDuration: 10, floatDelay: 0, x: 5, y: 8 },
  { emoji: '🌱', color: '#22c55e', floatDuration: 12, floatDelay: 1.5, x: 18, y: 22 },
  // 右上区域
  { emoji: '✨', color: '#fcd34d', floatDuration: 9, floatDelay: 0.8, x: 82, y: 10 },
  { emoji: '🐦', color: '#60a5fa', floatDuration: 12.5, floatDelay: 2, x: 92, y: 25 },
  // 左中区域
  { emoji: '😌', color: '#10b981', floatDuration: 9.5, floatDelay: 0.5, x: 6, y: 45 },
  { emoji: '☕️', color: '#f97316', floatDuration: 11.5, floatDelay: 1.8, x: 15, y: 60 },
  // 右中区域
  { emoji: '📝', color: '#3b82f6', floatDuration: 11, floatDelay: 1.2, x: 88, y: 50 },
  { emoji: '🌸', color: '#f9a8d4', floatDuration: 10.5, floatDelay: 2.2, x: 78, y: 38 },
  // 左下区域
  { emoji: '🎨', color: '#a78bfa', floatDuration: 11.2, floatDelay: 0.3, x: 8, y: 78 },
  { emoji: '💫', color: '#fbbf24', floatDuration: 10.8, floatDelay: 1.0, x: 22, y: 88 },
  // 右下区域
  { emoji: '🌿', color: '#34d399', floatDuration: 9.8, floatDelay: 1.6, x: 85, y: 75 },
  { emoji: '🦋', color: '#818cf8', floatDuration: 11.8, floatDelay: 2.5, x: 75, y: 90 },
];

// 四个选项
const options = [
  {
    id: 'found',
    label: '是的',
    labelEn: 'Yes',
    emoji: '🎯',
    color: '#22c55e',
    bgResponse: 'celebrate', // 背景 emoji 闪烁或轻微放大，突出喜悦、发现感
  },
  {
    id: 'notFound',
    label: '没有',
    labelEn: 'No',
    emoji: '😕',
    color: '#fbbf24',
    bgResponse: 'wander', // 背景 emoji 微微晃动 + 轻微变色，表示迷茫/探索感
  },
  {
    id: 'notMyProblem',
    label: '这不是我的问题',
    labelEn: 'Not my concern',
    emoji: '❌',
    color: '#ef4444',
    bgResponse: 'fadeOut', // 背景 emoji 淡出/缩小，聚焦用户排除动作
  },
  {
    id: 'dontKnow',
    label: '我也不知道',
    labelEn: 'I don\'t know',
    emoji: '🤷',
    color: '#3b82f6',
    bgResponse: 'thinking', // 背景 emoji 上下漂浮 + 轻微闪烁，强调思考、不确定感
  },
];

export function Q1PressureSource({ onComplete }: QuestionProps) {
  const t = useTranslations('q1');
  const { dispatch } = useAnswers();
  const containerRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [bgResponse, setBgResponse] = useState<string | null>(null);

  const handleSelect = (option: typeof options[0]) => {
    setSelected(option.id);
    setBgResponse(option.bgResponse);

    // 延迟 2 秒后进入下一步，让动画更充分展示
    setTimeout(() => {
      dispatch({
        type: 'SET_Q1',
        payload: {
          selected: option.id,
          emoji: option.emoji,
          percentage: 0, // 不再使用百分比
        },
      });
      onComplete();
    }, 2000);
  };

  // 根据选择生成背景动画变体（更慢更持续）
  const getBgEmojiAnimation = (index: number) => {
    if (!bgResponse) {
      // 默认漂浮动画 - 更慢更柔和
      return {
        y: [0, -12, 0, 12, 0],
        x: [0, 6, 0, -6, 0],
        opacity: [0.35, 0.55, 0.35],
        scale: [1, 1.08, 1],
      };
    }

    switch (bgResponse) {
      case 'celebrate':
        // 找到了 - 闪烁放大，喜悦感（更慢）
        return {
          scale: [1, 1.25, 1.1, 1.2, 1.15, 1],
          opacity: [0.5, 0.9, 0.6, 0.85, 0.7, 0.5],
          rotate: [0, 8, -6, 5, -3, 0],
        };
      case 'wander':
        // 没找到 - 晃动，迷茫感（更慢）
        return {
          x: [0, -12, 12, -8, 8, -4, 0],
          opacity: [0.5, 0.35, 0.5, 0.35, 0.5, 0.4, 0.5],
        };
      case 'fadeOut':
        // 这不是我的问题 - 淡出缩小（更慢更柔和）
        return {
          scale: [1, 0.7, 0.4, 0.2],
          opacity: [0.5, 0.3, 0.15, 0],
          y: [0, 15, 30, 50],
        };
      case 'thinking':
        // 我也不知道 - 上下漂浮闪烁，思考感（更慢）
        return {
          y: [0, -18, -5, -15, -8, 0],
          opacity: [0.4, 0.75, 0.35, 0.65, 0.45, 0.4],
          scale: [1, 1.08, 0.98, 1.05, 1.02, 1],
        };
      default:
        return {};
    }
  };


  return (
    <>
      {/* 背景漂浮 Emoji - 分布在整个页面背景，z-index 低于 card */}
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
              repeat: bgResponse === 'fadeOut' ? 0 : Infinity,
              delay: bgResponse ? index * 0.15 : item.floatDelay,
              ease: 'easeInOut',
            }}
          >
            {item.emoji}
          </motion.span>
        ))}
      </div>

      <div ref={containerRef} className="relative glass-card p-8 overflow-hidden min-h-[500px]">
        {/* 标题区域 */}
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

      {/* 四个选项 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 relative z-10"
      >
        {options.map((option, index) => {
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
              {/* 选中时的点击动画 - 更慢的光圈扩散 */}
              <AnimatePresence>
                {isSelected && (
                  <>
                    {/* 光圈扩散效果 */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0.7 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: `radial-gradient(circle, ${option.color}35, transparent)` }}
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Emoji - 更慢更持续的动画 */}
              <motion.span
                className="text-4xl block mb-3"
                animate={
                  isSelected
                    ? option.id === 'found'
                      ? { scale: [1, 1.35, 1.15, 1.25, 1.2], rotate: [0, 8, -4, 5, 0] } // 放大 + 弹跳
                      : option.id === 'notFound'
                      ? { x: [0, -10, 10, -7, 7, -4, 0] } // 左右轻晃
                      : option.id === 'notMyProblem'
                      ? { rotate: [0, 120, 240, 360], scale: [1, 0.9, 0.75, 0.6] } // 旋转 + 缩小
                      : { y: [0, -12, -4, -10, -6, 0], opacity: [1, 0.65, 0.9, 0.7, 0.85, 1] } // 上下漂浮 + 闪烁
                    : {}
                }
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                {option.emoji}
              </motion.span>

              {/* 文字标签 */}
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
