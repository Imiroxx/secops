import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QRAuthState {
  qrCode: string | null;
  status: 'idle' | 'generating' | 'ready' | 'scanned' | 'expired' | 'error';
  sessionId: string | null;
  expiresAt: number | null;
}

export function useQRAuth() {
  const [state, setState] = useState<QRAuthState>({
    qrCode: null,
    status: 'idle',
    sessionId: null,
    expiresAt: null,
  });
  
  const { toast } = useToast();

  const generateQRCode = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'generating', qrCode: null }));
    
    try {
      // Generate session ID
      const sessionId = `sec-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
      
      // Create QR code data with session info
      const qrData = JSON.stringify({
        sessionId,
        timestamp: Date.now(),
        expiresAt,
        type: 'secops-auth'
      });
      
      // Generate QR code URL
      const response = await fetch('/api/auth/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          data: qrData,
          returnUrl: window.location.origin + '/auth/qr-callback'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      const { qrUrl } = await response.json();
      
      setState({
        qrCode: qrUrl,
        status: 'ready',
        sessionId,
        expiresAt
      });
      
      // Start polling for authentication status
      startStatusPolling(sessionId);
      
    } catch (error) {
      console.error('QR generation error:', error);
      setState(prev => ({ ...prev, status: 'error' }));
      toast({
        title: 'Authentication Error',
        description: 'Failed to generate QR code. Please try again.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const startStatusPolling = useCallback((sessionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/status/${sessionId}`);
        
        if (!response.ok) {
          clearInterval(pollInterval);
          setState(prev => ({ ...prev, status: 'error' }));
          return;
        }
        
        const { status, user } = await response.json();
        
        if (status === 'authenticated') {
          clearInterval(pollInterval);
          setState(prev => ({ ...prev, status: 'scanned' }));
          toast({
            title: 'Authentication Successful',
            description: `Welcome back, ${user.username}!`,
          });
          
          // Redirect to dashboard after successful auth
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
          
        } else if (status === 'expired') {
          clearInterval(pollInterval);
          setState(prev => ({ ...prev, status: 'expired' }));
          toast({
            title: 'QR Code Expired',
            description: 'Please generate a new QR code.',
            variant: 'destructive'
          });
        }
        
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    // Auto-expire check
    const expireTimeout = setTimeout(() => {
      clearInterval(pollInterval);
      setState(prev => ({ ...prev, status: 'expired' }));
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      clearInterval(pollInterval);
      clearTimeout(expireTimeout);
    };
  }, [toast]);

  const reset = useCallback(() => {
    setState({
      qrCode: null,
      status: 'idle',
      sessionId: null,
      expiresAt: null,
    });
  }, []);

  // Auto-expire check
  useEffect(() => {
    if (state.expiresAt && state.status === 'ready') {
      const timeUntilExpiry = state.expiresAt - Date.now();
      
      if (timeUntilExpiry > 0) {
        const timeout = setTimeout(() => {
          setState(prev => ({ ...prev, status: 'expired' }));
        }, timeUntilExpiry);
        
        return () => clearTimeout(timeout);
      } else {
        setState(prev => ({ ...prev, status: 'expired' }));
      }
    }
  }, [state.expiresAt, state.status]);

  return {
    ...state,
    generateQRCode,
    reset,
    isExpired: state.status === 'expired',
    isReady: state.status === 'ready',
    isScanned: state.status === 'scanned',
    isLoading: state.status === 'generating',
    hasError: state.status === 'error'
  };
}
