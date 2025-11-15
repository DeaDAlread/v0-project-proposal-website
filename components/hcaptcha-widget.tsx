'use client';

import { useEffect, useRef } from 'react';

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function HCaptchaWidget({ onVerify, onExpire }: HCaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const captchaRef = useRef<any>(null);

  useEffect(() => {
    const loadHCaptcha = async () => {
      if (typeof window === 'undefined' || !containerRef.current) return;

      // Load hCaptcha script
      if (!document.getElementById('hcaptcha-script')) {
        const script = document.createElement('script');
        script.id = 'hcaptcha-script';
        script.src = 'https://js.hcaptcha.com/1/api.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          renderCaptcha();
        };
      } else if ((window as any).hcaptcha) {
        renderCaptcha();
      }
    };

    const renderCaptcha = () => {
      if (containerRef.current && (window as any).hcaptcha) {
        try {
          captchaRef.current = (window as any).hcaptcha.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
            theme: 'light',
            callback: onVerify,
            'expired-callback': onExpire,
          });
        } catch (error) {
          console.error('[v0] hCaptcha render error:', error);
        }
      }
    };

    loadHCaptcha();

    return () => {
      if (captchaRef.current && (window as any).hcaptcha) {
        try {
          (window as any).hcaptcha.remove(captchaRef.current);
        } catch (error) {
          console.error('[v0] hCaptcha cleanup error:', error);
        }
      }
    };
  }, [onVerify, onExpire]);

  return (
    <div ref={containerRef} className="flex justify-center">
      {!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && (
        <p className="text-sm text-yellow-600">hCaptcha not configured</p>
      )}
    </div>
  );
}
