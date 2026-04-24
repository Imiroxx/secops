import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

export interface QRAuthState {
  qrCode: string | null;
  status: 'idle' | 'generating' | 'ready' | 'scanned' | 'authenticated' | 'expired' | 'error';
  sessionId: string | null;
  error: string | null;
  username?: string;
  authUrl?: string;
}

export function useQRAuthReal() {
  const [state, setState] = useState<QRAuthState>({
    qrCode: null,
    status: 'idle',
    sessionId: null,
    error: null,
  });

  const generateQRCode = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'generating', error: null }));
    
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR session');
      }
      
      const data = await response.json();
      
      // Generate QR code with the auth URL
      const qrCode = await QRCode.toDataURL(data.authUrl || data.qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#10b981',
          light: '#000000'
        }
      });
      
      setState({
        qrCode,
        authUrl: data.authUrl,
        status: 'ready',
        sessionId: data.sessionId,
        error: null,
      });
      
      // Start polling for authentication status
      startPolling(data.sessionId);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Не удалось сгенерировать QR код',
      }));
    }
  }, []);

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
        const response = await fetch(`/api/qr/status/${sessionId}`);
        
        if (!response.ok) {
          setState(prev => ({ ...prev, status: 'expired' }));
          return;
        }
        
        const data = await response.json();
        
        if (data.status === 'scanned') {
          setState(prev => ({ ...prev, status: 'scanned' }));
        } else if (data.status === 'authenticated') {
          setState(prev => ({ 
            ...prev, 
            status: 'authenticated',
            username: data.username 
          }));
          
          // Redirect to dashboard after successful authentication
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        
        // Continue polling if status hasn't changed to authenticated
        if (data.status === 'pending' || data.status === 'scanned') {
          setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error('Error polling QR status:', error);
        setState(prev => ({ ...prev, status: 'error', error: 'Ошибка проверки статуса' }));
      }
    };
    
    setTimeout(poll, 3000);
  }, []);

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

  // Auto-generate QR code on mount
  useEffect(() => {
    if (state.status === 'idle') {
      generateQRCode();
    }
  }, [state.status, generateQRCode]);

  return {
    ...state,
    generateQRCode,
    reset,
    refresh
  };
}
