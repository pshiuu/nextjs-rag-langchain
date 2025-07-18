import { NextRequest, NextResponse } from "next/server";

// In-memory stores (in production, use Redis or database)
const ipRateStore = new Map<string, { count: number; resetTime: number }>();
const sessionStore = new Map<
  string,
  {
    count: number;
    resetTime: number;
    firstRequest: number;
    messageHistory: string[];
  }
>();

// Rate limiting configuration
const RATE_LIMITS = {
  IP: {
    requests: 100, // requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  SESSION: {
    requests: 30, // requests per session window
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxDaily: 200, // max requests per session per day
  },
  MESSAGE: {
    maxLength: 2000, // max characters per message
    minInterval: 1000, // minimum ms between messages
  },
};

// Security configuration
const SECURITY_CONFIG = {
  maxMessageLength: 2000,
  maxMessagesPerMinute: 20,
  suspiciousPatterns: [
    /script/gi,
    /<[^>]*>/g, // HTML tags
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
    /onload|onerror|onclick/gi,
  ],
  bannedPhrases: ["eval(", "function(", "document.", "window.", "location."],
};

interface SecurityResult {
  allowed: boolean;
  reason?: string;
  headers?: Record<string, string>;
}

interface ChatSecurityContext {
  ip: string;
  sessionId: string;
  apiKey: string;
  message: string;
  userAgent?: string;
}

export class ChatSecurity {
  /**
   * Main security check - validates all security measures
   */
  static async validateRequest(
    context: ChatSecurityContext
  ): Promise<SecurityResult> {
    try {
      // 1. Rate limiting checks
      const ipCheck = this.checkIPRateLimit(context.ip);
      if (!ipCheck.allowed) {
        return ipCheck;
      }

      const sessionCheck = this.checkSessionRateLimit(context.sessionId);
      if (!sessionCheck.allowed) {
        return sessionCheck;
      }

      // 2. Input validation
      const inputCheck = this.validateInput(context.message);
      if (!inputCheck.allowed) {
        return inputCheck;
      }

      // 3. Content filtering
      const contentCheck = this.filterContent(context.message);
      if (!contentCheck.allowed) {
        return contentCheck;
      }

      // 4. Session tracking
      this.trackSession(context.sessionId, context.message);

      return {
        allowed: true,
        headers: this.getSecurityHeaders(),
      };
    } catch (error) {
      console.error("Security check error:", error);
      return {
        allowed: false,
        reason: "Security validation failed",
      };
    }
  }

  /**
   * IP-based rate limiting
   */
  private static checkIPRateLimit(ip: string): SecurityResult {
    const now = Date.now();
    const key = `ip:${ip}`;

    let record = ipRateStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + RATE_LIMITS.IP.windowMs,
      };
      ipRateStore.set(key, record);
      return { allowed: true };
    }

    if (record.count >= RATE_LIMITS.IP.requests) {
      return {
        allowed: false,
        reason: `Rate limit exceeded. Try again in ${Math.ceil(
          (record.resetTime - now) / 1000
        )}s`,
      };
    }

    record.count++;
    ipRateStore.set(key, record);
    return { allowed: true };
  }

  /**
   * Session-based rate limiting with daily limits
   */
  private static checkSessionRateLimit(sessionId: string): SecurityResult {
    const now = Date.now();
    const key = `session:${sessionId}`;

    let record = sessionStore.get(key);

    if (!record) {
      record = {
        count: 1,
        resetTime: now + RATE_LIMITS.SESSION.windowMs,
        firstRequest: now,
        messageHistory: [],
      };
      sessionStore.set(key, record);
      return { allowed: true };
    }

    // Check daily limit
    const dayMs = 24 * 60 * 60 * 1000;
    if (
      now - record.firstRequest < dayMs &&
      record.messageHistory.length >= RATE_LIMITS.SESSION.maxDaily
    ) {
      return {
        allowed: false,
        reason: "Daily message limit reached. Please try again tomorrow.",
      };
    }

    // Check rate limit window
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + RATE_LIMITS.SESSION.windowMs;
    } else if (record.count >= RATE_LIMITS.SESSION.requests) {
      return {
        allowed: false,
        reason: `Too many messages. Please wait ${Math.ceil(
          (record.resetTime - now) / 1000
        )}s`,
      };
    } else {
      record.count++;
    }

    sessionStore.set(key, record);
    return { allowed: true };
  }

  /**
   * Input validation and sanitization
   */
  private static validateInput(message: string): SecurityResult {
    if (!message || typeof message !== "string") {
      return {
        allowed: false,
        reason: "Invalid message format",
      };
    }

    // Length check
    if (message.length > SECURITY_CONFIG.maxMessageLength) {
      return {
        allowed: false,
        reason: `Message too long. Maximum ${SECURITY_CONFIG.maxMessageLength} characters.`,
      };
    }

    // Empty or whitespace only
    if (message.trim().length === 0) {
      return {
        allowed: false,
        reason: "Message cannot be empty",
      };
    }

    return { allowed: true };
  }

  /**
   * Content filtering for malicious patterns
   */
  private static filterContent(message: string): SecurityResult {
    const lowerMessage = message.toLowerCase();

    // Check for banned phrases
    for (const phrase of SECURITY_CONFIG.bannedPhrases) {
      if (lowerMessage.includes(phrase.toLowerCase())) {
        return {
          allowed: false,
          reason: "Message contains prohibited content",
        };
      }
    }

    // Check for suspicious patterns
    for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
      if (pattern.test(message)) {
        return {
          allowed: false,
          reason: "Message contains suspicious content",
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Track session activity for analysis
   */
  private static trackSession(sessionId: string, message: string): void {
    const record = sessionStore.get(`session:${sessionId}`);
    if (record) {
      record.messageHistory.push(message.substring(0, 100)); // Store first 100 chars for analysis

      // Keep only last 50 messages to prevent memory bloat
      if (record.messageHistory.length > 50) {
        record.messageHistory = record.messageHistory.slice(-50);
      }

      sessionStore.set(`session:${sessionId}`, record);
    }
  }

  /**
   * Security headers for responses
   */
  private static getSecurityHeaders(): Record<string, string> {
    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": "default-src 'self'",
    };
  }

  /**
   * Sanitize message content
   */
  static sanitizeMessage(message: string): string {
    return message
      .trim()
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/data:/gi, "") // Remove data: protocol
      .substring(0, SECURITY_CONFIG.maxMessageLength); // Enforce length limit
  }

  /**
   * Generate session ID from request
   */
  static generateSessionId(request: NextRequest): string {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    const apiKey = request.url.split("/").pop() || "unknown";

    // Create a pseudo-session ID (in production, use proper session management)
    return btoa(`${ip}:${userAgent.substring(0, 50)}:${apiKey}`).substring(
      0,
      32
    );
  }

  /**
   * Get client IP address
   */
  static getClientIP(request: NextRequest): string {
    // Check various headers for real IP (useful behind proxies)
    const xForwardedFor = request.headers.get("x-forwarded-for");
    const xRealIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");

    if (xForwardedFor) {
      return xForwardedFor.split(",")[0].trim();
    }
    if (xRealIp) {
      return xRealIp;
    }
    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    return request.ip || "127.0.0.1";
  }

  /**
   * Create error response with security headers
   */
  static createErrorResponse(
    reason: string,
    status: number = 429
  ): NextResponse {
    const response = NextResponse.json(
      {
        error: reason,
        timestamp: new Date().toISOString(),
      },
      { status }
    );

    // Add security headers
    const securityHeaders = this.getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  /**
   * Cleanup old records (call periodically)
   */
  static cleanup(): void {
    const now = Date.now();

    // Cleanup IP rate limit store
    Array.from(ipRateStore.entries()).forEach(([key, record]) => {
      if (now > record.resetTime) {
        ipRateStore.delete(key);
      }
    });

    // Cleanup session store (remove sessions older than 24 hours)
    const dayMs = 24 * 60 * 60 * 1000;
    Array.from(sessionStore.entries()).forEach(([key, record]) => {
      if (now - record.firstRequest > dayMs) {
        sessionStore.delete(key);
      }
    });
  }
}

// Cleanup old records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    ChatSecurity.cleanup();
  }, 5 * 60 * 1000);
}
