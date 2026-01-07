import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
void motion;

/**
 * ResponsiveCardGrid
 * - Desktop: 3 columns
 * - Tablet: 2 columns
 * - Mobile: 1 column (cards stretch full width)
 * - Equal height cards using grid auto-rows and h-full cards
 * - Responsive paddings/margins and touch-friendly buttons
 */
export default function ResponsiveCardGrid({ items = [] }) {
  return (
    <section className="container py-8 sm:py-10 md:py-12">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {items.map((item) => (
          <motion.article
            key={item.id}
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.28, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="group h-full max-w-full overflow-hidden rounded-xl border bg-card text-foreground shadow-sm transition hover:shadow-md focus-within:shadow-md will-change-transform"
          >
            {item.image && (
              <div className="aspect-video overflow-hidden">
                {/* Images scale to container */}
                <img
                  src={item.image}
                  alt={item.alt || item.title || "Card image"}
                  loading="lazy"
                  className="h-full w-full max-w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            )}

            <div className="flex h-full flex-col p-4 sm:p-5 md:p-6 gap-3">
              {/* Text wraps properly; prevent overflow */}
              {item.title && (
                <h3 className="text-lg md:text-xl font-semibold wrap-break-word leading-snug">
                  {item.title}
                </h3>
              )}

              {item.description && (
                <p className="text-sm md:text-base text-muted-foreground wrap-break-word leading-relaxed">
                  {item.description}
                </p>
              )}
              {/* Spacer to push actions to bottom for equal card heights */}
              <div className="flex-1" />

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {item.ctaLabel && (
                  <Button
                    aria-label={item.ctaAriaLabel || item.ctaLabel}
                    onClick={item.onClick}
                    // Touch-friendly target
                    className="min-h-11 px-5"
                  >
                    {item.ctaLabel}
                  </Button>
                )}
                {item.secondaryLabel && (
                  <Button
                    variant="outline"
                    aria-label={item.secondaryAriaLabel || item.secondaryLabel}
                    onClick={item.onClickSecondary}
                    className="min-h-11 px-5"
                  >
                    {item.secondaryLabel}
                  </Button>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}