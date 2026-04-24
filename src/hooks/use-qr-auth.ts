import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

export interface QRAuthState {
  qrCode: string | null;
  status: 'idle' | 'generating' | 'ready' | 'scanned' | 'authenticated' | 'expired' | 'error';
  sessionId: string | null;
  error: string | null;
  authUrl?: string;
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
      
      // Создаем URL для мобильного приложения
      const baseUrl = window.location.origin;
      const authUrl = `${baseUrl}/auth/qr?session=${sessionId}&timestamp=${Date.now()}`;
      
      // QR код содержит URL для мобильного приложения
      const qrData = {
        type: 'auth',
        sessionId,
        timestamp: Date.now(),
        app: 'SecOps Global',
        url: authUrl,
        callbackUrl: `${baseUrl}/auth/callback`
      };
      
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#10b981',
          light: '#000000'
        },
        errorCorrectionLevel: 'M'
      });
      
      setState({
        qrCode,
        status: 'ready',
        sessionId,
        error: null,
        authUrl
      });
      
      // Сохраняем сессию в localStorage для имитации
      localStorage.setItem(`qr_session_${sessionId}`, JSON.stringify({
        status: 'pending',
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 минут
      }));
      
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
        localStorage.removeItem(`qr_session_${sessionId}`);
        return;
      }
      
      try {
        // Проверяем статус сессии в localStorage
        const sessionData = localStorage.getItem(`qr_session_${sessionId}`);
        
        if (!sessionData) {
          setState(prev => ({ ...prev, status: 'expired' }));
          return;
        }
        
        const session = JSON.parse(sessionData);
        
        if (session.status === 'scanned') {
          setState(prev => ({ ...prev, status: 'scanned' }));
          // Продолжаем опрос для получения статуса authenticated
          setTimeout(poll, 3000);
        } else if (session.status === 'authenticated') {
          setState(prev => ({ ...prev, status: 'authenticated' }));
          localStorage.removeItem(`qr_session_${sessionId}`);
          
          // Имитация успешного входа
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          return;
        } else if (Date.now() > session.expiresAt) {
          setState(prev => ({ ...prev, status: 'expired' }));
          localStorage.removeItem(`qr_session_${sessionId}`);
          return;
        } else {
          // Продолжаем опрос если статус pending
          setTimeout(poll, 3000);
        }
      } catch (error) {
        setState(prev => ({ ...prev, status: 'error', error: 'Ошибка проверки статуса' }));
      }
    };
    
    setTimeout(poll, 2000); // Первый опрос через 2 секунды
  }, []);

  // Функция для имитации сканирования QR кода (для тестирования)
  const simulateScan = useCallback(() => {
    if (!state.sessionId) return;
    
    const sessionData = localStorage.getItem(`qr_session_${state.sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.status = 'scanned';
      session.scannedAt = Date.now();
      localStorage.setItem(`qr_session_${state.sessionId}`, JSON.stringify(session));
    }
  }, [state.sessionId]);

  // Функция для имитации подтверждения входа (для тестирования)
  const simulateAuth = useCallback(() => {
    if (!state.sessionId) return;
    
    const sessionData = localStorage.getItem(`qr_session_${state.sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.status = 'authenticated';
      session.authenticatedAt = Date.now();
      localStorage.setItem(`qr_session_${state.sessionId}`, JSON.stringify(session));
    }
  }, [state.sessionId]);

  const reset = useCallback(() => {
    if (state.sessionId) {
      localStorage.removeItem(`qr_session_${state.sessionId}`);
    }
    setState({
      qrCode: null,
      status: 'idle',
      sessionId: null,
      error: null,
    });
  }, [state.sessionId]);

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
    simulateScan,
    simulateAuth
  };
}
