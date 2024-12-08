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
    answer: "You get 5 chances each day to guess different dog breeds from their photos. Each correct guess adds to your score!"
  },
  {
    question: "When do new puzzles come out?",
    answer: "New dog breeds are available every day at midnight in your local time."
  },
  {
    question: "How are scores calculated?",
    answer: "You get 1 point for each correct breed guess. Try to build up your streak by playing daily!"
  },
  {
    question: "Can I lose my guessing streak playing yesterday's puzzle?",
    answer: "No, yesterday's puzzle won't affect your guessing streak."
  }
];

export function FAQSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-green-500 hover:text-green-400 transition-colors">
        FAQ
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] bg-zinc-900 border-zinc-800">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-zinc-50">
            Frequently Asked Questions
          </SheetTitle>
        </SheetHeader>
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
      </SheetContent>
    </Sheet>
  );
} 