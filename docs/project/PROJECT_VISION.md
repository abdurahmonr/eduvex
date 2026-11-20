# Project Vision: Education Center ERP + CRM

## 1. Executive Summary

The **Education Center ERP + CRM** is an enterprise-grade education management platform specifically engineered for modern tutoring centers, language academies, preparatory institutions, and multi-branch training schools. 

The platform bridges the communication and operational chasm between institutional leadership, operations personnel, instructional faculty, learners, and parents. By deploying a domain-segregated **Five-Portal Architecture** (`director`, `admin`, `teacher`, `student`, `parent`) connected to a unified PostgreSQL/Supabase database, the system ensures that every stakeholder interacts with an interface dedicated to their workflow while maintaining institutional data integrity and enterprise security.

---

## 2. Strategic Objectives

1. **Operational Cohesion**: Eliminate fragmented communication, disparate spreadsheets, and disconnected tools by centralizing admissions, scheduling, academic tracking, and financial reconciliation.
2. **Subdomain-Driven Isolation**: Deliver dedicated web applications for each stakeholder role on distinct subdomains (`director.example.uz`, `admin.example.uz`, `teacher.example.uz`, `student.example.uz`, `parent.example.uz`), ensuring that application payloads are minimal, focused, and secure.
3. **Ironclad Backend Security**: Enforce security and role permissions at the database layer using PostgreSQL Row Level Security (RLS), treating client interfaces as untrusted presentation shells.
4. **Transparent Family Engagement**: Empower parents with real-time academic progress, lesson attendance logs, and automated tuition payment tracking for all their linked children.
5. **Architectural Modularity**: Maintain an npm Workspaces monorepo where shared business utilities, configuration, UI components, and authentication abstractions are reused without code duplication.

---

## 3. Core Principles

- **No Premature Complexity**: We prioritize clean, robust ES Modules JavaScript, standard React Router patterns, and Vite over convoluted microservices or unnecessary runtime layers.
- **Role-Centric Experience**: A teacher never sees administrative CRM pipelines; a student never sees staff payroll or institution-wide statistics; administrators manage operations without having separate accountant portals.
- **High-Fidelity Regional Localization**: Tailored for Uzbekistan's educational landscape, including native support for UZS currency formatting, national phone number masks (`+998`), and regional academic calendar models.
- **Single Source of Truth**: All five portals consume a single centralized Supabase PostgreSQL instance, guaranteeing immediate data consistency across all user touchpoints.
