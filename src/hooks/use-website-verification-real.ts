import { useState, useCallback } from 'react';

export interface VerificationResult {
  isValid: boolean;
  code?: string;
  message: string;
  siteUrl?: string;
  technologies?: string[];
}

export function useWebsiteVerificationReal() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const generateVerificationCode = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/verification/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate verification code');
      }
      
      const data = await response.json();
      return data.code;
    } catch (error) {
      console.error('Error generating verification code:', error);
      // Fallback to client-side generation
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `sec-ver-${timestamp}-${random}`;
    }
  }, []);

  const verifyWebsiteOwnership = useCallback(async (url: string, verificationCode: string): Promise<VerificationResult> => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Normalize URL
      const normalizedUrl = url.trim();
      if (!normalizedUrl) {
        throw new Error('URL не может быть пустым');
      }

      // Check URL format
      let urlObj: URL;
      try {
        urlObj = new URL(normalizedUrl);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          throw new Error('URL должен начинаться с http:// или https://');
        }
      } catch (error) {
        throw new Error('Некорректный формат URL');
      }

      // Call real verification API
      const response = await fetch('/api/verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: urlObj.href,
          verificationCode
        })
      });

      if (!response.ok) {
        throw new Error('Verification request failed');
      }

      const result = await response.json();
      setVerificationResult(result);
      return result;
      
    } catch (error) {
      const result: VerificationResult = {
        isValid: false,
        message: error instanceof Error ? error.message : 'Ошибка проверки сайта',
        siteUrl: url
      };
      
      setVerificationResult(result);
      return result;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const getVerificationInstructions = async (verificationCode: string) => {
    try {
      const response = await fetch('/api/verification/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.instructions;
      }
    } catch (error) {
      console.error('Error getting instructions:', error);
    }
    
    // Fallback instructions
    return {
      html: `<!-- SecOps Verification Code -->\n<meta name="secops-verification" content="${verificationCode}" />`,
      text: `Разместите следующий мета-тег в секции <head> вашей главной страницы:\n<meta name="secops-verification" content="${verificationCode}" />`,
      alternative: `Или добавьте в секцию <head>:\n<script>\nwindow.SECOPS_VERIFICATION = "${verificationCode}";\n</script>`
    };
  };

  const reset = useCallback(() => {
    setVerificationResult(null);
    setIsVerifying(false);
  }, []);

  return {
    isVerifying,
    verificationResult,
    generateVerificationCode,
    verifyWebsiteOwnership,
    getVerificationInstructions,
    reset
  };
}
