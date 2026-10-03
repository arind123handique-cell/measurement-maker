# Measurement Maker Constitution

## Core Principles

### I. Engineering & Mathematical Fidelity (IS:1200 & CPWD DSR)
All quantity takeoff calculations must conform strictly to Indian Standard **IS:1200** measurement methods and CPWD/State PWD conventions:
- Cubic work (`Cum`) = $Nos \times L \times B \times H$
- Area work (`Sqm`) = $Nos \times L \times B$ or $Nos \times L \times H$ (Perimeter $\times$ Height)
- Running work (`Rm` / `R.M`) = $Nos \times L$
- Steel work (`Kg`) = $Nos \times L \times \text{Weight per metre}$
- Deductions for openings (doors, windows, ventilators, structural cutouts) must be tracked explicitly as negative quantities.
- Quantities, rates, and amounts must maintain consistent 2-decimal precision.

### II. Audit-Compliant Output Standards
The deliverables produced by the platform (Excel Workbooks and PDF Measurement Books) must be indistinguishable from verified government PWD/CPWD records:
- Exact A4 portrait print layout and margin configurations.
- Standard font hierarchy (Arial Narrow, bold subheaders, uppercase section totals).
- Native Excel formula integrity: `=D*F*J` for area items, `=ROUND(SUM(...), 2)` for item totals, and dynamic multi-item grand totals.
- Zero silent rounding errors or discrepancies against sanctioned BOQ totals.

### III. Cloud-Native Architecture (Supabase First)
- All project data—including Projects, Divisions, Buildings, Floors, Rooms, Openings, BOQ Items, and Measurement Book lines—must be modeled cleanly in PostgreSQL via Supabase.
- Strong foreign-key cascading and relational integrity between drawings, rooms, and measurement rows.
- Full TypeScript typing generated directly from the live database schema.
- Secure environment separation for credentials and publishable keys.

### IV. Multimodal Intelligence (MCP Powered)
- Leverage **Gemini Multimodal API** for blueprint ingestion: automated parsing of architectural floor plan images/PDFs into structured room schedules and door/window dimensions.
- Leverage **StitchMCP** for generating clean, accessible, high-density engineering user interfaces and design systems.
- Human-in-the-loop review: Every AI-extracted dimension must be editable and verifiable by the engineer before generating the final MB.

### V. Simplicity & Site Usability
- Designed for field engineers, quantity surveyors, and estimators: fast data entry, low latency, Excel-like grid editing, and offline-friendly operation.
- No unnecessary complexity; prioritize speed, mathematical clarity, and 1-click export.

## Technical Constraints & Standards

- **Frontend**: Next.js / React with TypeScript, Tailwind CSS, Lucide icons, and high-density spreadsheet grid components.
- **Backend / Database**: Supabase PostgreSQL (`rdirvoopoaspyqiowmus`), Supabase Auth, and Storage for drawing PDFs.
- **Calculation & Export Engine**: Python FastAPI / openpyxl or Node-based Excel engine guaranteeing cell-level formatting parity with the `AType Cottage` benchmark.

## Governance & Quality Gates

- Every calculation change must pass verification against the 29-item benchmark dataset (`FULL CIRCUIT HOUSE ESTIMATE.xlsx`).
- No pull request or deployment shall introduce unrounded floating-point discrepancies into measurement outputs.
- Amendments to this constitution require documentation of rationale and backward compatibility review.

**Version**: 1.0.0 | **Ratified**: 2026-10-03 | **Last Amended**: 2026-10-03
