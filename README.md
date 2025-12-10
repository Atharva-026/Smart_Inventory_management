📦 Smart Inventory Management System – Mechanical Lab Workshops

A full-stack MERN + IoT–powered platform for automating tool issuing and returning inside Mechanical Engineering workshops.
This system replaces manual logbook entries with QR-based tracking, role-based dashboards, email verification, analytics, and optional ESP32 locker automation.

🚀 Overview

Mechanical workshops face issues like:

Lost or untracked tools

Manual logbook delays

No transparent record

Difficulty in auditing usage

No insights on tool demand or damage

The Smart Inventory Management System solves these through digitalization, automation, and real-time monitoring using QR codes.

🧩 Key Features
✅ 1. QR Code Generation

Admin generates QR codes for each tool.

Downloadable as PNG/PDF.

Label tools for quick scanning.

Includes Tool ID, Tool Name, Category, Locker ID (optional ESP32).

✅ 2. QR Code Scanning

Students scan QR codes to borrow/return tools.

System validates tool status.

Prevents duplicate or invalid transactions.

Fully logged in MongoDB.

🎛 Role-Based Dashboards
🎓 Student Dashboard

Borrow and return tools via QR scanning

View personal tool history

Update profile

Check tool status

Receive alerts if tool is overdue (optional)

🧑‍🏫 Faculty Dashboard

Faculty role responsibilities:

✔ Can manage students under them
✔ Add or remove student accounts
✔ View student borrowing history
✔ Monitor all transactions
✔ Download logs in CSV/PDF
✔ View tool usage patterns within their group

Faculty do NOT manage tools or stock.

🛠 Admin Dashboard

Admin role responsibilities (full control):

✔ Manage Faculty Accounts (Add/Edit/Delete)
✔ Manage Inventory (Tools & Stocks)
✔ Add/Edit/Delete tools
✔ Generate QR codes
✔ View ALL transactions
✔ View complete system analytics
✔ Download full reports (PDF/CSV)
✔ Handle email verification system
✔ Manage roles & system users
✔ ESP32 locker integration control

Admin controls the entire system.

📊 3. System Analytics (Admin Only)

Analytics include:

Most borrowed tools

Least used items

Daily/weekly borrowing frequency

Tool availability comparison

Stock analysis

Student/faculty usage patterns

Graphs allow labs to:

Identify heavily used tools

Predict damage or replacement needs

Improve budgeting

Optimize inventory planning

📄 4. Export Data (PDF & CSV)

Available for Admin and Faculty:

Tool stock list

Transaction logs

Student activity

Department usage

Analytics summary

Supports:

CSV for Excel

PDF for report submission

✉️ 5. Email Verification

For secure login:

OTP-based verification via Gmail App Password

Nodemailer integration

Avoids fake registrations

Used for students, faculty, and admins

🔐 6. Security Features

JWT-based authentication

Role-based access control (RBAC)

Password hashing using bcrypt

Protected backend routes

Form-level validation

Secure API layer

🔄 How It Works (Workflow)

Admin uploads tools → QR codes generated

Faculty manages students (add/remove)

Student scans QR to borrow a tool

Backend checks availability

If available → tool issued, time logged

Student scans again to return

Database updates instantly

Admin sees analytics, tool usage, and stock levels

Faculty monitors student activity

Admin exports CSV/PDF reports anytime

Optional IoT:

ESP32 opens/closes lockers on successful scan validation.

🏗 Tech Stack

Frontend: React, Axios, React Router
Backend: Node.js, Express.js, MongoDB, JWT, Nodemailer
Database: MongoDB (Atlas Compatible)
Hardware (Optional): ESP32 + Servo/Solenoid Lock

🧩 Modules Included

Authentication & Email Verification

QR Generator & Scanner

Tool Inventory Module

Student Management (Faculty Role)

Faculty Management (Admin Role)

Analytics Dashboard

Transaction Log Module

PDF/CSV Exporter

ESP32 Locker Control (Optional)

📝 Conclusion

This system modernizes mechanical workshop tool management by providing:

Full transparency

Automated logs

Real-time tracking

Role-based permissions

Data-driven insights

Secure access

It is scalable and suitable for any engineering department or institution.
