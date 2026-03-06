// lib/constants.ts
export const PLATFORMS = {
  google: {
    name: "Google Search",
    icon: "Search",
    category: "search",
    idealImageSize: { width: 1200, height: 630 },
    aspectRatio: "1.91:1",
  },
  twitter: {
    name: "X / Twitter",
    icon: "Twitter",
    category: "social",
    idealImageSize: { width: 1200, height: 628 },
    aspectRatio: "1.91:1",
  },
  linkedin: {
    name: "LinkedIn",
    icon: "Linkedin",
    category: "social",
    idealImageSize: { width: 1200, height: 627 },
    aspectRatio: "1.91:1",
  },
  discord: {
    name: "Discord",
    icon: "MessageCircle",
    category: "messaging",
    idealImageSize: { width: 1200, height: 630 },
    aspectRatio: "1.91:1",
  },
  slack: {
    name: "Slack",
    icon: "Hash",
    category: "messaging",
    idealImageSize: { width: 800, height: 418 },
    aspectRatio: "1.91:1",
  },
  whatsapp: {
    name: "WhatsApp",
    icon: "MessageSquare",
    category: "messaging",
    idealImageSize: { width: 400, height: 400 },
    aspectRatio: "1:1",
  },
  telegram: {
    name: "Telegram",
    icon: "Send",
    category: "messaging",
    idealImageSize: { width: 1200, height: 630 },
    aspectRatio: "1.91:1",
  },
  facebook: {
    name: "Facebook",
    icon: "Facebook",
    category: "social",
    idealImageSize: { width: 1200, height: 630 },
    aspectRatio: "1.91:1",
  },
  imessage: {
    name: "iMessage",
    icon: "Smartphone",
    category: "messaging",
    idealImageSize: { width: 1200, height: 630 },
    aspectRatio: "1.91:1",
  },
} as const;

export const GRADE_SCALE = {
  "A+": {
    min: 95,
    max: 100,
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    message: "Outstanding! Your metadata is perfectly optimized.",
  },
  A: {
    min: 90,
    max: 94,
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    message: "Excellent! Just a few minor improvements possible.",
  },
  "A-": {
    min: 85,
    max: 89,
    color: "text-green-500",
    bg: "bg-green-500",
    message: "Great job! Your link previews look professional.",
  },
  "B+": {
    min: 80,
    max: 84,
    color: "text-lime-500",
    bg: "bg-lime-500",
    message: "Good work! A few optimizations will make it perfect.",
  },
  B: {
    min: 75,
    max: 79,
    color: "text-yellow-500",
    bg: "bg-yellow-500",
    message: "Solid foundation. Some improvements recommended.",
  },
  "B-": {
    min: 70,
    max: 74,
    color: "text-yellow-500",
    bg: "bg-yellow-500",
    message: "Decent start. Several areas need attention.",
  },
  C: {
    min: 60,
    max: 69,
    color: "text-orange-500",
    bg: "bg-orange-500",
    message: "Needs work. Multiple issues affecting previews.",
  },
  D: {
    min: 50,
    max: 59,
    color: "text-red-400",
    bg: "bg-red-400",
    message: "Poor. Many critical metadata tags are missing.",
  },
  F: {
    min: 0,
    max: 49,
    color: "text-red-500",
    bg: "bg-red-500",
    message: "Critical issues. Most previews will look broken.",
  },
} as const;

export const TITLE_LIMITS = {
  min: 30,
  ideal: 50,
  max: 60,
  warning: "Title should be between 30-60 characters for optimal display.",
};

export const DESCRIPTION_LIMITS = {
  min: 120,
  ideal: 155,
  max: 160,
  warning:
    "Description should be between 120-160 characters for optimal display.",
};

export const OG_IMAGE_LIMITS = {
  minWidth: 200,
  idealWidth: 1200,
  minHeight: 200,
  idealHeight: 630,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  warningFileSize: 100 * 1024, // 100KB
  maxLoadTime: 3000, // 3 seconds
  warningLoadTime: 500, // 500ms
};

export const QUICK_TRY_URLS = [
  "devsethi.site",
  "stripe.com",
  "linear.app",
];
