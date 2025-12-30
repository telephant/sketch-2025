'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace the current locale in the path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 glass-button !p-1 !rounded-full">
      <motion.button
        onClick={() => switchLocale('zh')}
        className={`px-3 py-1 rounded-full text-sm transition-all ${
          locale === 'zh'
            ? 'bg-white/10 text-white font-medium'
            : 'text-white/50 hover:text-white/80'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        中文
      </motion.button>
      <motion.button
        onClick={() => switchLocale('en')}
        className={`px-3 py-1 rounded-full text-sm transition-all ${
          locale === 'en'
            ? 'bg-white/10 text-white font-medium'
            : 'text-white/50 hover:text-white/80'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        EN
      </motion.button>
    </div>
  );
}
