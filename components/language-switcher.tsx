'use client';

import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
      className="h-9 w-9"
      title={language === 'en' ? 'Switch to Thai' : 'สลับเป็นภาษาอังกฤษ'}
    >
      <span className="text-sm font-semibold">
        {language === 'en' ? 'TH' : 'EN'}
      </span>
    </Button>
  );
}
