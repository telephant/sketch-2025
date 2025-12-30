'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAnswers } from '@/hooks/useAnswers';
import { QuestionProps } from '@/types';

type Stage = 'input-old' | 'wall' | 'exploding' | 'input-new' | 'complete';

// Brick interface
interface Brick {
  id: number;
  row: number;
  col: number;
  x: number; // pixel position
  y: number;
  width: number;
  height: number;
  isHalf: boolean;
  char?: string;
  shade: number;
  crackLevel: number; // 0-2 for crack intensity
}

// Generate a realistic staggered brick wall
const generateWallBricks = (text: string): Brick[] => {
  const bricks: Brick[] = [];
  const rows = 6;
  const brickWidth = 48;
  const brickHeight = 24;
  const mortarGap = 3;
  const halfBrickWidth = (brickWidth - mortarGap) / 2;

  const chars = text.split('');
  let charIndex = 0;
  let brickId = 0;

  for (let row = 0; row < rows; row++) {
    const isOffsetRow = row % 2 === 1;
    const y = row * (brickHeight + mortarGap);

    if (isOffsetRow) {
      // Offset row: starts with half brick
      // Half brick at start
      bricks.push({
        id: brickId++,
        row,
        col: 0,
        x: 0,
        y,
        width: halfBrickWidth,
        height: brickHeight,
        isHalf: true,
        shade: 0.7 + Math.random() * 0.3,
        crackLevel: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
      });

      // Full bricks
      for (let col = 0; col < 5; col++) {
        const x = halfBrickWidth + mortarGap + col * (brickWidth + mortarGap);
        const shouldHaveChar = charIndex < chars.length && Math.random() > 0.5;
        bricks.push({
          id: brickId++,
          row,
          col: col + 1,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          isHalf: false,
          char: shouldHaveChar ? chars[charIndex++] : undefined,
          shade: 0.7 + Math.random() * 0.3,
          crackLevel: Math.random() > 0.85 ? Math.floor(Math.random() * 3) : 0,
        });
      }

      // Half brick at end
      bricks.push({
        id: brickId++,
        row,
        col: 6,
        x: halfBrickWidth + mortarGap + 5 * (brickWidth + mortarGap),
        y,
        width: halfBrickWidth,
        height: brickHeight,
        isHalf: true,
        shade: 0.7 + Math.random() * 0.3,
        crackLevel: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
      });
    } else {
      // Normal row: full bricks
      for (let col = 0; col < 6; col++) {
        const x = col * (brickWidth + mortarGap);
        const shouldHaveChar = charIndex < chars.length && Math.random() > 0.4;
        bricks.push({
          id: brickId++,
          row,
          col,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          isHalf: false,
          char: shouldHaveChar ? chars[charIndex++] : undefined,
          shade: 0.7 + Math.random() * 0.3,
          crackLevel: Math.random() > 0.85 ? Math.floor(Math.random() * 3) : 0,
        });
      }
    }
  }

  // Distribute remaining chars
  const emptyBricks = bricks.filter(b => !b.char && !b.isHalf);
  while (charIndex < chars.length && emptyBricks.length > 0) {
    const randomIndex = Math.floor(Math.random() * emptyBricks.length);
    emptyBricks[randomIndex].char = chars[charIndex++];
    emptyBricks.splice(randomIndex, 1);
  }

  return bricks;
};

// Generate explosion particles
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 30,
    distance: 120 + Math.random() * 180,
    rotation: Math.random() * 720 - 360,
    scale: 0.3 + Math.random() * 0.7,
    emoji: ['💥', '✨', '⚡', '🔥'][Math.floor(Math.random() * 4)],
  }));
};

export function Q4BiggestChange({ onComplete }: QuestionProps) {
  const t = useTranslations('q4');
  const { dispatch } = useAnswers();

  const [stage, setStage] = useState<Stage>('input-old');
  const [oldBelief, setOldBelief] = useState('');
  const [newBelief, setNewBelief] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const bricks = useMemo(() => generateWallBricks(oldBelief), [oldBelief]);
  const particles = useMemo(() => generateParticles(24), []);

  const handleOldBeliefSubmit = () => {
    if (!oldBelief.trim()) return;
    setStage('wall');
  };

  const handleExplode = () => {
    setStage('exploding');
    setTimeout(() => {
      setStage('input-new');
    }, 1500);
  };

  const handleNewBeliefSubmit = () => {
    if (!newBelief.trim()) return;
    setStage('complete');

    setTimeout(() => {
      dispatch({
        type: 'SET_Q4',
        payload: {
          change: `${oldBelief} → ${newBelief}`,
          emoji: '🦋',
          oldBelief,
          newBelief,
        },
      });
      onComplete();
    }, 4500); // Extended to let butterfly animation complete
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="relative glass-card p-8 overflow-hidden min-h-[550px]">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: stage === 'exploding'
            ? 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.3), transparent 70%)'
            : stage === 'input-new' || stage === 'complete'
            ? 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.15), transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1), transparent 70%)'
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
          className="font-bold mb-3 bg-clip-text text-transparent"
          style={{
            fontSize: 'var(--text-question)',
            backgroundImage: stage === 'input-new' || stage === 'complete'
              ? 'linear-gradient(90deg, #22c55e, #10b981, #22c55e)'
              : 'linear-gradient(90deg, #f97316, #ef4444, #f97316)'
          }}
        >
          {t('title')}
        </h2>
        <p className="text-white/50 text-sm">
          {stage === 'input-old' && t('oldBeliefHint')}
          {stage === 'wall' && t('clickToExplode')}
          {stage === 'input-new' && t('newBeliefHint')}
          {stage === 'complete' && t('transformed')}
        </p>
      </motion.div>

      {/* Stage: Input old belief */}
      <AnimatePresence mode="wait">
        {stage === 'input-old' && (
          <motion.div
            key="input-old"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10"
          >
            <div className="flex justify-center mb-6">
              <motion.span
                className="text-6xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🧱
              </motion.span>
            </div>

            <motion.input
              type="text"
              value={oldBelief}
              onChange={(e) => setOldBelief(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleOldBeliefSubmit)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t('oldBeliefPlaceholder')}
              className="w-full p-4 rounded-2xl bg-white/5 text-white placeholder-white/30
                focus:outline-none transition-all duration-300"
              style={{
                border: isFocused
                  ? '2px solid rgba(249, 115, 22, 0.5)'
                  : '2px solid rgba(255,255,255,0.1)',
              }}
            />

            <motion.button
              onClick={handleOldBeliefSubmit}
              disabled={!oldBelief.trim()}
              className={`
                mt-6 w-full py-4 rounded-2xl font-semibold transition-all duration-300
                ${oldBelief.trim()
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
                }
              `}
              whileHover={oldBelief.trim() ? { scale: 1.02 } : {}}
              whileTap={oldBelief.trim() ? { scale: 0.98 } : {}}
            >
              {t('buildWall')}
            </motion.button>
          </motion.div>
        )}

        {/* Stage: Wall display */}
        {stage === 'wall' && (
          <motion.div
            key="wall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Brick wall container */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              {/* Wall shadow on ground */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-8 blur-xl"
                style={{ background: 'rgba(0,0,0,0.4)' }}
              />

              {/* The wall */}
              <div
                className="relative overflow-hidden rounded-sm"
                style={{
                  padding: '3px',
                  background: '#4a4a4a', // Mortar color
                }}
              >
                {/* Brick container with absolute positioning */}
                <div
                  className="relative"
                  style={{
                    width: '303px', // 6 bricks * 48 + 5 gaps * 3
                    height: '159px', // 6 rows * 24 + 5 gaps * 3
                  }}
                >
                  {bricks.map((brick, index) => (
                    <motion.div
                      key={brick.id}
                      className="absolute rounded-[2px]"
                      style={{
                        left: `${brick.x}px`,
                        top: `${brick.y}px`,
                        width: `${brick.width}px`,
                        height: `${brick.height}px`,
                        background: `linear-gradient(175deg,
                          hsl(${8 + brick.shade * 8}, ${55 + brick.shade * 15}%, ${38 + brick.shade * 12}%) 0%,
                          hsl(${5 + brick.shade * 5}, ${50 + brick.shade * 10}%, ${28 + brick.shade * 8}%) 50%,
                          hsl(${3}, ${45 + brick.shade * 10}%, ${22 + brick.shade * 5}%) 100%)`,
                        boxShadow: `
                          inset 0 1px 1px rgba(255,255,255,0.12),
                          inset 0 -1px 2px rgba(0,0,0,0.25),
                          inset 1px 0 1px rgba(255,255,255,0.06),
                          inset -1px 0 1px rgba(0,0,0,0.15)
                        `,
                      }}
                      initial={{ opacity: 0, y: -20, rotateX: -15 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{
                        delay: brick.row * 0.08 + (brick.col * 0.02),
                        duration: 0.4,
                        ease: 'easeOut',
                      }}
                    >
                      {/* Brick texture - subtle noise */}
                      <div
                        className="absolute inset-0 rounded-[2px] opacity-40"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
                        }}
                      />

                      {/* Cracks on some bricks */}
                      {brick.crackLevel > 0 && (
                        <svg
                          className="absolute inset-0 w-full h-full opacity-30"
                          viewBox="0 0 48 24"
                          preserveAspectRatio="none"
                        >
                          {brick.crackLevel === 1 && (
                            <path
                              d="M12 0 L14 8 L10 16 L15 24"
                              stroke="rgba(0,0,0,0.6)"
                              strokeWidth="0.5"
                              fill="none"
                            />
                          )}
                          {brick.crackLevel === 2 && (
                            <>
                              <path
                                d="M8 0 L12 6 L8 12 L14 18 L10 24"
                                stroke="rgba(0,0,0,0.6)"
                                strokeWidth="0.5"
                                fill="none"
                              />
                              <path
                                d="M30 0 L28 10 L32 20 L28 24"
                                stroke="rgba(0,0,0,0.5)"
                                strokeWidth="0.5"
                                fill="none"
                              />
                            </>
                          )}
                        </svg>
                      )}

                      {/* Character on brick */}
                      {brick.char && (
                        <span
                          className="absolute inset-0 flex items-center justify-center font-bold text-white/95"
                          style={{
                            fontSize: brick.isHalf ? '10px' : '13px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.6), 0 0 4px rgba(0,0,0,0.3)',
                          }}
                        >
                          {brick.char}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Vertical mortar lines overlay for more realism */}
                <div className="absolute inset-0 pointer-events-none">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0"
                      style={{
                        left: `${3 + i * 51}px`,
                        width: '3px',
                        background: 'linear-gradient(180deg, rgba(74,74,74,0.3) 0%, rgba(74,74,74,0.1) 50%, rgba(74,74,74,0.3) 100%)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Wall top edge highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-sm"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
              />
            </motion.div>

            {/* Old belief label */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-orange-400/50 text-xs mb-1">{t('wallLabel')}</p>
              <p className="text-orange-300/80 text-base font-medium">「{oldBelief}」</p>
            </motion.div>

            {/* Explode button */}
            <motion.button
              onClick={handleExplode}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
                boxShadow: '0 4px 24px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 6px 32px rgba(220, 38, 38, 0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="text-2xl"
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.15, 1, 1.15, 1],
                }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                💣
              </motion.span>
              {t('explodeButton')}
            </motion.button>
          </motion.div>
        )}

        {/* Stage: Exploding */}
        {stage === 'exploding' && (
          <motion.div
            key="exploding"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-[350px]"
          >
            {/* Flash effect */}
            <motion.div
              className="absolute inset-0 bg-orange-500 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.25 }}
            />

            {/* Explosion center */}
            <motion.div
              className="absolute text-8xl z-20"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              💥
            </motion.div>

            {/* Secondary explosions */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`exp-${i}`}
                className="absolute text-5xl z-20"
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: 1.5,
                  opacity: 0,
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 80,
                }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
              >
                🔥
              </motion.div>
            ))}

            {/* Shockwave ring */}
            <motion.div
              className="absolute w-16 h-16 rounded-full border-4 border-orange-400/80"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 10, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />

            {/* Flying brick pieces - using actual brick data */}
            {bricks.map((brick) => {
              // Calculate explosion direction based on brick position
              const centerX = 150;
              const centerY = 80;
              const dx = brick.x + brick.width / 2 - centerX;
              const dy = brick.y + brick.height / 2 - centerY;
              const baseAngle = Math.atan2(dy, dx);
              const distance = 180 + Math.random() * 150;
              const xDir = Math.cos(baseAngle + (Math.random() - 0.5) * 0.5) * distance;
              const yDir = Math.sin(baseAngle + (Math.random() - 0.5) * 0.5) * distance + 80;

              return (
                <motion.div
                  key={brick.id}
                  className="absolute rounded-[2px]"
                  style={{
                    width: `${brick.width * 0.8}px`,
                    height: `${brick.height * 0.8}px`,
                    background: `linear-gradient(175deg,
                      hsl(${8 + brick.shade * 8}, ${55 + brick.shade * 15}%, ${38 + brick.shade * 12}%) 0%,
                      hsl(${3}, ${45 + brick.shade * 10}%, ${22 + brick.shade * 5}%) 100%)`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{
                    x: xDir,
                    y: yDir,
                    opacity: 0,
                    rotate: (Math.random() - 0.5) * 900,
                    scale: 0.2,
                  }}
                  transition={{
                    duration: 1.2 + Math.random() * 0.4,
                    delay: Math.random() * 0.08,
                    ease: 'easeOut',
                  }}
                >
                  {brick.char && (
                    <span className="absolute inset-0 flex items-center justify-center text-white/70 text-[10px] font-bold">
                      {brick.char}
                    </span>
                  )}
                </motion.div>
              );
            })}

            {/* Debris particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`debris-${i}`}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  background: `hsl(${10 + Math.random() * 10}, ${50 + Math.random() * 20}%, ${30 + Math.random() * 15}%)`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 250 + 50,
                  opacity: 0,
                  rotate: Math.random() * 720,
                  scale: 0,
                }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  delay: Math.random() * 0.15,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Smoke clouds */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`smoke-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${40 + Math.random() * 30}px`,
                  height: `${40 + Math.random() * 30}px`,
                  background: 'radial-gradient(circle, rgba(80,80,80,0.7) 0%, transparent 70%)',
                }}
                initial={{ scale: 0, opacity: 0.8, x: (Math.random() - 0.5) * 40, y: 0 }}
                animate={{
                  scale: 2.5,
                  opacity: 0,
                  y: -80 - Math.random() * 60,
                  x: (Math.random() - 0.5) * 80,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.15 + i * 0.06,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Sparkle particles */}
            {particles.map((particle) => (
              <motion.span
                key={particle.id}
                className="absolute"
                style={{ fontSize: `${16 + Math.random() * 8}px` }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                  y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
                  opacity: 0,
                  rotate: particle.rotation,
                  scale: 0,
                }}
                transition={{
                  duration: 0.7 + Math.random() * 0.3,
                  delay: Math.random() * 0.15,
                  ease: 'easeOut',
                }}
              >
                {particle.emoji}
              </motion.span>
            ))}

            {/* Text shattering */}
            <motion.p
              className="absolute text-orange-400/90 text-xl font-bold z-30"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.3, y: -40 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {oldBelief}
            </motion.p>
          </motion.div>
        )}

        {/* Stage: Input new belief */}
        {stage === 'input-new' && (
          <motion.div
            key="input-new"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10"
          >
            <div className="flex justify-center mb-6">
              <motion.span
                className="text-6xl"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                ✨
              </motion.span>
            </div>

            {/* Old belief crossed out */}
            <motion.div
              className="text-center mb-4 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-white/40 line-through text-sm">{oldBelief}</span>
              <motion.span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                ❌
              </motion.span>
            </motion.div>

            <motion.input
              type="text"
              value={newBelief}
              onChange={(e) => setNewBelief(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleNewBeliefSubmit)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t('newBeliefPlaceholder')}
              className="w-full p-4 rounded-2xl bg-white/5 text-white placeholder-white/30
                focus:outline-none transition-all duration-300"
              style={{
                border: isFocused
                  ? '2px solid rgba(34, 197, 94, 0.5)'
                  : '2px solid rgba(255,255,255,0.1)',
              }}
              autoFocus
            />

            <motion.button
              onClick={handleNewBeliefSubmit}
              disabled={!newBelief.trim()}
              className={`
                mt-6 w-full py-4 rounded-2xl font-semibold transition-all duration-300
                ${newBelief.trim()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
                }
              `}
              whileHover={newBelief.trim() ? { scale: 1.02 } : {}}
              whileTap={newBelief.trim() ? { scale: 0.98 } : {}}
            >
              {t('rebuildButton')}
            </motion.button>
          </motion.div>
        )}

        {/* Stage: Complete */}
        {stage === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-[350px] overflow-visible"
          >
            {/* Transformation text */}
            <motion.div
              className="text-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
                <motion.span
                  className="text-white/40 line-through text-base"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {oldBelief}
                </motion.span>
                <motion.span
                  className="text-3xl text-green-400"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  →
                </motion.span>
                <motion.span
                  className="text-green-400 font-bold text-base"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {newBelief}
                </motion.span>
              </div>
            </motion.div>

            {/* Main butterfly - appears, flutters, then triggers scatter */}
            <div className="relative h-32 w-full flex items-center justify-center">
              {/* Central big butterfly */}
              <motion.div
                className="text-7xl absolute"
                initial={{ scale: 0, rotate: -30 }}
                animate={{
                  scale: [0, 1.2, 1, 1.1, 1, 0],
                  rotate: [-30, 0, 5, -5, 0, 0],
                  y: [0, 0, -5, 5, 0, -20],
                }}
                transition={{
                  duration: 2.5,
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  ease: 'easeInOut',
                }}
              >
                🦋
              </motion.div>

              {/* Scattered butterflies - appear after main butterfly fades */}
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
                const distance = 120 + Math.random() * 100;
                const size = 20 + Math.random() * 16;
                const delay = 1.8 + Math.random() * 0.3;

                return (
                  <motion.span
                    key={`butterfly-${i}`}
                    className="absolute"
                    style={{ fontSize: `${size}px` }}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.2, 1, 0.8],
                      x: [0, Math.cos(angle) * distance * 0.3, Math.cos(angle) * distance],
                      y: [0, Math.sin(angle) * distance * 0.3 - 30, Math.sin(angle) * distance - 60 - Math.random() * 40],
                      opacity: [0, 1, 1, 0],
                      rotate: [0, Math.random() * 30 - 15, Math.random() * 60 - 30],
                    }}
                    transition={{
                      duration: 2,
                      delay,
                      ease: 'easeOut',
                      times: [0, 0.2, 0.6, 1],
                    }}
                  >
                    🦋
                  </motion.span>
                );
              })}

              {/* Sparkle trail */}
              {[...Array(20)].map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const distance = 60 + Math.random() * 120;

                return (
                  <motion.span
                    key={`sparkle-${i}`}
                    className="absolute text-lg"
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance - 20,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 2 + Math.random() * 0.5,
                      ease: 'easeOut',
                    }}
                  >
                    ✨
                  </motion.span>
                );
              })}
            </div>

            {/* Completion text */}
            <motion.p
              className="text-white/80 text-center mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
            >
              {t('transformComplete')}
            </motion.p>

            {/* Subtle glow effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ delay: 1.8, duration: 1 }}
              style={{
                background: 'radial-gradient(circle at 50% 40%, rgba(167, 139, 250, 0.2), transparent 60%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
