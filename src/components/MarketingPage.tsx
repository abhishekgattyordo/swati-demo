/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Logo from "./Logo";
import {
  Activity,
  HeartPulse,
  Clock,
  Sparkles,
  Calculator,
  TrendingUp,
  ShieldCheck,
  Bed,
  Mic,
  FileText,
  Pill,
  FlaskConical,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Video,
  UserCheck,
  Award,
  Users,
  ShieldAlert,
  Coins,
  Volume2,
  RefreshCw
} from "lucide-react";
import { Department, StaffRole } from "../types";

interface MarketingProps {
  onLaunchPortal: (role: StaffRole) => void;
  onBookAppointment: (appointmentData: any) => Promise<boolean>;
  activeAppointmentsCount: number;
}

export default function MarketingPage({
  onLaunchPortal,
  onBookAppointment,
  activeAppointmentsCount
}: MarketingProps) {
  // ROI state calculations
  const [beds, setBeds] = useState(150);
  const [dailyPatients, setDailyPatients] = useState(350);
  const [chartHours, setChartHours] = useState(3.5);

  // ROI calculations
  const weeklyHoursSaved = Math.round(chartHours * 0.7 * 5 * (beds / 10)); // 70% reduction in charting times
  const annualSavingsDollars = Math.round(weeklyHoursSaved * 52 * 45 + (beds * 1800)); // calculated in rupees/dollars scale
  const bedTurnaroundIncrease = Math.round(beds * 0.14); // 14% efficiency boost

  // Appointment Form state
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState("30");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientBloodType, setPatientBloodType] = useState("O+");
  const [department, setDepartment] = useState(Department.GENERAL_MEDICINE);
  const [doctorName, setDoctorName] = useState("Dr. Ananya Goel");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:30 AM");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"Physical" | "Teleconsultation">("Teleconsultation");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<any>(null);

  // Voice-Based Rounds demo states
  const [voiceRoundsInput, setVoiceRoundsInput] = useState("Patient stable. Continue antibiotics. Discharge tomorrow.");
  const [voiceRoundsOutput, setVoiceRoundsOutput] = useState<any>({
    progressNotes: "Patient clinically stable with normal physical exam. General systemic symptoms resolved. Vitals stable.",
    treatmentPlans: "Continue current dosage of antibiotics. Initiate formal discharge protocols.",
    nursingInstructions: "Prepare discharge planning summary. Administer antibiotics as scheduled, monitor vitals Q8h."
  });
  const [isVoiceRoundsAnalyzing, setIsVoiceRoundsAnalyzing] = useState(false);

  const VOICE_ROUNDS_PRESETS = [
    {
      title: "Routine Discharge",
      transcript: "Patient stable. Continue antibiotics. Discharge tomorrow.",
      output: {
        progressNotes: "Patient clinically stable with normal physical exam. General systemic symptoms resolved. Vitals stable.",
        treatmentPlans: "Continue current dosage of antibiotics. Initiate formal discharge protocols.",
        nursingInstructions: "Prepare discharge planning summary. Administer antibiotics as scheduled, monitor vitals Q8h."
      }
    },
    {
      title: "Overnight Fever",
      transcript: "Patient spiked a fever of 101 overnight. Hold discharge, get a repeat CBC, and start IV fluids.",
      output: {
        progressNotes: "Patient experienced overnight spike in temperature to 101°F. Guarded clinical prognosis.",
        treatmentPlans: "Postpone discharge. Order repeat Complete Blood Count (CBC) STAT. Initiate IV hydration support.",
        nursingInstructions: "Hold active discharge planning. Check temperature Q4h. Start secondary continuous IV drip line. Notify physician with CBC results."
      }
    },
    {
      title: "Lower Leg Pain",
      transcript: "Complaining of deep pain in right lower leg. Hold anticoagulants and order an urgent Doppler ultrasound.",
      output: {
        progressNotes: "Patient exhibits new onset of deep, localized pain in right lower extremity. Risk of deep vein thrombosis (DVT).",
        treatmentPlans: "Immediately hold all anticoagulant therapies. Request urgent bedside venous Doppler ultrasound of the lower right extremity.",
        nursingInstructions: "Withhold scheduled blood thinners. Keep the right lower limb elevated. Prepare patient for urgent bedside ultrasound transport."
      }
    }
  ];

  const handleSimulateVoiceRounds = (scen: any) => {
    setIsVoiceRoundsAnalyzing(true);
    setVoiceRoundsInput(scen.transcript);
    setTimeout(() => {
      setVoiceRoundsOutput(scen.output);
      setIsVoiceRoundsAnalyzing(false);
    }, 600);
  };

  const getDoctorForDept = (dept: Department) => {
    switch (dept) {
      case Department.CARDIOLOGY:
        return "Dr. Vivek Murthy";
      case Department.PEDIATRICS:
        return "Dr. Sarah D'Souza";
      case Department.ORTHOPEDICS:
        return "Dr. Dev Anand";
      case Department.EMERGENCY:
        return "Dr. Vikram Seth (ER Supervisor)";
      default:
        return "Dr. Ananya Goel";
    }
  };

  const handleDeptChange = (deptStr: string) => {
    const dept = deptStr as Department;
    setDepartment(dept);
    setDoctorName(getDoctorForDept(dept));
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientEmail || !patientPhone || !date || !reason) {
      alert("Please fill in all mandatory fields surrounding your medical booking.");
      return;
    }

    setIsSubmitting(true);
    const appointmentPayload = {
      patientName,
      patientEmail,
      patientPhone,
      patientAge,
      patientGender,
      patientBloodType,
      department,
      doctorName,
      date,
      time,
      reason,
      mode
    };

    try {
      const success = await onBookAppointment(appointmentPayload);
      if (success) {
        setBookingSuccess(true);
        setBookedDetails(appointmentPayload);
        // Clear inputs
        setPatientName("");
        setPatientEmail("");
        setPatientPhone("");
        setReason("");
        setDate("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen selection:bg-teal-600 selection:text-white font-sans antialiased text-slate-800 pb-12">
      {/* HEADER NAVIGATION */}
     <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
      <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How It Works</a>
          <a href="#roi-estimator" className="hover:text-teal-600 transition-colors">ROI Estimator</a>
          <a href="#patient-care" className="hover:text-teal-600 transition-colors">Patient Care</a>
          <a href="#book-appointment" className="hover:text-teal-600 transition-colors">Admin Scheduler</a>
        </nav>
        
        {/* Separated Launcher Actions */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
          <span className="hidden sm:inline text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-3 pr-1">Enter Portal:</span>
          <button 
            onClick={() => onLaunchPortal(StaffRole.DOCTOR)}
            className="bg-indigo-650 bg-indigo-600 hover:bg-slate-900 border border-indigo-200 text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded-full cursor-pointer transition-all shadow-md"
          >
            🩺 Doctor Portal
          </button>
          <button 
            onClick={() => onLaunchPortal(StaffRole.NURSE)}
            className="bg-rose-600 hover:bg-rose-700 border border-rose-200 text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded-full cursor-pointer transition-all shadow-md"
          >
            📋 Nurse Portal
          </button>
          <button 
            onClick={() => onLaunchPortal(StaffRole.PATIENT)}
            className="bg-teal-600 hover:bg-teal-700 border border-teal-200 text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded-full cursor-pointer transition-all shadow-md"
          >
            👤 Patient Portal
          </button>
        </div>
      </header>

      {/* MAIN BENTO GRID */}
      <main className="max-w-7xl mx-auto px-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* HERO CARD (col-span-2 row-span-2) */}
          <div className="md:col-span-2 md:row-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
                Unified Medical Hub
              </span>
              <h1 className="text-3xl md:text-4.5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-5">
                Swasti.ai is a modern AI-powered hospital management system that connects all hospital departments in one platform.
              </h1>
              
              {/* Core Benefits Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm shrink-0 mt-0.5 border border-teal-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Less paperwork</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Ambient transcription cuts record times</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm shrink-0 mt-0.5 border border-teal-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Faster workflows</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Instant triage and direct bed allocations</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm shrink-0 mt-0.5 border border-teal-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Better patient care</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Translate complex reports to conversational audio</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm shrink-0 mt-0.5 border border-teal-105">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">More time for patients</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Freeing doctors from heavy manual notes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <a
                href="#book-appointment"
                className="w-full sm:w-auto text-center bg-teal-600 text-white font-extrabold text-[11.5px] uppercase tracking-wider px-6 py-3.5 rounded-full hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/10 active:scale-[0.99]"
              >
                🎯 Schedule Demo
              </a>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto text-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[11.5px] uppercase tracking-wider px-6 py-3.5 rounded-full transition-colors active:scale-[0.99] flex items-center justify-center gap-1.5"
              >
                Explore Features <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100" className="object-cover w-full h-full" alt="DR" referrerPolicy="no-referrer" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100" className="object-cover w-full h-full" alt="DR" referrerPolicy="no-referrer" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=100" className="object-cover w-full h-full" alt="DR" referrerPolicy="no-referrer" />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Trusted by 140+ Medical Centers</span>
            </div>
          </div>

          {/* AI SCRIBING CARD (col-span-1) */}
          <div 
            onClick={() => onLaunchPortal(StaffRole.DOCTOR)}
            className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-lg shadow-indigo-600/10 min-h-[250px] group hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-indigo-100" />
              </div>
              <span className="text-[10px] font-extrabold bg-white/20 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">Launch</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-200 block mb-1">Ambient Voice</span>
              <h3 className="font-extrabold text-xl mb-2">Doctor AI Scribing</h3>
              <p className="text-indigo-100/80 text-xs sm:text-sm leading-relaxed">
                Listens to physician-patient dialogues and registers medical-grade SOAP charts automatically.
              </p>
            </div>
          </div>

          {/* EMERGENCY CARD (col-span-1) */}
          <div 
            onClick={() => onLaunchPortal(StaffRole.NURSE)}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-200/80 flex flex-col justify-between min-h-[250px] group hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full uppercase tracking-wider">Launch</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-red-500 block mb-1">Ambulance & Ward</span>
              <h3 className="font-extrabold text-[19px] text-slate-900 mb-2">Emergency ER Triage</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                Vitals evaluation loops matching symptom severity checks to instant ward priority ranks.
              </p>
            </div>
          </div>

          {/* ROI STATS REVENUE RECUPERATE CARD (col-span-1 row-span-2) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl min-h-[440px]">
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Efficiency Metrics</span>
              <div className="mt-8 space-y-6">
                <div>
                  <div className="text-4.5xl font-black text-white tracking-tight">38%</div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-1">Reduction in Admin Work</p>
                </div>
                <div>
                  <div className="text-4.5xl font-black text-teal-400 tracking-tight">2.4x</div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-1">Faster Billing Cycle</p>
                </div>
                <div>
                  <div className="text-4.5xl font-black text-white tracking-tight">15%</div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-1">Lower Operating Costs</p>
                </div>
              </div>
            </div>
            <a href="#roi-estimator" className="text-xs text-teal-400 font-extrabold tracking-widest uppercase flex items-center gap-1 hover:gap-2 transition-all mt-4">
              Analyze Savings ROI →
            </a>
          </div>

          {/* UNIFIED MODULES / PHARMACY & LABS CARD */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/80 flex flex-col justify-between min-h-[220px]">
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 block mb-1">Prescription Loops</span>
              <h3 className="font-extrabold text-[19px] text-slate-900 mb-2">Unified Modules</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                Integrated lab workflows and safe pharmacies synced across files registries.
              </p>
            </div>
          </div>

          {/* TELEMEDICINE / PATIENT PORTAL CARD (col-span-2) */}
          <div className="md:col-span-2 bg-teal-50 rounded-[2.5rem] p-8 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-[65%]">
              <span className="text-[10px] uppercase tracking-widest font-bold text-teal-700 block mb-1">Virtual Gateway</span>
              <h3 className="font-bold text-teal-900 text-2.5xl mb-2">Empower Patients</h3>
              <p className="text-teal-700/80 text-xs sm:text-sm mb-4 leading-relaxed font-medium">
                Sleek teleconsultation sessions, direct booking, and AI-assisted health records translatable instant in plain language.
              </p>
              <button 
                onClick={() => onLaunchPortal(StaffRole.PATIENT)}
                className="text-teal-800 font-extrabold text-xs uppercase tracking-wider underline underline-offset-4 hover:text-teal-950 cursor-pointer"
              >
                Launch Patient Workspace →
              </button>
            </div>
            <div className="w-28 h-28 bg-white rounded-3xl shadow-inner border border-teal-200/50 flex flex-col items-center justify-center p-4 relative shrink-0">
              <div className="w-12 h-1.5 bg-teal-200 rounded-full mb-3" />
              <div className="w-8 h-1 bg-teal-100 rounded-full mb-3" />
              <div className="w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center text-white text-[8px] animate-pulse absolute bottom-4" />
            </div>
          </div>

        </div>
      </main>

      {/* SECTION divider with visual credits */}
      <section className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">ISO 27001 SECURE</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Threat Safeguard</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">HL7 FHIR SYNCED</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Universal Data Interoperable</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">HIPAA COMPLIANT</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Protected Patient Integrity</p>
          </div>
        </div>
      </section>

      {/* SECTION: CONVERSION PIPELINE STEPS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-teal-600">The Clinical Pipeline</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Integrated Patient & Physician Lifecycle
            </h2>
            <p className="mt-3 text-slate-500 text-sm leading-relaxed">
              From the instant a patient schedules, our background medical intelligence engines run silently inside to protect diagnostics safety and recovery schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-[28px] left-[12%] right-[12%] h-[1px] bg-slate-200 z-0 border-t border-dashed" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-teal-500 rounded-full text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-teal-500/10">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-4">Step 1: Online Booking</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-extrabold">Instant EHR Auto-Registry</p>
              <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                Patients book online and enter symptoms, which instantly registers them into the active EHR. Zero receptionist or manual intake desk paperwork required.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-indigo-500 rounded-full text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-indigo-500/10">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-4">Ambient Consultation Scribe</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-extrabold">Clinician Ward</p>
              <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                Doctor Records dialogue naturally. Speech models automatically fill complete EMR SOAP charts in 70s.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-teal-600 rounded-full text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-teal-600/10">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-4">Automated Pharmacy Guard</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-extrabold">Lab Workorders</p>
              <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                AI cross-checks historical allergy lists and clinical contraindications to keep prescriptions 100% error-free.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-slate-900 rounded-full text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-slate-900/10">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-4">Patient Release Speech</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-extrabold">Discharge synthesis</p>
              <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                Discharge advice synthesized into conversational audio summaries for the patient's mobile device.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURE SPOTLIGHT: AMBIENT AI SCRIBING */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-indigo-900/40 flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left Block: Description, Problem vs Solution */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-500/20">
              <Mic className="w-3.5 h-3.5 text-indigo-450" /> Feature Spotlight
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 select-none">
              Ambient AI Scribing
            </h2>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-8 font-medium">
              This is one of the most powerful features. Swasti.ai uses advanced ambient speech models to process and document clinical consultations securely.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* The Current Problem */}
              <div className="bg-slate-950/40 border border-red-500/20 rounded-2xl p-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 block mb-3">Current Problem</span>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Doctors spend <span className="text-red-400 font-bold">30–50%</span> of consultation time:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Typing medical notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Updating records & archives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Writing prescriptions manually</span>
                  </li>
                </ul>
                <p className="text-[11px] text-slate-400 mt-3 italic font-medium">
                  ...instead of focusing entirely on the patient.
                </p>
              </div>

              {/* Swasti.ai Solution */}
              <div className="bg-teal-950/30 border border-teal-500/20 rounded-2xl p-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block mb-3">Swasti.ai Solution</span>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  The AI listens to the consultation conversation and automatically translates natural human exchange directly into structured clinical records.
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-teal-300">Hands-Free Documentation</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Block: Live Demonstration Box / Simulation */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-950/65 rounded-3xl border border-slate-800 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
              
              {/* Interactive Audio/Recorder Header Simulation */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-300">Consultation Live Transcript</p>
                    <p className="text-[9px] text-slate-500">Secure Audio Session #2490</p>
                  </div>
                </div>
                <div className="flex bg-slate-900 border border-slate-800 px-3 py-1 rounded-full items-center gap-1">
                  <span className="text-[9px] font-bold text-indigo-400 tracking-wider">SECURE LINK ACTIVED</span>
                </div>
              </div>

              {/* Dialog Simulation bubbles */}
              <div className="flex flex-col gap-4 text-xs font-medium">
                {/* Speaker 1: Doctor */}
                <div className="flex flex-col gap-1 items-start max-w-[85%]">
                  <span className="text-[9px] uppercase font-bold text-indigo-400">Doctor</span>
                  <div className="bg-indigo-950/60 border border-indigo-900/50 text-indigo-100 p-3 rounded-2xl rounded-tl-none">
                    "How long have you had the fever?"
                  </div>
                </div>
                {/* Speaker 2: Patient */}
                <div className="flex flex-col gap-1 items-end max-w-[85%] self-end">
                  <span className="text-[9px] uppercase font-bold text-emerald-400">Patient</span>
                  <div className="bg-slate-900 border border-slate-850 border-slate-800 text-slate-200 p-3 rounded-2xl rounded-tr-none">
                    "Three days."
                  </div>
                </div>
                {/* Speaker 3: Doctor */}
                <div className="flex flex-col gap-1 items-start max-w-[85%]">
                  <span className="text-[9px] uppercase font-bold text-indigo-450 text-indigo-400">Doctor</span>
                  <div className="bg-indigo-950/60 border border-indigo-900/50 text-indigo-100 p-3 rounded-2xl rounded-tl-none">
                    "Any cough?"
                  </div>
                </div>
                {/* Speaker 1: Patient */}
                <div className="flex flex-col gap-1 items-end max-w-[85%] self-end">
                  <span className="text-[9px] uppercase font-bold text-emerald-400">Patient</span>
                  <div className="bg-slate-900 border border-slate-850 border-slate-800 text-slate-200 p-3 rounded-2xl rounded-tr-none">
                    "Yes."
                  </div>
                </div>
              </div>

              {/* Result Generation Block */}
              <div className="border-t border-slate-800 pt-5 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-md border border-teal-500/20">
                    AI Auto-Generated Note
                  </span>
                  <div className="h-[1px] bg-slate-800 grow" />
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Chief Complaint:</span>
                    <p className="text-slate-200 font-medium mt-0.5">Fever for 3 days with cough.</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Assessment:</span>
                    <p className="text-slate-200 font-medium mt-0.5">Likely upper respiratory infection.</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">Plan:</span>
                    <p className="text-slate-200 font-medium mt-0.5">CBC, Chest X-Ray, Antibiotics.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURE SPOTLIGHT 2: INTELLIGENT PRESCRIPTION MANAGEMENT */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200/80 flex flex-col lg:flex-row-reverse gap-12 items-center">
          
          {/* Left Block (when rendered right): Description, Problem vs Solution */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-amber-200">
              <Pill className="w-3.5 h-3.5 text-amber-600" /> Clinical Safety Engine
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tight">
              Intelligent Prescription Management
            </h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8">
              Prevent medication errors dynamically. Swasti.ai automatically audits every prescription inside our pharmacy core prior to submission, cross-referencing patient history, active EHR notes, and lab telemetry.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* The Current Problem */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 block mb-3">Current Problem</span>
                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  Medication errors are common because:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-500 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Doctors may overlook drug allergies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Drug interactions can be easily missed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Dosages may need immediate adjustments</span>
                  </li>
                </ul>
              </div>

              {/* Swasti.ai Solution */}
              <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-750 text-amber-800 block mb-3">Swasti.ai Solution</span>
                <p className="text-xs text-slate-700 leading-relaxed font-bold mb-3">
                  Before a prescription is finalized, the AI checks:
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-amber-500">✔</span> Allergies
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-amber-500">✔</span> Medications
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-amber-500">✔</span> Lab results
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-amber-500">✔</span> Patient age
                  </div>
                  <div className="flex items-center gap-1 text-[11px]" title="Estimated Glomerular Filtration Rate">
                    <span className="text-amber-500">✔</span> Kidney func.
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-amber-500">✔</span> Liver func.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Block: Interactive Warning Simulation */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col gap-5 shadow-inner">
              
              {/* Simulated Prescription Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="text-left">
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Patient Chart Name</p>
                    <p className="text-xs font-black text-slate-800">Robert Chen (Age 68 • h/o CKD Stage 3)</p>
                  </div>
                  <span className="text-[9px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 uppercase">Interactive simulation</span>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prescribed Medication</label>
                    <div className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl font-bold text-slate-800 flex justify-between items-center shadow-inner">
                      <span>Drug A (Sildenafil citrate) - 50mg</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">Standard Dose</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Concomitant Therapy</label>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-50/50 border border-slate-200/40 px-3 py-1.5 rounded-lg">
                      <span className="text-rose-500 font-bold">•</span> Nitroglycerin sublingual (Nitrate compound)
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Warning Box */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-rose-800">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black">⚠️</span>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide">AI Prescription Conflict warn</p>
                    <p className="text-[10px] text-rose-600 font-bold mt-0.5">Critical Redundant/Interference detected</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-rose-200/55 pt-3 text-xs text-rose-950 font-medium leading-relaxed">
                  <div className="flex gap-2">
                    <span className="text-rose-500">•</span>
                    <div>
                      <strong className="text-rose-900">Drug Interaction Hazard:</strong> Sildenafil (Drug A) and Nitroglycerin co-administration causes a synergic, severe drop in blood pressure. <span className="underline">Contraindicated</span>.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-rose-500">•</span>
                    <div>
                      <strong className="text-rose-900">Documented Drug Allergy:</strong> Patient has a recorded active allergy to <span className="underline">Sulfonamides</span>. Sildenafil core formulation contains sulfur links triggering acute reactions.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-rose-500">•</span>
                    <div>
                      <strong className="text-rose-950">Kidney Function Adjustment Required:</strong> eGFR is impaired at 41 ml/min. Clearance is slow; standard starting dosage must be adjusted downward to <strong className="text-rose-900">25mg</strong>.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-extrabold uppercase tracking-wide rounded-lg cursor-pointer hover:bg-slate-50 transition active:scale-[0.98]">
                    Ignore (Override)
                  </button>
                  <button className="px-3.5 py-1.5 bg-rose-600 border border-rose-700 text-white text-[10px] font-extrabold uppercase tracking-wide rounded-lg cursor-pointer hover:bg-rose-700 transition active:scale-[0.98] shadow-md shadow-rose-600/10">
                    Fix: Substitute Drug
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURE SPOTLIGHT 3: VOICE-BASED CLINICAL ROUNDS */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-teal-900/40 flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left Block: Description, Current Problem vs Swasti.ai Solution */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/15 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-teal-500/20">
              <Volume2 className="w-3.5 h-3.5 text-teal-450" /> Voice Rounds Accelerator
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 select-none tracking-tight">
              Voice-Based Hospital Rounds
            </h2>
            <p className="text-teal-100/90 text-sm md:text-base leading-relaxed mb-8">
              Eliminate double documentation during daily ward routines. Swasti.ai lets physicians walk their hospital rounds, verbally state updates, and let AI instantly parse and push structured data into patient records.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* The Current Problem */}
              <div className="bg-slate-950/40 border border-red-500/15 rounded-2xl p-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 block mb-3">Current Problem</span>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  During inpatient ward rounds:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-450">
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500">•</span>
                    <span>Physicians note details on paper charts</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500">•</span>
                    <span>Manually re-enter data into EHRs hours later</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500">•</span>
                    <span>Nursing directions get delayed or lost</span>
                  </li>
                </ul>
              </div>

              {/* Swasti.ai Solution */}
              <div className="bg-teal-950/20 border border-teal-500/20 rounded-2xl p-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block mb-3">Swasti.ai Solution</span>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  The clinician simply speaks natural phrases like:
                </p>
                <p className="text-xs font-mono bg-teal-950/50 border border-teal-900 text-teal-300 px-2.5 py-1.5 rounded-lg my-2 italic">
                  "Patient stable. Continue antibiotics. Discharge tomorrow."
                </p>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  AI instantly updates progress logs, treatment grids, and nursing lists simultaneously.
                </p>
              </div>

            </div>

            {/* Benefits list */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-800 pt-6 text-center">
              <div>
                <p className="text-lg md:text-xl font-extrabold text-teal-400">3x Faster</p>
                <p className="text-[10px] uppercase font-bold text-slate-450 mt-1 font-extrabold">Ward Rounds</p>
              </div>
              <div>
                <p className="text-lg md:text-xl font-extrabold text-teal-400">Zero Error</p>
                <p className="text-[10px] uppercase font-bold text-slate-450 mt-1 font-extrabold">Direct Sync</p>
              </div>
              <div>
                <p className="text-lg md:text-xl font-extrabold text-teal-400">-50%</p>
                <p className="text-[10px] uppercase font-bold text-slate-450 mt-1 font-extrabold">Clerical Burden</p>
              </div>
            </div>
          </div>

          {/* Right Block: Live Demonstration Box */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-950/70 rounded-3xl border border-slate-800 p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl animate-pulse" />
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3 font-semibold text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse animate-duration-1000" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-300">Clinician Voice Command</p>
                    <p className="text-[9px] text-slate-500">Hospital Ward rounds • ID: #W-109</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-teal-950 border border-teal-800 px-2.5 py-1 rounded text-teal-300 uppercase">Interactive demo</span>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Ward Round Dictation Preset:</p>
                <div className="flex flex-wrap gap-2">
                  {VOICE_ROUNDS_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSimulateVoiceRounds(p)}
                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer select-none ${
                        voiceRoundsInput === p.transcript
                          ? "bg-teal-600 text-white border-teal-500 shadow-sm font-bold"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:text-slate-150"
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dictated text box */}
              <div>
                <label className="text-[9px] font-black tracking-wider text-slate-500 uppercase block mb-1">Doctor's Dictated Spoken Audio:</label>
                <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-200 italic font-mono leading-relaxed min-h-[50px] flex items-center justify-between">
                  <span>"{voiceRoundsInput}"</span>
                  <Volume2 className="w-4 h-4 text-teal-500 shrink-0 select-none ml-2" />
                </div>
              </div>

              {/* AI Auto structured results output */}
              <div className="space-y-3.5 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-md border border-teal-500/25">
                    Structured Clinical Outcome Streams
                  </span>
                  <div className="h-[1px] bg-slate-800 grow" />
                </div>

                {isVoiceRoundsAnalyzing ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 text-teal-500 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-300">Voice Transcriber Structuring updates...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Progress Notes */}
                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-teal-400 block mb-1">📝 PROGRESS NOTES</span>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{voiceRoundsOutput.progressNotes}</p>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-500 mt-2 block">✓ EHR Updated</span>
                    </div>

                    {/* Treatment plan */}
                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-teal-400 block mb-1">% TREATMENT PLAN</span>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{voiceRoundsOutput.treatmentPlans}</p>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-500 mt-2 block">✓ Records Synced</span>
                    </div>

                    {/* Nursing instructions */}
                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-teal-400 block mb-1">📋 NURSING WORKLIST</span>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{voiceRoundsOutput.nursingInstructions}</p>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-500 mt-2 block">✓ Nursing Notified</span>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION: DYNAMIC ROI CALCULATOR */}
      <section id="roi-estimator" className="max-w-7xl mx-auto px-6 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Explanation Card (col-span-5) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-lime-50 text-lime-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-6 border border-lime-200">
                <Calculator className="w-3.5 h-3.5 text-lime-600" />
                Capital Efficiency
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                Quantify Swasti.ai Financial Recovery
              </h2>
              <p className="mt-4 text-slate-500 text-xs sm:text-sm leading-relaxed">
                Regulatory compliance charts consumes over 40% of standard physician shifts, creating doctor burnout, discharge backlogs, and patient wait spikes.
              </p>
              <p className="mt-3 text-slate-500 text-xs sm:text-sm leading-relaxed">
                Calibrate the controls on the right panel to represent your healthcare institution. Estimate live savings saved by ambient automation.
              </p>
            </div>

            <div className="mt-8 p-5 bg-teal-50/50 rounded-2xl border border-teal-100 flex gap-4">
              <Activity className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-teal-900 uppercase tracking-widest">Inpatient Turnover catalyst</h4>
                <p className="text-xs text-teal-700/90 mt-1 leading-relaxed">
                  Real-time bed telemetry speeds up ward flow execution, maximizing inpatient capacity and overall hospital diagnostic ROI.
                </p>
              </div>
            </div>
          </div>

          {/* Right Bento Estimator Sliders Card (col-span-7) */}
          <div className="lg:col-span-7 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-8 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                Institution Sizing Controls
              </h3>

              <div className="space-y-6">
                {/*beds capacity*/}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    <span>Licensed Beds Capacity</span>
                    <span className="text-teal-400 text-sm font-extrabold">{beds} Beds</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={beds}
                    onChange={(e) => setBeds(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                </div>

                {/*patient intake*/}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    <span>Daily OPD/IPD Arrivals</span>
                    <span className="text-teal-400 text-sm font-extrabold">{dailyPatients} Patients</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="2000"
                    step="20"
                    value={dailyPatients}
                    onChange={(e) => setDailyPatients(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                </div>

                {/*charting hours*/}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    <span>Average Manual EHR Charting (Daily / MD)</span>
                    <span className="text-teal-400 text-sm font-extrabold">{chartHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.5"
                    value={chartHours}
                    onChange={(e) => setChartHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Results inside Sliders card */}
            <div className="mt-10 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Clinician Hours Saved</span>
                <p className="text-xl md:text-2xl font-black text-teal-400 mt-1">{weeklyHoursSaved} hrs <span className="text-[11px] font-normal text-slate-400">/ wk</span></p>
                <span className="text-[9px] text-slate-500 block mt-1">Returned directly to patient care</span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Est. Annual Profit Recovery</span>
                <p className="text-xl md:text-2xl font-black text-white mt-1">${annualSavingsDollars.toLocaleString()}</p>
                <span className="text-[9px] text-slate-505 block mt-1 text-slate-500">Recouped clinical transcription overheads</span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Bed Turnover Boost</span>
                <p className="text-xl md:text-2xl font-black text-teal-400 mt-1">+{bedTurnaroundIncrease} Beds</p>
                <span className="text-[9px] text-slate-500 block mt-1">Optimized inpatient ward cycle</span>
              </div>

              <div className="bg-teal-900/40 p-4 rounded-2xl border border-teal-800/60">
                <span className="text-[10px] text-teal-300 font-bold uppercase tracking-widest block">Projected recoupment</span>
                <p className="text-xl md:text-2xl font-black text-lime-400 mt-1">4.5 Months</p>
                <span className="text-[9px] text-teal-400/80 block mt-1">Full software deployment breakeven</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: ADVANCED PATIENT CARE ECOSYSTEM */}
      <section id="patient-care" className="max-w-7xl mx-auto px-6 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-teal-600">Advanced Patient Care</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            How AI helps doctors and patients
          </h2>
          <p className="mt-3 text-slate-500 text-sm">
            Empower diagnostic confidence with Swasti.ai's deep clinical automation and real-time medical insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Emergency Assessment */}
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-red-200 hover:shadow-md transition-all">
            <div>
              <div className="w-11 h-11 bg-rose-50 text-rose-650 text-rose-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Emergency Assessment</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                Prioritize patient critical severity instantly to optimize overall hospital triaging and prevent crowding in trauma centers.
              </p>
            </div>
            <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 text-[10px] bg-rose-50 rounded p-0.5 shrink-0 mt-0.5">✔</span>
                <span>AI helps prioritize critical patients.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 text-[10px] bg-rose-50 rounded p-0.5 shrink-0 mt-0.5">✔</span>
                <span>Identifies high-risk cases quickly.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: AI Scribing */}
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all">
            <div>
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">AI Scribing</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                Listen securely to patient-doctor dialogue in real time and populate professional, structured EMR charts.
              </p>
            </div>
            <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 text-[10px] bg-indigo-50 rounded p-0.5 shrink-0 mt-0.5">✔</span>
                <span>AI listens to doctor-patient conversations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 text-[10px] bg-indigo-50 rounded p-0.5 shrink-0 mt-0.5">✔</span>
                <span>Automatically creates clinical notes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 text-[10px] bg-indigo-50 rounded p-0.5 shrink-0 mt-0.5">✔</span>
                <span>Doctors don't need to type everything manually.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Smart Prescriptions */}
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-amber-200 hover:shadow-md transition-all">
            <div>
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Smart Prescriptions</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                Execute cross-interaction safeguards on all medications dynamically inside our modular pharmacy check routines.
              </p>
            </div>
            <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 text-[10px] bg-amber-50 rounded p-0.5 shrink-0 mt-0.5">✔</span>
                <span>Checks allergies.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 text-[10px] bg-amber-50 rounded p-0.5 shrink-0 mt-0.5">✔</span>
                <span>Checks drug interactions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 text-[10px] bg-amber-50 rounded p-0.5 shrink-0 mt-0.5">✔</span>
                <span>Suggests safer medications and dosages.</span>
              </li>
            </ul>
          </div>

          {/* Card 4: Voice-Based Rounds & Discharge */}
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-teal-200 hover:shadow-md transition-all">
            <div>
              <div className="w-11 h-11 bg-teal-50 rounded-xl text-teal-600 flex items-center justify-center mb-6">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Voice-Based Rounds & Discharge</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                Speak naturally during clinical rounds to instantly formulate standard discharge and progression folders.
              </p>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col">
              <p className="text-xs font-bold text-slate-700 mb-2">Doctors can speak naturally.</p>
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-teal-600 mb-2">AI generates:</p>
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-teal-500">•</span>
                  <span>Progress notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-500">•</span>
                  <span>Discharge summaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-500">•</span>
                  <span>Medication instructions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-500">•</span>
                  <span>Follow-up plans</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: LIVE APPOINTMENT DIRECT BOOKING */}
      <section id="book-appointment" className="max-w-7xl mx-auto px-6 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-teal-600">Administrative Sandbox</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Book Appointment & Sync HIS Registry
          </h2>
          <p className="mt-3 text-slate-500 text-sm">
            Select a specialty department and schedule inside this live sandbox database. Your record is instantly pushed across our clinical ward panels!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Appointment Form Bento Box (col-span-8) */}
          <form 
            onSubmit={handleSubmitAppointment} 
            className="lg:col-span-8 bg-white border border-slate-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-6 flex flex-col justify-between"
          >
            {bookingSuccess && bookedDetails ? (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl text-center space-y-4 my-auto">
                <div className="w-14 h-14 bg-emerald-100 rounded-full text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-emerald-950">Appointment Registered In Database!</h4>
                  <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed max-w-md mx-auto">
                    A clinical record slot has been inserted and pushed straight to standard PostgreSQL tables. You can launch the core portal database hub to review it.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-emerald-100 text-left text-xs text-slate-600 space-y-2 max-w-md mx-auto">
                  <p><strong>Patient Name:</strong> {bookedDetails.patientName}</p>
                  <p><strong>Care Specialty:</strong> {bookedDetails.department}</p>
                  <p><strong>Assigned Doctor:</strong> {bookedDetails.doctorName}</p>
                  <p><strong>Date & Time:</strong> {bookedDetails.date} at {bookedDetails.time}</p>
                  <p><strong>Consultation Mode:</strong> {bookedDetails.mode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingSuccess(false)}
                  className="bg-emerald-800 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-emerald-950 transition-colors"
                >
                  Book New Slot
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Full Patient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 font-medium placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 99999 99999"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Demographic details for auto-registration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-teal-50/20 p-4 rounded-2xl border border-teal-100/60">
                  <div className="sm:col-span-3 pb-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                      <span>⚡ Instant Auto-Registration</span>
                      <span className="font-normal text-teal-600">(No manual intake desk paperwork required)</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wide">Age *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="125"
                      placeholder="Age"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-600 transition-all text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wide">Gender *</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-600 transition-all text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wide">Blood Group</label>
                    <select
                      value={patientBloodType}
                      onChange={(e) => setPatientBloodType(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-600 transition-all text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. patient@care.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 font-medium placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Specialist Department *</label>
                    <select
                      value={department}
                      onChange={(e) => handleDeptChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 font-medium cursor-pointer"
                    >
                      <option value={Department.GENERAL_MEDICINE}>General Medicine</option>
                      <option value={Department.CARDIOLOGY}>Cardiology Department</option>
                      <option value={Department.PEDIATRICS}>Pediatric Care Department</option>
                      <option value={Department.ORTHOPEDICS}>Orthopedics Clinic</option>
                      <option value={Department.EMERGENCY}>Emergency Medicine Intake</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Assigned clinician</label>
                    <input
                      type="text"
                      disabled
                      value={doctorName}
                      className="w-full bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Select Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 font-semibold cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Available Time Slot *</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="09:00 AM">09:00 AM (Early Morning)</option>
                      <option value="10:30 AM">10:30 AM (Morning Peak)</option>
                      <option value="11:45 AM">11:45 AM (Pre-noon)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon)</option>
                      <option value="03:30 PM">03:30 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Consultation Mode *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 text-xs text-slate-600 cursor-pointer bg-slate-50 hover:bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/80 transition-all">
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === "Teleconsultation"}
                        onChange={() => setMode("Teleconsultation")}
                        className="accent-teal-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700">Virtual (High Definition Video Call)</span>
                    </label>
                    <label className="flex items-center gap-3 text-xs text-slate-600 cursor-pointer bg-slate-50 hover:bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/80 transition-all">
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === "Physical"}
                        onChange={() => setMode("Physical")}
                        className="accent-teal-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700">Physical Visit (Clinician Ward Unit)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Active Symptoms & Concerns *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe any active symptoms, clinical concerns, or historical healthcare issues for clinical analysis..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition-all text-slate-800 font-medium placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-md shadow-teal-600/10 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Syncing Appointment details..." : "Book Appointment & Sync HIS"}
                </button>
              </>
            )}
          </form>

          {/* Guidelines Telemetry Bento box (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            
            <div className="bg-teal-50 border border-teal-100 rounded-[2.5rem] p-8 flex flex-col justify-between grow">
              <div>
                <h4 className="font-extrabold text-teal-900 text-sm flex items-center gap-2 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  Live Sandbox Sync
                </h4>
                <p className="text-xs text-teal-800/80 mt-4 leading-relaxed font-semibold">
                  Every booking immediately creates an active outpatient slot. You can toggle the primary portal interface to instantly inspect records as Doctor Goel or a patient!
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-teal-200/50">
                <p className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">Total Scheduled Appointments:</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-teal-600 tracking-tight">{activeAppointmentsCount}</span>
                  <span className="text-xs font-bold text-teal-700 uppercase">Records Live</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-teal-400">PostgreSQL Schema logs</span>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Every reservation runs dynamic insert statements to seed the backend. Structured logs comply with HIPAA privacy guidelines.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                INSERT INTO appointments (patient, mode, doctor_assigned) VALUES ('John Doe', 'Teleconsultation', 'Ananya Goel');
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER BAR */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-slate-400 font-bold gap-4">
        <div className="flex gap-6">
          <span>HIPAA COMPLIANT</span>
          <span>HL7 FHIR READY</span>
          <span>256-BIT SECURED ENGINE</span>
        </div>
        <div>© 2026 SWASTI AI MEDICAL SYSTEMS PVT LTD</div>
      </footer>
    </div>
  );
}
