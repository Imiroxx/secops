import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

export interface QRAuthState {
  qrCode: string | null;
  status: 'idle' | 'generating' | 'ready' | 'scanned' | 'authenticated' | 'expired' | 'error';
  sessionId: string | null;
  error: string | null;
}

export function useQRAuth() {
  const [state, setState] = useState<QRAuthState>({
    qrCode: null,
    status: 'idle',
    sessionId: null,
    error: null,
  });

  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }, []);

  const generateQRCode = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'generating', error: null }));
    
    try {
      const sessionId = generateSessionId();
      const qrData = JSON.stringify({
        type: 'auth',
        sessionId,
        timestamp: Date.now(),
        app: 'SecOps Global'
      });
      
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#10b981',
          light: '#000000'
        }
      });
      
      setState({
        qrCode,
        status: 'ready',
        sessionId,
        error: null,
      });
      
      // Start polling for authentication status
      startPolling(sessionId);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Не удалось сгенерировать QR код',
      }));
    }
  }, [generateSessionId]);

  const startPolling = useCallback((sessionId: string) => {
    let pollCount = 0;
    const maxPolls = 60; // 5 минут с интервалом 5 секунд
    
    const poll = async () => {
      pollCount++;
      
      if (pollCount > maxPolls) {
        setState(prev => ({ ...prev, status: 'expired' }));
        return;
      }
      
      try {
        // Имитация проверки статуса (в реальном приложении здесь будет API запрос)
        const response = await mockAuthCheck(sessionId);
        
        if (response.status === 'scanned') {
          setState(prev => ({ ...prev, status: 'scanned' }));
          // Продолжаем опрос для получения статуса authenticated
          setTimeout(poll, 3000);
        } else if (response.status === 'authenticated') {
          setState(prev => ({ ...prev, status: 'authenticated' }));
          // Перенаправляем пользователя через 2 секунды
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          return;
        } else {
          // Продолжаем опрос если статус pending
          setTimeout(poll, 5000);
        }
      } catch (error) {
        setState(prev => ({ ...prev, status: 'error', error: 'Ошибка проверки статуса' }));
      }
    };
    
    setTimeout(poll, 2000); // Первый опрос через 2 секунды
  }, []);

  const mockAuthCheck = async (sessionId: string) => {
    // Имитация ответа от сервера
    // Для демонстрации: через 10 секунд считаем что код отсканирован
    // Еще через 5 секунд считаем что аутентификация успешна
    
    const timeElapsed = Date.now() - parseInt(sessionId.split('_')[1]);
    
    if (timeElapsed > 15000) { // 15 секунд
      return { status: 'authenticated', user: { id: 1, username: 'qr_user' } };
    } else if (timeElapsed > 10000) { // 10 секунд
      return { status: 'scanned' };
    } else {
      return { status: 'pending' };
    }
  };

  const reset = useCallback(() => {
    setState({
      qrCode: null,
      status: 'idle',
      sessionId: null,
      error: null,
    });
  }, []);

  const refresh = useCallback(() => {
    reset();
    setTimeout(() => {
      generateQRCode();
    }, 100);
  }, [reset, generateQRCode]);

  // Автоматическая генерация QR кода при монтировании
  useEffect(() => {
    if (state.status === 'idle') {
      generateQRCode();
    }
  }, [state.status, generateQRCode]);

  return {
    ...state,
    generateQRCode,
    reset,
    refresh,
  };
}
