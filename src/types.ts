/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Staff roles in Swasti HIS
export enum StaffRole {
  DOCTOR = "Doctor",
  NURSE = "Nurse",
  PHARMACIST = "Pharmacist",
  LAB_TECH = "Lab Technician",
  BILLING = "Billing Specialist",
  ADMIN = "Administrator",
  PATIENT = "Patient"
}

// Specialty Departments
export enum Department {
  EMERGENCY = "Emergency Medicine",
  CARDIOLOGY = "Cardiology",
  PEDIATRICS = "Pediatric Care",
  GENERAL_MEDICINE = "General Medicine",
  NEUROLOGY = "Neurology",
  ORTHOPEDICS = "Orthopedics"
}

// Bed structure
export interface Bed {
  id: string;
  roomNumber: string;
  ward: "Emergency" | "General Ward" | "ICU" | "Maternity" | "Pediatrics";
  bedNumber: string;
  status: "Available" | "Occupied" | "Maintenance";
  occupiedByPatientId?: string;
  occupiedByPatientName?: string;
}

// Triage levels
export enum TriageLevel {
  IMMEDIATE = "Level 1: Immediate/Resuscitation", // Red
  EMERGENT = "Level 2: Emergent",                 // Orange
  URGENT = "Level 3: Urgent",                     // Yellow
  LESS_URGENT = "Level 4: Semi-Urgent",           // Green
  NON_URGENT = "Level 5: Non-Urgent"              // Blue
}

// Patient Records
export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phoneNumber: string;
  email: string;
  bloodType?: string;
  history?: string; // Past conditions
  admittedAt?: string;
  bedId?: string;
  currentStatus: "Discharged" | "Admitted" | "In Triage" | "Observation" | "Outpatient";
  allergies?: string[];
}

// Virtual Appointments Model
export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  department: Department;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  mode: "Physical" | "Teleconsultation";
}

// Medication Prescription
export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "Once daily", "Twice daily"
  instructions: string; // e.g. "After food"
  prescribedBy: string; // Doctor name
  prescribedDate: string;
  status: "Pending" | "Dispensed";
}

// Laboratory tests
export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  testName: string; // e.g. "Complete Blood Count", "Lipid Profile"
  orderedBy: string;
  orderedDate: string;
  status: "Ordered" | "Processing" | "Ready";
  result?: string; // Filled once ready
}

// Billing records
export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  consultationCharges: number;
  labCharges: number;
  pharmacyCharges: number;
  roomCharges: number;
  discount: number;
  total: number;
  status: "Unpaid" | "Paid";
  paymentDate?: string;
}

// Scribe session model
export interface ScribeSession {
  id: string;
  patientId?: string;
  patientName: string;
  rawText: string;
  soapNotes?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  icdCodes?: Array<{ code: string; description: string }>;
  medications?: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  timestamp: string;
}

// Chat integration
export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}
