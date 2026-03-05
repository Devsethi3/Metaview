// components/results/results-tabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  FileText,
  Share2,
  Twitter,
  Image,
  Code,
  Trophy,
} from "lucide-react";
import type { AnalysisResult } from "@/types";
import { ScoreSummary } from "./score-summary";
import { PreviewsTab } from "./tabs/previews-tab";
import { BasicTab } from "./tabs/basic-tab";
import { OpenGraphTab } from "./tabs/open-graph-tab";
import { TwitterTab } from "./tabs/twitter-tab";
import { ImagesTab } from "./tabs/images-tab";
import { RawTab } from "./tabs/raw-tab";
import { ScoreTab } from "./tabs/score-tab";

interface ResultsTabsProps {
  result: AnalysisResult;
}

const tabs = [
  { id: "previews", label: "Previews", icon: Eye },
  { id: "basic", label: "Basic", icon: FileText },
  { id: "opengraph", label: "Open Graph", icon: Share2 },
  { id: "twitter", label: "X / Twitter", icon: Twitter },
  { id: "images", label: "Images", icon: Image },
  { id: "raw", label: "Raw", icon: Code },
  { id: "score", label: "Score", icon: Trophy },
];

export function ResultsTabs({ result }: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState("previews");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Score Summary - Always visible at top */}
      <div className="mb-6">
        <ScoreSummary result={result} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6 h-11! p-1 bg-muted/50">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-3 py-2 whitespace-nowrap data-[state=active]:bg-background"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value="previews"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <PreviewsTab result={result} />
        </TabsContent>

        <TabsContent
          value="basic"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <BasicTab result={result} />
        </TabsContent>

        <TabsContent
          value="opengraph"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <OpenGraphTab result={result} />
        </TabsContent>

        <TabsContent
          value="twitter"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <TwitterTab result={result} />
        </TabsContent>

        <TabsContent
          value="images"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <ImagesTab result={result} />
        </TabsContent>

        <TabsContent
          value="raw"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <RawTab result={result} />
        </TabsContent>

        <TabsContent
          value="score"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <ScoreTab result={result} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
