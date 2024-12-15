"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const faqs = [
  {
    question: "How do I play?",
    answer: "You get 5 chances each day to guess different dog breeds from their photos. Each correct guess adds to your score! You can play both our daily puzzle 'Barkle' and our endless mode 'Pawsistence'.",
  },
  {
    question: "When do new puzzles come out?",
    answer: "New dog breeds are available every day at 6:00 PM PST for the next day's puzzle.",
  },
  {
    question: "How do guessing streaks work?",
    answer: "In Barkle (daily mode), you build a streak by playing consecutive days and maintaining correct guesses. Your daily streak increases when you play on consecutive days, while your guessing streak tracks your correct guesses for in puzzles. In Pawsistence mode, your streak continues as long as you keep guessing correctly!",
  },
  {
    question: "What's the difference between Barkle and Pawsistence?",
    answer: "Barkle is our daily puzzle with 5 new dogs each day. Pawsistence is our endless mode where you can keep playing and try to build the highest streak possible!",
  },
  {
    question: "How do I save my progress?",
    answer: "You can quickly start playing by just entering a username! However, to secure your progress (in case of cleared browser data), we recommend signing in with Google on the home page.",
  },
  {
    question: "Can I play previous days' puzzles?",
    answer: "The ability to play previous days' puzzles is coming soon! Stay tuned for this exciting feature.",
  },
  {
    question: "How are scores calculated?",
    answer: "In Barkle (daily mode), you get 1 point for each correct breed guess out of 5 possible points. Your daily streak increases by playing consecutive days, and your current streak tracks correct guesses between multiple days!",
  },
  {
    question: "What happens if I clear my browser data?",
    answer: "If you're playing with just a username, clearing browser data will reset your progress. To prevent this, sign in with Google to permanently secure your scores and streaks!",
  },
  {
    question: "How many times can I play?",
    answer: "Barkle (daily mode) gives you one puzzle per day with 5 dogs to guess. Pawsistence mode lets you play 3 times per day, trying to achieve your highest streak!",
  },
  {
    question: "I found a bug or have a suggestion. How can I report it?",
    answer: "We love hearing from our players! You can report bugs or suggest features by filling out the feedback form on the home page.",
  },
];

export function FAQSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-green-500 transition-colors hover:text-green-400">
        FAQ
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[80vh] border-zinc-800 bg-zinc-900"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="flex-none">
            <SheetTitle className="text-2xl font-bold text-zinc-50">
              Frequently Asked Questions
            </SheetTitle>
          </SheetHeader>
          <div className="scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 flex-1 overflow-y-auto pr-1">
            <Accordion type="single" collapsible className="mt-6">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-zinc-100">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
