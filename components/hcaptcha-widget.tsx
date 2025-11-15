'use client';

import { useEffect, useRef, useState } from 'react';

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function HCaptchaWidget({ onVerify, onExpire }: HCaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const response = await fetch('/api/captcha-sitekey');
        if (!response.ok) throw new Error('Failed to fetch siteKey');
        const { siteKey } = await response.json();
        setSiteKey(siteKey);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load CAPTCHA');
      }
    };

    fetchSiteKey();
  }, []);

  useEffect(() => {
    // Load hCaptcha script
    if (!window.hcaptcha) {
      const script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && window.hcaptcha && siteKey) {
      // Clear previous widget
      containerRef.current.innerHTML = '';
      
      window.hcaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: onVerify,
        'expired-callback': onExpire,
      });
    }
  }, [isLoaded, siteKey, onVerify, onExpire]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return <div ref={containerRef} className="flex justify-center py-4" />;
}
