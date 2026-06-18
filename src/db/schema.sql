-- ==========================================
-- SWASTI.AI HOSPITAL INFORMATION SYSTEM (HIS)
-- Production PostgreSQL Database DDL Schema
-- ==========================================

-- Enable standard security and identification extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Staff Accounts / System Roles
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Secure hash
    role VARCHAR(50) NOT NULL CHECK (role IN ('Doctor', 'Nurse', 'Pharmacist', 'Lab Technician', 'Billing Specialist', 'Administrator')),
    department VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Patients
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 125),
    gender VARCHAR(15) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    phone_number VARCHAR(25) NOT NULL,
    email VARCHAR(100) UNIQUE,
    blood_type VARCHAR(10) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    history TEXT, -- Clinical summary of past conditions
    allergies TEXT[], -- Array of diagnosed compound allergies
    current_status VARCHAR(25) NOT NULL CHECK (current_status IN ('Discharged', 'Admitted', 'In Triage', 'Observation', 'Outpatient')),
    admitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Wards & Bed Inventory
CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    ward VARCHAR(50) NOT NULL CHECK (ward IN ('Emergency', 'General Ward', 'ICU', 'Maternity', 'Pediatrics')),
    bed_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
    occupied_by_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on bed ward for instant search during emergency allocations
CREATE INDEX IF NOT EXISTS idx_beds_ward_status ON beds(ward, status);

-- Table: Appointments (Physical & Teleconsultations)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_name VARCHAR(100) NOT NULL,
    patient_email VARCHAR(100) NOT NULL,
    patient_phone VARCHAR(25) NOT NULL,
    department VARCHAR(100) NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    mode VARCHAR(20) NOT NULL DEFAULT 'Physical' CHECK (mode IN ('Physical', 'Teleconsultation')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Prescriptions & Medication Logs
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL, -- e.g. "500mg"
    frequency VARCHAR(100) NOT NULL, -- e.g. "Twice daily"
    instructions TEXT, -- e.g. "Take after meals"
    prescribed_by VARCHAR(100) NOT NULL, -- Referencing Doctor's Name
    prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dispensed')),
    dispensed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Laboratory Test Orders
CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_name VARCHAR(150) NOT NULL,
    ordered_by VARCHAR(100) NOT NULL,
    ordered_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Ordered' CHECK (status IN ('Ordered', 'Processing', 'Ready')),
    result TEXT, -- Lab clinician entries
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Bills & Invoices
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consultation_charges DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    lab_charges DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    pharmacy_charges DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    room_charges DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(15) NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Paid')),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: AI Scribe Clinical Sessions
CREATE TABLE IF NOT EXISTS scribe_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(100) NOT NULL,
    raw_transcript TEXT NOT NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    icd_codes JSONB, -- Stores array of [{code, description}]
    prescribed_medicines JSONB, -- Stores medications array [{name, dosage, frequency, duration}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for optimized diagnostic lookup
CREATE INDEX IF NOT EXISTS idx_scribe_patient ON scribe_sessions(patient_id);
