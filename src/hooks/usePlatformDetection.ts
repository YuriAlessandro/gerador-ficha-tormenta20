import { useMemo } from 'react';

export type Platform =
  | 'android'
  | 'ios'
  | 'windows'
  | 'mac'
  | 'linux'
  | 'unknown';
export type Browser =
  | 'chrome'
  | 'edge'
  | 'firefox'
  | 'safari'
  | 'samsung'
  | 'other';

export interface PlatformInfo {
  platform: Platform;
  browser: Browser;
  isMobile: boolean;
  /** Whether the current browser supports the beforeinstallprompt API */
  supportsNativeInstall: boolean;
}

function detectPlatform(ua: string): Platform {
  // iOS detection (iPhone, iPad, iPod)
  if (/iphone|ipod/i.test(ua)) return 'ios';
  if (/ipad/i.test(ua)) return 'ios';

  // iPadOS 13+ reports as Macintosh — distinguish via touch support
  if (
    /macintosh/i.test(ua) &&
    typeof navigator !== 'undefined' &&
    navigator.maxTouchPoints > 1
  ) {
    return 'ios';
  }

  if (/android/i.test(ua)) return 'android';
  if (/windows/i.test(ua)) return 'windows';
  if (/macintosh|mac os x/i.test(ua)) return 'mac';
  if (/linux/i.test(ua)) return 'linux';

  return 'unknown';
}

function detectBrowser(ua: string): Browser {
  if (/samsungbrowser/i.test(ua)) return 'samsung';
  if (/edg\//i.test(ua)) return 'edge';
  if (/firefox|fxios/i.test(ua)) return 'firefox';
  if (/chrome|crios/i.test(ua)) return 'chrome';
  if (/safari/i.test(ua)) return 'safari';
  return 'other';
}

export const usePlatformDetection = (): PlatformInfo =>
  useMemo(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    const platform = detectPlatform(ua);
    const browser = detectBrowser(ua);
    const isMobile = platform === 'android' || platform === 'ios';

    // beforeinstallprompt is supported on Chrome, Edge, and Samsung Internet
    const supportsNativeInstall =
      browser === 'chrome' || browser === 'edge' || browser === 'samsung';

    return { platform, browser, isMobile, supportsNativeInstall };
  }, []);
