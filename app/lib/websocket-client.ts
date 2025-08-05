import type { 
  WebSocketMessage, 
  ProcessingStatusMessage, 
  TranscriptionStatusMessage 
} from './types';

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;

  constructor(url?: string) {
    this.url = url || (
      process.env.NODE_ENV === 'production' 
        ? 'wss://api.your-domain.com/ws' 
        : 'ws://localhost:8000/ws'
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.token 
          ? `${this.url}?token=${encodeURIComponent(this.token)}`
          : this.url;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connection', { type: 'connection', data: 'connected', timestamp: Date.now() });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          
          this.emit('disconnection', { 
            type: 'disconnection', 
            data: { code: event.code, reason: event.reason }, 
            timestamp: Date.now() 
          });

          if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          
          this.emit('error', { 
            type: 'error', 
            data: error, 
            timestamp: Date.now() 
          });

          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection failed'));
          }
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  private scheduleReconnect() {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    const jitter = Math.random() * 1000;
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect().catch(console.error);
      }
    }, delay + jitter);
  }

  private handleMessage(message: WebSocketMessage) {
    // Emit to specific event handlers
    this.emit(message.type, message);
    
    // Emit to general message handlers
    this.emit('message', message);
  }

  private emit(eventType: string, message: WebSocketMessage) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${eventType}:`, error);
        }
      });
    }
  }

  on(eventType: string, handler: WebSocketEventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  off(eventType: string, handler: WebSocketEventHandler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Typed event handlers for specific message types
export class TypedWebSocketClient extends WebSocketClient {
  onProcessingStatus(handler: (message: ProcessingStatusMessage) => void) {
    this.on('processing_status', handler as WebSocketEventHandler);
  }

  onTranscriptionStatus(handler: (message: TranscriptionStatusMessage) => void) {
    this.on('transcription_status', handler as WebSocketEventHandler);
  }

  offProcessingStatus(handler: (message: ProcessingStatusMessage) => void) {
    this.off('processing_status', handler as WebSocketEventHandler);
  }

  offTranscriptionStatus(handler: (message: TranscriptionStatusMessage) => void) {
    this.off('transcription_status', handler as WebSocketEventHandler);
  }
}

// Create singleton instance
export const wsClient = new TypedWebSocketClient();

// Auto-connect when token is available
let autoConnectEnabled = false;

export function enableAutoConnect() {
  autoConnectEnabled = true;
}

export function disableAutoConnect() {
  autoConnectEnabled = false;
  wsClient.disconnect();
}

// Helper function to ensure connection
export async function ensureWebSocketConnection(token?: string): Promise<void> {
  if (token) {
    wsClient.setToken(token);
  }
  
  if (!wsClient.isConnected && autoConnectEnabled) {
    await wsClient.connect();
  }
}