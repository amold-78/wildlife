import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function Toast() {
  const { toast } = useBooking();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#4ADE80] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#E4B865] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-[#F87171] shrink-0" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 max-w-md animate-fade-in shadow-[0_20px_48px_-12px_rgba(3,12,9,0.75)] rounded-xl bg-[#0B221B] text-[#F4EBDA] border border-[#C99A4A]/50 px-4 py-3.5 flex items-center gap-3"
    >
      {icons[toast.type] || icons.success}
      <p className="text-xs sm:text-sm font-medium text-[#F8F3E8] leading-snug">
        {toast.message}
      </p>
    </div>
  );
}
