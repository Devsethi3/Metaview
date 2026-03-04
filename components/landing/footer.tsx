// components/landing/footer.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Heart, Zap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold">Metaview</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>by</span>
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline underline-offset-4"
            >
              @yourusername
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/yourusername/metaview"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                Star on GitHub
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://twitter.com/intent/tweet?text=Check%20out%20Metaview%20-%20preview%20your%20link%20previews%20across%20every%20platform!%20https://metaview.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Share
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
