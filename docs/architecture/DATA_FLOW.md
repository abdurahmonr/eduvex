# End-to-End System Data Flows

## 1. Overview

This document maps out the core data lifecycles and sequence workflows of the Education Center ERP + CRM across portals, services, and the database.

---

## 2. Workflow 1: Inbound Lead to Student Enrollment

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Campus Admin
    participant App as admin.example.uz
    participant Service as admin/services/crmService.js
    participant Supa as Supabase PostgREST
    participant DB as Postgres Database

    Admin->>App: Submits new inquiry (Name, Phone, Course)
    App->>Service: createLead(leadData)
    Service->>Supa: client.from('leads').insert(payload)
    Supa->>DB: INSERT INTO public.leads (institution_id, name, phone, status='new')
    DB-->>Supa: 201 Created (lead_id)
    Supa-->>App: Lead registered on Kanban board

    Admin->>App: Books Trial Lesson -> Updates status to 'trial_scheduled'
    App->>Service: scheduleTrial(lead_id, lesson_id)
    Service->>Supa: client.from('trial_lessons').insert(...)
    Supa->>DB: Records trial booking

    Note over Admin,DB: Trial Completed & Approved
    Admin->>App: Clicks "Convert to Student"
    App->>Service: convertLeadToStudent(lead_id, group_id, parent_info)
    Service->>Supa: client.rpc('convert_lead_to_enrolled_student', payload)
    Supa->>DB: RPC Transaction: Creates profile, student, parent_students, group_students & initial invoice
    DB-->>Supa: Success (student_id, invoice_id)
    Supa-->>App: Conversion complete! Student visible in Directory.
```

---

## 3. Workflow 2: Lesson Attendance Journaling & Realtime Parent Notification

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Teacher
    participant TchApp as teacher.example.uz
    participant TchSvc as teacher/services/attendanceService.js
    participant Supa as Supabase API & Realtime
    participant DB as Postgres Database
    participant ParApp as parent.example.uz
    actor Parent as Parent

    Teacher->>TchApp: Opens lesson journal for Group #104
    TchApp->>TchSvc: getLessonRoster(lessonId)
    TchSvc->>Supa: client.from('group_students').select(...)
    Supa->>DB: SELECT with RLS (validates teacher_id = auth.uid())
    DB-->>TchApp: Renders student attendance checklist

    Teacher->>TchApp: Toggles Student "Absent" & enters note "Unexcused"
    Teacher->>TchApp: Clicks "Save Attendance"
    TchApp->>TchSvc: recordAttendance(lessonId, records)
    TchSvc->>Supa: client.from('attendance').upsert(records)
    Supa->>DB: INSERT / UPDATE public.attendance
    DB-->>Supa: Write confirmed (AFTER INSERT/UPDATE trigger logs mutation to audit_logs)
    DB-->>Supa: WAL Change Event emitted to Realtime channel

    Supa->>ParApp: Realtime WebSocket Broadcast (CDC Event)
    ParApp->>ParApp: Verifies student_id matches linked children
    ParApp-->>Parent: Alerts: "Child marked Absent for IELTS Lesson at 09:15"
```

---

## 4. Workflow 3: Tuition Billing & Cashier Reconciliation (No Accountant)

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student / Parent
    actor Admin as Campus Admin (Cashier)
    participant App as admin.example.uz
    participant Svc as admin/services/financeService.js
    participant RPC as Supabase RPC Endpoint
    participant DB as Postgres Engine
    participant DirApp as director.example.uz
    actor Director as Director

    Student->>Admin: Presents monthly tuition fee (1,500,000 UZS via Terminal Card)
    Admin->>App: Opens Cashier -> Selects Student -> Selects Invoice #INV-802
    Admin->>App: Submits "Record Payment" (Card, 1,500,000 UZS)
    App->>Svc: recordTuitionPayment(invoiceId, amount, 'card')
    Svc->>RPC: client.rpc('process_tuition_payment', payload)
    
    Note over RPC,DB: Atomic Multi-Table Transaction
    RPC->>DB: BEGIN TRANSACTION
    RPC->>DB: Validates admin holds 'finance:cashier' permission in JWT claims
    RPC->>DB: INSERT INTO public.payments (amount=1500000, method='card', cashier_id)
    Note over DB: Database AFTER INSERT trigger automatically writes to public.audit_logs
    RPC->>DB: UPDATE public.invoices SET status='paid', paid_at=NOW()
    RPC->>DB: UPDATE public.student_balances SET balance = balance + 1500000
    RPC->>DB: COMMIT TRANSACTION
    DB-->>RPC: Transaction Success (Receipt #REC-2026-904)
    RPC-->>App: Payment successful! Prints receipt.

    Note over DirApp,Director: Executive Audit Synchronization
    Director->>DirApp: Refreshes Financial Health Overview
    DirApp->>DB: SELECT SUM(amount) FROM payments WHERE institution_id=...
    DB-->>DirApp: Returns updated gross collected revenue (+1,500,000 UZS)
```

---

## 5. Workflow 4: Parent Multi-Child Academic & Attendance Monitoring

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Parent
    participant App as parent.example.uz
    participant Svc as parent/services/familyService.js
    participant Supa as Supabase PostgREST
    participant DB as Postgres Database (RLS)

    Parent->>App: Logs in -> App loads Family Dashboard
    App->>Svc: getLinkedChildren()
    Svc->>Supa: client.from('parent_students').select('student:profiles(*)')
    Supa->>DB: SELECT WHERE parent_id = auth.uid()
    DB-->>App: Returns Child 1 (Alisher) & Child 2 (Madina)

    App-->>Parent: Displays Child Switcher Tabs
    Parent->>App: Clicks "Alisher" -> Selects "Academic Progress"
    App->>Svc: getChildGrades(alisher_id)
    Svc->>Supa: client.from('grades').select('*').eq('student_id', alisher_id)
    Supa->>DB: RLS verifies parent_students relationship exists
    DB-->>App: Returns homework scores, exam grades, teacher feedback
    App-->>Parent: Renders Gradebook & mastery milestones
```
