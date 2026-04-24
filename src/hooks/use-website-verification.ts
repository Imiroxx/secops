import { useState, useCallback } from 'react';

export interface VerificationResult {
  isValid: boolean;
  code?: string;
  message: string;
  siteUrl?: string;
}

export function useWebsiteVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const generateVerificationCode = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `sec-ver-${timestamp}-${random}`;
  }, []);

  const verifyWebsiteOwnership = useCallback(async (url: string, verificationCode: string): Promise<VerificationResult> => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Нормализация URL
      const normalizedUrl = url.trim();
      if (!normalizedUrl) {
        throw new Error('URL не может быть пустым');
      }

      // Проверка формата URL
      let urlObj: URL;
      try {
        urlObj = new URL(normalizedUrl);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          throw new Error('URL должен начинаться с http:// или https://');
        }
      } catch (error) {
        throw new Error('Некорректный формат URL');
      }

      // В реальном приложении здесь был бы запрос к API для проверки сайта
      // Для демонстрации имитируем проверку
      
      const mockVerification = await mockWebsiteVerification(urlObj.href, verificationCode);
      
      setVerificationResult(mockVerification);
      return mockVerification;
      
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

  const mockWebsiteVerification = async (url: string, verificationCode: string): Promise<VerificationResult> => {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Для демонстрации: если verificationCode содержит "valid", считаем что проверка успешна
    // В реальном приложении здесь будет реальная проверка содержимого сайта
    
    if (verificationCode.includes('valid') || verificationCode.includes('demo')) {
      return {
        isValid: true,
        code: verificationCode,
        message: 'Сайт успешно верифицирован! Код подтверждения найден на странице.',
        siteUrl: url
      };
    } else {
      // Имитация различных сценариев ошибок
      const random = Math.random();
      
      if (random < 0.3) {
        return {
          isValid: false,
          code: verificationCode,
          message: 'Код верификации не найден на главной странице. Убедитесь, что вы разместили мета-тег с кодом.',
          siteUrl: url
        };
      } else if (random < 0.5) {
        return {
          isValid: false,
          code: verificationCode,
          message: 'Сайт недоступен. Проверьте, что сайт работает и доступен из интернета.',
          siteUrl: url
        };
      } else {
        return {
          isValid: false,
          code: verificationCode,
          message: 'Не удалось проверить сайт. Попробуйте повторить попытку позже.',
          siteUrl: url
        };
      }
    }
  };

  const getVerificationInstructions = (verificationCode: string) => {
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
