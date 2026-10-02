import React, { useState, useRef, useEffect } from 'react';
import { Booking, RentalAgreementData } from '../types';
import { BUSINESS_CONFIG } from '../data/fleetData';
import { formatINR, getSavedBookings } from '../utils/whatsapp';
import {
  X,
  FileSignature,
  ShieldCheck,
  CheckCircle2,
  Download,
  Printer,
  RotateCcw,
  AlertTriangle,
  Calendar,
  Clock,
  Car,
  FileText,
  UserCheck,
  Share2,
  ExternalLink,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface RentalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBooking?: Booking | null;
}

export const RentalAgreementModal: React.FC<RentalAgreementModalProps> = ({
  isOpen,
  onClose,
  initialBooking,
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(initialBooking || null);
  const [customerName, setCustomerName] = useState<string>(initialBooking?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(initialBooking?.customerPhone || '');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [signingMode, setSigningMode] = useState<'digital' | 'office'>('digital');
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [signedTimestamp, setSignedTimestamp] = useState<string>('');
  const [agreementRefId, setAgreementRefId] = useState<string>('');

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Sync initial booking when prop changes
  useEffect(() => {
    if (initialBooking) {
      setSelectedBooking(initialBooking);
      setCustomerName(initialBooking.customerName || '');
      setCustomerPhone(initialBooking.customerPhone || '');
    } else {
      const saved = getSavedBookings();
      if (saved.length > 0) {
        setSelectedBooking(saved[0]);
        setCustomerName(saved[0].customerName || '');
        setCustomerPhone(saved[0].customerPhone || '');
      }
    }
  }, [initialBooking, isOpen]);

  // Generate agreement reference ID
  useEffect(() => {
    if (isOpen) {
      const refCode = `VRA-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      setAgreementRefId(refCode);
    }
  }, [isOpen]);

  // Setup Canvas
  useEffect(() => {
    if (isOpen && signingMode === 'digital' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#39ff88';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, signingMode]);

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isSigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isSigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleSignAgreement = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error('Please check and accept the agreement terms & conditions to proceed.');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter the customer / primary rider name.');
      return;
    }

    if (!customerPhone.trim()) {
      toast.error('Please enter a valid WhatsApp contact number.');
      return;
    }

    if (signingMode === 'digital' && !hasDrawnSignature) {
      toast.error('Please provide your digital e-signature in the signature box.');
      return;
    }

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    setIsSigned(true);
    setSignedTimestamp(timestamp);

    // Save agreement to localStorage for records
    try {
      const agreementRecord: RentalAgreementData = {
        bookingId: selectedBooking?.id || `VROOM-${Date.now().toString().slice(-6)}`,
        customerName,
        customerPhone,
        vehicleName: selectedBooking?.vehicleName || 'Self-Drive Two-Wheeler',
        pickupDate: selectedBooking?.pickupDate || new Date().toISOString().split('T')[0],
        pickupTime: selectedBooking?.pickupTime || '09:00 AM',
        returnDate: selectedBooking?.returnDate,
        returnTime: selectedBooking?.returnTime,
        totalAmount: selectedBooking?.totalAmount,
        securityDeposit: selectedBooking?.securityDeposit || 500,
        signingMode,
        signedAt: timestamp,
        isAgreed: true,
        agreementHash: agreementRefId,
      };

      const existingRecords: RentalAgreementData[] = JSON.parse(
        localStorage.getItem('ghoomify_rides_agreements_v1') || '[]'
      );
      localStorage.setItem('ghoomify_rides_agreements_v1', JSON.stringify([agreementRecord, ...existingRecords]));
    } catch (err) {
      console.error('Failed to store agreement record', err);
    }

    toast.success('Rental Agreement digitally accepted & recorded!');
  };

  const handlePrintAgreement = () => {
    window.print();
  };

  const handleSendToWhatsApp = () => {
    const phone = BUSINESS_CONFIG.whatsappNumber;
    const vehicle = selectedBooking?.vehicleName || 'Self-Drive Vehicle';
    const bId = selectedBooking?.id || 'Booking Enquiry';
    
    const message = `*VroomMate Rides - Rental Agreement Acknowledgement*
==========================================
📄 *Agreement Ref:* ${agreementRefId}
📋 *Booking ID:* ${bId}
👤 *Primary Rider:* ${customerName}
📱 *Phone:* ${customerPhone}
🪪 *License No:* ${licenseNumber || 'Will show original at desk'}
🏍️ *Vehicle:* ${vehicle}
⏱️ *Signed At:* ${signedTimestamp || 'Just now'}
✍️ *Mode:* ${signingMode === 'digital' ? 'Digitally Signed Online' : 'Counter-Sign at Hub'}
==========================================
✅ I confirm that I am at least 18 years old, possess a valid Indian Driving License, agree to wear helmets, follow the ₹150 late-fee clause, and abide by the vehicle safety policies of VroomMate Rides (Opp. Bharat Petroleum, Chota Gamharia).`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isOpen) return null;

  const savedBookings = getSavedBookings();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div 
        className="w-full max-w-3xl bg-[#121721] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rental-agreement-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0d1117] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39ff88]/10 border border-[#39ff88]/30 flex items-center justify-center text-[#39ff88]">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h2 id="rental-agreement-title" className="font-display font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                Self-Drive Rental Agreement &amp; Terms
              </h2>
              <p className="text-xs text-slate-400">
                Official terms of service for {BUSINESS_CONFIG.name} · Chota Gamharia Hub
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Booking Context Banner */}
          {selectedBooking ? (
            <div className="bg-[#18202f] border border-[#2b3952] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#39ff88] bg-[#39ff88]/10 px-2 py-0.5 rounded border border-[#39ff88]/30">
                    {selectedBooking.id}
                  </span>
                  <span className="font-display font-bold text-white text-sm">
                    {selectedBooking.vehicleName}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {selectedBooking.pickupDate} ({selectedBooking.pickupTime})
                  </span>
                  <span>·</span>
                  <span>{selectedBooking.duration} {selectedBooking.rentalType === 'daily' ? 'Days' : 'Hours'}</span>
                  <span>·</span>
                  <span>Deposit: <strong className="text-white">{formatINR(selectedBooking.securityDeposit)}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Estimated Total</div>
                <div className="font-display font-black text-lg text-[#ff7a1a]">
                  {formatINR(selectedBooking.totalAmount)}
                </div>
              </div>
            </div>
          ) : savedBookings.length > 0 ? (
            <div className="bg-[#18202f] border border-[#2b3952] rounded-xl p-4 space-y-2">
              <label htmlFor="booking-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#39ff88]" />
                Select Existing Booking Record (Optional):
              </label>
              <select
                id="booking-select"
                defaultValue=""
                onChange={(e) => {
                  const b = savedBookings.find((item: Booking) => item.id === e.target.value);
                  if (b) {
                    setSelectedBooking(b);
                    setCustomerName(b.customerName);
                    setCustomerPhone(b.customerPhone);
                  }
                }}
                className="w-full bg-[#10141d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#39ff88]"
              >
                <option value="">General Standard Rental Agreement</option>
                {savedBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.vehicleName} ({b.customerName})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Legal Agreement Sections */}
          <div className="bg-[#0e131c] border border-white/10 rounded-xl p-4 sm:p-5 space-y-4 max-h-60 sm:max-h-72 overflow-y-auto text-xs leading-relaxed text-slate-300 divide-y divide-white/5">
            <div className="pb-3 space-y-1.5">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-[#39ff88]">
                1. Eligibility &amp; Identity Verification
              </h3>
              <p>
                The Hirer (Rider) affirms being at least 18 years of age and in possession of a valid, unexpired Indian Driving License (Two-Wheeler with Gear or Gearless). Original ID (Aadhaar Card / Voter ID) and Driving License must be produced physically or via WhatsApp before keys handover.
              </p>
            </div>

            <div className="py-3 space-y-1.5">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-[#39ff88]">
                2. Non-Transferability &amp; Lawful Use
              </h3>
              <p>
                The vehicle is leased exclusively to the designated Hirer. Sub-leasing, lending, or letting unauthorized third parties, minors, or unlicensed individuals ride the vehicle is strictly prohibited and terminates the contract immediately with forfeiture of security deposit.
              </p>
            </div>

            <div className="py-3 space-y-1.5">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-[#39ff88]">
                3. Mandatory Helmet, Speed &amp; Traffic Compliance
              </h3>
              <p>
                Rider and pillion must wear BIS/ISI certified helmets at all times. VroomMate provides 1 complimentary sanitized helmet with each ride. Maximum city speed limit is 40–50 km/h; expressway max 60 km/h. Any e-challans, traffic violations, or speeding penalties during the rental tenure are the sole liability of the Hirer.
              </p>
            </div>

            <div className="py-3 space-y-1.5">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-[#39ff88]">
                4. Fuel &amp; Mileage Policy
              </h3>
              <p>
                The vehicle is provided with a standard fuel level and must be returned with an equivalent level. Free daily mileage is capped at 150 km/day. Additional running is billed at standard nominal rates (₹3 to ₹5 per km).
              </p>
            </div>

            <div className="py-3 space-y-1.5">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-[#ff7a1a]">
                5. Scheduled Return &amp; Late Fee Penalty
              </h3>
              <p>
                Vehicle must be returned to the Gamharia Hub (Opp. Bharat Petroleum) at or before the designated return timestamp. An unannounced delay incurs a flat fine of <strong className="text-white">₹150</strong> plus applicable hourly rental tariffs.
              </p>
            </div>

            <div className="pt-3 space-y-1.5">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider text-[#39ff88]">
                6. Security Deposit &amp; Damage Inspection
              </h3>
              <p>
                The security deposit is 100% refundable upon vehicle return inspection. In case of mechanical abuse, accidental scratches, or broken parts, repair deductions will occur at transparent authorized service center rates.
              </p>
            </div>
          </div>

          {/* Customer Rider Info Form */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="customer-name-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name of Rider *
              </label>
              <input
                id="customer-name-input"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isSigned}
                className="w-full bg-[#18202f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#39ff88]"
              />
            </div>

            <div>
              <label htmlFor="customer-phone-input" className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Number *
              </label>
              <input
                id="customer-phone-input"
                type="tel"
                placeholder="10-digit Mobile No."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={isSigned}
                className="w-full bg-[#18202f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#39ff88]"
              />
            </div>

            <div>
              <label htmlFor="license-number-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Driving License Number
              </label>
              <input
                id="license-number-input"
                type="text"
                placeholder="JH05..."
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                disabled={isSigned}
                className="w-full bg-[#18202f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#39ff88]"
              />
            </div>
          </div>

          {/* Signing Mode Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Execution / Signing Option:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSigningMode('digital')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    signingMode === 'digital'
                      ? 'bg-[#39ff88] text-[#0d1117] font-bold'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  Digital E-Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSigningMode('office')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    signingMode === 'office'
                      ? 'bg-[#ff7a1a] text-[#0d1117] font-bold'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  Sign at Desk / Handover
                </button>
              </div>
            </div>

            {signingMode === 'digital' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Draw your signature in the box below using finger or mouse:</span>
                  {!isSigned && hasDrawnSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
                <div className="relative border-2 border-dashed border-white/20 rounded-xl overflow-hidden bg-[#0a0e14]">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={130}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[120px] touch-none cursor-crosshair block"
                  />
                  {!hasDrawnSignature && !isSigned && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 text-xs">
                      ✍️ Sign here with mouse or touch
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#18202f] border border-white/10 rounded-xl p-4 flex items-center gap-3 text-xs text-slate-300">
                <UserCheck className="w-5 h-5 text-[#ff7a1a] shrink-0" />
                <div>
                  <div className="font-bold text-white">Physical Handover Verification</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    You can inspect the vehicle, check fuel level, and sign the printed agreement counterpart directly at the VroomMate Desk (Opp. Bharat Petroleum, Gamharia).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className="space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isSigned}
                className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#39ff88] focus:ring-[#39ff88] accent-[#39ff88]"
              />
              <span className="text-xs text-slate-300">
                I have read, understood, and accept all the terms of the{' '}
                <strong className="text-white">VroomMate Self-Drive Rental Agreement</strong>. I certify that all details provided are accurate and that I will abide by traffic laws and safe vehicle handling norms.
              </span>
            </label>
          </div>

          {/* Signed Status Banner */}
          {isSigned && (
            <div className="bg-[#39ff88]/10 border border-[#39ff88]/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#39ff88] shrink-0" />
                <div>
                  <div className="font-bold text-[#39ff88]">Agreement Recorded Successfully!</div>
                  <div className="text-[11px] text-slate-400">
                    Ref Code: <span className="font-mono text-white">{agreementRefId}</span> · Signed: {signedTimestamp}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="px-3.5 py-1.5 rounded-lg bg-[#39ff88] text-[#0d1117] font-bold text-xs flex items-center gap-1.5 hover:bg-[#4dff93] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Send Copy on WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0d1117] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintAgreement}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Terms</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>

            {!isSigned ? (
              <button
                type="button"
                onClick={handleSignAgreement}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#39ff88] text-[#0d1117] hover:bg-[#4dff93] transition-all flex items-center gap-2 shadow-lg shadow-[#39ff88]/20"
              >
                <FileSignature className="w-4 h-4" />
                <span>Accept &amp; Confirm Agreement</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#39ff88]" />
                <span>Done</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
