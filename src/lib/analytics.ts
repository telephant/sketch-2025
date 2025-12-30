const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzy7gO4oOa6p5PeHdYD3vaH-PXHFSBKMk78ME8KJrxw8peQkVmVPdUCfq9CzS0uVtuQQg/exec';

interface TrackEventData {
  event: 'page_view' | 'report_generated';
  locale?: string;
  timezone?: string;
  screen?: string;
  device?: string;
  referrer?: string;
  answers?: Record<string, unknown>;
}

// 获取设备类型
function getDeviceType(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
    return /iPad/i.test(ua) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

// 获取客户端信息
function getClientInfo() {
  if (typeof window === 'undefined') return {};

  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    screen: `${screen.width}x${screen.height}`,
    device: getDeviceType(),
    referrer: document.referrer || '',
  };
}

export async function trackEvent(data: TrackEventData): Promise<void> {
  try {
    // 添加客户端信息
    const clientInfo = getClientInfo();
    const fullData = { ...data, ...clientInfo };

    const payload = JSON.stringify(fullData);

    if (navigator.sendBeacon) {
      navigator.sendBeacon(GOOGLE_SHEET_URL, payload);
    } else {
      fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      }).catch(() => {
        // Silently fail - don't affect user experience
      });
    }
  } catch {
    // Silently fail - analytics should never break the app
  }
}

export function trackPageView(locale: string): void {
  trackEvent({
    event: 'page_view',
    locale,
  });
}

export function trackReportGenerated(locale: string, answers: Record<string, unknown>): void {
  trackEvent({
    event: 'report_generated',
    locale,
    answers,
  });
}
