import React from 'react';
import { Vehicle } from '../types';
import { formatINR, generateDirectWhatsAppInquiry } from '../utils/whatsapp';
import { getVehicleDepositBreakdown } from '../utils/pricing';
import { X, Check, ShieldCheck, Gauge, Fuel, Zap, ArrowRight, MessageCircle } from 'lucide-react';

interface VehicleSpecsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onBookNow: (vehicle: Vehicle) => void;
}

export const VehicleSpecsModal: React.FC<VehicleSpecsModalProps> = ({
  vehicle,
  onClose,
  onBookNow,
}) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-2xl bg-[#161c26] border-t sm:border border-[#263041] rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Mobile Pull-Down Indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-2 sm:hidden shrink-0" aria-hidden="true" />

        {/* Header with image */}
        <div className="relative aspect-[16/9] max-h-56 sm:max-h-64 bg-[#111722] overflow-hidden shrink-0">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white grid place-items-center transition-colors backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-end justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2bff8e] text-[#0d1117] shadow-lg">
                {vehicle.tag}
              </span>
              {(vehicle.isAvailable ?? vehicle.available ?? true) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0d1117]/90 backdrop-blur-md text-[#22f054] border border-[#22f054]/40">
                  <span className="h-2 w-2 rounded-full bg-[#22f054] animate-pulse"></span>
                  <span>Available</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/90 backdrop-blur-md text-red-400 border border-red-500/50 shadow-lg shadow-red-950/50">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span>Booked</span>
                </span>
              )}
            </div>
            <div className="bg-[#0d1117]/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shrink-0">
              <span className="font-display font-black text-lg sm:text-xl text-[#ff7a1a]">
                {formatINR(vehicle.pricePerDay)}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-300"> / Day</span>
            </div>
          </div>
        </div>

        {/* Content body (Scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white">{vehicle.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{vehicle.subtitle}</p>
            <p className="mt-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">{vehicle.description}</p>
          </div>

          {/* Technical Specs Grid */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2.5">
              Performance &amp; Engine Specs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-[#10141d] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#2bff8e]" />
                  <span>Engine</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">{vehicle.engine}</div>
              </div>

              <div className="bg-[#10141d] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-[#2bff8e]" />
                  <span>Mileage</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">{vehicle.mileage}</div>
              </div>

              <div className="bg-[#10141d] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#2bff8e]" />
                  <span>Transmission</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">{vehicle.transmission}</div>
              </div>

              <div className="bg-[#10141d] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] text-slate-400">Fuel Tank Capacity</div>
                <div className="text-xs font-bold text-white mt-1">{vehicle.fuelCapacity}</div>
              </div>

              <div className="bg-[#10141d] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] text-slate-400">Free KM / Day</div>
                <div className="text-xs font-bold text-[#2bff8e] mt-1">{vehicle.freeKmPerDay} KM</div>
              </div>

              <div className="bg-[#10141d] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] text-slate-400">Daily Deposit (1x)</div>
                <div className="text-xs font-bold text-[#2bff8e] mt-1">
                  {formatINR(vehicle.securityDeposit)}
                </div>
              </div>
            </div>
          </div>

          {/* Security Deposits (100% Refundable) Section */}
          {(() => {
            const deposit = getVehicleDepositBreakdown(vehicle.id);
            return (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f141d] border border-white/10 shadow-inner">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2bff8e] shrink-0" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Security Deposit <span className="text-[#2bff8e] font-semibold lowercase">(100% refundable)</span>
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full font-medium">
                    Charged once per booking
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-[#161c26] rounded-xl p-2 sm:p-2.5 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-sans font-medium">Hourly</span>
                    <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">{formatINR(deposit.hourly)}</span>
                  </div>
                  <div className="bg-[#161c26] rounded-xl p-2 sm:p-2.5 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-sans font-medium">Day</span>
                    <span className="text-xs sm:text-sm font-bold text-[#2bff8e] mt-0.5 block">{formatINR(deposit.daily)}</span>
                  </div>
                  <div className="bg-[#161c26] rounded-xl p-2 sm:p-2.5 border border-white/5">
                    <span className="block text-[10px] text-slate-400 font-sans font-medium">Week</span>
                    <span className="text-xs sm:text-sm font-bold text-[#2bff8e] mt-0.5 block">{formatINR(deposit.weekly)}</span>
                  </div>
                </div>

                <p className="mt-2 text-[10.5px] sm:text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Charged once per booking (never per day).</span>
                  <span className="text-[#2bff8e] font-medium">100% refunded</span>
                </p>
              </div>
            );
          })()}

          {/* Included Features */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
              Included with This Rental
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
              {vehicle.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2bff8e] shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#0d1117]/95 backdrop-blur-md shrink-0 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onBookNow(vehicle);
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-full font-bold text-sm bg-[#2bff8e] text-[#0d1117] hover:bg-[#4dff9f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2bff8e]/20"
          >
            <span>Book {vehicle.name} Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={generateDirectWhatsAppInquiry(vehicle.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3 px-5 rounded-full font-bold text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>
    </div>
  );
};
