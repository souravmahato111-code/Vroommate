import React, { useState } from 'react';
import { Vehicle, VehicleCategory } from '../types';
import { FLEET_VEHICLES } from '../data/fleetData';
import { formatINR, generateDirectWhatsAppInquiry } from '../utils/whatsapp';
import { MessageCircle, Check, Info, Gauge, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface FleetSectionProps {
  onSelectVehicleForBooking: (vehicle: Vehicle) => void;
  onOpenSpecsModal: (vehicle: Vehicle) => void;
}

export const FleetSection: React.FC<FleetSectionProps> = ({
  onSelectVehicleForBooking,
  onOpenSpecsModal,
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('all');

  const categories: { id: VehicleCategory; label: string }[] = [
    { id: 'all', label: 'All Fleet' },
    { id: 'scooty', label: 'Scooty / Gearless' },
    { id: 'sport', label: 'Sporty & Naked' },
    { id: 'commuter', label: 'Economy Commuter' },
    { id: 'cruiser', label: 'Touring Cruisers' },
  ];

  const filteredVehicles = FLEET_VEHICLES.filter((vehicle) => {
    if (selectedCategory === 'all') return true;
    return vehicle.category === selectedCategory;
  });

  return (
    <section
      ref={ref}
      id="fleet"
      className={`py-20 bg-[#0d1117] border-b border-white/5 scroll-mt-20 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="uppercase tracking-[0.2em] font-bold text-xs md:text-sm text-[#2bff8e]">
            Our Fleet
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-3">
            Pick the Ride That Fits Your Day
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base">
            All two-wheelers are serviced with fresh engine oil, clean sanitized helmets, and valid insurance.
          </p>
        </div>

        {/* Interactive Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#2bff8e] text-[#0d1117] shadow-lg shadow-[#2bff8e]/20 scale-105'
                  : 'bg-[#161c26] text-slate-300 hover:text-white hover:bg-[#1e2736] border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Fleet Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-12">
          {filteredVehicles.map((vehicle) => {
            const isAvailable = vehicle.isAvailable ?? vehicle.available ?? true;

            return (
              <article
                key={vehicle.id}
                className="group rounded-3xl overflow-hidden flex flex-col bg-[#161c26] border border-[#263041] hover:border-[#2bff8e]/60 hover:shadow-2xl hover:shadow-[#2bff8e]/15 transition-all duration-300 transform hover:-translate-y-1.5"
              >
                {/* Image Container with Tag & Availability Indicator */}
                <div className="relative overflow-hidden aspect-[16/10] bg-[#111722]">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />

                  {/* Resilient Fallback */}
                  <div
                    style={{ display: 'none' }}
                    className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#161c26] text-center"
                  >
                    <Gauge className="w-10 h-10 text-[#2bff8e] mb-2" />
                    <p className="font-bold text-white text-sm">{vehicle.name}</p>
                  </div>

                  {/* Category / Feature Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        vehicle.tag === 'Best for City Commute'
                          ? 'bg-[#2bff8e] text-[#0d1117]'
                          : vehicle.tag === 'Popular Choice'
                          ? 'bg-[#2bff8e] text-[#0d1117]'
                          : 'bg-white/90 text-[#0d1117]'
                      }`}
                    >
                      {vehicle.tag}
                    </span>
                  </div>

                  {/* Status Indicator Badge (Available vs Booked) */}
                  <div className="absolute top-4 right-4 z-10">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0d1117]/90 backdrop-blur-md text-[#22f054] border border-[#22f054]/40 shadow-lg shadow-[#22f054]/15">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22f054] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22f054]"></span>
                        </span>
                        <span>Available</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/90 backdrop-blur-md text-red-400 border border-red-500/50 shadow-lg shadow-red-950/50">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        <span>Booked</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-[#0d1117]/85 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium text-slate-300 border border-white/10">
                    {vehicle.mileage}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-extrabold text-xl text-white group-hover:text-[#2bff8e] transition-colors">
                        {vehicle.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{vehicle.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenSpecsModal(vehicle)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="View vehicle specifications"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pricing Block */}
                  <div className="mt-4 border-y border-white/5 py-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="font-display font-black text-2xl text-[#ff7a1a]">
                          {formatINR(vehicle.pricePerDay)}
                        </span>
                        <span className="text-xs text-slate-400 font-medium"> / Day</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-300">
                          {formatINR(vehicle.pricePerHour)}/hr
                        </span>
                        <span className="text-[11px] block text-slate-400">Min 3 hrs</span>
                      </div>
                    </div>

                    {vehicle.pricePerWeek && (
                      <div className="mt-2 py-1 px-2.5 rounded-lg bg-[#2bff8e]/10 border border-[#2bff8e]/20 flex items-center justify-between text-[11px]">
                        <span className="text-[#2bff8e] font-bold">1 Week (7 Days):</span>
                        <span className="font-mono font-bold text-white">{formatINR(vehicle.pricePerWeek)}</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed flex-1 line-clamp-3">
                    {vehicle.description}
                  </p>

                  {/* Key feature highlights */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#2bff8e] shrink-0" />
                      <span>Free Sanitized Helmet included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#2bff8e] shrink-0" />
                      <span>{vehicle.freeKmPerDay} km/day included free · Zero hidden charges</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectVehicleForBooking(vehicle)}
                      className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-md ${
                        isAvailable
                          ? 'bg-[#2bff8e] text-[#0d1117] hover:bg-[#4dff9f] shadow-[#2bff8e]/20'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 shadow-red-500/10'
                      }`}
                    >
                      <span>{isAvailable ? 'Book This Ride' : 'Currently Booked (Inquire Next Slot)'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href={generateDirectWhatsAppInquiry(vehicle.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>{isAvailable ? 'Enquire on WhatsApp' : 'Enquire Next Availability'}</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
