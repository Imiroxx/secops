import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2, Shield, CheckCircle } from 'lucide-react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  status?: 'generating' | 'ready' | 'scanned' | 'expired';
}

export function QRCodeDisplay({ value, size = 256, className = '', status = 'ready' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: '#00ff41',
        light: '#000000'
      },
      errorCorrectionLevel: 'M'
    }, (error) => {
      if (error) console.error(error);
    });
  }, [value, size]);

  const getStatusIcon = () => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-6 h-6 animate-spin text-primary" />;
      case 'scanned':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'expired':
        return <Shield className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'generating':
        return 'border-primary/50';
      case 'scanned':
        return 'border-green-500/50';
      case 'expired':
        return 'border-red-500/50';
      default:
        return 'border-primary/30';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`absolute inset-0 border-2 ${getStatusColor()} rounded-lg animate-pulse`} />
      <div className="relative bg-black/80 p-4 rounded-lg border border-primary/30 backdrop-blur-sm">
        {status === 'generating' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-primary text-sm">Generating QR Code...</p>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="block" />
        
        {status !== 'ready' && status !== 'generating' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
            <div className="text-center">
              {getStatusIcon()}
              <p className="text-primary mt-2 text-sm capitalize">{status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
