// Simulated risk scoring engine

export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export interface ThreatEvent {
  id: string;
  type: "sms" | "call" | "email" | "transaction";
  title: string;
  description: string;
  riskLevel: RiskLevel;
  score: number;
  timestamp: Date;
  blocked: boolean;
}

export interface TrustScore {
  overall: number;
  sms: number;
  calls: number;
  transactions: number;
  trend: "up" | "down" | "stable";
}

const SMS_PATTERNS = [
  { pattern: /urgent|immediately|act now/i, weight: 30, label: "Urgency manipulation" },
  { pattern: /click here|bit\.ly|tinyurl/i, weight: 25, label: "Suspicious link" },
  { pattern: /won|winner|prize|lottery/i, weight: 35, label: "Prize scam" },
  { pattern: /bank|account.*suspend|verify.*identity/i, weight: 40, label: "Phishing attempt" },
  { pattern: /password|pin|ssn|social security/i, weight: 45, label: "Credential harvesting" },
  { pattern: /free|no cost|limited time/i, weight: 15, label: "Bait offer" },
  { pattern: /irs|tax|refund.*claim/i, weight: 35, label: "Government impersonation" },
];

export function analyzeSMS(message: string): { score: number; threats: string[]; riskLevel: RiskLevel } {
  let score = 0;
  const threats: string[] = [];

  for (const { pattern, weight, label } of SMS_PATTERNS) {
    if (pattern.test(message)) {
      score += weight;
      threats.push(label);
    }
  }

  score = Math.min(score, 100);
  const riskLevel = getRiskLevel(score);
  return { score, threats, riskLevel };
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 10) return "safe";
  if (score <= 30) return "low";
  if (score <= 55) return "medium";
  if (score <= 80) return "high";
  return "critical";
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "safe": return "hsl(160, 84%, 39%)";
    case "low": return "hsl(174, 72%, 56%)";
    case "medium": return "hsl(38, 92%, 50%)";
    case "high": return "hsl(15, 80%, 50%)";
    case "critical": return "hsl(0, 72%, 51%)";
  }
}

export function generateMockThreatEvents(): ThreatEvent[] {
  const events: ThreatEvent[] = [
    { id: "1", type: "sms", title: "Phishing SMS blocked", description: "Message claiming to be from your bank requesting account verification", riskLevel: "critical", score: 92, timestamp: new Date(Date.now() - 1000 * 60 * 5), blocked: true },
    { id: "2", type: "call", title: "Suspicious caller detected", description: "Unknown international number flagged by community reports", riskLevel: "high", score: 75, timestamp: new Date(Date.now() - 1000 * 60 * 30), blocked: true },
    { id: "3", type: "sms", title: "Promotional spam filtered", description: "Unsolicited marketing message with suspicious link", riskLevel: "medium", score: 45, timestamp: new Date(Date.now() - 1000 * 60 * 120), blocked: false },
    { id: "4", type: "transaction", title: "Unusual transaction pattern", description: "Multiple small transactions detected in short timeframe", riskLevel: "low", score: 28, timestamp: new Date(Date.now() - 1000 * 60 * 180), blocked: false },
    { id: "5", type: "call", title: "Robocall intercepted", description: "Automated call claiming IRS audit - classic scam pattern", riskLevel: "critical", score: 95, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), blocked: true },
    { id: "6", type: "email", title: "Safe communication", description: "Verified sender from known contact", riskLevel: "safe", score: 5, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), blocked: false },
  ];
  return events;
}

export function generateTrustScore(): TrustScore {
  return { overall: 87, sms: 92, calls: 78, transactions: 91, trend: "up" };
}

export function generateWeeklyData() {
  return [
    { day: "Mon", threats: 3, blocked: 3, score: 85 },
    { day: "Tue", threats: 5, blocked: 4, score: 82 },
    { day: "Wed", threats: 2, blocked: 2, score: 90 },
    { day: "Thu", threats: 7, blocked: 6, score: 78 },
    { day: "Fri", threats: 4, blocked: 4, score: 87 },
    { day: "Sat", threats: 1, blocked: 1, score: 95 },
    { day: "Sun", threats: 2, blocked: 2, score: 92 },
  ];
}
