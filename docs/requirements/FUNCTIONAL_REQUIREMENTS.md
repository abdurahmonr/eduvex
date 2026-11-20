# Functional Requirements Document

## 1. Scope & System Overview

This document specifies the functional requirements for the Education Center ERP + CRM platform across the five core portals.

---

## 2. Portal-Specific Functional Requirements

### 2.1 Director Portal (`director.example.uz`)

- **FR-DIR-01 (Executive Dashboard)**: System shall provide real-time KPIs showing active student enrollment, monthly collected revenue, staff counts, and branch capacity.
- **FR-DIR-02 (Administrator Management)**: Director shall have the ability to create, edit, deactivate, and assign campus administrator accounts.
- **FR-DIR-03 (Financial Oversight)**: Director shall have view and audit access to consolidated revenue reports, branch expenditures, and outstanding debt balances.
- **FR-DIR-04 (Branch Governance)**: Director shall be able to configure institution branches, room allocations, and global operating policies.
- **FR-DIR-05 (Tariff Approvals)**: Director shall define and approve tuition tariff schedules, discounts, and payment policies.

### 2.2 Admin Portal (`admin.example.uz`)

- **FR-ADM-01 (CRM & Lead Ingestion)**: Administrators shall be able to capture inbound inquiries, schedule trial lessons, record notes, and transition leads to enrolled students.
- **FR-ADM-02 (Student Directory)**: Administrators shall register students, assign identification numbers, link parent contacts, and manage contract statuses.
- **FR-ADM-03 (Group & Course Scheduling)**: Administrators shall create course cohorts (groups), set weekly schedules (days/times), assign classrooms, and assign instructors.
- **FR-ADM-04 (Operational Cashiering)**: Administrators shall record student tuition payments (cash, card, bank transfer), generate receipts, and manage student balance ledgers.
- **FR-ADM-05 (No Independent Accountant Rule)**: All daily billing and cashier workflows must be performed directly in the Admin portal without routing to an external accountant interface.

### 2.3 Teacher Portal (`teacher.example.uz`)

- **FR-TCH-01 (Assigned Cohorts)**: Teachers shall view only the groups and students explicitly assigned to them.
- **FR-TCH-02 (Lesson Attendance)**: Teachers shall record attendance for each lesson with status flags (Present, Absent, Excused, Late).
- **FR-TCH-03 (Grade & Evaluation Journal)**: Teachers shall enter homework scores, examination grades, and performance notes for enrolled students.
- **FR-TCH-04 (Schedule View)**: Teachers shall access a weekly interactive timetable of their upcoming classes and room assignments.

### 2.4 Student Portal (`student.example.uz`)

- **FR-STU-01 (Personal Learning Space)**: Students shall view their active course enrollments, instructors, and group schedules.
- **FR-STU-02 (Attendance Record)**: Students shall view historical attendance percentages and lesson logs.
- **FR-STU-03 (Tuition Balance)**: Students shall review their current payment balance, payment due dates, and paid invoices.
- **FR-STU-04 (Study Resources)**: Students shall access course syllabi and lesson study notes.

### 2.5 Parent Portal (`parent.example.uz`)

- **FR-PAR-01 (Linked Children View)**: Parents shall access a family dashboard with the ability to switch between multiple enrolled children.
- **FR-PAR-02 (Attendance Monitoring)**: Parents shall view real-time lesson attendance records and absence history for their children.
- **FR-PAR-03 (Academic Progress)**: Parents shall review grades, teacher feedback, and milestone evaluations for each child.
- **FR-PAR-04 (Tuition Statements & Receipts)**: Parents shall review itemized invoices and download digital receipts for tuition payments.

---

## 3. Cross-Portal Functional Requirements

- **FR-SYS-01 (Role Segregation)**: A user authenticated in one portal shall only access resources permitted by their backend role.
- **FR-SYS-02 (Centralized Auth)**: Authentication credentials shall be validated against a unified Supabase Auth instance.
- **FR-SYS-03 (Audit Trail)**: Financial records, attendance changes, and administrator actions shall create immutable audit log entries.
