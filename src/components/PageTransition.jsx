import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
void AnimatePresence; void motion;

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
};

export const RouteTransition = ({ element }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="will-change-transform"
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
