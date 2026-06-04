"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const WA_NUMBER = "916302371238";
const WA_MESSAGE = encodeURIComponent("Hi EliteLobby! I need help with my account / tournament.");
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export function WhatsAppButton() {
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setTooltip(true), 1500);
    const hide = setTimeout(() => setTooltip(false), 5500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-2">
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-[#111827] border border-white/10 rounded-2xl shadow-xl px-3 py-2 pr-1.5 sm:px-4 sm:py-2.5 sm:pr-2"
          >
            <span className="text-xs font-heading font-semibold text-white whitespace-nowrap">Chat on WhatsApp</span>
            <button
              onClick={() => setTooltip(false)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTooltip(false)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl relative"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ background: "#25D366" }} />
        <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" fill="white">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.651 4.799 1.786 6.809L2 30l7.42-1.748A13.916 13.916 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.45 11.45 0 0 1-5.845-1.601l-.42-.249-4.402 1.037 1.072-4.283-.274-.44A11.456 11.456 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.61c-.344-.172-2.035-1.004-2.35-1.118-.315-.115-.545-.172-.775.172-.229.344-.888 1.118-1.088 1.348-.2.23-.4.258-.744.086-.344-.172-1.452-.536-2.767-1.71-1.022-.913-1.712-2.04-1.912-2.384-.2-.344-.021-.53.15-.701.155-.154.344-.401.516-.602.172-.2.229-.344.344-.573.115-.229.057-.43-.029-.601-.086-.172-.775-1.868-1.062-2.557-.28-.672-.563-.58-.775-.59l-.659-.011c-.229 0-.601.086-.916.43-.315.344-1.203 1.176-1.203 2.867 0 1.69 1.232 3.323 1.404 3.552.172.23 2.425 3.703 5.876 5.193.821.355 1.462.567 1.961.725.824.262 1.574.225 2.167.137.66-.099 2.035-.832 2.321-1.635.287-.803.287-1.49.2-1.634-.085-.144-.315-.23-.659-.401z"/>
        </svg>
      </motion.a>
    </div>
  );
}
