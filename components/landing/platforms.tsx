// components/landing/platforms.tsx
"use client";

import { motion } from "motion/react";
import {
  Search,
  Twitter,
  Linkedin,
  MessageCircle,
  Hash,
  MessageSquare,
  Send,
  Facebook,
  Smartphone,
} from "lucide-react";

const platforms = [
  { name: "Google", icon: Search, color: "text-blue-500" },
  { name: "X / Twitter", icon: Twitter, color: "text-foreground" },
  { name: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  { name: "Discord", icon: MessageCircle, color: "text-indigo-500" },
  { name: "Slack", icon: Hash, color: "text-purple-500" },
  { name: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
  { name: "Telegram", icon: Send, color: "text-sky-500" },
  { name: "Facebook", icon: Facebook, color: "text-blue-500" },
  { name: "iMessage", icon: Smartphone, color: "text-green-500" },
];

export function LandingPlatforms() {
  return (
    <section className="py-12 border-y bg-muted/30">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-6">
          See your link previews across 9+ platforms
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <platform.icon className={`h-5 w-5 ${platform.color}`} />
              <span className="text-sm font-medium">{platform.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
