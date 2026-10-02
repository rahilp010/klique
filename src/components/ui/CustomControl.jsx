/* eslint-disable no-unused-vars */
import React, {
   forwardRef,
   useCallback,
   useEffect,
   useLayoutEffect,
   useImperativeHandle,
   useMemo,
   useRef,
   useState,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Search,
   CalendarDays,
   ChevronDown,
   X,
   Plus,
   Clock,
   ChevronLeft,
   ChevronRight,
} from 'lucide-react';

const panelClass =
   'border border-white/[0.09] bg-[#16161b] text-white shadow-2xl shadow-black/60';

const filterDomProps = (props = {}) => {
   const {
      container,
      virtualized,
      menuStyle,
      menuStyleOverride,
      renderExtraFooter,
      renderMenuItem,
      preventOverflow,
      placement,
      cleanable,
      searchable,
      menuMaxHeight,
      formatter,
      parser,
      checkedChildren,
      unCheckedChildren,
      speaker,
      renderTitle,
      characterSet,
      containerStyle,
      onCreateNew,
      createNewText,
      ...validProps
   } = props;
   return validProps;
};

const useIsomorphicLayoutEffect =
   typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const useDropdownPosition = (open, triggerRef, menuWidthOverride = null) => {
   const [coords, setCoords] = useState({
      top: 0,
      left: 0,
      width: 220,
      placement: 'bottom',
   });

   const updatePosition = useCallback(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < 280 && rect.top > 280;
      const width = menuWidthOverride || Math.max(rect.width, 200);
      let left = rect.left;
      if (left + width > window.innerWidth - 12) {
         left = Math.max(12, window.innerWidth - width - 12);
      }

      setCoords({
         top: placeAbove ? rect.top - 6 : rect.bottom + 6,
         left,
         width,
         placement: placeAbove ? 'top' : 'bottom',
      });
   }, [triggerRef, menuWidthOverride]);

   useIsomorphicLayoutEffect(() => {
      if (open) {
         updatePosition();
         window.addEventListener('resize', updatePosition);
         window.addEventListener('scroll', updatePosition, true);
         return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
         };
      }
   }, [open, updatePosition]);

   return { coords, updatePosition };
};

export const Input = ({
   value = '',
   onChange,
   placeholder,
   type = 'text',
   className = '',
   ...props
}) => (
   <input
      {...filterDomProps(props)}
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value, e)}
      className={`h-11 w-full rounded-xl bg-[#16161b] px-3 text-sm text-white outline-none transition-all placeholder:text-gray-500  ${className}`}
   />
);

export const InputGroup = ({ children, className = '', ...props }) => (
   <div
      {...filterDomProps(props)}
      className={`flex h-12 items-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#16161b]/90 transition-all focus-within:border-[#daf4aa]/40 focus-within:ring-4 focus-within:ring-[#daf4aa]/[0.06] ${className}`}>
      {children}
   </div>
);

InputGroup.Button = ({ children, className = '', onClick, ...props }) => (
   <button
      {...props}
      type="button"
      onClick={onClick}
      className={`flex h-full shrink-0 items-center justify-center px-3 text-gray-400 transition-colors hover:text-[#daf4aa] ${className}`}>
      {children}
   </button>
);

export const SelectPicker = forwardRef(
   (
      {
         data = [],
         value,
         onChange,
         placeholder = 'Select...',
         searchable = true,
         cleanable = true,
         style,
         className = '',
         menuMaxHeight = 260,
         menuWidth,
         menuStyle,
         disabled = false,
         renderMenuItem,
         renderExtraFooter,
         onCreateNew,
         createNewText,
         ...props
      },
      outerRef,
   ) => {
      const [open, setOpen] = useState(false);
      const [query, setQuery] = useState('');
      const [focusedIndex, setFocusedIndex] = useState(-1);
      const triggerRef = useRef(null);
      const menuRef = useRef(null);
      const listRef = useRef(null);
      const resolvedMenuWidth = menuStyle?.width ?? menuWidth ?? null;
      const { coords, updatePosition } = useDropdownPosition(
         open,
         triggerRef,
         resolvedMenuWidth,
      );

      const handleClose = useCallback(() => {
         setOpen(false);
         setQuery('');
         setFocusedIndex(-1);
      }, []);

      useImperativeHandle(outerRef, () => ({
         close: handleClose,
         open: () => {
            updatePosition();
            setOpen(true);
         },
      }));

      useEffect(() => {
         const handler = (e) => {
            if (
               triggerRef.current &&
               !triggerRef.current.contains(e.target) &&
               menuRef.current &&
               !menuRef.current.contains(e.target)
            ) {
               handleClose();
            }
         };
         document.addEventListener('mousedown', handler);
         return () => document.removeEventListener('mousedown', handler);
      }, [handleClose]);

      const selected = data.find(
         (item) => String(item?.value) === String(value),
      );
      const filtered = useMemo(() => {
         if (!searchable || !query) return data;
         const q = query.toLowerCase();
         return data.filter((item) =>
            String(item?.label ?? item?.value ?? '')
               .toLowerCase()
               .includes(q),
         );
      }, [data, query, searchable]);

      const displayed = useMemo(() => {
         if (filtered.length > 80) return filtered.slice(0, 80);
         return filtered;
      }, [filtered]);

      useEffect(() => {
         if (open) {
            setFocusedIndex(displayed.length > 0 ? 0 : -1);
         }
      }, [open, query, displayed.length]);

      useEffect(() => {
         if (open && focusedIndex >= 0 && listRef.current) {
            const targetEl = listRef.current.children[focusedIndex];
            if (targetEl && typeof targetEl.scrollIntoView === 'function') {
               targetEl.scrollIntoView({ block: 'nearest' });
            }
         }
      }, [focusedIndex, open]);

      const handleKeyDown = (e) => {
         e.stopPropagation();
         if (!open) {
            if (
               e.key === 'ArrowDown' ||
               e.key === 'ArrowUp' ||
               e.key === 'Enter'
            ) {
               e.preventDefault();
               updatePosition();
               setOpen(true);
            }
            return;
         }

         const extraCount = renderExtraFooter || onCreateNew ? 1 : 0;
         const totalCount = displayed.length + extraCount;

         if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
         } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
         } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < displayed.length) {
               const item = displayed[focusedIndex];
               onChange?.(item?.value, item);
               handleClose();
            } else if (
               focusedIndex === displayed.length &&
               (renderExtraFooter || onCreateNew)
            ) {
               handleClose();
               if (onCreateNew) {
                  onCreateNew();
               } else if (typeof renderExtraFooter === 'function') {
                  renderExtraFooter(handleClose);
               }
            }
         } else if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
         }
      };

      const menuContent = (
         <AnimatePresence>
            {open && (
               <motion.div
                  ref={menuRef}
                  initial={{
                     opacity: 0,
                     y: coords.placement === 'top' ? 4 : -4,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                     opacity: 0,
                     y: coords.placement === 'top' ? 4 : -4,
                  }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  style={{
                     ...menuStyle,
                     position: 'fixed',
                     top: coords.placement === 'top' ? undefined : coords.top,
                     bottom:
                        coords.placement === 'top'
                           ? window.innerHeight - coords.top
                           : undefined,
                     left: coords.left,
                     width: coords.width,
                     maxWidth: 'calc(100vw - 24px)',
                     zIndex: menuStyle?.zIndex ?? 999999,
                  }}
                  className={`overflow-hidden rounded-2xl ${panelClass}`}>
                  {searchable && (
                     <div className="border-b border-white/[0.06] p-2">
                        <div className="flex items-center rounded-xl border border-white/[0.07] bg-white/[0.03] px-3">
                           <Search
                              size={17}
                              strokeWidth={2}
                              className="shrink-0 text-gray-500"
                           />
                           <input
                              autoFocus
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Search..."
                              className="h-10 w-full bg-transparent px-2 text-sm text-white outline-none placeholder:text-gray-600"
                           />
                        </div>
                     </div>
                  )}
                  <div
                     ref={listRef}
                     className="overflow-y-auto p-1.5 customScrollbar"
                     style={{ maxHeight: menuMaxHeight }}>
                     {displayed.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                           No results found
                        </div>
                     ) : (
                        displayed.map((item, idx) => {
                           const isSelected =
                              String(item?.value) === String(value);
                           const isFocused = idx === focusedIndex;
                           const labelText = item?.label ?? item?.value;
                           return (
                              <button
                                 key={String(item?.value)}
                                 type="button"
                                 onMouseEnter={() => setFocusedIndex(idx)}
                                 onClick={() => {
                                    onChange?.(item?.value, item);
                                    handleClose();
                                 }}
                                 className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                                    isSelected
                                       ? 'bg-[#daf4aa]/10 text-[#daf4aa]'
                                       : isFocused
                                         ? 'bg-white/10 text-white'
                                         : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                                 }`}>
                                 {renderMenuItem ? (
                                    renderMenuItem(labelText, item)
                                 ) : (
                                    <span className="truncate">
                                       {labelText}
                                    </span>
                                 )}
                                 {isSelected && !renderMenuItem && (
                                    <span>✓</span>
                                 )}
                              </button>
                           );
                        })
                     )}
                  </div>
                  {(renderExtraFooter || onCreateNew) && (
                     <div
                        className={`border-t border-white/[0.08] p-1.5 bg-[#16161b] ${
                           focusedIndex === displayed.length
                              ? 'bg-white/10'
                              : ''
                        }`}
                        onMouseEnter={() => setFocusedIndex(displayed.length)}>
                        {renderExtraFooter ? (
                           typeof renderExtraFooter === 'function' ? (
                              renderExtraFooter(handleClose)
                           ) : (
                              renderExtraFooter
                           )
                        ) : (
                           <button
                              type="button"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleClose();
                                 onCreateNew?.();
                              }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#daf4aa]/15 px-3 py-2 text-xs font-bold text-[#daf4aa] transition-colors hover:bg-[#daf4aa]/25 cursor-pointer">
                              <Plus size={16} strokeWidth={2.5} />
                              {createNewText || 'Create New'}
                           </button>
                        )}
                     </div>
                  )}
               </motion.div>
            )}
         </AnimatePresence>
      );

      return (
         <div
            ref={triggerRef}
            {...filterDomProps(props)}
            className={`relative ${className}`}
            style={style}>
            <button
               type="button"
               disabled={disabled}
               onKeyDown={handleKeyDown}
               onClick={() => {
                  if (disabled) return;
                  if (!open) {
                     updatePosition();
                  }
                  setOpen((v) => !v);
               }}
               className={`flex h-12 w-full items-center justify-between gap-2 rounded-2xl border px-4 text-left text-sm transition-all ${
                  open
                     ? 'border-[#daf4aa]/40 bg-[#16161b] ring-4 ring-[#daf4aa]/[0.06]'
                     : 'border-white/[0.08] bg-[#16161b]/90 hover:border-white/[0.14]'
               } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
               <span
                  className={
                     selected
                        ? 'truncate text-gray-200'
                        : 'truncate text-gray-500'
                  }>
                  {selected?.label ?? placeholder}
               </span>
               <div className="flex items-center gap-1">
                  {cleanable &&
                     value !== undefined &&
                     value !== null &&
                     value !== '' && (
                        <span
                           role="button"
                           onClick={(e) => {
                              e.stopPropagation();
                              onChange?.('');
                           }}
                           className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-white/10 hover:text-white">
                           ×
                        </span>
                     )}
                  <ChevronDown
                     size={20}
                     strokeWidth={2}
                     className={`shrink-0 text-gray-500 transition-transform duration-200 ${
                        open ? 'rotate-180 text-[#daf4aa]' : ''
                     }`}
                  />
               </div>
            </button>
            {createPortal(menuContent, document.body)}
         </div>
      );
   },
);
export const DateRangePicker = ({
   value = [],
   onChange,
   placeholder = 'Select Date Range',
   className = '',
   style,
   ...props
}) => {
   const [open, setOpen] = useState(false);
   const [start, setStart] = useState('');
   const [end, setEnd] = useState('');
   const triggerRef = useRef(null);
   const menuRef = useRef(null);
   const { coords, updatePosition } = useDropdownPosition(
      open,
      triggerRef,
      330,
   );

   useEffect(() => {
      if (Array.isArray(value) && value.length === 2) {
         const a = new Date(value[0]);
         const b = new Date(value[1]);
         setStart(!isNaN(a) ? a.toISOString().slice(0, 10) : '');
         setEnd(!isNaN(b) ? b.toISOString().slice(0, 10) : '');
      } else if (!value?.length) {
         setStart('');
         setEnd('');
      }
   }, [value]);

   useEffect(() => {
      const handler = (e) => {
         if (
            triggerRef.current &&
            !triggerRef.current.contains(e.target) &&
            menuRef.current &&
            !menuRef.current.contains(e.target)
         ) {
            setOpen(false);
         }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
   }, []);

   const display =
      start && end
         ? `${new Date(`${start}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} — ${new Date(`${end}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
         : placeholder;

   const menuContent = (
      <AnimatePresence>
         {open && (
            <motion.div
               ref={menuRef}
               initial={{
                  opacity: 0,
                  y: coords.placement === 'top' ? 4 : -4,
               }}
               animate={{ opacity: 1, y: 0 }}
               exit={{
                  opacity: 0,
                  y: coords.placement === 'top' ? 4 : -4,
               }}
               transition={{ duration: 0.1, ease: 'easeOut' }}
               style={{
                  position: 'fixed',
                  top: coords.placement === 'top' ? undefined : coords.top,
                  bottom:
                     coords.placement === 'top'
                        ? window.innerHeight - coords.top
                        : undefined,
                  left: coords.left,
                  width: 330,
                  zIndex: 999999,
               }}
               className={`rounded-2xl p-4 ${panelClass}`}>
               <div className="mb-4">
                  <p className="text-sm font-semibold text-white">Date Range</p>
                  <p className="mt-1 text-xs text-gray-500">
                     Select the period you want to view
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                     From
                     <input
                        type="date"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-gray-200 outline-none"
                     />
                  </label>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                     To
                     <input
                        type="date"
                        value={end}
                        min={start}
                        onChange={(e) => setEnd(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-gray-200 outline-none"
                     />
                  </label>
               </div>
               <div className="mt-4 flex justify-between border-t border-white/[0.06] pt-3">
                  <button
                     type="button"
                     onClick={() => {
                        setStart('');
                        setEnd('');
                        onChange?.([]);
                        setOpen(false);
                     }}
                     className="rounded-xl px-3 py-2 text-xs text-gray-500 hover:bg-white/[0.05] hover:text-white">
                     Clear
                  </button>
                  <button
                     type="button"
                     disabled={!start || !end}
                     onClick={() => {
                        const s = new Date(`${start}T00:00:00`);
                        const e = new Date(`${end}T23:59:59.999`);
                        onChange?.([s, e]);
                        setOpen(false);
                     }}
                     className="rounded-xl bg-[#daf4aa] px-4 py-2 text-xs font-bold text-[#16161b] hover:bg-[#cbe699] disabled:cursor-not-allowed disabled:opacity-40">
                     Apply Range
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
   );

   return (
      <div
         ref={triggerRef}
         className={`relative ${className}`}
         style={style}
         {...filterDomProps(props)}>
         <button
            type="button"
            onClick={() => {
               if (!open) updatePosition();
               setOpen((v) => !v);
            }}
            className="flex h-12 w-full min-w-[220px] items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#16161b]/90 px-4 text-sm transition-all hover:border-white/[0.14] focus:border-[#daf4aa]/40">
            <span className="flex min-w-0 items-center gap-3">
               <CalendarDays
                  size={18}
                  strokeWidth={2}
                  className={open ? 'text-[#daf4aa]' : 'text-gray-500'}
               />
               <span
                  className={
                     start && end
                        ? 'truncate text-gray-200'
                        : 'truncate text-gray-500'
                  }>
                  {display}
               </span>
            </span>
            <ChevronDown
               size={20}
               strokeWidth={2}
               className={`text-gray-500 transition-transform ${open ? 'rotate-180 text-[#daf4aa]' : ''}`}
            />
         </button>
         {createPortal(menuContent, document.body)}
      </div>
   );
};

export const DatePicker = forwardRef(
   (
      {
         value,
         onChange,
         placeholder = 'Select Date',
         className = '',
         style,
         cleanable = true,
         disabled = false,
         format = 'yyyy-MM-dd',
         menuStyle,
         ...props
      },
      outerRef,
   ) => {
      const [open, setOpen] = useState(false);
      const triggerRef = useRef(null);
      const menuRef = useRef(null);

      const parsedSelectedDate = useMemo(() => {
         if (!value) return null;
         if (value instanceof Date && !isNaN(value)) return value;
         if (typeof value === 'string') {
            const dateOnly = value.split('T')[0];
            const parts = dateOnly.split('-');
            if (parts.length === 3) {
               const y = parseInt(parts[0], 10);
               const m = parseInt(parts[1], 10) - 1;
               const d = parseInt(parts[2], 10);
               const parsed = new Date(y, m, d);
               if (!isNaN(parsed)) return parsed;
            }
            const d = new Date(value);
            if (!isNaN(d)) return d;
         }
         return null;
      }, [value]);

      const [viewDate, setViewDate] = useState(() => {
         return parsedSelectedDate || new Date();
      });

      useEffect(() => {
         if (parsedSelectedDate) {
            setViewDate(parsedSelectedDate);
         }
      }, [parsedSelectedDate]);

      const handleClose = useCallback(() => {
         setOpen(false);
      }, []);

      useImperativeHandle(outerRef, () => ({
         close: handleClose,
         open: () => setOpen(true),
      }));

      const { coords, updatePosition } = useDropdownPosition(
         open,
         triggerRef,
         290,
      );

      useEffect(() => {
         const handler = (e) => {
            if (
               triggerRef.current &&
               !triggerRef.current.contains(e.target) &&
               menuRef.current &&
               !menuRef.current.contains(e.target)
            ) {
               handleClose();
            }
         };
         document.addEventListener('mousedown', handler);
         return () => document.removeEventListener('mousedown', handler);
      }, [handleClose]);

      const formatDisplayDate = (d) => {
         if (!d || isNaN(d)) return placeholder;
         return d.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
         });
      };

      const formatValueStr = (d) => {
         if (!d || isNaN(d)) return '';
         const year = d.getFullYear();
         const month = String(d.getMonth() + 1).padStart(2, '0');
         const day = String(d.getDate()).padStart(2, '0');
         return `${year}-${month}-${day}`;
      };

      const handleSelectDay = (dayDate) => {
         const formatted = formatValueStr(dayDate);
         onChange?.(formatted, dayDate);
         handleClose();
      };

      const prevMonth = () => {
         setViewDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
         );
      };

      const nextMonth = () => {
         setViewDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
         );
      };

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay();
      const startOffset = (firstDayOfWeek + 6) % 7;
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      const calendarCells = [];

      for (let i = startOffset - 1; i >= 0; i--) {
         const dayNum = daysInPrevMonth - i;
         calendarCells.push({
            date: new Date(year, month - 1, dayNum),
            dayNum,
            isCurrentMonth: false,
         });
      }

      for (let d = 1; d <= daysInMonth; d++) {
         calendarCells.push({
            date: new Date(year, month, d),
            dayNum: d,
            isCurrentMonth: true,
         });
      }

      const remaining = 42 - calendarCells.length;
      for (let d = 1; d <= remaining; d++) {
         calendarCells.push({
            date: new Date(year, month + 1, d),
            dayNum: d,
            isCurrentMonth: false,
         });
      }

      const todayStr = formatValueStr(new Date());
      const selectedStr = formatValueStr(parsedSelectedDate);

      const monthName = viewDate.toLocaleDateString('en-US', {
         month: 'long',
         year: 'numeric',
      });

      const menuContent = (
         <AnimatePresence>
            {open && (
               <motion.div
                  ref={menuRef}
                  initial={{
                     opacity: 0,
                     y: coords.placement === 'top' ? 4 : -4,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                     opacity: 0,
                     y: coords.placement === 'top' ? 4 : -4,
                  }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  style={{
                     ...menuStyle,
                     position: 'fixed',
                     top: coords.placement === 'top' ? undefined : coords.top,
                     bottom:
                        coords.placement === 'top'
                           ? window.innerHeight - coords.top
                           : undefined,
                     left: coords.left,
                     width: 290,
                     zIndex: menuStyle?.zIndex ?? 999999,
                  }}
                  className={`rounded-2xl p-3.5 ${panelClass}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                     <button
                        type="button"
                        onClick={prevMonth}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                        <ChevronLeft size={18} />
                     </button>
                     <span className="text-sm font-semibold text-white">
                        {monthName}
                     </span>
                     <button
                        type="button"
                        onClick={nextMonth}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                        <ChevronRight size={18} />
                     </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                     <span>Mo</span>
                     <span>Tu</span>
                     <span>We</span>
                     <span>Th</span>
                     <span>Fr</span>
                     <span>Sa</span>
                     <span>Su</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                     {calendarCells.map((cell, idx) => {
                        const cellStr = formatValueStr(cell.date);
                        const isSelected =
                           selectedStr && cellStr === selectedStr;
                        const isToday = cellStr === todayStr;

                        return (
                           <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectDay(cell.date)}
                              className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs transition-all font-medium ${
                                 isSelected
                                    ? 'bg-[#daf4aa] text-[#16161b] font-bold shadow-md shadow-[#daf4aa]/20'
                                    : cell.isCurrentMonth
                                      ? isToday
                                         ? 'border border-[#daf4aa]/50 text-[#daf4aa] font-semibold bg-[#daf4aa]/10'
                                         : 'text-gray-200 hover:bg-white/10 hover:text-white'
                                      : 'text-gray-600 hover:bg-white/[0.04]'
                              }`}>
                              {cell.dayNum}
                           </button>
                        );
                     })}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-2.5">
                     <button
                        type="button"
                        onClick={() => {
                           const today = new Date();
                           setViewDate(today);
                           handleSelectDay(today);
                        }}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#daf4aa] hover:bg-[#daf4aa]/10 transition-colors">
                        Today
                     </button>
                     {cleanable && parsedSelectedDate && (
                        <button
                           type="button"
                           onClick={() => {
                              onChange?.('', null);
                              handleClose();
                           }}
                           className="rounded-lg px-2.5 py-1 text-xs text-gray-500 hover:bg-white/10 hover:text-white transition-colors">
                           Clear
                        </button>
                     )}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      );

      return (
         <div
            ref={triggerRef}
            className={`relative ${className}`}
            style={style}
            {...filterDomProps(props)}>
            <button
               type="button"
               disabled={disabled}
               onClick={() => {
                  if (disabled) return;
                  if (!open) updatePosition();
                  setOpen((v) => !v);
               }}
               className={`flex h-12 w-full items-center justify-between gap-2 rounded-2xl border px-4 text-left text-sm transition-all ${
                  open
                     ? 'border-[#daf4aa]/40 bg-[#16161b] ring-4 ring-[#daf4aa]/[0.06]'
                     : 'border-white/[0.08] bg-[#16161b]/90 hover:border-white/[0.14]'
               } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
               <span className="flex items-center gap-2.5 min-w-0">
                  <CalendarDays
                     size={18}
                     strokeWidth={2}
                     className={open ? 'text-[#daf4aa]' : 'text-gray-400'}
                  />
                  <span
                     className={
                        parsedSelectedDate
                           ? 'truncate text-gray-200'
                           : 'truncate text-gray-500'
                     }>
                     {formatDisplayDate(parsedSelectedDate)}
                  </span>
               </span>
               <div className="flex items-center gap-1 shrink-0">
                  {cleanable && parsedSelectedDate && (
                     <span
                        role="button"
                        onClick={(e) => {
                           e.stopPropagation();
                           onChange?.('', null);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-white/10 hover:text-white">
                        <X className="w-4 h-4" />
                     </span>
                  )}
                  <ChevronDown
                     size={20}
                     strokeWidth={2}
                     className={`text-gray-500 transition-transform duration-200 ${
                        open ? 'rotate-180 text-[#daf4aa]' : ''
                     }`}
                  />
               </div>
            </button>
            {createPortal(menuContent, document.body)}
         </div>
      );
   },
);

export const TimePicker = forwardRef(
   (
      {
         value = '',
         onChange,
         placeholder = 'Select Time',
         className = '',
         style,
         cleanable = true,
         disabled = false,
         is12h = true,
         menuStyle,
         ...props
      },
      outerRef,
   ) => {
      const [open, setOpen] = useState(false);
      const triggerRef = useRef(null);
      const menuRef = useRef(null);

      const parsed = useMemo(() => {
         if (!value)
            return {
               hours12: 12,
               hours24: 12,
               minutes: 0,
               period: 'PM',
               isValid: false,
            };

         let h24 = 12;
         let m = 0;
         let p = 'PM';

         if (typeof value === 'string') {
            const match = value.match(
               /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i,
            );
            if (match) {
               let rawH = parseInt(match[1], 10);
               m = parseInt(match[2], 10);
               const rawP = match[3] ? match[3].toUpperCase() : null;

               if (rawP) {
                  p = rawP;
                  if (p === 'PM' && rawH < 12) h24 = rawH + 12;
                  else if (p === 'AM' && rawH === 12) h24 = 0;
                  else h24 = rawH;
               } else {
                  h24 = rawH;
                  p = h24 >= 12 ? 'PM' : 'AM';
               }
            }
         } else if (value instanceof Date && !isNaN(value)) {
            h24 = value.getHours();
            m = value.getMinutes();
            p = h24 >= 12 ? 'PM' : 'AM';
         }

         let h12 = h24 % 12;
         if (h12 === 0) h12 = 12;

         return {
            hours12: h12,
            hours24: h24,
            minutes: m,
            period: p,
            isValid: true,
         };
      }, [value]);

      const [selectedH12, setSelectedH12] = useState(parsed.hours12);
      const [selectedH24, setSelectedH24] = useState(parsed.hours24);
      const [selectedM, setSelectedM] = useState(parsed.minutes);
      const [selectedP, setSelectedP] = useState(parsed.period);

      useEffect(() => {
         if (parsed.isValid) {
            setSelectedH12(parsed.hours12);
            setSelectedH24(parsed.hours24);
            setSelectedM(parsed.minutes);
            setSelectedP(parsed.period);
         }
      }, [parsed]);

      const handleClose = useCallback(() => {
         setOpen(false);
      }, []);

      useImperativeHandle(outerRef, () => ({
         close: handleClose,
         open: () => setOpen(true),
      }));

      const { coords, updatePosition } = useDropdownPosition(
         open,
         triggerRef,
         270,
      );

      useEffect(() => {
         const handler = (e) => {
            if (
               triggerRef.current &&
               !triggerRef.current.contains(e.target) &&
               menuRef.current &&
               !menuRef.current.contains(e.target)
            ) {
               handleClose();
            }
         };
         document.addEventListener('mousedown', handler);
         return () => document.removeEventListener('mousedown', handler);
      }, [handleClose]);

      const emitTime = (h12Val, h24Val, mVal, pVal) => {
         let finalH24 = h24Val;
         if (is12h) {
            if (pVal === 'PM' && h12Val < 12) finalH24 = h12Val + 12;
            else if (pVal === 'AM' && h12Val === 12) finalH24 = 0;
            else finalH24 = h12Val;
         }

         const time24Str = `${String(finalH24).padStart(2, '0')}:${String(mVal).padStart(2, '0')}`;
         const time12Str = `${String(h12Val).padStart(2, '0')}:${String(mVal).padStart(2, '0')} ${pVal}`;

         onChange?.(time24Str, {
            time24: time24Str,
            time12: time12Str,
            hours24: finalH24,
            hours12: h12Val,
            minutes: mVal,
            period: pVal,
         });
      };

      const displayFormatted = useMemo(() => {
         if (!parsed.isValid) return placeholder;
         if (is12h) {
            return `${String(parsed.hours12).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')} ${parsed.period}`;
         }
         return `${String(parsed.hours24).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
      }, [parsed, is12h, placeholder]);

      const presets = [
         { label: '09:00 AM', h12: 9, h24: 9, m: 0, p: 'AM' },
         { label: '12:00 PM', h12: 12, h24: 12, m: 0, p: 'PM' },
         { label: '03:00 PM', h12: 3, h24: 15, m: 0, p: 'PM' },
         { label: '06:00 PM', h12: 6, h24: 18, m: 0, p: 'PM' },
         { label: '09:00 PM', h12: 9, h24: 21, m: 0, p: 'PM' },
      ];

      const hourOptions = useMemo(() => {
         if (is12h) {
            return Array.from({ length: 12 }, (_, i) => i + 1);
         }
         return Array.from({ length: 24 }, (_, i) => i);
      }, [is12h]);

      const minuteOptions = useMemo(() => {
         return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
      }, []);

      const menuContent = (
         <AnimatePresence>
            {open && (
               <motion.div
                  ref={menuRef}
                  initial={{
                     opacity: 0,
                     y: coords.placement === 'top' ? 4 : -4,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                     opacity: 0,
                     y: coords.placement === 'top' ? 4 : -4,
                  }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  style={{
                     ...menuStyle,
                     position: 'fixed',
                     top: coords.placement === 'top' ? undefined : coords.top,
                     bottom:
                        coords.placement === 'top'
                           ? window.innerHeight - coords.top
                           : undefined,
                     left: coords.left,
                     width: 270,
                     zIndex: menuStyle?.zIndex ?? 999999,
                  }}
                  className={`rounded-2xl p-3 ${panelClass}`}>
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/[0.08] customScrollbar">
                     {presets.map((pr) => (
                        <button
                           key={pr.label}
                           type="button"
                           onClick={() => {
                              setSelectedH12(pr.h12);
                              setSelectedH24(pr.h24);
                              setSelectedM(pr.m);
                              setSelectedP(pr.p);
                              emitTime(pr.h12, pr.h24, pr.m, pr.p);
                           }}
                           className="shrink-0 rounded-lg bg-white/[0.05] px-2 py-1 text-[11px] font-medium text-gray-300 hover:bg-[#daf4aa]/15 hover:text-[#daf4aa] transition-colors">
                           {pr.label}
                        </button>
                     ))}
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 pb-1 text-center">
                     <div>
                        <p className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                           Hours
                        </p>
                        <div className="h-44 overflow-y-auto customScrollbar space-y-1 pr-1">
                           {hourOptions.map((h) => {
                              const isSelected = is12h
                                 ? selectedH12 === h
                                 : selectedH24 === h;

                              return (
                                 <button
                                    key={h}
                                    type="button"
                                    onClick={() => {
                                       if (is12h) {
                                          setSelectedH12(h);
                                          emitTime(
                                             h,
                                             selectedH24,
                                             selectedM,
                                             selectedP,
                                          );
                                       } else {
                                          setSelectedH24(h);
                                          let h12 = h % 12;
                                          if (h12 === 0) h12 = 12;
                                          const p = h >= 12 ? 'PM' : 'AM';
                                          setSelectedH12(h12);
                                          setSelectedP(p);
                                          emitTime(h12, h, selectedM, p);
                                       }
                                    }}
                                    className={`w-full rounded-lg py-1.5 text-xs font-semibold transition-all ${
                                       isSelected
                                          ? 'bg-[#daf4aa] text-[#16161b] font-bold'
                                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}>
                                    {String(h).padStart(2, '0')}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     <div>
                        <p className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                           Mins
                        </p>
                        <div className="h-44 overflow-y-auto customScrollbar space-y-1 pr-1">
                           {minuteOptions.map((m) => {
                              const isSelected = selectedM === m;
                              return (
                                 <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                       setSelectedM(m);
                                       emitTime(
                                          selectedH12,
                                          selectedH24,
                                          m,
                                          selectedP,
                                       );
                                    }}
                                    className={`w-full rounded-lg py-1.5 text-xs font-semibold transition-all ${
                                       isSelected
                                          ? 'bg-[#daf4aa] text-[#16161b] font-bold'
                                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}>
                                    {String(m).padStart(2, '0')}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     <div>
                        <p className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                           {is12h ? 'Period' : 'Actions'}
                        </p>
                        {is12h ? (
                           <div className="space-y-2 pt-2">
                              {['AM', 'PM'].map((period) => (
                                 <button
                                    key={period}
                                    type="button"
                                    onClick={() => {
                                       setSelectedP(period);
                                       emitTime(
                                          selectedH12,
                                          selectedH24,
                                          selectedM,
                                          period,
                                       );
                                    }}
                                    className={`w-full rounded-xl py-3 text-xs font-bold transition-all ${
                                       selectedP === period
                                          ? 'bg-[#daf4aa] text-[#16161b] shadow-md shadow-[#daf4aa]/20'
                                          : 'bg-white/[0.05] text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}>
                                    {period}
                                 </button>
                              ))}
                           </div>
                        ) : null}

                        <button
                           type="button"
                           onClick={() => {
                              const now = new Date();
                              const nowH24 = now.getHours();
                              const nowM = Math.floor(now.getMinutes() / 5) * 5;
                              const nowP = nowH24 >= 12 ? 'PM' : 'AM';
                              let nowH12 = nowH24 % 12;
                              if (nowH12 === 0) nowH12 = 12;

                              setSelectedH12(nowH12);
                              setSelectedH24(nowH24);
                              setSelectedM(nowM);
                              setSelectedP(nowP);
                              emitTime(nowH12, nowH24, nowM, nowP);
                              handleClose();
                           }}
                           className="w-full mt-3 rounded-xl bg-white/[0.06] border border-white/[0.08] py-2 text-[11px] font-semibold text-[#daf4aa] hover:bg-[#daf4aa]/15 transition-colors">
                           Now
                        </button>
                     </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-white/[0.08] pt-2">
                     {cleanable && parsed.isValid && (
                        <button
                           type="button"
                           onClick={() => {
                              onChange?.('');
                              handleClose();
                           }}
                           className="rounded-lg px-2.5 py-1 text-xs text-gray-500 hover:bg-white/10 hover:text-white transition-colors">
                           Clear
                        </button>
                     )}
                     <button
                        type="button"
                        onClick={handleClose}
                        className="ml-auto rounded-lg bg-[#daf4aa] px-4 py-1 text-xs font-bold text-[#16161b] hover:bg-[#cbe699] transition-colors">
                        Done
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      );

      return (
         <div
            ref={triggerRef}
            className={`relative ${className}`}
            style={style}
            {...filterDomProps(props)}>
            <button
               type="button"
               disabled={disabled}
               onClick={() => {
                  if (disabled) return;
                  if (!open) updatePosition();
                  setOpen((v) => !v);
               }}
               className={`flex h-12 w-full items-center justify-between gap-2 rounded-2xl border px-4 text-left text-sm transition-all ${
                  open
                     ? 'border-[#daf4aa]/40 bg-[#16161b] ring-4 ring-[#daf4aa]/[0.06]'
                     : 'border-white/[0.08] bg-[#16161b]/90 hover:border-white/[0.14]'
               } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
               <span className="flex items-center gap-2.5 min-w-0">
                  <Clock
                     size={18}
                     strokeWidth={2}
                     className={open ? 'text-[#daf4aa]' : 'text-gray-400'}
                  />
                  <span
                     className={
                        parsed.isValid
                           ? 'truncate text-gray-200 font-medium'
                           : 'truncate text-gray-500'
                     }>
                     {displayFormatted}
                  </span>
               </span>
               <div className="flex items-center gap-1 shrink-0">
                  {cleanable && parsed.isValid && (
                     <span
                        role="button"
                        onClick={(e) => {
                           e.stopPropagation();
                           onChange?.('');
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-white/10 hover:text-white">
                        <X className="w-4 h-4" />
                     </span>
                  )}
                  <ChevronDown
                     size={20}
                     strokeWidth={2}
                     className={`text-gray-500 transition-transform duration-200 ${
                        open ? 'rotate-180 text-[#daf4aa]' : ''
                     }`}
                  />
               </div>
            </button>
            {createPortal(menuContent, document.body)}
         </div>
      );
   },
);

export const Tooltip = ({ children, ...props }) => children;

export const Whisper = ({ children, speaker }) => {
   const title = React.isValidElement(speaker)
      ? speaker.props.children
      : speaker;
   return React.cloneElement(children, {
      title: typeof title === 'string' ? title : undefined,
   });
};

export const Modal = ({
   open,
   onClose,
   children,
   size = 'md',
   className = '',
}) => {
   if (!open) return null;
   const widths = {
      xs: 'max-w-md',
      sm: 'max-w-lg',
      md: 'max-w-2xl',
      lg: 'max-w-5xl',
      xl: 'max-w-6xl',
   };

   return createPortal(
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
         />
         <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`relative flex max-h-[90vh] w-full ${widths[size] || widths.md} flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-[#16161b] shadow-2xl shadow-black/50 ${className}`}>
            {children}
         </motion.div>
      </div>,
      document.body,
   );
};

Modal.Header = ({ children, className = '' }) => (
   <div
      className={`flex items-center justify-between border-b border-white/[0.08] px-5 py-4 ${className}`}>
      {children}
   </div>
);

Modal.Title = ({ children, className = '' }) => (
   <div className={`text-base font-semibold text-white ${className}`}>
      {children}
   </div>
);

Modal.Body = ({ children, className = '' }) => (
   <div
      className={`min-h-0 flex-1 overflow-auto customScrollbar px-5 py-4 ${className}`}>
      {children}
   </div>
);

Modal.Footer = ({ children, className = '' }) => (
   <div
      className={`flex items-center justify-end gap-2 border-t border-white/[0.08] px-5 py-4 ${className}`}>
      {children}
   </div>
);

export const InputNumber = ({
   value = '',
   onChange,
   min,
   max,
   step = 'any',
   prefix,
   disabled = false,
   formatter,
   className = '',
   placeholder,
   onFocus,
   onBlur,
   ...props
}) => {
   const [isFocused, setIsFocused] = useState(false);
   const [localStr, setLocalStr] = useState(
      value === '' || value === null || value === undefined
         ? ''
         : String(value),
   );

   useEffect(() => {
      if (!isFocused) {
         setLocalStr(
            value === '' || value === null || value === undefined
               ? ''
               : String(value),
         );
      }
   }, [value, isFocused]);

   const displayValue = isFocused
      ? localStr
      : value === '' || value === null || value === undefined
        ? ''
        : formatter
          ? formatter(value)
          : String(value);

   const handleChange = (e) => {
      const raw = e.target.value;
      if (raw === '' || raw === null || raw === undefined) {
         setLocalStr('');
         onChange?.('');
         return;
      }

      let clean = raw.replace(/[^0-9.]/g, '');
      const parts = clean.split('.');
      if (parts.length > 2) {
         clean = parts[0] + '.' + parts.slice(1).join('');
      }

      setLocalStr(clean);

      if (clean === '' || clean === '.') {
         onChange?.('');
      } else {
         const num = Number(clean);
         if (!Number.isNaN(num)) {
            onChange?.(num);
         }
      }
   };

   const handleFocus = (e) => {
      setIsFocused(true);
      setLocalStr(
         value === '' || value === null || value === undefined
            ? ''
            : String(value),
      );
      onFocus?.(e);
   };

   const handleBlur = (e) => {
      setIsFocused(false);
      onBlur?.(e);
      if (localStr === '.' || localStr === '') {
         setLocalStr('');
         onChange?.('');
      } else {
         const num = Number(localStr);
         if (!Number.isNaN(num)) {
            let finalNum = num;
            if (min !== undefined && num < min) finalNum = min;
            if (max !== undefined && num > max) finalNum = max;
            if (finalNum !== num) {
               onChange?.(finalNum);
               setLocalStr(String(finalNum));
            }
         }
      }
   };

   return (
      <div className={`relative flex items-center ${className}`}>
         {prefix !== undefined && prefix !== null && (
            <div className="absolute left-3 z-10 flex items-center text-gray-400 pointer-events-none">
               {prefix}
            </div>
         )}
         <input
            {...filterDomProps(props)}
            type="text"
            inputMode="decimal"
            value={displayValue}
            disabled={disabled}
            placeholder={placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`h-11 w-full rounded-xl border border-white/[0.08] bg-[#16161b]/90 px-3 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#daf4aa]/40 focus:ring-4 focus:ring-[#daf4aa]/[0.05] disabled:cursor-not-allowed disabled:opacity-50 ${prefix !== undefined && prefix !== null ? 'pl-9' : ''}`}
         />
      </div>
   );
};

const normalizePickerData = (data = []) =>
   data.map((item) =>
      typeof item === 'object' ? item : { label: String(item), value: item },
   );

export const CheckPicker = forwardRef(
   (
      {
         data = [],
         value = [],
         onChange,
         placeholder = 'Select...',
         searchable = true,
         className = '',
         menuMaxHeight = 260,
         menuWidth,
         menuStyle,
         disabled = false,
         renderMenuItem,
         renderExtraFooter,
         onCreateNew,
         createNewText,
         ...props
      },
      outerRef,
   ) => {
      const items = normalizePickerData(data);
      const [open, setOpen] = useState(false);
      const [query, setQuery] = useState('');
      const [focusedIndex, setFocusedIndex] = useState(-1);
      const triggerRef = useRef(null);
      const menuRef = useRef(null);
      const listRef = useRef(null);
      const resolvedMenuWidth = menuStyle?.width ?? menuWidth ?? null;
      const coords = useDropdownPosition(open, triggerRef, resolvedMenuWidth);
      const selectedValues = Array.isArray(value) ? value : [];

      const handleClose = useCallback(() => {
         setOpen(false);
         setQuery('');
         setFocusedIndex(-1);
      }, []);

      useImperativeHandle(outerRef, () => ({
         close: handleClose,
         open: () => setOpen(true),
      }));

      useEffect(() => {
         const handler = (e) => {
            if (
               triggerRef.current &&
               !triggerRef.current.contains(e.target) &&
               menuRef.current &&
               !menuRef.current.contains(e.target)
            ) {
               handleClose();
            }
         };
         document.addEventListener('mousedown', handler);
         return () => document.removeEventListener('mousedown', handler);
      }, [handleClose]);

      const filtered = useMemo(
         () =>
            !query
               ? items
               : items.filter((i) =>
                    String(i.label ?? i.value)
                       .toLowerCase()
                       .includes(query.toLowerCase()),
                 ),
         [items, query],
      );

      useEffect(() => {
         if (open) {
            setFocusedIndex(filtered.length > 0 ? 0 : -1);
         }
      }, [open, query, filtered.length]);

      useEffect(() => {
         if (open && focusedIndex >= 0 && listRef.current) {
            const targetEl = listRef.current.children[focusedIndex];
            if (targetEl && typeof targetEl.scrollIntoView === 'function') {
               targetEl.scrollIntoView({ block: 'nearest' });
            }
         }
      }, [focusedIndex, open]);

      const toggle = (v) => {
         const exists = selectedValues.some((x) => String(x) === String(v));
         onChange?.(
            exists
               ? selectedValues.filter((x) => String(x) !== String(v))
               : [...selectedValues, v],
         );
      };

      const handleKeyDown = (e) => {
         e.stopPropagation();
         if (!open) {
            if (
               e.key === 'ArrowDown' ||
               e.key === 'ArrowUp' ||
               e.key === 'Enter'
            ) {
               e.preventDefault();
               setOpen(true);
            }
            return;
         }

         const extraCount = renderExtraFooter || onCreateNew ? 1 : 0;
         const totalCount = filtered.length + extraCount;

         if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
         } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
         } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < filtered.length) {
               toggle(filtered[focusedIndex].value);
            } else if (
               focusedIndex === filtered.length &&
               (renderExtraFooter || onCreateNew)
            ) {
               handleClose();
               if (onCreateNew) {
                  onCreateNew();
               } else if (typeof renderExtraFooter === 'function') {
                  renderExtraFooter(handleClose);
               }
            }
         } else if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
         }
      };

      const labels = items
         .filter((i) =>
            selectedValues.some((v) => String(v) === String(i.value)),
         )
         .map((i) => i.label);

      const menuContent = (
         <AnimatePresence>
            {open && (
               <motion.div
                  ref={menuRef}
                  initial={{
                     opacity: 0,
                     y: coords.placement === 'top' ? 5 : -5,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: coords.placement === 'top' ? 5 : -5 }}
                  style={{
                     ...menuStyle,
                     position: 'fixed',
                     top: coords.placement === 'top' ? undefined : coords.top,
                     bottom:
                        coords.placement === 'top'
                           ? window.innerHeight - coords.top
                           : undefined,
                     left: coords.left,
                     width: coords.width,
                     maxWidth: 'calc(100vw - 24px)',
                     zIndex: menuStyle?.zIndex ?? 999999,
                  }}
                  className={`overflow-hidden rounded-2xl ${panelClass}`}>
                  {searchable && (
                     <div className="border-b border-white/[0.06] p-2">
                        <input
                           autoFocus
                           value={query}
                           onChange={(e) => setQuery(e.target.value)}
                           onKeyDown={handleKeyDown}
                           placeholder="Search..."
                           className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-sm text-white outline-none"
                        />
                     </div>
                  )}
                  <div
                     ref={listRef}
                     className="overflow-y-auto p-1.5 customScrollbar"
                     style={{ maxHeight: menuMaxHeight }}>
                     {filtered.map((item, idx) => {
                        const checked = selectedValues.some(
                           (v) => String(v) === String(item.value),
                        );
                        const isFocused = idx === focusedIndex;
                        return (
                           <button
                              key={String(item.value)}
                              type="button"
                              onMouseEnter={() => setFocusedIndex(idx)}
                              onClick={() => toggle(item.value)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${
                                 checked
                                    ? 'bg-[#daf4aa]/10 text-[#daf4aa]'
                                    : isFocused
                                      ? 'bg-white/10 text-white'
                                      : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                              }`}>
                              <span className="truncate">
                                 {item.label ?? item.value}
                              </span>
                              <span
                                 className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                                    checked
                                       ? 'border-[#daf4aa] bg-[#daf4aa] text-[#16161b]'
                                       : 'border-white/15'
                                 }`}>
                                 {checked ? '✓' : ''}
                              </span>
                           </button>
                        );
                     })}
                  </div>
                  {(renderExtraFooter || onCreateNew) && (
                     <div
                        className={`border-t border-white/[0.08] p-1.5 bg-[#16161b] ${
                           focusedIndex === filtered.length ? 'bg-white/10' : ''
                        }`}
                        onMouseEnter={() => setFocusedIndex(filtered.length)}>
                        {renderExtraFooter ? (
                           typeof renderExtraFooter === 'function' ? (
                              renderExtraFooter(handleClose)
                           ) : (
                              renderExtraFooter
                           )
                        ) : (
                           <button
                              type="button"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleClose();
                                 onCreateNew?.();
                              }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#daf4aa]/15 px-3 py-2 text-xs font-bold text-[#daf4aa] transition-colors hover:bg-[#daf4aa]/25 cursor-pointer">
                              <Plus size={16} strokeWidth={2.5} />
                              {createNewText || 'Create New'}
                           </button>
                        )}
                     </div>
                  )}
               </motion.div>
            )}
         </AnimatePresence>
      );

      return (
         <div
            ref={triggerRef}
            className={`relative ${className}`}
            {...filterDomProps(props)}>
            <button
               type="button"
               disabled={disabled}
               onKeyDown={handleKeyDown}
               onClick={() => !disabled && setOpen((v) => !v)}
               className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-2xl border border-white/[0.08] bg-[#16161b]/90 px-4 py-2 text-left text-sm transition-all ${
                  open
                     ? 'border-[#daf4aa]/40 ring-4 ring-[#daf4aa]/[0.06]'
                     : 'hover:border-white/[0.14]'
               } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
               <span
                  className={
                     labels.length
                        ? 'truncate text-gray-200'
                        : 'truncate text-gray-500'
                  }>
                  {labels.length ? labels.join(', ') : placeholder}
               </span>
               <ChevronDown
                  size={20}
                  strokeWidth={2}
                  className={`shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180 text-[#daf4aa]' : ''}`}
               />
            </button>
            {createPortal(menuContent, document.body)}
         </div>
      );
   },
);

export const TagPicker = CheckPicker;

export const Toggle = ({
   checked = false,
   onChange,
   checkedChildren,
   unCheckedChildren,
   disabled = false,
   size = 'md',
   className = '',
}) => (
   <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex items-center rounded-full border p-1 transition-all ${size === 'lg' ? 'h-9 w-20' : 'h-7 w-14'} ${checked ? 'border-[#daf4aa]/40 bg-[#daf4aa]/20' : 'border-white/10 bg-[#16161b]'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <span
         className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all ${size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'} ${checked ? 'right-1' : 'left-1'}`}
      />
      <span
         className={`relative z-10 w-full text-[9px] font-bold ${checked ? 'text-[#daf4aa] text-left pl-1' : 'text-gray-500 text-right pr-1'}`}>
         {checked ? checkedChildren : unCheckedChildren}
      </span>
   </button>
);

export const Checkbox = ({
   checked = false,
   onChange,
   children,
   disabled = false,
   className = '',
}) => (
   <label
      className={`inline-flex items-center gap-2 cursor-pointer text-sm text-gray-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
         type="checkbox"
         checked={!!checked}
         disabled={disabled}
         onChange={(e) => onChange?.(e.target.checked, e)}
         className="h-4 w-4 accent-[#daf4aa]"
      />
      {children}
   </label>
);

export const Uploader = ({
   onChange,
   onDragEnter,
   onDragLeave,
   onDrop,
   disabled = false,
   accept,
   children,
   className = '',
   draggable = true,
   autoUpload = false,
   ...props
}) => {
   const fileInputRef = useRef(null);

   const handleFiles = (files) => {
      if (!files || files.length === 0) return;
      const fileList = Array.from(files).map((file) => ({
         blobFile: file,
         name: file.name,
      }));
      onChange?.(fileList);
   };

   const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
   };

   const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onDragEnter?.(e);
   };

   const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onDragLeave?.(e);
   };

   const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onDrop?.(e);
      if (!disabled && e.dataTransfer && e.dataTransfer.files) {
         handleFiles(e.dataTransfer.files);
      }
   };

   return (
      <div
         className={`relative ${className}`}
         onDragOver={draggable ? handleDragOver : undefined}
         onDragEnter={draggable ? handleDragEnter : undefined}
         onDragLeave={draggable ? handleDragLeave : undefined}
         onDrop={draggable ? handleDrop : undefined}
         onClick={() => {
            if (!disabled && fileInputRef.current) {
               fileInputRef.current.click();
            }
         }}>
         <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
               if (e.target.files) {
                  handleFiles(e.target.files);
                  e.target.value = '';
               }
            }}
         />
         {children}
      </div>
   );
};

export const Animation = {
   Collapse: ({ in: isIn, children }) => (
      <AnimatePresence initial={false}>
         {isIn && (
            <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               style={{ overflow: 'hidden' }}>
               {children}
            </motion.div>
         )}
      </AnimatePresence>
   ),
   Bounce: ({ in: isIn = true, children, className = '' }) => (
      <AnimatePresence>
         {isIn && (
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: -10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: -10 }}
               className={className}>
               {children}
            </motion.div>
         )}
      </AnimatePresence>
   ),
   Fade: ({ in: isIn = true, children, className = '' }) => (
      <AnimatePresence>
         {isIn && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className={className}>
               {children}
            </motion.div>
         )}
      </AnimatePresence>
   ),
};

export default {
   Input,
   InputNumber,
   InputGroup,
   SelectPicker,
   CheckPicker,
   DateRangePicker,
   DatePicker,
   TimePicker,
   Tooltip,
   Whisper,
   Modal,
   Toggle,
   Checkbox,
   Uploader,
   Animation,
};
