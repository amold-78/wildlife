import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useBooking();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in shadow-2xl rounded-2xl bg-white border border-[#E9DFC9] p-4 flex items-center gap-3">
      {icons[toast.type] || icons.success}
      <p className="text-sm font-medium text-[#202724] leading-snug">{toast.message}</p>
    </div>
  );
}
