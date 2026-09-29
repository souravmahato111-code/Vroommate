import React from 'react';
import { Booking } from '../types';
import { formatINR, generateWhatsAppBookingUrl } from '../utils/whatsapp';
import { X, Calendar, Clock, MessageCircle, Bike, CheckCircle2, Trash2, FileSignature } from 'lucide-react';

interface MyBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onClearBooking?: (id: string) => void;
  onOpenAgreement?: (booking: Booking) => void;
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  isOpen,
  onClose,
  bookings,
  onClearBooking,
  onOpenAgreement,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#161c26] border-l border-[#263041] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#0d1117]/80">
          <div>
            <h2 className="font-display font-black text-xl text-white">My Ride Reservations</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {bookings.length} {bookings.length === 1 ? 'reservation' : 'reservations'} on this device
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-white/5 grid place-items-center text-slate-500 mx-auto mb-3">
                <Bike className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-white text-base">No active reservations yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Pick an Automatic Scooty, Yamaha FZ, or Centuro to book your ride with instant WhatsApp confirmation.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#10141d] rounded-2xl p-5 border border-white/10 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#39ff88] bg-[#39ff88]/10 px-2 py-0.5 rounded">
                    {b.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#ff7a1a] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>WhatsApp Verification Pending</span>
                    </span>
                    {onClearBooking && (
                      <button
                        type="button"
                        onClick={() => onClearBooking(b.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-base text-white">{b.vehicleName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>
                      {b.pickupDate} ({b.pickupTime})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {b.duration} {b.rentalType === 'daily' ? 'Days' : 'Hours'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400">Total Rental</span>
                    <div className="font-display font-bold text-[#ff7a1a] text-sm">
                      {formatINR(b.totalAmount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Security Deposit</span>
                    <div className="font-mono text-slate-200">{formatINR(b.securityDeposit)}</div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <a
                    href={generateWhatsAppBookingUrl(b)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Chat on WhatsApp for {b.id}</span>
                  </a>
                  {onOpenAgreement && (
                    <button
                      type="button"
                      onClick={() => onOpenAgreement(b)}
                      className="w-full py-2 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileSignature className="w-3.5 h-3.5 text-[#39ff88]" />
                      <span>View / Sign Agreement</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-[#0d1117]/80 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Reminder: Return vehicles on time. Unnotified late return fine is <span className="text-[#ff7a1a] font-semibold">₹150</span>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
