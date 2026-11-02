/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
   const [notifications, setNotifications] = useState([]);

   const removeNotification = useCallback((id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
   }, []);

   const showNotification = useCallback(
      (message, type = 'success', duration = 3000) => {
         const id = Math.random().toString(36).substring(2, 9);
         setNotifications((prev) => [...prev.slice(-3), { id, message, type }]);

         if (duration > 0) {
            setTimeout(() => {
               removeNotification(id);
            }, duration);
         }
         return id;
      },
      [removeNotification]
   );

   return (
      <NotificationContext.Provider value={{ showNotification, removeNotification }}>
         {children}

         {/* Fixed Toast Stack */}
         <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[250] flex flex-col items-center gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-md">
            <AnimatePresence>
               {notifications.map((toast) => {
                  const isSuccess = toast.type === 'success';
                  const isError = toast.type === 'error';

                  return (
                     <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto flex items-center justify-between gap-3 w-full px-4 py-3 rounded-2xl bg-[#141418]/95 border border-zinc-800 shadow-2xl backdrop-blur-xl text-zinc-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                           {isSuccess && (
                              <CheckCircle2 size={18} className="text-[#daf4aa] shrink-0" />
                           )}
                           {isError && (
                              <AlertCircle size={18} className="text-rose-400 shrink-0" />
                           )}
                           {!isSuccess && !isError && (
                              <Info size={18} className="text-cyan-400 shrink-0" />
                           )}
                           <p className="text-xs sm:text-sm font-medium leading-tight truncate">
                              {toast.message}
                           </p>
                        </div>

                        <button
                           onClick={() => removeNotification(toast.id)}
                           className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors shrink-0"
                           aria-label="Dismiss">
                           <X size={14} />
                        </button>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </div>
      </NotificationContext.Provider>
   );
};

export const useNotification = () => {
   const context = useContext(NotificationContext);
   if (!context) {
      return {
         showNotification: (msg) => {
            console.log('[Notification]', msg);
         },
         removeNotification: () => {},
      };
   }
   return context;
};
