import React, { useState } from 'react';
import { Vehicle } from '../types';
import { FLEET_VEHICLES } from '../data/fleetData';
import { formatINR } from '../utils/whatsapp';
import { Calculator, ArrowRight, ShieldCheck, Check, Sparkles, Tag } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  calculateRentalBaseFare,
  getVehicleSecurityDeposit,
  getSavingsOnWeeklyPackage,
  calculateExtraHelmetCost,
} from '../utils/pricing';

interface FareCalculatorProps {
  onProceedToBooking: (config: {
    vehicle: Vehicle;
    rentalType: 'daily' | 'hourly';
    duration: number;
    extraHelmet: boolean;
    doorstepDelivery: boolean;
    total: number;
  }) => void;
}

export const FareCalculator: React.FC<FareCalculatorProps> = ({ onProceedToBooking }) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(FLEET_VEHICLES[0].id);
  const [rentalType, setRentalType] = useState<'daily' | 'hourly'>('daily');
  const [duration, setDuration] = useState<number>(1);
  const [extraHelmet, setExtraHelmet] = useState<boolean>(false);
  const [doorstepDelivery, setDoorstepDelivery] = useState<boolean>(false);

  const selectedVehicle =
    FLEET_VEHICLES.find((v) => v.id === selectedVehicleId) || FLEET_VEHICLES[0];

  // Pricing calculations
  const effectiveDuration = rentalType === 'daily' ? Math.min(7, Math.max(1, duration)) : duration;
  const baseRate = calculateRentalBaseFare(selectedVehicle, rentalType, effectiveDuration);

  const extraHelmetCost = extraHelmet
    ? calculateExtraHelmetCost(rentalType, effectiveDuration)
    : 0;

  const deliveryCost = doorstepDelivery ? 100 : 0;
  const totalPayable = baseRate + extraHelmetCost + deliveryCost;

  const securityDeposit = getVehicleSecurityDeposit(selectedVehicle.id, rentalType, effectiveDuration);
  const weeklyDiscountSavings = getSavingsOnWeeklyPackage(selectedVehicle, rentalType, effectiveDuration);

  const handleProceed = () => {
    onProceedToBooking({
      vehicle: selectedVehicle,
      rentalType,
      duration: effectiveDuration,
      extraHelmet,
      doorstepDelivery,
      total: totalPayable,
    });
  };

  return (
    <section
      ref={ref}
      id="calculator"
      className={`py-20 bg-[#0d1117] border-b border-white/5 scroll-mt-20 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] font-bold text-xs md:text-sm text-[#ff7a1a]">
            Interactive Estimator
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-3">
            Real-Time Fare Calculator
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base">
            Customize your ride duration and see exact transparent pricing before booking.
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto bg-[#161c26] border border-[#263041] rounded-3xl p-6 md:p-10 shadow-2xl grid md:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="md:col-span-7 space-y-6">
            {/* Vehicle Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                1. Select Vehicle
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FLEET_VEHICLES.map((v) => {
                  const isAvail = v.isAvailable ?? v.available ?? true;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3 rounded-2xl text-left transition-all border ${
                        selectedVehicleId === v.id
                          ? 'border-[#39ff88] bg-[#39ff88]/10 text-white shadow-sm'
                          : 'border-white/5 bg-[#10141d] text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-xs font-bold truncate">{v.name}</div>
                        {!isAvail && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-950/90 text-red-400 border border-red-500/50 shrink-0">
                            Booked
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#ff7a1a] font-mono mt-1">
                        {formatINR(v.pricePerDay)}/day
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rental Plan (Daily vs Hourly) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                2. Rental Duration Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRentalType('daily');
                    setDuration(1);
                  }}
                  className={`py-3 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    rentalType === 'daily'
                      ? 'bg-[#39ff88] text-[#0d1117] border-[#39ff88]'
                      : 'bg-[#10141d] text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  <span>Daily Rental (24 hrs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRentalType('hourly');
                    setDuration(4);
                  }}
                  className={`py-3 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    rentalType === 'hourly'
                      ? 'bg-[#39ff88] text-[#0d1117] border-[#39ff88]'
                      : 'bg-[#10141d] text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  <span>Hourly Rental (Flexible)</span>
                </button>
              </div>
            </div>

            {/* Duration Slider / Stepper */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  3. Select Duration
                </label>
                <span className="font-display font-black text-lg text-white">
                  {duration} {rentalType === 'daily' ? (duration === 1 ? 'Day' : 'Days') : 'Hours'}
                </span>
              </div>

              {rentalType === 'daily' ? (
                <div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full accent-[#39ff88] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>1 Day</span>
                    <span>3 Days</span>
                    <span>5 Days</span>
                    <span className="text-[#39ff88] font-bold">7 Days (Max / Week Deal)</span>
                  </div>
                  {/* Quick pills */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[1, 2, 3, 5, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          duration === d
                            ? 'bg-[#ff7a1a] text-[#0d1117] shadow-md'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {d === 7 ? '7 Days (Weekly Deal 🔥)' : `${d} ${d === 1 ? 'day' : 'days'}`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full accent-[#39ff88] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>3 Hours (Min)</span>
                    <span>6 Hours</span>
                    <span>9 Hours</span>
                    <span>12 Hours</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[3, 4, 6, 8, 12].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDuration(h)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          duration === h
                            ? 'bg-[#ff7a1a] text-[#0d1117]'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {h} hrs
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Optional Addons */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                4. Optional Add-ons
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#10141d] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={extraHelmet}
                    onChange={(e) => setExtraHelmet(e.target.checked)}
                    className="w-4 h-4 accent-[#39ff88] rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Extra Pillion Helmet</div>
                    <div className="text-[11px] text-slate-400">1st helmet is already 100% free</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#ff7a1a]">
                    +{formatINR(calculateExtraHelmetCost(rentalType, effectiveDuration))}
                  </div>
                  {rentalType === 'daily' && effectiveDuration >= 7 && (
                    <div className="text-[10px] text-[#39ff88] font-bold">Week Deal (₹200)</div>
                  )}
                </div>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#10141d] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={doorstepDelivery}
                    onChange={(e) => setDoorstepDelivery(e.target.checked)}
                    className="w-4 h-4 accent-[#39ff88] rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Doorstep Pickup (Inside 6km Range)</div>
                    <div className="text-[11px] text-slate-400">Inside 6km range of Gamharia Hub</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-[#ff7a1a]">+₹100</div>
              </label>
            </div>
          </div>

          {/* Receipt Breakdown Column */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#10151f] to-[#141b27] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#39ff88]" />
                  <span className="font-display font-bold text-sm text-white">Rental Receipt</span>
                </div>
                <span className="text-[11px] font-mono text-[#39ff88] bg-[#39ff88]/10 px-2 py-0.5 rounded">
                  ESTIMATE
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Selected Vehicle</span>
                  <span className="font-bold text-white text-sm">{selectedVehicle.name}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>
                    Base Rent ({effectiveDuration} {rentalType === 'daily' ? (effectiveDuration === 7 ? 'days (1 Full Week)' : effectiveDuration === 1 ? 'day' : 'days') : 'hours'})
                  </span>
                  <span className="font-mono text-white font-semibold">{formatINR(baseRate)}</span>
                </div>

                {weeklyDiscountSavings > 0 && (
                  <div className="p-2 rounded-lg bg-[#39ff88]/15 border border-[#39ff88]/30 flex items-center justify-between text-xs text-[#39ff88]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      Weekly Deal Package Applied!
                    </span>
                    <span className="font-bold">Save {formatINR(weeklyDiscountSavings)}</span>
                  </div>
                )}

                {extraHelmet && (
                  <div className="flex justify-between text-slate-300">
                    <span>
                      Extra Pillion Helmet {rentalType === 'daily' && effectiveDuration >= 7 ? '(1 Week Deal)' : ''}
                    </span>
                    <span className="font-mono text-white">+{formatINR(extraHelmetCost)}</span>
                  </div>
                )}

                {doorstepDelivery && (
                  <div className="flex justify-between text-slate-300">
                    <span>Doorstep Pickup (Inside 6km Range)</span>
                    <span className="font-mono text-white">{formatINR(deliveryCost)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-300">
                  <span>Free KM Included</span>
                  <span className="font-mono text-[#39ff88]">
                    {rentalType === 'daily' ? selectedVehicle.freeKmPerDay * effectiveDuration : '50'} KM
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Complimentary Sanitized Helmet</span>
                  <span className="text-[#39ff88] font-semibold">1 Helmet Included (FREE)</span>
                </div>

                {/* Subtotal */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                  <span className="font-bold text-white text-sm">Total Rental Fare</span>
                  <span className="font-display font-black text-2xl text-[#ff7a1a]">
                    {formatINR(totalPayable)}
                  </span>
                </div>

                {/* Security Deposit Note */}
                <div className="mt-4 p-3 rounded-xl bg-[#39ff88]/10 border border-[#39ff88]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#39ff88] shrink-0" />
                    <div>
                      <span className="font-bold text-white">Security Deposit: </span>
                      <span className="font-bold text-[#39ff88] font-mono">{formatINR(securityDeposit)}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5">(100% refunded on return)</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded font-medium">1x per booking</span>
                </div>

                {/* Late Return Fine notice */}
                <div className="p-2.5 rounded-xl bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 flex items-start gap-2 text-[11px] text-slate-300">
                  <span className="font-bold text-[#ff7a1a]">Late Return Policy:</span>
                  <span>Flat fine of ₹150 applies if returned late without prior notice.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleProceed}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-sm bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] shadow-lg shadow-[#39ff88]/20 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Proceed to Book This Ride</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Sends full reservation details directly to WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
