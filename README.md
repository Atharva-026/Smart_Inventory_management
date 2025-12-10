Smart Inventory Management System – Mechanical Lab Workshops

A full-stack MERN-based Inventory Management solution designed for Mechanical Engineering labs.
The system automates tool issuing and returning using QR codes, real-time tracking, email verification, data analytics, and role-based dashboards. It removes manual logbooks and introduces a modern digital workflow suitable for college workshops.

Overview

Mechanical workshops often face issues such as untracked tools, lost equipment, manual logbook errors, and lack of usage insights.
This Smart Inventory Management System solves these challenges by digitizing inventory operations and providing automated, transparent, and secure tool management.

The system supports three roles:

Student – Scan and borrow/return tools

Faculty – Manage students and monitor their activity

Admin – Manage faculty, tools, stock, analytics, and system users

Key Features
1. QR Code Generation

Admin generates unique QR codes for each tool.

Codes can be downloaded as PNG or PDF.

Each QR includes Tool ID, Name, and optional Locker ID.

2. QR Code Scanning

Students scan QR to borrow or return tools.

The system validates availability and previous transactions.

Prevents duplicate or invalid scans.

Every action is logged in MongoDB.

Role-Based Dashboards
Student Dashboard

Borrow and return tools using QR scanning

View personal tool usage history

Manage profile

Check tool borrowing status

Faculty Dashboard

Manage student accounts

View all students and their transaction history

Track tool usage by students

Export logs (CSV/PDF)

Admin Dashboard

Manage faculty accounts

Manage tool inventory and stock

Add/Edit/Delete tools

Generate QR codes

View full analytics

Export complete system reports

Manage email verification system

Control hardware integrations (ESP32 lockers)

System Analytics (Admin)

The analytics module includes:

Most borrowed tools

Least used tools

Daily/weekly borrowing trends

Tool availability insights

Stock movement analysis

Student and faculty usage patterns

Graphs help identify demand patterns, tool shortage risks, and budgeting requirements.

Data Export (PDF & CSV)

The system supports exporting data in:

CSV (Excel compatible)

PDF (for reports and documentation)

Files available for export:

Transaction logs

Tool lists

Student activity

Faculty usage reports

Analytics data summaries

Email Verification

To ensure account authenticity, the platform uses:

OTP-based email verification

Gmail App Passwords (Nodemailer integration)

Verification for students, faculty, and admins

This prevents fake registrations and enhances system security.

Security Features

JWT-based authentication

Role-based access control (RBAC)

Bcrypt password hashing

Protected API routes

Input and form validation

Workflow (Tool Borrow/Return)

Admin adds a tool and generates its QR code.

Faculty manages student accounts and assigns access.

Student logs in and scans the QR code.

Backend checks availability and validates the transaction.

If valid, tool gets issued and timestamp stored.

Student returns the tool by scanning again.

Database updates the status instantly.

Faculty monitors student activity.

Admin views analytics and downloads reports.

Optional Hardware Workflow:

ESP32 unlocks the tool locker if scan is approved.

Technology Stack

Frontend: React.js, Axios, React Router
Backend: Node.js, Express.js, JWT, Nodemailer
Database: MongoDB
Hardware (Optional): ESP32 microcontroller with servo/solenoid locks

Modules Included

Authentication & Email Verification

QR Code Generator

QR Scanner Module

Tool Inventory Module

Student Management Module (Faculty)

Faculty Management Module (Admin)

Analytics Dashboard

Reports Export (PDF/CSV)

ESP32 Locker Control (Optional)

Conclusion

The Smart Inventory Management System modernizes mechanical workshop operations by providing transparency, automation, and real-time tracking.
Its role-based workflow, analytics, QR-based scanning, and data export capabilities make it a complete solution for college labs and engineering departments.

It improves accountability, reduces tool loss, saves manual work, and offers data-driven insights for better inventory planning.
