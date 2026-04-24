import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import url from 'url';

export interface QRSession {
  sessionId: string;
  status: 'pending' | 'scanned' | 'authenticated' | 'expired';
  userId?: number;
  username?: string;
  createdAt: Date;
  scannedAt?: Date;
  expiresAt: Date;
}

export class QRAuthService {
  private sessions: Map<string, QRSession> = new Map();
  private wsServer?: WebSocketServer;

  constructor() {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  initializeWebSocketServer(server: any) {
    this.wsServer = new WebSocketServer({ 
      server,
      path: '/ws/qr-auth'
    });

    this.wsServer.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const { query } = url.parse(req.url || '', true);
      const sessionId = query.sessionId as string;

      if (!sessionId) {
        ws.close(1008, 'Session ID required');
        return;
      }

      const session = this.sessions.get(sessionId);
      if (!session) {
        ws.close(1008, 'Invalid session');
        return;
      }

      // Store WebSocket connection for this session
      (session as any).ws = ws;

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(sessionId, message);
        } catch (error) {
          console.error('Invalid message format:', error);
        }
      });

      ws.on('close', () => {
        // Clean up WebSocket reference
        if (session) {
          delete (session as any).ws;
        }
      });

      // Send current status
      this.sendStatusUpdate(sessionId);
    });

    console.log('QR Auth WebSocket server initialized');
  }

  generateSession(): QRSession {
    const sessionId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const session: QRSession = {
      sessionId,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  private handleMessage(sessionId: string, message: any) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    switch (message.type) {
      case 'scan':
        if (session.status === 'pending') {
          session.status = 'scanned';
          session.scannedAt = new Date();
          this.sendStatusUpdate(sessionId);
        }
        break;

      case 'authenticate':
        if (session.status === 'scanned' && message.credentials) {
          // Here you would validate credentials against your user database
          // For demo, we'll accept any non-empty credentials
          if (message.credentials.username && message.credentials.password) {
            session.status = 'authenticated';
            session.username = message.credentials.username;
            // In real implementation, you would get userId from database
            session.userId = Math.floor(Math.random() * 1000) + 1;
            
            this.sendStatusUpdate(sessionId);
            
            // Auto-redirect after successful authentication
            setTimeout(() => {
              this.cleanupSession(sessionId);
            }, 2000);
          }
        }
        break;

      case 'ping':
        // Keep connection alive
        this.sendStatusUpdate(sessionId, { type: 'pong' });
        break;
    }
  }

  private sendStatusUpdate(sessionId: string, additionalData?: any) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const ws = (session as any).ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'status_update',
        sessionId,
        status: session.status,
        username: session.username,
        timestamp: new Date().toISOString(),
        ...additionalData
      }));
    }
  }

  getSession(sessionId: string): QRSession | undefined {
    return this.sessions.get(sessionId);
  }

  private cleanupExpiredSessions() {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        session.status = 'expired';
        this.sendStatusUpdate(sessionId);
        this.cleanupSession(sessionId);
      }
    }
  }

  private cleanupSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      const ws = (session as any).ws;
      if (ws) {
        ws.close(1000, 'Session ended');
      }
      this.sessions.delete(sessionId);
    }
  }

  // For mobile app to authenticate
  validateSession(sessionId: string): QRSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) {
      return null;
    }
    return session;
  }

  updateSessionStatus(sessionId: string, status: QRSession['status'], data?: Partial<QRSession>) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      if (data) {
        Object.assign(session, data);
      }
      this.sendStatusUpdate(sessionId);
    }
  }
}

export const qrAuthService = new QRAuthService();
