import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HOME_FAQS } from '../config/homeFaqs.js';

export default function HomeFaq() {
  return (
    <section className="no-print mt-12 pt-10 border-t border-border/60" aria-labelledby="home-faq-heading">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 id="home-faq-heading" className="font-serif text-2xl font-semibold text-foreground mb-3">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Quick answers about exporting recurring calendars — no account, no lock-in.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full text-left">
          {HOME_FAQS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger className="font-medium text-foreground hover:no-underline sm:hover:underline">
                {item.title}
              </AccordionTrigger>
              <AccordionContent>{item.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
