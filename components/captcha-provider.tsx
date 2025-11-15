import { HCaptchaWidget } from './hcaptcha-widget';

interface CaptchaProviderProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function CaptchaProvider({ onVerify, onExpire }: CaptchaProviderProps) {
  return <HCaptchaWidget onVerify={onVerify} onExpire={onExpire} />;
}
