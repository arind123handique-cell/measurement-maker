# Tasks: Online Measurement Maker Web App

**Input**: Design documents from `specs/001-online-measurement-maker/`  
**Prerequisites**: [plan.md](file:///D:/PROJECTS%20APP/Measurement%20Maker/specs/001-online-measurement-maker/plan.md), [spec.md](file:///D:/PROJECTS%20APP/Measurement%20Maker/specs/001-online-measurement-maker/spec.md)  
**Status**: Completed (100% Implemented & Verified)

---

## Phase 1: Setup & Foundational Infrastructure

- [x] **T001**: Scaffold web application directory `web/` using Vite, React 18, TypeScript, and Tailwind CSS.
- [x] **T002**: Install `@supabase/supabase-js`, `lucide-react`, `xlsx` / `exceljs`, and styling utilities.
- [x] **T003**: Create `web/src/lib/supabaseClient.ts` configured with project `rdirvoopoaspyqiowmus` credentials.
- [x] **T004**: [P] Create `web/src/types/database.types.ts` containing the generated Supabase database schema definitions.

---

## Phase 2: User Story 1 (P1) – Project & Room Schedule Management 🎯 MVP Increment 1

- [x] **T005**: [US1] Create `web/src/components/ProjectHeader.tsx` displaying work name, client authority, division, and SOR reference.
- [x] **T006**: [US1] Create `web/src/components/BuildingManager.tsx` allowing engineers to add buildings (G+1 Main, Dormitory, Cottage) with default ceiling height.
- [x] **T007**: [US1] Create `web/src/components/RoomScheduleTable.tsx` for entering room names, $L$, $B$, $H$, with live perimeter $2(L+B)$ and carpet area calculations.
- [x] **T008**: [US1] Create `web/src/components/OpeningScheduleModal.tsx` for adding doors ($D_1$), windows ($W_1$), and ventilators ($V$) to each room.
- [x] **T009**: [US1] Hook up Supabase CRUD operations for `projects`, `buildings`, `rooms`, and `openings`.

---

## Phase 3: User Story 2 (P1) – Automated Measurement Book (MB) Editor 🎯 MVP Increment 2

- [x] **T010**: [US2] Create `web/src/lib/measurementEngine.ts`:
  - Calculate room perimeter walls ($Nos \times 2(L+B) \times H$)
  - Generate negative opening deductions ($-Nos \times W \times H$)
  - Calculate structural beam projections ($Nos \times L \times 0.73\text{m}$)
  - Calculate identical floor multipliers
- [x] **T011**: [US2] Create `web/src/components/MeasurementBookGrid.tsx` rendering the official PWD layout:
  - Columns: `SL. No.`, `CODE NO`, `PARTICULARS`, `No.`, `x`, `L`, `x`, `B`, `x`, `H`, `QTY`, `Unit`, `RATE`, `AMOUNT`.
  - Item headers, room-by-room calculation rows, deductions, and item subtotal rows.
- [x] **T012**: [US2] Implement inline row addition, negative deduction toggling, and live total recalculations.
- [x] **T013**: [US2] Persist generated MB lines into Supabase `measurements` and `estimate_items`.

---

## Phase 4: User Story 3 (P1) – Official PWD Excel & PDF Export 🎯 MVP Increment 3

- [x] **T014**: [US3] Create `web/src/lib/excelExporter.ts` producing workbooks formatted identically to the **`AType Cottage`** reference:
  - A4 portrait print orientation and page margins
  - Arial Narrow fonts, header styling, and thin borders
  - Native Excel formulas (`=D*F*J`, `=ROUND(SUM(...), 2)`, `=ROUND(K*M, 2)`)
  - Civil works grand total formula and amount in words
- [x] **T015**: [US3] Add 1-click **"Export Measurement Book (.xlsx)"** button and download trigger.
- [x] **T016**: [US3] Validate exported file against benchmark `FULL CIRCUIT HOUSE ESTIMATE.xlsx` to ensure 0.00 discrepancy.

---

## Phase 5: User Story 4 (P2) – BOQ Reconciliation Matrix

- [x] **T017**: [US4] Create `web/src/components/BOQReconciliationTable.tsx` comparing Sanctioned BOQ quantities vs MB Measured quantities.
- [x] **T018**: [US4] Display visual status badges:
  - 🟢 **MATCH** ($\Delta = 0.00$)
  - 🔴 **OVERRUN** ($\Delta > 0.00$)
  - 🟡 **SAVING** ($\Delta < 0.00$)
- [x] **T019**: [US4] Show total estimate variance and summary financial cards.

---

## Phase 6: User Story 5 (P2) – Gemini Multimodal Blueprint Takeoff

- [x] **T020**: [US5] Create `web/src/components/BlueprintUploader.tsx` supporting PDF and image uploads with interactive pan/zoom.
- [x] **T021**: [US5] Implement Gemini Vision API prompt to extract room names, dimensions ($L \times B$), ceiling height, and door/window schedules from floor plans.
- [x] **T022**: [US5] Provide interactive confirmation dialog before populating room schedules into Supabase.

---

## Phase 7: User Story 6 (P2) – Parametric Auto Estimation via Form Query & Natural Language

- [x] **T023**: [US6] Create `web/src/lib/formQueryEngine.ts` with natural language parser, parametric room schedule synthesizer, and IS:1200 quantity takeoff engine.
- [x] **T024**: [US6] Create `web/src/components/AutoEstimationWizard.tsx` with prompt bar, typology selectors, plinth area slider, and DSR 2021 specification toggles.
- [x] **T025**: [US6] Implement instant executive cost metrics (Total Cost, Plinth Area Rate/Sqm & Sqft, Category breakdown).
- [x] **T026**: [US6] Provide 1-click **"Apply to Active Project"** and **"Export .xlsx"** directly from the Form Query Wizard.
