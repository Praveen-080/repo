import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

function Skeleton({ className, animated = true, ...props }) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const MotionDiv = motion.div;
  const baseClass = cn("animate-pulse rounded-md bg-muted", className);

  if (!shouldAnimate) {
    return <div className={baseClass} {...props} />;
  }

  return (
    <MotionDiv
      className={baseClass}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  );
}

export { Skeleton };