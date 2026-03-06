// components/results/tabs/score-tab.tsx
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Copy,
} from "lucide-react";
import type { AnalysisResult, ScoreCheck } from "@/types";
import { GRADE_SCALE } from "@/lib/constants";
import { goeyToast } from "goey-toast";

interface ScoreTabProps {
  result: AnalysisResult;
}

type FilterType = "all" | "pass" | "warning" | "fail";

export function ScoreTab({ result }: ScoreTabProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [openCategories, setOpenCategories] = useState<string[]>(
    result.score.categories.map(c => c.key)
  );

  const { score } = result;

  const toggleCategory = (key: string) => {
    setOpenCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      goeyToast.success("Copied to clipboard");
    } catch {
      goeyToast.error("Failed to copy");
    }
  };

  const StatusIcon = ({ status }: { status: "pass" | "warning" | "fail" | "pending" }) => {
    if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (status === "fail") return <XCircle className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 rounded-full bg-muted" />;
  };

  const filterChecks = (checks: ScoreCheck[]): ScoreCheck[] => {
    if (filter === "all") return checks;
    return checks.filter(c => c.status === filter);
  };

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case "essential": return "📋";
      case "openGraph": return "🔗";
      case "twitter": return "🐦";
      case "images": return "🖼️";
      case "technical": return "⚙️";
      case "extras": return "✨";
      case "accessibility": return "♿";
      case "performance": return "⚡";
      default: return "📄";
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <ScoreCircle score={score.total} grade={score.grade} size="lg" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">
                Your Score: {score.total}/100
              </h2>
              <p className="text-muted-foreground mb-4">{gradeInfo.message}</p>

              <div className="flex items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-lg font-semibold">{score.passCount}</span>
                  <span className="text-muted-foreground">Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-semibold">{score.warningCount}</span>
                  <span className="text-muted-foreground">Warnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-semibold">{score.failCount}</span>
                  <span className="text-muted-foreground">Failed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {score.categories.slice(0, 6).map((cat) => (
                <div
                  key={cat.key}
                  className="text-center p-3 bg-muted rounded-lg"
                >
                  <div className="text-lg mb-1">{getCategoryIcon(cat.key)}</div>
                  <div className="text-sm font-medium">{cat.points}/{cat.maxPoints}</div>
                  <div className="text-xs text-muted-foreground">{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Filter Buttons */}
      <div className="flex items-center flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "pass" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pass")}
          className={filter === "pass" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Passed ({score.passCount})
        </Button>
        <Button
          variant={filter === "warning" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("warning")}
          className={filter === "warning" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Warnings ({score.warningCount})
        </Button>
        <Button
          variant={filter === "fail" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("fail")}
          className={filter === "fail" ? "bg-red-500 hover:bg-red-600" : ""}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Failed ({score.failCount})
        </Button>
      </div>

      {/* Category Cards */}
      <div className="space-y-4">
        {score.categories.map((category) => {
          const filteredChecks = filterChecks(category.checks);
          if (filter !== "all" && filteredChecks.length === 0) return null;

          return (
            <Card key={category.key}>
              <Collapsible
                open={openCategories.includes(category.key)}
                onOpenChange={() => toggleCategory(category.key)}
              >
                <CollapsibleTrigger asChild className="p-2 m-2">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getCategoryIcon(category.key)}</span>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {category.points}/{category.maxPoints} points
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            {category.checks.filter(c => c.status === "pass").length}
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            {category.checks.filter(c => c.status === "warning").length}
                          </Badge>
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                            {category.checks.filter(c => c.status === "fail").length}
                          </Badge>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform ${
                            openCategories.includes(category.key) ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      {filteredChecks.map((check) => (
                        <motion.div
                          key={check.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-start gap-4">
                            <StatusIcon status={check.status} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{check.label}</span>
                                <Badge variant="outline" className="text-xs">
                                  {check.points}/{check.maxPoints} pts
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {check.message}
                              </p>
                              {check.value && (
                                <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block mb-2">
                                  {check.value.length > 100
                                    ? check.value.slice(0, 100) + "..."
                                    : check.value}
                                </p>
                              )}
                              {check.fix && (
                                <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                                  <p className="text-sm font-medium mb-1">How to fix:</p>
                                  <p className="text-sm text-muted-foreground">{check.fix}</p>
                                </div>
                              )}
                              {check.fixCode && (
                                <div className="mt-3 space-y-2">
                                  {check.fixCode.html && (
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">HTML</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs"
                                          onClick={() => copyToClipboard(check.fixCode!.html!)}
                                        >
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </Button>
                                      </div>
                                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                        {check.fixCode.html}
                                      </pre>
                                    </div>
                                  )}
                                  {check.fixCode.nextjs && (
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">Next.js</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs"
                                          onClick={() => copyToClipboard(check.fixCode!.nextjs!)}
                                        >
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </Button>
                                      </div>
                                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                        {check.fixCode.nextjs}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Grade Scale Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {Object.entries(GRADE_SCALE).map(([grade, info]) => (
              <div
                key={grade}
                className={`text-center p-3 rounded-lg ${
                  score.grade === grade
                    ? "ring-2 ring-primary bg-primary/10"
                    : "bg-muted"
                }`}
              >
                <div className={`text-lg font-bold ${info.color}`}>{grade}</div>
                <div className="text-xs text-muted-foreground">
                  {info.min}-{info.max}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}