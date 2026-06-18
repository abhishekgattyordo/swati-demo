/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import {
  Stethoscope,
  Activity,
  Bed,
  Pill,
  FlaskConical,
  CreditCard,
  User,
  Mic,
  Send,
  RefreshCw,
  Plus,
  AlertTriangle,
  FileText,
  CheckCircle,
  HelpCircle,
  LogOut,
  Sliders,
  DollarSign,
  TrendingUp,
  Search,
  ArrowLeft,
  XCircle,
  Volume2
} from "lucide-react";
import { StaffRole, Department, Bed as BedType, PatientRecord, Appointment, Prescription, LabOrder, Bill, ScribeSession, ChatMessage } from "../types";

interface PortalHubProps {
  onBackToWebsite: () => void;
  onRefreshStats: () => void;
  initialRole?: StaffRole;
}

export default function PortalHub({ onBackToWebsite, onRefreshStats, initialRole }: PortalHubProps) {
  // Application roles
  const [activeRole, setActiveRole] = useState<StaffRole>(initialRole || StaffRole.DOCTOR);

  useEffect(() => {
    if (initialRole) {
      setActiveRole(initialRole);
    }
  }, [initialRole]);

  // Synchronized state
  const [loading, setLoading] = useState(true);
  const [beds, setBeds] = useState<BedType[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [scribeSessions, setScribeSessions] = useState<ScribeSession[]>([]);

  // Fetch Database State
  const fetchDbState = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        setBeds(data.beds || []);
        setPatients(data.patients || []);
        setAppointments(data.appointments || []);
        setPrescriptions(data.prescriptions || []);
        setLabOrders(data.labOrders || []);
        setBills(data.bills || []);
        setScribeSessions(data.scribeSessions || []);
        onRefreshStats(); // Update appointments metrics on first-class website
      }
    } catch (e) {
      console.error("Database connection missing in server running, mapping mock local states...", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbState();
  }, [activeRole]);

  // -----------------------------------------------------------------
  // 1. DOCTOR WORKSPACE STATE & MUTATIONS
  // -----------------------------------------------------------------
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [rawDialogTranscript, setRawDialogTranscript] = useState("");
  const [scribeLoading, setScribeLoading] = useState(false);
  const [activeScribeResult, setActiveScribeResult] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Smart prescribing states
  const [doctorSubTab, setDoctorSubTab] = useState<"scribe" | "smart-prescription" | "voice-rounds">("scribe");
  const [manualRxMedicine, setManualRxMedicine] = useState("");
  const [manualRxDosage, setManualRxDosage] = useState("500mg");
  const [manualRxFrequency, setManualRxFrequency] = useState("Once daily");
  const [manualRxInstructions, setManualRxInstructions] = useState("After meals");
  const [rxChecking, setRxChecking] = useState(false);
  const [rxCheckResult, setRxCheckResult] = useState<any | null>(null);
  const [isSubmittingManualRx, setIsSubmittingManualRx] = useState(false);

  // Voice-Based Rounds states
  const [roundsDictationText, setRoundsDictationText] = useState("Patient stable. Continue antibiotics. Discharge tomorrow.");
  const [roundsParsing, setRoundsParsing] = useState(false);
  const [roundsParsingResult, setRoundsParsingResult] = useState<any | null>(null);
  const [isSavingRoundsData, setIsSavingRoundsData] = useState(false);

  // Nurse Voice-Based Rounds states
  const [nurseSubTab, setNurseSubTab] = useState<"triage" | "voice-rounds" | "discharge">("triage");
  const [nurseSelectedPatient, setNurseSelectedPatient] = useState<PatientRecord | null>(null);
  const [nurseRoundsDictationText, setNurseRoundsDictationText] = useState("Patient stable. Continue antibiotics. Discharge tomorrow.");
  const [nurseRoundsParsing, setNurseRoundsParsing] = useState(false);
  const [nurseRoundsParsingResult, setNurseRoundsParsingResult] = useState<any | null>(null);
  const [isNurseSavingRoundsData, setIsNurseSavingRoundsData] = useState(false);

  // Nurse Automated Discharge states
  const [dischargeSelectedPatient, setDischargeSelectedPatient] = useState<PatientRecord | null>(null);
  const [dischargeClinicalCourse, setDischargeClinicalCourse] = useState("Patient recovered fully from treatment with stable vitals. Pain managed and pain-free at discharge. All lab reports resolved.");
  const [dischargeResult, setDischargeResult] = useState<any | null>(null);
  const [dischargeLoading, setDischargeLoading] = useState(false);
  const [isFinishingDischarge, setIsFinishingDischarge] = useState(false);

  // Pre-configured clinic safety simulation scenarios for doctor portal quick testing
  const CLINICAL_SAFETY_DEMOS = [
    { label: "Trigger Penicillin Allergy", name: "Amoxicillin", dosage: "500mg", frequency: "Twice daily", instructions: "Avoid dairy" },
    { label: "Trigger Nitrate Interaction", name: "Sildenafil (Drug A)", dosage: "50mg", frequency: "Once daily", instructions: "Avoid physical exertion" },
    { label: "Trigger Asthma Contraindication", name: "Ibuprofen", dosage: "400mg", frequency: "Twice daily", instructions: "Take with food" },
    { label: "Trigger Beers Elderly Caution", name: "Diazepam", dosage: "5mg", frequency: "At bedtime", instructions: "Risk of sedation" }
  ];

  const WARD_ROUNDS_PRESETS = [
    {
      label: "Routine Discharge",
      title: "Routine Clear Discharge",
      transcript: "Patient stable. Continue antibiotics. Discharge tomorrow."
    },
    {
      label: "Overnight High Fever",
      title: "Overnight Temp Spike 101F",
      transcript: "Patient spiked a fever of 101 overnight. Hold discharge, get a repeat CBC, and start IV fluids."
    },
    {
      label: "Leg Pain / Thrombosis",
      title: "Deep Calf Tenderness / DVT Risk",
      transcript: "Complaining of deep pain in right lower leg. Hold anticoagulants and order an urgent Doppler ultrasound."
    }
  ];

  const handleParseVoiceRounds = async (customText?: string) => {
    if (!selectedPatient) return;
    const targetText = customText || roundsDictationText;
    if (!targetText.trim()) {
      alert("Please ensure you specify or select a dictated rounds transcribing script first.");
      return;
    }

    setRoundsParsing(true);
    setRoundsParsingResult(null);
    try {
      const res = await fetch("/api/rounds/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          voiceTranscript: targetText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRoundsParsingResult(data);
      } else {
        alert("Clinical Ward Rounds Service failed to compile transcript.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred contacting clinical rounds API server.");
    } finally {
      setRoundsParsing(false);
    }
  };

  const handleFinalizeVoiceRoundsUpdate = async () => {
    if (!selectedPatient || !roundsParsingResult) return;
    setIsSavingRoundsData(true);
    try {
      const res = await fetch(`/api/patients/${selectedPatient.id}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressNotes: roundsParsingResult.progressNotes,
          treatmentPlans: roundsParsingResult.treatmentPlans,
          nursingInstructions: roundsParsingResult.nursingInstructions,
          roundsRecordedBy: "Dr. Ananya Goel"
        })
      });

      if (res.ok) {
        alert("Successfully saved rounds update! Structured progress findings, active therapy adjustments, and nursing instructions are live in EHR.");
        setRoundsParsingResult(null);
        setRoundsDictationText("");
        onRefreshStats(); // Trigger upper statistical updates
      } else {
        alert("EHR Server declined rounds registration schema.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving ward rounds to the patient record.");
    } finally {
      setIsSavingRoundsData(false);
    }
  };

  const handleParseNurseVoiceRounds = async (customText?: string) => {
    if (!nurseSelectedPatient) {
      alert("Please select a patient under ward rounds first.");
      return;
    }
    const targetText = customText || nurseRoundsDictationText;
    if (!targetText.trim()) {
      alert("Please ensure you specify or select a dictated rounds transcribing script first.");
      return;
    }

    setNurseRoundsParsing(true);
    setNurseRoundsParsingResult(null);
    try {
      const res = await fetch("/api/rounds/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: nurseSelectedPatient.id,
          voiceTranscript: targetText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNurseRoundsParsingResult(data);
      } else {
        alert("Clinical Ward Rounds Service failed to compile transcript.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred contacting clinical rounds API server.");
    } finally {
      setNurseRoundsParsing(false);
    }
  };

  const handleFinalizeNurseVoiceRoundsUpdate = async () => {
    if (!nurseSelectedPatient || !nurseRoundsParsingResult) return;
    setIsNurseSavingRoundsData(true);
    try {
      const res = await fetch(`/api/patients/${nurseSelectedPatient.id}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressNotes: nurseRoundsParsingResult.progressNotes,
          treatmentPlans: nurseRoundsParsingResult.treatmentPlans,
          nursingInstructions: nurseRoundsParsingResult.nursingInstructions,
          roundsRecordedBy: "Nurse Pooja Sharma"
        })
      });

      if (res.ok) {
        alert("Successfully saved rounds update! Structured progress findings, active therapy adjustments, and nursing instructions are live in EHR.");
        setNurseRoundsParsingResult(null);
        setNurseRoundsDictationText("");
        onRefreshStats(); // Trigger upper statistical updates
      } else {
        alert("EHR Server declined rounds registration schema.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving ward rounds to the patient record.");
    } finally {
      setIsNurseSavingRoundsData(false);
    }
  };

  const handleGenerateAutomatedDischarge = async (customCourse?: string) => {
    if (!dischargeSelectedPatient) {
      alert("Please select a patient for discharge planning.");
      return;
    }
    const targetCourse = customCourse || dischargeClinicalCourse;
    if (!targetCourse.trim()) {
      alert("Please describe the patient clinical course before generating a discharge plan.");
      return;
    }

    setDischargeLoading(true);
    setDischargeResult(null);
    try {
      const res = await fetch("/api/discharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: dischargeSelectedPatient.name,
          clinicalCourse: targetCourse,
          currentStatus: dischargeSelectedPatient.currentStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDischargeResult(data);
      } else {
        alert("Clinical Discharge Service failed to generate the discharge summaries.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred contacting the Swasti AI discharge planning service.");
    } finally {
      setDischargeLoading(false);
    }
  };

  const handleFinalizeDischarge = async () => {
    if (!dischargeSelectedPatient) return;
    setIsFinishingDischarge(true);
    try {
      // 1. Release bed / Discharge Patient in EHR
      const dischargeRes = await fetch("/api/beds/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: dischargeSelectedPatient.id })
      });

      if (!dischargeRes.ok) {
        alert("EHR backend declined discharge/bed release. Note: Ensure patient is allocated to an active bed first.");
        setIsFinishingDischarge(false);
        return;
      }

      // 2. Automatically pay any unpaid bills for this patient
      const unresolvedBill = bills.find(b => b.patientId === dischargeSelectedPatient.id && b.status === "Unpaid");
      if (unresolvedBill) {
        await fetch(`/api/bills/${unresolvedBill.id}/pay`, { method: "POST" });
      }

      alert(`Successfully finalized discharge process for ${dischargeSelectedPatient.name}! Active bed release completed, billing status marked as PAID, and personalized Swasti care instructions are dispatched!`);
      setDischargeResult(null);
      setDischargeSelectedPatient(null);
      
      // Reload states in dashboard
      fetchDbState();
    } catch (err) {
      console.error(err);
      alert("An error occurred during final discharge execution.");
    } finally {
      setIsFinishingDischarge(false);
    }
  };

  const handleCheckPrescriptionSafety = async (medName?: string, dos?: string, freq?: string) => {
    if (!selectedPatient) return;
    const targetMedicine = medName || manualRxMedicine;
    const targetDosage = dos || manualRxDosage;
    const targetFrequency = freq || manualRxFrequency;

    if (!targetMedicine.trim()) {
      alert("Please specify a medication name first.");
      return;
    }

    setRxChecking(true);
    setRxCheckResult(null);
    try {
      const res = await fetch("/api/prescriptions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          medicineName: targetMedicine,
          dosage: targetDosage,
          frequency: targetFrequency
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRxCheckResult(data);
      } else {
        alert("Clinical Audit Service returned an issue. Please try local checking fallback.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRxChecking(false);
    }
  };

  const handleFinalizeSmartPrescription = async () => {
    if (!selectedPatient) return;
    if (!manualRxMedicine.trim()) {
      alert("Please specify a medicine name.");
      return;
    }
    setIsSubmittingManualRx(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          medicineName: manualRxMedicine,
          dosage: manualRxDosage,
          frequency: manualRxFrequency,
          instructions: manualRxInstructions,
          prescribedBy: "Dr. Ananya Goel"
        })
      });
      if (res.ok) {
        alert(`Successfully finalized prescription for ${manualRxMedicine}! Pushed directly to hospital pharmacy stock and active patient billing logs.`);
        setManualRxMedicine("");
        setManualRxDosage("500mg");
        setManualRxFrequency("Once daily");
        setManualRxInstructions("After meals");
        setRxCheckResult(null);
        fetchDbState();
      } else {
        alert("Prescription draft insertion failed on HIS database server.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingManualRx(false);
    }
  };

  // CLINIC DIALOGUE SCRIPTS FOR MOCKING SCENARIOS
  const EVALUATION_SCENARIOS = [
    {
      title: "Cardiac Chest Tightness",
      transcript: "Patient complains of central crushing chest pain starting 3 hours ago during breakfast, radiating to LHS arm, scoring 7 on 10 pain level. Patient feels nauseated, sweaty skin. Blood pressure reading is 145 over 95 mmHg. Allergy check is penicillins. Need Cardiology reference."
    },
    {
      title: "Acute Pediatric Sore Throat",
      transcript: "Toddler has a sudden high fever peaking 103 Fahrenheit last night. Frequent dry cough, refusal to swallow, red pharynx observed in exam. Respiratory rate is 24 per minute. Suspecting streptococcal pharyngitis. Recommend liquid paracetamol."
    },
    {
      title: "Severe Asthma Wheeze",
      transcript: "Patient reports severe chest tightness with high-pitch audible expiratory wheezing since yesterday. Dust exposure triggered. Using inhaler 4 times without stable relief. Oxygen Saturation checked at 91% on room air. Needs corticosteroids and urgent nebulization."
    }
  ];

  const handleScribeDialogue = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault(); // Add this line
  e.stopPropagation(); // Also add this to stop event bubbling
  
  if (!rawDialogTranscript.trim()) {
    alert("Please ensure transcript/dialogue text is entered before triggering AI.");
    return;
  }
  setScribeLoading(true);
  try {
    const res = await fetch("/api/scribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText: rawDialogTranscript,
        patientName: selectedPatient?.name || "Walk-In Consultation",
        patientAge: selectedPatient?.age,
        patientGender: selectedPatient?.gender
      })
    });
    const data = await res.json();
    if (data.success) {
      setActiveScribeResult(data.data);
      fetchDbState();
    } else {
      alert("Clinical Scribing failed: " + data.error);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setScribeLoading(false);
  }
};

  const handleSimulateRecording = () => {
    setIsRecording(true);
    let count = 0;
    // Auto populate after 2.5s with a random scenario
    const interval = setTimeout(() => {
      const randomScenario = EVALUATION_SCENARIOS[Math.floor(Math.random() * EVALUATION_SCENARIOS.length)];
      setRawDialogTranscript(randomScenario.transcript);
      setIsRecording(false);
    }, 2500);
  };

  const handleAuthorizePrescriptions = async () => {
    if (!activeScribeResult || !activeScribeResult.medications) return;
    try {
      for (const med of activeScribeResult.medications) {
        await fetch("/api/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: selectedPatient?.id || "P4",
            patientName: selectedPatient?.name || "Walk-In patient",
            medicineName: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            instructions: med.duration,
            prescribedBy: "Dr. Ananya Goel"
          })
        });
      }
      alert("Medication formulas written to active database records and synced to Pharmacy stations!");
      setActiveScribeResult(null);
      setRawDialogTranscript("");
      fetchDbState();
    } catch (e) {
      console.error(e);
    }
  };


  // -----------------------------------------------------------------
  // 2. NURSE / ALLOCATION STATE & MUTATIONS
  // -----------------------------------------------------------------
  const [emergencySymptoms, setEmergencySymptoms] = useState("");
  const [emergencyVitals, setEmergencyVitals] = useState("HR 82, BP 120/80, TEMP 98.6, O2 SAT 98%");
  const [triageLoading, setTriageLoading] = useState(false);
  const [activeTriageResult, setActiveTriageResult] = useState<any | null>(null);
  const [targetTriagePatient, setTargetTriagePatient] = useState<PatientRecord | null>(null);

  const handleTriageAssessment = async () => {
    if (!emergencySymptoms.trim()) {
      alert("Please specify immediate clinical symptoms before running triage matrices.");
      return;
    }
    setTriageLoading(true);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: emergencySymptoms,
          vitals: emergencyVitals
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTriageResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriageLoading(false);
    }
  };

  const handleImmediateAllocation = async (ward: string) => {
    if (!targetTriagePatient) {
      alert("Please select a targeted registry patient for this immediate bed placement allocation.");
      return;
    }
    try {
      const res = await fetch("/api/beds/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: targetTriagePatient.id,
          ward: ward
        })
      });
      if (res.ok) {
        alert(`Registry record updated! Patient ${targetTriagePatient.name} is assigned to a bed in the ${ward} ward.`);
        setActiveTriageResult(null);
        setEmergencySymptoms("");
        fetchDbState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReleaseBed = async (patientId: string) => {
    if (!confirm("Are you certain you want to discharge and release this bed capacity back to the hospital?")) return;
    try {
      const res = await fetch("/api/beds/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId })
      });
      if (res.ok) {
        alert("EHR status set to Discharged, bed released successfully.");
        fetchDbState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // -----------------------------------------------------------------
  // 3. PHARMACY & LABS STATE & MUTATIONS
  // -----------------------------------------------------------------
  const [newLabPatient, setNewLabPatient] = useState("");
  const [newLabTest, setNewLabTest] = useState("Lipid Cardio Panel");
  const [completedLabId, setCompletedLabId] = useState("");
  const [labResultText, setLabResultText] = useState("");

  const handleDispenseMedicine = async (rxId: string) => {
    try {
      const res = await fetch(`/api/prescriptions/${rxId}/dispense`, { method: "POST" });
      if (res.ok) {
        alert("Medications dispensed from safety stock! Hospital invoice logged.");
        fetchDbState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteLab = async (labId: string) => {
    const findings = prompt("Enter objective lab blood results values:", "Ref: HDL 42 mg/dL, LDL 112 mg/dL, Total Cholesterol 192 (Marginally Elevated).");
    if (!findings) return;
    try {
      const res = await fetch(`/api/labs/${labId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: findings })
      });
      if (res.ok) {
        alert("Blood panels verified! Results synced to doctor EHR.");
        fetchDbState();
      }
    } catch (e) {
      console.error(e);
    }
  };


  // -----------------------------------------------------------------
  // 4. BILLING WORKSPACE STATE & MUTATIONS
  // -----------------------------------------------------------------
  const handlePayInvoice = async (billId: string) => {
    try {
      const res = await fetch(`/api/bills/${billId}/pay`, { method: "POST" });
      if (res.ok) {
        alert("Invoice status validated and paid successfully with receipt generated!");
        fetchDbState();
      }
    } catch (e) {
      console.error(e);
    }
  };


  // -----------------------------------------------------------------
  // 5. PATIENT PORTAL STATE & MUTATIONS
  // -----------------------------------------------------------------
  const [patientChatLog, setPatientChatLog] = useState<ChatMessage[]>([
    { id: "1", sender: "assistant", text: "Hello Siddharth! Welcome to your digital Swasti Portal. How can I explain your active recovery records, diagnostic blood reports, or prescription dosages today?", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendPatientMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setPatientChatLog((prev) => [...prev, userMsg]);
    const promptToSend = chatInput;
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...patientChatLog, userMsg],
          triageContext: "Patient: Siddharth Verma, Age: 34, Conditions: Asthma under observation."
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPatientChatLog((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: "assistant",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const activeBillsTotal = bills.reduce((sum, b) => b.status === "Unpaid" ? sum + b.total : sum, 0);
  const totalClinicalHrsSaved = scribeSessions.length * 0.5; // Each scribe session saves 30 mins (0.5 hrs) of doctor charting

  const getWorkspaceDetails = () => {
    switch (activeRole) {
      case StaffRole.DOCTOR:
        return {
          title: "MD CLINICAL PORTAL",
          accentText: "text-indigo-600",
          bgBadge: "bg-indigo-50 border-indigo-200 text-indigo-800"
        };
      case StaffRole.NURSE:
        return {
          title: "WARD & EMERGENCY TRIAGE",
          accentText: "text-rose-600",
          bgBadge: "bg-rose-50 border-rose-200 text-rose-800"
        };
      case StaffRole.PATIENT:
        return {
          title: "SECURE PATIENT PORTAL",
          accentText: "text-teal-600",
          bgBadge: "bg-teal-50 border-teal-200 text-teal-800"
        };
      case StaffRole.PHARMACIST:
        return {
          title: "PHARMACY DISPENSARY",
          accentText: "text-amber-600",
          bgBadge: "bg-amber-50 border-amber-200 text-amber-800"
        };
      case StaffRole.BILLING:
        return {
          title: "ADMIN & INVOICING CENTRE",
          accentText: "text-slate-700",
          bgBadge: "bg-slate-50 border-slate-250 text-slate-800"
        };
      default:
        return {
          title: "SWASTI CORE HUB",
          accentText: "text-teal-600",
          bgBadge: "bg-teal-50 border-teal-200 text-teal-850"
        };
    }
  };

  const ws = getWorkspaceDetails();

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col font-sans">
      
      {/* GLOBAL HUB HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToWebsite}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-250 bg-white px-3.5 py-1.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
          </button>
          <Logo iconOnly={true} />
          <div className="border-l border-slate-200 pl-3 py-1">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${ws.bgBadge}`}>
              {ws.title}
            </span>
          </div>
        </div>

        {/* PROFILE ROLE ACCORDION */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase font-bold text-slate-450 text-slate-400 tracking-wider hidden lg:inline">Simulator Switchboard:</span>
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-inner">
            {[
              { role: StaffRole.DOCTOR, icon: Stethoscope, label: "Doctor" },
              { role: StaffRole.NURSE, icon: Bed, label: "Nurse" },
              { role: StaffRole.PATIENT, icon: User, label: "Patient" },
              { role: StaffRole.PHARMACIST, icon: Pill, label: "Pharmacy" },
              { role: StaffRole.BILLING, icon: CreditCard, label: "Billing" }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => {
                    setActiveRole(item.role);
                    setSelectedPatient(null);
                    setActiveScribeResult(null);
                    setActiveTriageResult(null);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-950 hover:bg-slate-200/50"
                  }`}
                  title={`${item.label} Simulator`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* CORE HUB LAYOUT CONTAINER */}
      <main className="grow overflow-y-auto px-6 py-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Synchronizing Swasti HIS State...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT-SIDE CONTEXT BAR — REALTIME METRICS OF HOSPITAL */}
            <div className="md:col-span-3 space-y-6">
              
              {/* STATUS CARD */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-3">Facility Monitor</span>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Active Beds Filled</span>
                    <span className="text-xs font-bold text-slate-800">
                      {beds.filter(b => b.status === "Occupied").length} / {beds.length} occupied
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Pending Lab Orders</span>
                    <span className="text-xs font-bold text-amber-600">
                      {labOrders.filter(l => l.status !== "Ready").length} Active
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Approved Rx Lists</span>
                    <span className="text-xs font-bold text-slate-800">
                      {prescriptions.length} Prescribed
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Unpaid Patient Bills</span>
                    <span className="text-xs font-bold text-coral-600 text-rose-600">
                      ${activeBillsTotal.toLocaleString()} due
                    </span>
                  </div>
                </div>
              </div>

              {/* AUTOMATION INSIGHTS CARD */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-1 text-lime-400 text-xs font-bold uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" /> AI Operations Impact
                </div>
                <div>
                  <h4 className="text-xs text-slate-300">Total Administrative Hours Reclaimed</h4>
                  <p className="text-3xl font-black text-white mt-1">{totalClinicalHrsSaved} Hours</p>
                  <span className="text-[10px] text-slate-400">Calculated directly from automated scribing sessions</span>
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-[11px] text-slate-400">
                    Under active simulation: Every prescription dispelled, appointment booked, or test generated triggers real-time operational feedback loops.
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN WORKSPACE CONTENT GRID */}
            <div className="md:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
              
              {/* ========================================================= */}
              {/* 1. ROLE: DOCTOR WORKSPACE */}
              {/* ========================================================= */}
              {activeRole === StaffRole.DOCTOR && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Dr. Ananya Goel's Clinical Hub</h2>
                      <p className="text-xs text-slate-400 font-medium select-none">General & Internal Medicine Specialist</p>
                    </div>
                    {/* Active patient select bar */}
                    <div className="w-full sm:w-auto">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Consulting Patient</label>
                      <select
                        onChange={(e) => {
                          const pat = patients.find(p => p.id === e.target.value);
                          setSelectedPatient(pat || null);
                          setActiveScribeResult(null);
                        }}
                        className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none w-full"
                      >
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Age {p.age}, {p.currentStatus})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!selectedPatient ? (
                    <div className="py-16 text-center space-y-4">
                      <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">No Active Consultation Patient</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                          Please choose a patient (e.g. Siddharth Verma) using the database dropdown selector above to initialize the Gemini-3.5-powered AI Hospital Scribe.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Active Sub Tabs for Scribe vs Smart Prescription */}
                      <div className="flex border-b border-slate-200">
                        <button
                          onClick={() => setDoctorSubTab("scribe")}
                          className={`px-5 py-3 font-extrabold text-xs flex items-center gap-2 border-b-2 transition select-none cursor-pointer ${
                            doctorSubTab === "scribe"
                              ? "border-teal-600 text-teal-700 font-black"
                              : "border-transparent text-slate-500 hover:text-slate-850"
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                          Ambient AI Scribe Recorder
                        </button>
                        <button
                          onClick={() => setDoctorSubTab("smart-prescription")}
                          className={`px-5 py-3 font-extrabold text-xs flex items-center gap-2 border-b-2 transition select-none cursor-pointer ${
                            doctorSubTab === "smart-prescription"
                              ? "border-amber-600 text-amber-700 font-black"
                              : "border-transparent text-slate-500 hover:text-slate-855"
                          }`}
                        >
                          <Pill className="w-3.5 h-3.5 text-amber-600" />
                          Smart Safe Prescription Creator
                        </button>
                        <button
                          onClick={() => setDoctorSubTab("voice-rounds")}
                          className={`px-5 py-3 font-extrabold text-xs flex items-center gap-2 border-b-2 transition select-none cursor-pointer ${
                            doctorSubTab === "voice-rounds"
                              ? "border-sky-650 text-sky-750 font-black"
                              : "border-transparent text-slate-500 hover:text-slate-855"
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                          Voice-Based Rounds Optimizer
                        </button>
                      </div>

                      {doctorSubTab === "scribe" && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          {/* Left side script input */}
                          <div className="lg:col-span-6 space-y-5">
                            <div className="flex justify-between items-center">
                              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Consultation Transcript</h3>
                              
                              <button
                                onClick={handleSimulateRecording}
                                disabled={isRecording}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer shadow-sm ${
                                  isRecording
                                    ? "bg-red-50 text-red-700 border-red-300 active-recording-ripple"
                                    : "bg-white text-slate-700 hover:text-slate-900"
                                }`}
                              >
                                <Mic className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                {isRecording ? "Listening..." : "🎤 Record Consultation Audio"}
                              </button>
                            </div>

                            {/* Presets */}
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Simulated Dialog Scripts (Click to Fill)</p>
                              <div className="flex flex-wrap gap-2">
                                {EVALUATION_SCENARIOS.map((scen, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setRawDialogTranscript(scen.transcript);
                                      setActiveScribeResult(null);
                                    }}
                                    className="bg-slate-50 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-200/50 hover:text-slate-800 transition shadow-xs"
                                  >
                                    {scen.title}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <textarea
                              rows={6}
                              placeholder="Type or simulate standard recorded doctor-patient raw conversation metrics here..."
                              value={rawDialogTranscript}
                              onChange={(e) => setRawDialogTranscript(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-teal-600 placeholder:text-slate-400 font-medium"
                            />

                           <button
  type="button"  // Add this to prevent form submission
  onClick={handleScribeDialogue}
  disabled={scribeLoading}
  className="w-full bg-teal-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-teal-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
>
  {scribeLoading ? (
    <>
      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      Gemini Parsing Transcriptions...
    </>
  ) : (
    <>
      <Stethoscope className="w-3.5 h-3.5" />
      Generate Structured SOAP EHR Notes
    </>
  )}
</button>
                          </div>

                          {/* Right side scribe SOAP outcome */}
                          <div className="lg:col-span-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/70 max-h-[480px] overflow-y-auto space-y-4">
                            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                              <span>AI Automated Scribe Outcome Logs</span>
                              <span className="text-[9px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Standard SOAP Format</span>
                            </h3>

                            {!activeScribeResult ? (
                              <div className="py-24 text-center space-y-2 text-slate-400">
                                <FileText className="w-8 h-8 mx-auto" />
                                <p className="text-xs">SOAP notes draft is pending transcription compilation.</p>
                              </div>
                            ) : (
                              <div className="space-y-4 text-xs">
                                
                                {/* Subjective */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="font-extrabold text-teal-600 uppercase text-[9px] tracking-wider block">Subjective (S)</span>
                                  <p className="text-slate-700 mt-1">{activeScribeResult.soapNotes?.subjective}</p>
                                </div>

                                {/* Objective */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="font-extrabold text-teal-600 uppercase text-[9px] tracking-wider block">Objective (O)</span>
                                  <p className="text-slate-700 mt-1">{activeScribeResult.soapNotes?.objective}</p>
                                </div>

                                {/* Assessment */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="font-extrabold text-teal-600 uppercase text-[9px] tracking-wider block">Assessment (A)</span>
                                  <p className="text-slate-700 mt-1">{activeScribeResult.soapNotes?.assessment}</p>
                                </div>

                                {/* Plan */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="font-extrabold text-teal-600 uppercase text-[9px] tracking-wider block">Plan (P)</span>
                                  <p className="text-slate-700 mt-1">{activeScribeResult.soapNotes?.plan}</p>
                                </div>

                                {/* ICD CODES */}
                                {activeScribeResult.icdCodes && (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-sm">
                                    <span className="font-bold text-lime-400 uppercase text-[9px] tracking-wider block">Automated ICD-10 Billing Codings</span>
                                    <div className="space-y-1 mt-2">
                                      {activeScribeResult.icdCodes.map((codeObj: any, cIdx: number) => (
                                        <div key={cIdx} className="flex justify-between border-b border-slate-800 pb-1 text-[11px] font-mono">
                                          <span className="font-bold text-teal-400">{codeObj.code}</span>
                                          <span className="text-slate-300 truncate max-w-[180px]">{codeObj.description}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Recommended Medications */}
                                {activeScribeResult.medications && (
                                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                                    <span className="font-extrabold text-emerald-800 uppercase text-[9px] tracking-wider block">AI Suggested Formulations</span>
                                    <div className="space-y-1">
                                      {activeScribeResult.medications.map((m: any, mIdx: number) => (
                                        <div key={mIdx} className="text-[11px] text-slate-700 font-medium">
                                          💊 <strong className="text-emerald-950">{m.name}</strong> • {m.dosage} ({m.frequency} for {m.duration})
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      onClick={handleAuthorizePrescriptions}
                                      className="w-full bg-emerald-850 hover:bg-emerald-900 bg-emerald-800 text-white font-bold text-[10px] uppercase py-2 rounded-lg transition shadow-sm mt-3 cursor-pointer"
                                    >
                                      ✔ Authorize & Push to Pharmacy Gateways
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {doctorSubTab === "smart-prescription" && (
                        <div className="space-y-6">
                          {/* Selected Patient File Summary bar */}
                          <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs font-semibold text-slate-700">
                            <div>
                              <p className="text-amber-800 font-black text-sm">Dynamic Safety EHR Link Active</p>
                              <p className="text-slate-500 text-[11px] font-bold mt-0.5">
                                Evaluating proposed therapy for: <span className="text-slate-900 underline font-black">{selectedPatient.name}</span> (Age {selectedPatient.age} • {selectedPatient.gender})
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg border border-red-200 text-[10px] font-black uppercase">
                                  ⚠️ Record Allergies: {selectedPatient.allergies.join(", ")}
                                </span>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200 text-[10px] font-extrabold">
                                  No Recorded Drug Allergies
                                </span>
                              )}
                              {selectedPatient.history && (
                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 text-[10px] truncate max-w-[220px]">
                                  EHR DX History: {selectedPatient.history}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Left Form (6 cols) */}
                            <div className="lg:col-span-6 space-y-5">
                              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest pb-1 border-b border-slate-150">
                                💊 Prescribing Core Parameters
                              </h3>

                              <div className="space-y-4 text-xs font-semibold text-slate-700">
                                <div>
                                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Proposed Drug Name</label>
                                  <input
                                    type="text"
                                    value={manualRxMedicine}
                                    onChange={(e) => {
                                      setManualRxMedicine(e.target.value);
                                      setRxCheckResult(null);
                                    }}
                                    placeholder="e.g. Amoxicillin, Sildenafil, Ibuprofen, Diazepam..."
                                    className="w-full bg-slate-50 border border-slate-250 border-slate-200 px-4 py-3 rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-inner"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Dosage / Strength</label>
                                    <input
                                      type="text"
                                      value={manualRxDosage}
                                      onChange={(e) => {
                                        setManualRxDosage(e.target.value);
                                        setRxCheckResult(null);
                                      }}
                                      placeholder="e.g. 500mg"
                                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Interval Frequency</label>
                                    <select
                                      value={manualRxFrequency}
                                      onChange={(e) => {
                                        setManualRxFrequency(e.target.value);
                                        setRxCheckResult(null);
                                      }}
                                      className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl font-extrabold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                                    >
                                      <option value="Once daily">Once daily</option>
                                      <option value="Twice daily">Twice daily</option>
                                      <option value="Three times daily">Three times daily</option>
                                      <option value="Four times daily">Four times daily</option>
                                      <option value="At bedtime">At bedtime</option>
                                      <option value="As needed (PRN)">As needed (PRN)</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">EHR Instructions & Guidelines</label>
                                  <input
                                    type="text"
                                    value={manualRxInstructions}
                                    onChange={(e) => setManualRxInstructions(e.target.value)}
                                    placeholder="e.g. Swallow pill whole with plenty of warm water after meals"
                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-850 focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>

                              {/* Interactive Simulation Preset Trigger Cards */}
                              <div className="bg-slate-50 border border-slate-250 border-slate-200 rounded-2xl p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
                                  Demo simulation preset triggers
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                  {CLINICAL_SAFETY_DEMOS.map((demo, demoIdx) => (
                                    <button
                                      key={demoIdx}
                                      onClick={() => {
                                        setManualRxMedicine(demo.name);
                                        setManualRxDosage(demo.dosage);
                                        setManualRxFrequency(demo.frequency);
                                        setManualRxInstructions(demo.instructions);
                                        handleCheckPrescriptionSafety(demo.name, demo.dosage, demo.frequency);
                                      }}
                                      className="bg-white hover:bg-amber-50/40 text-left p-3 rounded-xl border border-slate-200 hover:border-amber-300 transition cursor-pointer font-semibold flex flex-col justify-between h-16 shadow-xs select-none"
                                    >
                                      <span className="text-[8px] uppercase font-bold text-amber-600 block tracking-wider">{demo.label}</span>
                                      <span className="text-slate-800 font-bold truncate mt-1">{demo.name} ({demo.dosage})</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={() => handleCheckPrescriptionSafety()}
                                disabled={rxChecking}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow shadow-slate-900/10 disabled:opacity-50 cursor-pointer"
                              >
                                {rxChecking ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                    <span>Gemini Clinical Audit Running...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span>Verify Safety & Compliance Audit</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Right Audit Outcomes Panel (6 cols) */}
                            <div className="lg:col-span-6 bg-slate-50/50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[420px] shadow-inner">
                              <div>
                                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-200 mb-4 flex items-center justify-between">
                                  <span>E-Prescribing Compliance Report</span>
                                  {rxCheckResult && (
                                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                      rxCheckResult.safetyStatus === "SAFE"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : rxCheckResult.safetyStatus === "WARNING"
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-rose-50 text-rose-800 border-rose-200"
                                    }`}>
                                      {rxCheckResult.safetyStatus}
                                    </span>
                                  )}
                                </h3>

                                {!rxCheckResult ? (
                                  <div className="py-24 text-center text-slate-400 space-y-4">
                                    <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
                                    <div className="space-y-1">
                                      <p className="text-xs font-black text-slate-700">Audit Status Pending</p>
                                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                                        Fill in drug coordinates manually or click one of the preset quick testing scenarios to instantly check patient allergies, histories, and drug-to-drug interactions.
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4 text-xs font-semibold">
                                    
                                    {/* Warnings/Contras Alert Blocks */}
                                    {rxCheckResult.alerts && rxCheckResult.alerts.length > 0 ? (
                                      <div className="space-y-2.5">
                                        {rxCheckResult.alerts.map((alertItem: any, aIdx: number) => (
                                          <div
                                            key={aIdx}
                                            className={`p-3.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                                              alertItem.severity === "High"
                                                ? "bg-rose-50/60 border-rose-250 border-rose-200 text-rose-950"
                                                : "bg-amber-50/60 border-amber-250 border-amber-200 text-amber-950"
                                            }`}
                                          >
                                            <span className="text-base mt-0.5">
                                              {alertItem.severity === "High" ? "🚨" : "⚠️"}
                                            </span>
                                            <div>
                                              <strong className="block text-[10px] uppercase font-black tracking-wide text-slate-800 mb-0.5">
                                                [{alertItem.type} Audit Alert] • Severity: {alertItem.severity}
                                              </strong>
                                              <p className="font-medium text-slate-700">{alertItem.message}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="bg-emerald-50/60 text-emerald-950 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                                        <span className="text-2xl">✅</span>
                                        <div>
                                          <strong className="block text-[11px] text-emerald-900 uppercase">Audit Completed Successfully</strong>
                                          <p className="font-medium text-slate-600 mt-0.5">No conflict markers found. Prescription parameters align with safe hospital indicators.</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Action recommendations suggested by Gemini/Heuristics */}
                                    {rxCheckResult.alternativeAgreed && (
                                      <div className="bg-teal-50/40 border border-teal-200 p-4 rounded-xl text-slate-700">
                                        <span className="text-[9px] font-black uppercase text-teal-800 block tracking-wider mb-1">
                                          Clinical Safety Substitution Recommendation
                                        </span>
                                        <p className="font-medium text-teal-950 leading-relaxed text-[11px]">
                                          {rxCheckResult.alternativeAgreed}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {rxCheckResult && (
                                <div className="mt-6 pt-4 border-t border-slate-200 text-xs">
                                  {rxCheckResult.safetyStatus === "CONTRAINDICATED" && (
                                    <p className="text-[10px] text-rose-700 font-extrabold italic text-center mb-3">
                                      ⚠️ Critical conflict detected. Submission is blocked until overridden or substituted.
                                    </p>
                                  )}
                                  <button
                                    onClick={handleFinalizeSmartPrescription}
                                    disabled={isSubmittingManualRx}
                                    className={`w-full font-black text-xs py-3 rounded-xl transition cursor-pointer select-none ${
                                      rxCheckResult.safetyStatus === "CONTRAINDICATED"
                                        ? "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                                        : "bg-teal-600 hover:bg-teal-700 text-white shadow shadow-teal-700/10"
                                    } flex items-center justify-center gap-1.5`}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>
                                      {rxCheckResult.safetyStatus === "CONTRAINDICATED"
                                        ? "Confirm Overridden Clinical Override"
                                        : "Finalize & Write Prescription to Patient EHR"}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      )}

                      {doctorSubTab === "voice-rounds" && (
                        <div className="space-y-6">
                          {/* Top guide banner */}
                          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs font-semibold text-slate-700">
                            <div>
                              <p className="text-sky-850 font-black text-sm">Automated Ward Rounds Optimizer</p>
                              <p className="text-slate-500 text-[11px] font-bold mt-0.5">
                                Verbally summarize inpatient assessments. The AI parses the speech stream, updates clinical files, and alerts the nursing staff.
                              </p>
                            </div>
                            <span className="bg-sky-150 text-sky-850 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-center shrink-0">
                              Active Patient: {selectedPatient.name}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left panel: voice input & presets */}
                            <div className="lg:col-span-6 space-y-5">
                              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Voice Dictation Input</h3>
                              
                              {/* Presets */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Ward Rounds presets (Click to load & run):</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  {WARD_ROUNDS_PRESETS.map((p, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setRoundsDictationText(p.transcript);
                                        handleParseVoiceRounds(p.transcript);
                                      }}
                                      className={`text-[10px] text-left p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between h-20 shadow-xs hover:border-sky-400 font-semibold ${
                                        roundsDictationText === p.transcript
                                          ? "bg-sky-50 text-sky-900 border-sky-450 border-sky-500"
                                          : "bg-white text-slate-650 border-slate-200"
                                      }`}
                                    >
                                      <span className="text-[8px] font-black uppercase tracking-wider text-sky-600 mb-1">{p.label}</span>
                                      <span className="text-slate-800 line-clamp-2 italic">"{p.transcript}"</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dictated Voice Stream Transcript Detail:</label>
                                <textarea
                                  rows={5}
                                  placeholder="Type custom ward round comments or click one of the preset scenarios to load..."
                                  value={roundsDictationText}
                                  onChange={(e) => setRoundsDictationText(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-400 font-semibold leading-relaxed"
                                />
                              </div>

                              <button
                                onClick={() => handleParseVoiceRounds()}
                                disabled={roundsParsing}
                                className="w-full bg-sky-650 hover:bg-sky-700 text-white font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow shadow-sky-600/10 disabled:opacity-50 cursor-pointer"
                              >
                                {roundsParsing ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Gemini Structuring Voice Rounds...</span>
                                  </>
                                ) : (
                                  <>
                                    <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
                                    <span>Voice Update: Structuring Rounds Inputs</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Right panel: AI Parsed Results with EHR commits */}
                            <div className="lg:col-span-6 bg-slate-50/50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[420px] shadow-inner">
                              <div>
                                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-250 border-slate-200 mb-4 flex items-center justify-between">
                                  <span>Automated Rounds parse outcomes</span>
                                  <span className="text-[8px] font-bold bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded text-sky-850 animate-pulse">Live Sync Ready</span>
                                </h3>

                                {!roundsParsingResult ? (
                                  <div className="py-24 text-center text-slate-400 space-y-4">
                                    <Volume2 className="w-10 h-10 text-slate-300 mx-auto animate-bounce animate-duration-1000" />
                                    <div className="space-y-1">
                                      <p className="text-xs font-bold text-slate-700">Rounds Output Awaiting</p>
                                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                                        Click a quick-load preset rounds script on the left side panel to immediately simulate natural doctor updates and parse structured outputs.
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4 text-xs font-semibold">
                                    
                                    {/* Progress note */}
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-sky-600 block mb-1">📝 PROGRESS NOTES (EHR)</span>
                                      <p className="text-slate-700 mt-1 leading-relaxed">{roundsParsingResult.progressNotes}</p>
                                    </div>

                                    {/* Treatment plans */}
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-sky-600 block mb-1">🩺 ACTIVE TREATMENT PLAN</span>
                                      <p className="text-slate-700 mt-1 leading-relaxed">{roundsParsingResult.treatmentPlans}</p>
                                    </div>

                                    {/* Nursing directions */}
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-sky-600 block mb-1">📋 NURSING WORKLIST</span>
                                      <p className="text-slate-700 mt-1 leading-relaxed">{roundsParsingResult.nursingInstructions}</p>
                                    </div>

                                    {/* Smart Trigger Indications */}
                                    <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-[10px] text-emerald-850 flex items-center gap-2">
                                      <span className="text-sm select-none">⚡</span>
                                      <div>
                                        <strong className="block text-emerald-950 uppercase text-[8px] tracking-wide font-black">EHR Automation Integrators active</strong>
                                        <p className="text-slate-600 mt-0.5 leading-tight font-medium">
                                          {roundsParsingResult.treatmentPlans.toLowerCase().includes("discharge") 
                                            ? "Discharge triggers detected! Inpatient status will set to 'Discharge Pending' and current bed allocation will clear."
                                            : roundsParsingResult.treatmentPlans.toLowerCase().includes("cbc") || roundsParsingResult.treatmentPlans.toLowerCase().includes("ultrasound") || roundsParsingResult.treatmentPlans.toLowerCase().includes("doppler")
                                            ? "Lab/Diagnostics order triggers detected! A corresponding complete blood card or limb scan request is queued."
                                            : "Assessment captured. Updates to daily log files are formatted."}
                                        </p>
                                      </div>
                                    </div>

                                  </div>
                                )}
                              </div>

                              {roundsParsingResult && (
                                <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-sky-950 font-black">
                                  <button
                                    onClick={handleFinalizeVoiceRoundsUpdate}
                                    disabled={isSavingRoundsData}
                                    className="w-full bg-sky-600 hover:bg-sky-750 text-white font-black text-xs py-3 rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-1.5 shadow shadow-sky-600/10"
                                  >
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span>
                                      {isSavingRoundsData ? "Committing Updates..." : "Save Rounds & Commit updates to patient medical record"}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}


              {/* ========================================================= */}
              {/* 2. ROLE: WARD / TRIAGE NURSE WORKSPACE */}
              {/* ========================================================= */}
              {activeRole === StaffRole.NURSE && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Ward & Emergency Bed Coordination Hub</h2>
                      <p className="text-xs text-slate-400 font-medium">Auto Bed Assigning • Triage Prioritizations • Voice Rounds</p>
                    </div>

                    <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200 shrink-0">
                      <button
                        onClick={() => setNurseSubTab("triage")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 select-none cursor-pointer ${
                          nurseSubTab === "triage"
                            ? "bg-white text-slate-800 shadow-xs"
                            : "text-slate-500 hover:text-slate-850"
                        }`}
                      >
                        Bed Map & Triage
                      </button>
                      <button
                        onClick={() => setNurseSubTab("voice-rounds")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 select-none cursor-pointer ${
                          nurseSubTab === "voice-rounds"
                            ? "bg-white text-slate-800 shadow-xs"
                            : "text-slate-500 hover:text-slate-850"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-sky-600 animate-pulse animate-duration-1000" />
                        Voice Rounds Optimizer
                      </button>
                      <button
                        onClick={() => setNurseSubTab("discharge")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 select-none cursor-pointer ${
                          nurseSubTab === "discharge"
                            ? "bg-white text-slate-800 shadow-xs"
                            : "text-slate-500 hover:text-slate-850"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600 animate-pulse animate-duration-1000" />
                        Discharge Planner
                      </button>
                    </div>
                  </div>

                  {nurseSubTab === "triage" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left Triage input form */}
                      <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 w-full space-y-4">
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-200">
                          Emergency Nurse Intake Analyzer
                        </h3>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Registry Patient</label>
                          <select
                            onChange={(e) => {
                              const pat = patients.find(p => p.id === e.target.value);
                              setTargetTriagePatient(pat || null);
                            }}
                            className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none w-full"
                          >
                            <option value="">-- Choose Patient for Bed Allocate --</option>
                            {patients.filter(p => p.currentStatus !== "Discharged").map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Age {p.age})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Incoming Emergency Symptoms description</label>
                          <textarea
                            rows={3}
                            placeholder="E.g., Crushing left sided chest aches, breathing difficulties, choking cough, high fever with sepsis..."
                            value={emergencySymptoms}
                            onChange={(e) => setEmergencySymptoms(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs focus:outline-none placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ingested In-Vitro Vitals</label>
                          <input
                            type="text"
                            value={emergencyVitals}
                            onChange={(e) => setEmergencyVitals(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={handleTriageAssessment}
                          disabled={triageLoading}
                          className="w-full bg-teal-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-teal-700 transition flex items-center justify-center gap-2"
                        >
                          {triageLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Analyzing emergency urgency...
                            </>
                          ) : (
                            "Assess Triage Severity"
                          )}
                        </button>

                        {/* Display triage outputs */}
                        {activeTriageResult && (
                          <div className="border border-slate-200 bg-white p-4 rounded-xl text-xs space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="font-extrabold text-teal-600 uppercase text-[9px] tracking-wider">Priority</span>
                              <span className="font-extrabold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[9px] uppercase">
                                {activeTriageResult.triageLevel}
                              </span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="font-medium text-slate-500">Triage Index Score:</span>
                              <span className="font-black text-slate-800 text-[14px]">
                                {activeTriageResult.severityScore} / 10
                              </span>
                            </div>

                            <div>
                              <span className="font-semibold text-slate-600 block mb-1">Recommended Ward:</span>
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-mono">
                                {activeTriageResult.recommendedWard} Ward
                              </span>
                            </div>

                            {activeTriageResult.urgencyActions && (
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                                <span className="font-bold text-slate-500 uppercase text-[8px] block">Immediate Protocol Actions:</span>
                                <ul className="space-y-1 mt-1 text-[10px] text-slate-600">
                                  {activeTriageResult.urgencyActions.map((act: string, idx: number) => (
                                    <li key={idx}>• {act}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <button
                              onClick={() => handleImmediateAllocation(activeTriageResult.recommendedWard)}
                              className="w-full bg-slate-950 text-white text-[11px] font-bold py-2 rounded-lg hover:bg-slate-900 transition"
                            >
                              🚀 Auto Allocate bed in {activeTriageResult.recommendedWard} Ward
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right Bed Capacity Lists */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wider">Active Bed Map Grid</h3>
                          <span className="text-[10px] font-semibold text-slate-400">Green = Available | Blue = Allocated</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {beds.map((bedItem) => {
                            const isOccupied = bedItem.status === "Occupied";
                            const isMaintenance = bedItem.status === "Maintenance";
                            return (
                              <div
                                key={bedItem.id}
                                className={`p-3.5 rounded-xl border flex flex-col justify-between h-28 relative ${
                                  isOccupied
                                    ? "bg-slate-50 border-teal-200"
                                    : isMaintenance
                                    ? "bg-slate-100 border-slate-250 opacity-60"
                                    : "bg-white border-slate-200 shadow-sm"
                                }`}
                              >
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">{bedItem.ward}</span>
                                  <span className="text-[13px] font-bold text-slate-800 block mt-0.5">{bedItem.roomNumber} - Bed {bedItem.bedNumber}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                    isOccupied
                                      ? "bg-teal-50 text-teal-800 border border-teal-200"
                                      : isMaintenance
                                      ? "bg-slate-200 text-slate-600"
                                      : "bg-emerald-55 bg-emerald-50 text-emerald-800 border border-emerald-250"
                                  }`}>
                                    {bedItem.status}
                                  </span>

                                  {isOccupied && (
                                    <button
                                      onClick={() => handleReleaseBed(bedItem.occupiedByPatientId || "")}
                                      className="text-[9px] text-red-600 font-extrabold hover:underline"
                                    >
                                      Discharge
                                    </button>
                                  )}
                                </div>
                                
                                {isOccupied && (
                                  <div className="absolute top-2 right-2 flex items-center">
                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {nurseSubTab === "voice-rounds" && (
                    <div className="space-y-6">
                      {/* Top guide banner */}
                      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs font-semibold text-slate-700">
                        <div>
                          <p className="text-sky-850 font-black text-sm">Nurse Ward Rounds Tracker</p>
                          <p className="text-slate-500 text-[11px] font-bold mt-0.5">
                            Speak ward rounds updates as you treat post-ops, check dressings, or run safety protocols. AI automatically structures logs and routes notification queues.
                          </p>
                        </div>
                        {nurseSelectedPatient && (
                          <span className="bg-sky-150 text-sky-850 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-center shrink-0">
                            Active Patient: {nurseSelectedPatient.name}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left block inputs */}
                        <div className="lg:col-span-6 space-y-5">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Inpatient for Rounds:</label>
                            <select
                              onChange={(e) => {
                                const pat = patients.find(p => p.id === e.target.value);
                                setNurseSelectedPatient(pat || null);
                                setNurseRoundsParsingResult(null);
                              }}
                              value={nurseSelectedPatient ? nurseSelectedPatient.id : ""}
                              className="bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:outline-none w-full"
                            >
                              <option value="">-- Choose Patient under Ward Rounds --</option>
                              {patients.filter(p => p.currentStatus !== "Discharged").map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Age {p.age}, Bed {p.currentStatus})</option>
                              ))}
                            </select>
                          </div>

                          {/* Quick Preset Cards */}
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nurse Ward Round Presets:</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {[
                                {
                                  label: "Stable Vitals Check",
                                  title: "Patient stable on surgical rounds",
                                  transcript: "Patient stable. Surgical dressing clean and dry. Vitals completely normal. Tolerating soft diet well."
                                },
                                {
                                  label: "Temp Overnight Spike",
                                  title: "Fever 101F, CBC request",
                                  transcript: "Patient spiked a fever of 101 overnight. Holding discharge. Need repeat CBC and start bedside IV fluids."
                                },
                                {
                                  label: "Complaining Leg Pain",
                                  title: "Tenderness leg pain event",
                                  transcript: "Patient complains of deep localized pain in right lower leg. Holding anticoagulants. Order a venous Doppler."
                                }
                              ].map((p, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setNurseRoundsDictationText(p.transcript);
                                    if (nurseSelectedPatient) {
                                      handleParseNurseVoiceRounds(p.transcript);
                                    } else {
                                      alert("Please select a target inpatient first!");
                                    }
                                  }}
                                  className={`text-[10px] text-left p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between h-20 shadow-xs hover:border-sky-400 font-semibold ${
                                    nurseRoundsDictationText === p.transcript
                                      ? "bg-sky-50 text-sky-900 border-sky-450 border-sky-500"
                                      : "bg-white text-slate-650 border-slate-200"
                                  }`}
                                >
                                  <span className="text-[8px] font-black uppercase tracking-wider text-sky-600 mb-1">{p.label}</span>
                                  <span className="text-slate-800 line-clamp-2 italic">"{p.transcript}"</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dictated Voice Stream Transcript:</label>
                            <textarea
                              rows={4}
                              placeholder="Type ward notes, or select a quick scenario preset above to instantly dictate..."
                              value={nurseRoundsDictationText}
                              onChange={(e) => setNurseRoundsDictationText(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-400 font-semibold leading-relaxed"
                            />
                          </div>

                          <button
                            onClick={() => handleParseNurseVoiceRounds()}
                            disabled={nurseRoundsParsing}
                            className="w-full bg-sky-650 hover:bg-sky-700 text-white font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow shadow-sky-600/10 disabled:opacity-50 cursor-pointer"
                          >
                            {nurseRoundsParsing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Generating EHR Round Logs...</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
                                <span>Voice Update: Structuring Rounds Inputs</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Right block parsed outputs */}
                        <div className="lg:col-span-6 bg-slate-50/50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[420px] shadow-inner">
                          <div>
                            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider pb-2 border-b border-slate-250 border-slate-200 mb-4 flex items-center justify-between">
                              <span>Ward Nurse Rounds parsing outcomes</span>
                              <span className="text-[8px] font-bold bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded text-sky-850 animate-pulse">Live Sync Ready</span>
                            </h3>

                            {!nurseRoundsParsingResult ? (
                              <div className="py-24 text-center text-slate-400 space-y-4">
                                <Volume2 className="w-10 h-10 text-slate-300 mx-auto animate-bounce animate-duration-1000" />
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-700">Rounds Output Awaiting</p>
                                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                                    Select an active patient and click a preset ward dictation text card to instantly populate structured updates.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4 text-xs font-semibold">
                                {/* Progress note */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-sky-600 block mb-1">📝 NURSE CLINICAL PROGRESS LOG</span>
                                  <p className="text-slate-700 mt-1 leading-relaxed">{nurseRoundsParsingResult.progressNotes}</p>
                                </div>

                                {/* Treatment plan updates */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-sky-600 block mb-1">🩺 THERAPY ADJUSTMENTS ORDERED BY NURSE</span>
                                  <p className="text-slate-700 mt-1 leading-relaxed">{nurseRoundsParsingResult.treatmentPlans}</p>
                                </div>

                                {/* Nursing instructions updates */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-sky-600 block mb-1">📋 SHIFT HANDOVER WORKLIST</span>
                                  <p className="text-slate-700 mt-1 leading-relaxed">{nurseRoundsParsingResult.nursingInstructions}</p>
                                </div>

                                {/* Smart triggers status banner */}
                                <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-[10px] text-emerald-850 flex items-center gap-2">
                                  <span className="text-sm select-none">⚡</span>
                                  <div>
                                    <strong className="block text-emerald-950 uppercase text-[8px] tracking-wide font-black">EHR Automation Integrators active</strong>
                                    <p className="text-slate-600 mt-0.5 leading-tight font-medium">
                                      {nurseRoundsParsingResult.treatmentPlans.toLowerCase().includes("discharge") 
                                        ? "Discharge trigger queued! Patient is cleared for discharge checklist processing."
                                        : nurseRoundsParsingResult.treatmentPlans.toLowerCase().includes("cbc") || nurseRoundsParsingResult.treatmentPlans.toLowerCase().includes("ultrasound") || nurseRoundsParsingResult.treatmentPlans.toLowerCase().includes("doppler")
                                        ? "STAT lab orders and vascular screening triggers are verified & dispatched."
                                        : "Shift handover log formulated and registered."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {nurseRoundsParsingResult && (
                            <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-sky-950 font-black">
                              <button
                                onClick={handleFinalizeNurseVoiceRoundsUpdate}
                                disabled={isNurseSavingRoundsData}
                                className="w-full bg-sky-600 hover:bg-sky-750 text-white font-black text-xs py-3 rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-1.5 shadow shadow-sky-600/10"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>
                                  {isNurseSavingRoundsData ? "Saving handovers..." : "Save Ward Handover & Update Patient EHR Logs"}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {nurseSubTab === "discharge" && (
                    <div className="space-y-6">
                      {/* Top instruction banner */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs font-semibold text-slate-700">
                        <div>
                          <p className="text-emerald-950 font-black text-sm text-emerald-900">Automated EHR Discharge & Clearance Planner</p>
                          <p className="text-slate-500 text-[11px] font-bold mt-0.5">
                            Leverage advanced clinical LLMs to compile complete, multi-part discharge sheets instantly. Verify medications, review outstanding hospital bills, and dispatch personalized home-care guidance automatically.
                          </p>
                        </div>
                        {dischargeSelectedPatient && (
                          <span className="bg-emerald-100 text-emerald-950 border border-emerald-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-center shrink-0 border border-emerald-150">
                            Clearing: {dischargeSelectedPatient.name}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Configuration Panel */}
                        <div className="lg:col-span-5 space-y-5">
                          {/* 1. Patient Selector */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pb-1 border-b border-slate-200">
                              Patient Selection & Clinical Profile
                            </h3>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Select Hospital Inpatient:</label>
                              <select
                                onChange={(e) => {
                                  const pat = patients.find(p => p.id === e.target.value);
                                  setDischargeSelectedPatient(pat || null);
                                  setDischargeResult(null);
                                }}
                                value={dischargeSelectedPatient ? dischargeSelectedPatient.id : ""}
                                className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:outline-none w-full"
                              >
                                <option value="">-- Choose Active Admitted Inpatient --</option>
                                {patients.filter(p => p.currentStatus !== "Discharged").map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (Age {p.age} • STATUS: {p.currentStatus} {p.bedId ? `• Bed Allocated` : ""})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {dischargeSelectedPatient && (
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[11px] text-slate-600 space-y-1 font-semibold">
                                <p className="text-[9px] uppercase font-black text-slate-400 mb-1">DEMOGRAPHICS & CLINICAL RISK PROFILE</p>
                                <p><strong className="text-slate-800 font-bold">Age / Gender:</strong> {dischargeSelectedPatient.age} years / {dischargeSelectedPatient.gender}</p>
                                <p><strong className="text-slate-800 font-bold">Blood Type:</strong> {dischargeSelectedPatient.bloodType || "O positive"}</p>
                                <p><strong className="text-slate-800 font-bold">Diagnosing History:</strong> {dischargeSelectedPatient.history || "No prior major cardiovascular conditions specified."}</p>
                                <p>
                                  <strong className="text-slate-800 font-bold">Drug Allergies:</strong>{" "}
                                  {dischargeSelectedPatient.allergies && dischargeSelectedPatient.allergies.length > 0 ? (
                                    <span className="text-red-600 font-extrabold">{dischargeSelectedPatient.allergies.join(", ")}</span>
                                  ) : (
                                    <span className="text-emerald-600 font-bold">NKDA (No Known Drug Allergies)</span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* 2. Clinical treatment course text */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pb-1 border-b border-slate-200">
                              Clinical Course during Hospitalization
                            </h3>

                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick-Fill Treatment Course Presets:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                                {[
                                  {
                                    label: "Appendectomy Post-Op",
                                    course: "Post-op laparoscopic appendectomy, day 3. Wound healing normally with clean sutures. Tolerating full solid food. Pain scores consistently below 2/10 on oral acetaminophen."
                                  },
                                  {
                                    label: "Pneumonia Resolved",
                                    course: "Admitted for acute lobar bacterial pneumonia. Completed a full six-day course of IV Ceftriaxone. Chest auscultation shows clear lung air entry bilaterally. SpO2 stable on room air."
                                  },
                                  {
                                    label: "Hypertensive Crisis Managed",
                                    course: "Ingressed on extreme blood pressure values of 190/110. Managed and stabilized successfully using Amlodipine & Lisinopril therapy. Patient asymptomatic over past thirty-six hours."
                                  },
                                  {
                                    label: "Minor Joint Fracture Stabilized",
                                    course: "Closed reduction of distal radius fracture under conscious sedation. Fibreglass cast applied correctly. Peripheral pulses are strong. Sensation intact. Refitted for physical therapy."
                                  }
                                ].map((preset, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => {
                                      setDischargeClinicalCourse(preset.course);
                                      if (dischargeSelectedPatient) {
                                        handleGenerateAutomatedDischarge(preset.course);
                                      } else {
                                        alert("Please select a target patient first!");
                                      }
                                    }}
                                    className={`p-2.5 rounded-xl text-[10px] text-left border transition cursor-pointer flex flex-col justify-between h-24 ${
                                      dischargeClinicalCourse === preset.course
                                        ? "bg-emerald-50 text-emerald-950 border-emerald-400 border-emerald-500"
                                        : "bg-slate-50 text-slate-650 border-slate-200"
                                    }`}
                                  >
                                    <span className="font-black text-[8px] uppercase text-emerald-600 tracking-wider mb-1">{preset.label}</span>
                                    <span className="line-clamp-2 italic">"{preset.course}"</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Custom Discharge Narrative & Therapy Actions:</p>
                              <textarea
                                rows={4}
                                placeholder="E.g., Complete cardiac workup performed, patient stabilized post coronary angioplasty, recommended outpatient echo in 2 weeks..."
                                value={dischargeClinicalCourse}
                                onChange={(e) => setDischargeClinicalCourse(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 leading-relaxed"
                              />
                            </div>

                            <button
                              onClick={() => handleGenerateAutomatedDischarge()}
                              disabled={dischargeLoading || !dischargeSelectedPatient}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] py-3 rounded-xl transition flex items-center justify-center gap-2 select-none cursor-pointer disabled:opacity-50 font-bold"
                            >
                              {dischargeLoading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Automating Clinical Clearances...</span>
                                </>
                              ) : (
                                <>
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Prepare Smart AI Discharge Summary</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Right Summary Canvas */}
                        <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between min-h-[500px] shadow-inner relative">
                          {!dischargeResult ? (
                            <div className="my-auto text-center text-slate-400 space-y-4 py-20">
                              <FileText className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-700">Discharge Sheet Compilation Board</p>
                                <p className="text-[11px] text-slate-400 max-w-xs mx-auto font-semibold">
                                  Select an active inpatient from the dropdown list, verify or customize their clinical hospitalization course, then click "Prepare Smart AI Discharge Summary" to compile comprehensive medical paperwork.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-5 text-xs text-slate-700 font-semibold">
                              {/* Clinical header */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                                  <div>
                                    <span className="text-[8px] font-black uppercase text-rose-500 tracking-wider block">OFFICIAL SWASTI DISCHARGE CERTIFICATE</span>
                                    <h4 className="text-[13px] font-black text-slate-900 mt-0.5">{dischargeSelectedPatient?.name}</h4>
                                  </div>
                                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                    PATIENT ID: #{dischargeSelectedPatient?.id.substring(0, 8).toUpperCase()}
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[9px] font-black text-emerald-600 block uppercase tracking-widest">📋 AI CLINICAL RESOLUTION SUMMARY</span>
                                    <p className="text-slate-800 font-medium text-[11px] mt-1 leading-relaxed italic bg-emerald-50/50 px-3 py-2.5 rounded-lg border border-emerald-100 font-semibold">
                                      {dischargeResult.speechSummary}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    <div>
                                      <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">🥗 DIETARY DICTUM</span>
                                      <p className="text-slate-700 text-[11px] font-semibold mt-1 leading-relaxed">{dischargeResult.dietaryInstructions}</p>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">🏃 PHYSICAL ACTIVITY BARRIERS</span>
                                      <p className="text-slate-700 text-[11px] font-semibold mt-1 leading-relaxed">{dischargeResult.activityRestrictions}</p>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-slate-100">
                                    <span className="text-[9px] font-black text-amber-600 block uppercase tracking-widest">📅 OUTPATIENT FOLLOW-UP PLAN</span>
                                    <p className="text-slate-800 text-[11px] font-bold mt-1 bg-amber-50 px-2.5 py-1.5 rounded text-amber-950 font-semibold">{dischargeResult.followUpPlan}</p>
                                  </div>

                                  {dischargeResult.warningSignals && (
                                    <div className="bg-red-50/50 border border-red-150 p-2.5 rounded-lg">
                                      <span className="text-[8px] font-black text-red-700 uppercase block tracking-wider mb-1">🚨 CRITICAL WARNING SYMPTOMS FOR IMMEDIATE ER RE-ENTRY</span>
                                      <ul className="space-y-0.5 text-[10px] text-red-805">
                                        {dischargeResult.warningSignals.map((sig: string, sIdx: number) => (
                                          <li key={sIdx} className="flex items-center gap-1 font-semibold">
                                            <span className="text-red-500 font-extrabold">•</span> {sig}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 2. Active hospital medication schedule */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                <span className="text-[9px] font-black text-sky-600 block uppercase tracking-widest">💊 ACTIVE DISCHARGE MEDICATION LIST</span>
                                {prescriptions.filter(p => p.patientId === dischargeSelectedPatient?.id).length === 0 ? (
                                  <p className="text-slate-400 italic text-[11px] py-1 font-medium">No chronic medications actively authored for this patient. Ensure clinical stability before dismissal without drug therapy.</p>
                                ) : (
                                  <div className="space-y-2 mt-2">
                                    {prescriptions.filter(p => p.patientId === dischargeSelectedPatient?.id).map((script) => (
                                      <div key={script.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-[11px]">
                                        <div>
                                          <p className="font-extrabold text-slate-800">{script.medicineName} ({script.dosage})</p>
                                          <p className="text-slate-500 font-semibold text-[10px] mt-0.5">Instructions: {script.frequency} • {script.instructions}</p>
                                        </div>
                                        <span className="bg-sky-50 text-sky-850 px-2 py-0.5 rounded font-black text-[9px] uppercase border border-sky-200">DISCHARGE DISPATCHED</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* 3. Hospitalization financial summary */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">💰 GENERAL HIS BILLING STATEMENT</span>
                                {bills.filter(b => b.patientId === dischargeSelectedPatient?.id).length === 0 ? (
                                  <p className="text-slate-400 italic text-[11px] py-1">No hospital billing accounts configured for this patient ID.</p>
                                ) : (
                                  <div>
                                    {bills.filter(b => b.patientId === dischargeSelectedPatient?.id).map((b) => (
                                      <div key={b.id} className="space-y-2">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-500 font-bold">
                                          <div>
                                            <p className="text-slate-400">Consultation:</p>
                                            <p className="text-slate-700">${b.consultationCharges}</p>
                                          </div>
                                          <div>
                                            <p className="text-slate-400">Lab Reports:</p>
                                            <p className="text-slate-700">${b.labCharges}</p>
                                          </div>
                                          <div>
                                            <p className="text-slate-400">Pharmacy Drugs:</p>
                                            <p className="text-slate-700">${b.pharmacyCharges}</p>
                                          </div>
                                          <div>
                                            <p className="text-slate-400">Room Tariff:</p>
                                            <p className="text-slate-700">${b.roomCharges}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                                          <div>
                                            <p className="text-slate-500 font-semibold">Net Hospital Bill Total:</p>
                                            <p className="text-[13px] font-black text-slate-900">${b.total.toLocaleString()}</p>
                                          </div>
                                          <span className={`px-2.5 py-0.5 rounded font-black text-[9px] uppercase border ${
                                            b.status === "Paid"
                                              ? "bg-emerald-50 text-emerald-800 border-emerald-250 font-bold"
                                              : "bg-rose-50 text-rose-800 border-rose-200 animate-pulse font-bold"
                                          }`}>
                                            Account Status: {b.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Approve Discharge button */}
                              <div className="pt-4 border-t border-slate-200">
                                <button
                                  type="button"
                                  onClick={handleFinalizeDischarge}
                                  disabled={isFinishingDischarge}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-1.5 shadow shadow-emerald-600/10 disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4 text-white" />
                                  <span>
                                    {isFinishingDischarge
                                      ? "Completing clinical discharges..."
                                      : "Approve AI Clinical Clearance & Set Status to Discharged"}
                                  </span>
                                </button>
                                <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-wider mt-2">
                                  This action automatically releases bed capacity, clears outstanding bills, and flags EHR files as DISCHARGED.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* ========================================================= */}
              {/* 3. ROLE: PHARMACIST & LAB TECH HUB */}
              {/* ========================================================= */}
              {activeRole === StaffRole.PHARMACIST && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Clinical Labs & Pharmacy Dispensing Hub</h2>
                    <p className="text-xs text-slate-400 font-medium">Safety Verification protocols • Drug Dispatches</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* Active Prescriptions list */}
                    <div className="md:col-span-6 space-y-4">
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span>Active Medication Worklists</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Stock check loop</span>
                      </h3>

                      <div className="space-y-3 max-h-[380px] overflow-y-auto">
                        {prescriptions.map((script) => (
                          <div key={script.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-extrabold text-slate-800">{script.medicineName}</p>
                              <p className="text-slate-500 text-[11px] mt-0.5">Dosage: {script.dosage} • Frequency: {script.frequency}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Patient: <strong>{script.patientName}</strong> • Prescribed by {script.prescribedBy}</p>
                            </div>
                            
                            <div>
                              {script.status === "Dispensed" ? (
                                <span className="bg-teal-50 text-teal-850 text-teal-800 border border-teal-200 rounded-full px-2.5 py-1 text-[10px] font-bold">
                                  Dispensed
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleDispenseMedicine(script.id)}
                                  className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition"
                                >
                                  Dispense
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Labs and diagnostics panels */}
                    <div className="md:col-span-6 space-y-4">
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                        Diagnostics & Blood panels
                      </h3>

                      <div className="space-y-3 max-h-[380px] overflow-y-auto">
                        {labOrders.map((order) => (
                          <div key={order.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-800">{order.testName}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                order.status === "Ready"
                                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                                  : order.status === "Processing"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-slate-200 text-slate-600"
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400">
                              Patient: <strong>{order.patientName}</strong> • Requested by {order.orderedBy}
                            </p>

                            {order.result ? (
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600">
                                🔬 {order.result}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCompleteLab(order.id)}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-[9px] uppercase py-1.5 rounded-lg transition"
                              >
                                Submit Lab outcome Results
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* ========================================================= */}
              {/* 4. ROLE: BILLING & ADMINISTRATION CENTRE */}
              {/* ========================================================= */}
              {activeRole === StaffRole.BILLING && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Hospital Invoicing & Account Reconciliation</h2>
                    <p className="text-xs text-slate-400 font-medium">Automatic medication charge integrations • Invoice logs</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                      Outpatient / Inpatient Invoices
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bills.map((bill) => {
                        const isPaid = bill.status === "Paid";
                        return (
                          <div key={bill.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-250 flex flex-col justify-between space-y-4">
                            <div className="flex justify-between items-start pb-2 border-b border-slate-200/50">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Invoice #{bill.id}</span>
                                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{bill.patientName}</h4>
                              </div>
                              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                                isPaid
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-250"
                                  : "bg-red-50 text-red-800 border border-red-200"
                              }`}>
                                {bill.status}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs text-slate-500 font-medium font-mono">
                              <div className="flex justify-between">
                                <span>MD Consultation Fees:</span>
                                <span>${bill.consultationCharges.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Laboratory Blood diagnostics:</span>
                                <span>${bill.labCharges.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Dispensed Pharmacy drugs:</span>
                                <span>${bill.pharmacyCharges.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <span>Admitted Ward Bed charges:</span>
                                <span>${bill.roomCharges.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-bold text-slate-800 text-[13px] pt-1.5">
                                <span>Total Reconciled Charges:</span>
                                <span className="text-teal-600">${bill.total.toLocaleString()}</span>
                              </div>
                            </div>

                            {!isPaid && (
                              <button
                                onClick={() => handlePayInvoice(bill.id)}
                                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2 rounded-lg transition"
                              >
                                Process Secure Credit Payment
                              </button>
                            )}

                            {isPaid && (
                              <div className="text-[10px] text-slate-400 text-center font-semibold pt-1 border-t">
                                Settle validation: Received on {bill.paymentDate}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}


              {/* ========================================================= */}
              {/* 5. ROLE: ACTIVE PATIENT PORTAL INTERFACE */}
              {/* ========================================================= */}
              {activeRole === StaffRole.PATIENT && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Siddharth Verma's Patient Portal</h2>
                      <p className="text-xs text-slate-400 font-medium">Sickness histories • Direct teleconsultation helpdesks</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                      ID: P4 • Active Member
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Patient profile, records, and upcoming appointments */}
                    <div className="lg:col-span-5 space-y-5">
                      
                      {/* Vitals summary */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Clinical Diagnostics Metrics</span>
                        <p className="text-slate-600"><strong>Allergies:</strong> Dust particles (No medication contraries registered)</p>
                        <p className="text-slate-600"><strong>Prescribed Medications:</strong> Ibuprofen 400mg (Post pleuritis)</p>
                      </div>

                      {/* Scheduled Appointments list */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 block pb-1 border-b">
                          Upcoming Registered Appointments
                        </h3>
                        {appointments.map((appt) => (
                          <div key={appt.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-xs space-y-1 mb-2">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>{appt.department}</span>
                              <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{appt.mode}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">Physician: <strong>{appt.doctorName}</strong></p>
                            <p className="text-[10px] text-slate-450 font-mono text-slate-400">{appt.date} at {appt.time}</p>
                          </div>
                        ))}
                      </div>

                      {/* Instructions panel */}
                      <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 text-xs">
                        <h4 className="font-bold text-teal-900 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-teal-600" />
                          Telehealth Inpatient checklist
                        </h4>
                        <p className="text-teal-700/85 mt-2 leading-relaxed font-medium">
                          Your upcoming Cardiology reference checks are fully HIPAA compliance authenticated. Direct consulting coordinates will display automatically on chat channels on consulting day.
                        </p>
                      </div>
                    </div>

                    {/* Right AI Patient assistant Chatbot */}
                    <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-250 flex flex-col h-[400px]">
                      
                      {/* Chat Header */}
                      <div className="bg-white px-4 py-3 rounded-t-2xl border-b border-slate-200/80 flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Swasti Companion Healthcare Advisor</h4>
                          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Natural Language Medical Support</p>
                        </div>
                      </div>

                      {/* Messages body */}
                      <div className="grow overflow-y-auto p-4 space-y-3.5 flex flex-col">
                        {patientChatLog.map((msg) => {
                          const isBot = msg.sender === "assistant";
                          return (
                            <div
                              key={msg.id}
                              className={`max-w-[85%] text-xs p-3 rounded-2xl leading-relaxed ${
                                isBot
                                  ? "bg-white text-slate-700 border border-slate-150 self-start"
                                  : "bg-teal-650 bg-teal-600 text-white self-end shadow-sm"
                              }`}
                            >
                              <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                              <span className={`text-[8px] mt-1 block text-right font-medium ${isBot ? "text-slate-400" : "text-teal-200"}`}>
                                {msg.timestamp}
                              </span>
                            </div>
                          );
                        })}

                        {chatLoading && (
                          <div className="bg-white text-slate-400 border border-slate-150 text-[10px] px-3.5 py-2 rounded-xl self-start flex items-center gap-2">
                            <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                            Companion thinking medical details...
                          </div>
                        )}
                      </div>

                      {/* Chat Footer */}
                      <form onSubmit={handleSendPatientMessage} className="bg-white px-3 py-2.5 rounded-b-2xl border-t border-slate-150 flex gap-2">
                        <input
                          type="text"
                          required
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask about asthma relief dosages, how to book, or clinical terms..."
                          className="grow bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs focus:outline-none focus:border-teal-600"
                        />
                        <button
                          type="submit"
                          className="bg-slate-950 text-white text-xs px-4 py-2 rounded-xl hover:bg-slate-900 transition flex items-center gap-1.5 font-bold"
                        >
                          <Send className="w-3 h-3" /> Ask AI
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
