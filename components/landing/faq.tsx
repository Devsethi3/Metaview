// components/landing/faq.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is Metaview really free?",
    answer:
      "Yes, Metaview is 100% free and open source. No accounts, no subscriptions, no limits. We believe everyone should have access to tools that help them build better websites.",
  },
  {
    question: "Do you store or track my URLs?",
    answer:
      "No. Metaview runs entirely in your browser. Your URL history is stored locally on your device using localStorage. We don't have any backend database and don't collect any analytics about which URLs you check.",
  },
  {
    question: "How accurate are the platform previews?",
    answer:
      "We reverse-engineer exactly how each platform renders link previews, including their fallback chains (e.g., X uses twitter:title, then falls back to og:title, then to the page title). Our previews match what you'd see on the real platforms with very high accuracy.",
  },
  {
    question: "Why can't I check localhost URLs?",
    answer:
      "Metaview fetches your page from our servers to bypass CORS restrictions. This means localhost URLs aren't accessible. You'll need to deploy your site or use a tool like ngrok to create a public URL for testing.",
  },
  {
    question: "What's a good score?",
    answer:
      "Anything above 85 is considered excellent. 70-84 is good but has room for improvement. Below 70 means you're missing important meta tags that will affect how your links appear when shared. Our scoring prioritizes the tags that have the biggest impact on social sharing and SEO.",
  },
  {
    question: "How is the score calculated?",
    answer:
      "The score is calculated across 6 categories: Essential (title, description, canonical, HTTPS), Open Graph (og:title, og:image, etc.), Twitter/X (twitter:card, twitter:image, etc.), Images (size, aspect ratio, load time), Technical (robots.txt, sitemap, security), and Extras (structured data, author, etc.). Each check has a point value based on its importance.",
  },
  {
    question: "Can I use this in my CI/CD pipeline?",
    answer:
      "Not yet, but it's on our roadmap! We plan to add an API endpoint that you can call from your build process to fail deploys if your meta tags are broken.",
  },
  {
    question: "How do I contribute?",
    answer:
      "Metaview is open source! Check out our GitHub repository to report bugs, suggest features, or submit pull requests. We welcome contributions of all kinds.",
  },
];

export function LandingFAQ() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Metaview.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
