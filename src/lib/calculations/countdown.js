/**
 * Event Countdown Utilities & iCalendar (ICS) Generation
 * 100% Client-side time breakdown and calendar export.
 */

/**
 * Calculates remaining days, hours, minutes, and seconds to target date
 */
export const calculateTimeRemaining = (targetDateString, currentTimestamp = Date.now()) => {
   if (!targetDateString) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isPast: false };
   }

   const target = new Date(targetDateString).getTime();
   const now = currentTimestamp;
   const diff = target - now;

   if (Number.isNaN(target)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isPast: false };
   }

   const isPast = diff <= 0;
   const absDiff = Math.abs(diff);

   const totalSeconds = Math.floor(absDiff / 1000);
   const days = Math.floor(totalSeconds / (3600 * 24));
   const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
   const minutes = Math.floor((totalSeconds % 3600) / 60);
   const seconds = totalSeconds % 60;

   return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      isPast,
   };
};

/**
 * Calculates progress percentage between creation/start date and target date
 */
export const calculateEventProgress = (startDateString, targetDateString, currentTimestamp = Date.now()) => {
   const start = new Date(startDateString).getTime();
   const target = new Date(targetDateString).getTime();
   const now = currentTimestamp;

   if (Number.isNaN(start) || Number.isNaN(target) || target <= start) {
      return 100;
   }

   if (now >= target) return 100;
   if (now <= start) return 0;

   const total = target - start;
   const elapsed = now - start;
   const pct = (elapsed / total) * 100;
   return Math.min(100, Math.max(0, parseFloat(pct.toFixed(1))));
};

/**
 * Generates an RFC 5545 compliant .ics calendar file for import into Google Calendar,
 * Apple Calendar, and Outlook.
 */
export const generateICS = ({ title, description = '', targetDate }) => {
   const dateObj = new Date(targetDate);
   if (Number.isNaN(dateObj.getTime())) return '';

   const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
   };

   const startDate = formatICSDate(dateObj);
   // End time default: 1 hour after start
   const endDate = formatICSDate(new Date(dateObj.getTime() + 60 * 60 * 1000));
   const now = formatICSDate(new Date());

   const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Klique//Event Countdown Tool//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@klique.tools`,
      `DTSTAMP:${now}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${(title || 'Scheduled Event').replace(/[,;\\]/g, ' ')}`,
      `DESCRIPTION:${(description || 'Created with Klique Event Countdown').replace(/[,;\\]/g, ' ')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Upcoming Event Tomorrow',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
   ];

   return icsLines.join('\r\n');
};
