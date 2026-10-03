# Feature Specification: Online Measurement Maker Web App

**Feature Branch**: `001-online-measurement-maker`  
**Created**: 2026-10-03  
**Status**: Approved / In-Planning  
**Input**: "online based web app with supabase integration and other MCPs if required"

---

## 1. Executive Summary
The **Online Measurement Maker Web App** is an engineering estimation and quantity surveying platform tailored for Civil Engineers, PWD/CPWD Estimators, and Infrastructure Contractors. It replaces tedious manual spreadsheet drafting with an automated, cloud-backed workflow that connects architectural floor plans to official Indian Standard (IS:1200) Measurement Books (MB) and tender BOQ reconciliations, with 1-click export to certified government-standard Excel templates.

---

## 2. User Scenarios & Prioritized User Stories

### User Story 1 – Project & Architectural Room Schedule Management (Priority: P1)
**User Journey**: An engineer creates a new civil work estimate (e.g., "Circuit House Renovation"), defines project administrative metadata (Division, Circle, Department, DSR Year), and configures building structures (e.g., G+1 Main Building, Dormitory, Cottage). Within each building, the engineer enters room dimensions ($L \times B \times H$) and associates door, window, and ventilator openings ($D_1, W_1, V$).  
**Why this priority**: Without dimensional geometry, downstream automated measurements are impossible.  
**Independent Test**: The engineer can create a project, add 3 buildings with 15 rooms and opening schedules, and observe all entities persisted in Supabase (`projects`, `buildings`, `rooms`, `openings`).  
**Acceptance Scenarios**:
1. **Given** an empty project, **When** the engineer inputs Room dimensions ($5.644\text{m} \times 5.508\text{m} \times 3.05\text{m}$) and adds $1 \times D_1$ ($1.2\text{m} \times 2.1\text{m}$) and $2 \times W_1$ ($1.5\text{m} \times 1.8\text{m}$), **Then** Supabase records the room and openings with auto-calculated carpet area ($31.09\,\text{Sqm}$) and perimeter ($22.304\,\text{m}$).

---

### User Story 2 – Automated Measurement Book (MB) Generation & Editing (Priority: P1)
**User Journey**: The engineer selects an item from the BOQ / DSR catalog (e.g., Item 11: `13.83.2` Acrylic Emulsion Interior Painting). The system automatically expands the item across all rooms in the selected buildings:
- Creates perimeter wall entries: $Nos \times \text{Perimeter } 2(L+B) \times H$
- Injects opening deductions as negative quantities: $-Nos \times W \times H$
- Generates structural beam side & soffit projections (girth $0.73\text{m}$)
- Provides an interactive grid for fine-tuning or adding custom line items.  
**Why this priority**: This is the core mechanical pain point for engineers—automating hundreds of error-prone multiplication lines.  
**Independent Test**: Selecting Item 11 instantly generates the 78-line measurement schedule totaling exactly $1,768.20\,\text{Sqm}$ with zero manual math.  
**Acceptance Scenarios**:
1. **Given** room schedules with doors and windows, **When** an area item (Painting/Plaster) is added, **Then** all door and window areas are automatically inserted with negative quantities (e.g., $-1, -2$).
2. **Given** measurement lines in the editor, **When** any dimension is modified, **Then** the item total updates in real-time using `=D*F*J` or `=D*F` calculation logic.

---

### User Story 3 – Official PWD/CPWD Excel & PDF Export (Priority: P1)
**User Journey**: The engineer clicks **"Export Measurement Book"**. The system generates a production `.xlsx` workbook that 100% replicates the formatting of the official **`AType Cottage`** reference sheet:
- A4 portrait print setup and exact margins ($0.25''$ sides, $0.75''$ top/bottom)
- Arial Narrow typography with bold headers and merged title banners
- Merged columns for Item No (A), Code (B), and Description (C:K)
- Native Excel formulas (`=D*F*J`, `=ROUND(SUM(...), 2)`, `=ROUND(K*M, 2)`)
- Dynamic Civil Works Grand Total and Amount in Words  
**Why this priority**: Government PWD/CPWD audits reject non-standard spreadsheet layouts. The export must pass audit submission on day one.  
**Independent Test**: Download the generated `.xlsx`, open in Excel, verify that every formula computes natively and matches `FULL CIRCUIT HOUSE ESTIMATE.xlsx`.

---

### User Story 4 – BOQ Tender Reconciliation & Variance Alerting (Priority: P2)
**User Journey**: The engineer imports or defines the sanctioned tender BOQ quantities. The system displays a live side-by-side comparison:
$$\text{Variance} = \text{Measured Qty} - \text{Sanctioned BOQ Qty}$$
$$\text{Financial Variance} = \text{Measured Amount} - \text{Sanctioned Amount}$$
Overruns ($> 0$) and unutilized provisions ($< 0$) are highlighted with visual badges.  
**Why this priority**: Prevents cost overruns and assists in preparing Revised Estimates / Extra Item Statements.  
**Independent Test**: Compare measured quantities across all 29 items against the BOQ; verify that difference is $0.00$ for compliant items and flagged if altered.

---

### User Story 5 – Multimodal AI Blueprint Ingestion via Gemini Vision MCP (Priority: P2)
**User Journey**: Instead of manually typing room dimensions, the engineer uploads an architectural plan image (PNG, JPEG) or blueprint PDF. The Gemini Vision MCP inspects the plan, extracts room names, room dimensions, wall thicknesses, and window/door schedules, and presents a pre-filled review form for approval before committing to Supabase.  
**Why this priority**: Accelerates project onboarding from 2 hours of typing down to 30 seconds of AI extraction.  
**Independent Test**: Upload the 3 floor plans (`Plan 1`, `Plan 2`, `Plan 3`), observe Gemini extracting Rooms 1–11, Dormitory Hall, and Cottage Suite dimensions with $> 95\%$ accuracy.

---

### User Story 6 – Parametric Auto Estimation via Form Query & Natural Language (Priority: P2)
**User Journey**: An engineer or departmental client specifies project parameters (Plinth Area, Typology, Floors, Scope, Finishes, Roofing, Site Works) via a guided form query or natural language prompt (e.g., "G+1 Circuit House 500 sqm with acrylic paint, vitrified tiles, CGI roof and paver blocks"). The system automatically synthesizes the architectural program, runs the IS:1200 cascading engine, applies DSR 2021 rates, and outputs the itemized BOQ, Measurement Book, and total estimated budget with 1-click Excel export and active project synchronization.  
**Why this priority**: Empowers engineers to prepare preliminary, administrative, and detailed budget estimates in under 10 seconds before blueprints are drawn.  
**Independent Test**: Submit form query with 500 sqm G+1 Circuit House; verify that synthesized room carpet areas, wall areas, DSR items, and Measurement Book rows are generated accurately with plinth area rate benchmarks.

### User Story 7 – Immersive Real-Sync Interactive 3D Character Experience (Priority: P1)
**User Journey**: The 3D civil engineer character (`@ErMilim`) serves as the primary interactive, immersive anchor of the entire web application. The character behaves like a real living person:
- **Smooth Real-Time Cursor Tracking**: Naturally turns head, torso, and gaze smoothly with mouse cursor coordinates at 60fps using physics damping (LERP).
- **Expressive Living Reactions**:
  - Smiles, blinks, and winks with subtle eye sparkles during idle breathing.
  - Waves and greets the engineer upon entry or session restore.
  - Jumps with playful physics elevation upon milestones (e.g. calculation verified, Excel export complete, or interactive click).
  - Inspects her digital blueprint tablet when user enters or edits tabular numbers.
  - Respectfully shields eyes and turns away when password fields receive focus.
- **Visual Stature**: Integrated seamlessly into the full-screen spatial environment as a primary companion rather than an intrusive or clipped picture-in-picture widget.  
**Why this priority**: Directly requested by the user to turn a cold, complex civil engineering spreadsheet tool into an engaging, intuitive, award-winning spatial web experience.  
**Independent Test**: Move mouse across viewport to verify 60fps continuous head turns; click character or trigger jump button to verify smooth jumping animation; verify zero frame dropping.

---

## 3. Edge Cases & Boundary Conditions
1. **Zero Openings in a Room**: If a storeroom or vault has no windows or ventilators, the system must omit deduction lines without failing formulas.
2. **Double-Story Identical Floors**: When a building has multiple identical floors (e.g. Ground Floor + First Floor in G+1), the system must support either a floor multiplier ($Nos = 2$) or an itemized identical-floor subtotal row.
3. **Partial Height Dado (Toilets)**: For rooms with wall tiles up to $2.10\text{m}$, wall painting height must automatically adjust to the remaining clear wall height ($H - 2.10\text{m} = 0.95\text{m}$).
4. **Rounding Precision Reconciliation**: Floating-point rounding across 80 lines must ensure both row-level rounded sums and Excel column SUM evaluate to the exact two-decimal target without 1-cent drifting.
5. **Character Animation Interruptions**: If the user moves cursor rapidly while a jump or celebration animation is playing, the physics engine must blend kinematics smoothly without jarring model pops or coordinate glitches.

---

## 4. Functional Requirements Checklist

| Requirement ID | Specification | Status |
| :--- | :--- | :--- |
| **FR-001** | Support full CRUD operations for Projects, Buildings, Floors, Rooms, and Openings in Supabase. | Mandatory |
| **FR-002** | Implement formula calculation engine for 1D (Length), 2D (Area), 3D (Volume), and Steel weight items. | Mandatory |
| **FR-003** | Support negative quantity deductions for door/window openings per IS:1200 rules. | Mandatory |
| **FR-004** | Provide live spreadsheet data grid with inline cell editing and keyboard navigation. | Mandatory |
| **FR-005** | Generate native `.xlsx` with openpyxl/exceljs conforming 100% to PWD `AType Cottage` styling. | Mandatory |
| **FR-006** | Integrate Gemini Vision MCP for automated architectural drawing parsing. | Mandatory |
| **FR-007** | Integrate StitchMCP for engineering design system components and high-density UI layouts. | Mandatory |
| **FR-008** | Implement Row-Level Security (RLS) policies on Supabase tables for authenticated users. | Mandatory |
| **FR-009** | Implement real-sync 3D character engine with multi-state animations (smile, jump, wave, tablet inspect, smooth 60fps cursor tracking). | Mandatory |
