// components/landing/demo.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function LandingDemo() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Example Output
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See what you get
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Here's a preview of the analysis you'll receive for any URL.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Score Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      example.com
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold">87</div>
                      <div className="text-2xl font-semibold text-lime-500">
                        B+
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Good work! A few optimizations will make it perfect.
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">28</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-500">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Cards Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Preview */}
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="text-blue-500">Google</span>
                    <Badge variant="outline" className="text-xs">
                      Perfect
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      https://example.com › page
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 font-medium">
                      Example Page Title - Brand
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      This is an example meta description that shows how your
                      page will appear in Google search results.
                    </div>
                  </div>
                </div>

                {/* X/Twitter Preview */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="text-xs text-muted-foreground p-2 border-b flex items-center gap-2">
                    <span>X / Twitter</span>
                    <Badge variant="outline" className="text-xs">
                      Warning
                    </Badge>
                  </div>
                  <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      og:image preview
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="text-sm font-medium">
                      Example Page Title
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      This is an example description for Twitter cards.
                    </div>
                    <div className="text-xs text-muted-foreground">
                      example.com
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Categories Preview */}
              <div className="border-t p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { name: "Essential", score: 22, max: 25 },
                    { name: "Open Graph", score: 18, max: 20 },
                    { name: "Twitter/X", score: 12, max: 15 },
                    { name: "Images", score: 16, max: 20 },
                    { name: "Technical", score: 9, max: 10 },
                    { name: "Extras", score: 6, max: 10 },
                  ].map((cat) => (
                    <div key={cat.name} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {cat.name}
                      </div>
                      <div className="text-lg font-semibold">
                        {cat.score}/{cat.max}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
