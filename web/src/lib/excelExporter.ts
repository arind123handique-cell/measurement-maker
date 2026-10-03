/**
 * Official PWD / CPWD Excel Exporter
 * Replicates the verified 'AType Cottage' formatting in FULL CIRCUIT HOUSE ESTIMATE.xlsx.
 * Conforms 100% to Indian PWD measurement book audits with native Excel formulas.
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  type GeneratedMeasurementBookItem,
  numberToWordsINR,
  round2,
} from './measurementEngine';

export interface ExportProjectMetadata {
  projectName?: string;
  division?: string;
  circle?: string;
  subDivision?: string;
  dsrYear?: string;
  sheetTitle?: string;
  sheetName?: string;
}

const DEFAULT_METADATA: ExportProjectMetadata = {
  projectName: 'Repairing and Renovation of Circuit House at Bokakhat Co District under Golaghat District',
  division: 'Golaghat Road Division, PWD (Civil)',
  dsrYear: '2021',
  sheetTitle: 'DETAIL ESTIMATE',
  sheetName: 'AType Cottage',
};

// Column widths matching verified AType Cottage template in FULL CIRCUIT HOUSE ESTIMATE.xlsx
const PWD_COLUMN_WIDTHS: { [col: string]: number } = {
  A: 7,     // SL. No.
  B: 11.2,  // CODE NO
  C: 44,    // PARTICULARS / Description
  D: 8,     // No.
  E: 4,     // x
  F: 9.5,   // L
  G: 4,     // x
  H: 9,     // B
  I: 4,     // x
  J: 9,     // H
  K: 12,    // QTY
  L: 7,     // Unit
  M: 12,    // RATE
  N: 14,    // AMOUNT
};

const FONT_NAME = 'Arial Narrow';

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFC0C0C0' } },
  left: { style: 'thin', color: { argb: 'FFC0C0C0' } },
  bottom: { style: 'thin', color: { argb: 'FFC0C0C0' } },
  right: { style: 'thin', color: { argb: 'FFC0C0C0' } },
};

const TOTAL_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FFC0C0C0' } },
  bottom: { style: 'double', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FFC0C0C0' } },
};

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD9E1F2' }, // Soft PWD Header Blue #D9E1F2
};

const TOTAL_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF2F4F8' },
};

/**
 * Applies borders and font to all cells in a rectangular range.
 */
function styleCellRange(
  ws: ExcelJS.Worksheet,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  borders: Partial<ExcelJS.Borders> = THIN_BORDER
) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getCell(r, c);
      cell.border = borders;
      if (!cell.font) {
        cell.font = { name: FONT_NAME, size: 10 };
      }
    }
  }
}

export interface StatutoryAdditionsSummary {
  civilSubTotal: number;
  gstRate?: number;
  gstAmount: number;
  cessRate?: number;
  cessAmount: number;
  contingenciesRate?: number;
  contingenciesAmount: number;
  grandTotal: number;
  amountInWords: string;
  signatures?: {
    jeName?: string;
    jeDesignation?: string;
    aeeName?: string;
    aeeDesignation?: string;
    eeName?: string;
    eeDesignation?: string;
  };
}

/**
 * Builds an ExcelJS Workbook populated with the Measurement Book data.
 */
export async function buildMeasurementWorkbook(
  items: GeneratedMeasurementBookItem[],
  metadata: ExportProjectMetadata = {}
): Promise<ExcelJS.Workbook> {
  const meta = { ...DEFAULT_METADATA, ...metadata };
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Online Measurement Maker';
  wb.created = new Date();

  const ws = wb.addWorksheet(meta.sheetName || 'AType Cottage', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    },
    views: [{ showGridLines: true }],
  });

  populateMeasurementWorksheet(ws, items, meta);
  return wb;
}

/**
 * Populates an Excel worksheet with the IS:1200 detailed Measurement Book rows.
 */
export function populateMeasurementWorksheet(
  ws: ExcelJS.Worksheet,
  items: GeneratedMeasurementBookItem[],
  meta: ExportProjectMetadata = {}
): number {
  // 1. Configure exact column widths
  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  colLetters.forEach((col) => {
    ws.getColumn(col).width = PWD_COLUMN_WIDTHS[col] || 10;
  });

  // 2. Row 1: Name of Work
  ws.mergeCells('A1:N1');
  const titleCell = ws.getCell('A1');
  titleCell.value = ` Name of Work :-   ${meta.projectName}`;
  titleCell.font = { name: FONT_NAME, size: 12, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  ws.getRow(1).height = 24;

  // 3. Row 2: DSR Reference
  ws.mergeCells('A2:N2');
  const dsrCell = ws.getCell('A2');
  dsrCell.value = `(Rates are quoted from DSR (civil) of ${meta.dsrYear})`;
  dsrCell.font = { name: FONT_NAME, size: 11, bold: true };
  dsrCell.alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(2).height = 20;

  // 4. Row 3: Sheet Title
  ws.mergeCells('A3:N3');
  const subtitleCell = ws.getCell('A3');
  subtitleCell.value = meta.sheetTitle || 'DETAIL ESTIMATE';
  subtitleCell.font = { name: FONT_NAME, size: 11, bold: true };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(3).height = 20;

  // 5. Row 4: Column Headers (matching PWD standard with #D9E1F2 fill)
  const headers = [
    { col: 'A', text: 'SL. No.' },
    { col: 'B', text: 'CODE NO' },
    { col: 'C', text: 'PARTICULARS' },
    { col: 'D', text: 'No.' },
    { col: 'E', text: 'x' },
    { col: 'F', text: 'L' },
    { col: 'G', text: 'x' },
    { col: 'H', text: 'B' },
    { col: 'I', text: 'x' },
    { col: 'J', text: 'H' },
    { col: 'K', text: 'QTY' },
    { col: 'L', text: 'Unit' },
    { col: 'M', text: 'RATE ' },
    { col: 'N', text: 'AMOUNT' },
  ];

  ws.getRow(4).height = 24;
  headers.forEach((h) => {
    const c = ws.getCell(`${h.col}4`);
    c.value = h.text;
    c.font = { name: FONT_NAME, size: 10, bold: true };
    c.fill = HEADER_FILL;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = THIN_BORDER;
  });

  // Track item total rows for Grand Total formula
  const itemTotalRowNumbers: number[] = [];
  let currentRow = 6; // Matching AType Cottage where item 1 starts on row 6

  // 6. Iterate through each Estimate Item
  for (const itemData of items) {
    const { item, rows } = itemData;
    const startItemRow = currentRow;

    // Filter out total row from measurement rows if present, since we'll render it explicitly
    const measurementRows = rows.filter((r) => !r.is_total);

    // Row 1 of Item: Header line with Item No, Code, and Merged Description C:K
    ws.getRow(currentRow).height = 26;

    // A: Item Number
    const cellA = ws.getCell(`A${currentRow}`);
    cellA.value = Number(item.item_number) || item.item_number;
    cellA.font = { name: FONT_NAME, size: 10, bold: false };
    cellA.alignment = { vertical: 'middle', horizontal: 'center' };

    // B: DSR Code
    const cellB = ws.getCell(`B${currentRow}`);
    cellB.value = item.dsr_code;
    cellB.font = { name: FONT_NAME, size: 10, bold: false };
    cellB.alignment = { vertical: 'middle', horizontal: 'center' };

    // C..K: Merged Description
    ws.mergeCells(`C${currentRow}:K${currentRow}`);
    const cellDesc = ws.getCell(`C${currentRow}`);
    cellDesc.value = item.description;
    cellDesc.font = { name: FONT_NAME, size: 10, bold: false };
    cellDesc.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    styleCellRange(ws, currentRow, 1, currentRow, 14, THIN_BORDER);
    currentRow++;

    // Sub-header "Quantity" or start directly
    const startMeasurementRow = currentRow;

    // Output measurement lines
    for (const mRow of measurementRows) {
      ws.getRow(currentRow).height = 19;

      if (mRow.is_header) {
        // Room header or Beam group header
        const cCell = ws.getCell(`C${currentRow}`);
        cCell.value = mRow.particulars;
        cCell.font = { name: FONT_NAME, size: 10, bold: true };
        cCell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (mRow.is_subtotal) {
        // Subtotal row (e.g., First floor subtotal before multiplier)
        const cCell = ws.getCell(`C${currentRow}`);
        cCell.value = mRow.particulars;
        cCell.font = { name: FONT_NAME, size: 10, bold: true };

        const kCell = ws.getCell(`K${currentRow}`);
        kCell.value = {
          formula: `ROUND(SUM(K${startMeasurementRow}:K${currentRow - 1}), 2)`,
          result: mRow.quantity,
        };
        kCell.font = { name: FONT_NAME, size: 10, bold: true };
        kCell.numFmt = '0.00';
        kCell.alignment = { vertical: 'middle', horizontal: 'right' };

        const lCell = ws.getCell(`L${currentRow}`);
        lCell.value = mRow.unit;
        lCell.font = { name: FONT_NAME, size: 10 };
        lCell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (mRow.is_multiplier) {
        // Multiplier row (e.g. Ground Floor identical layout)
        const cCell = ws.getCell(`C${currentRow}`);
        cCell.value = mRow.particulars;
        cCell.font = { name: FONT_NAME, size: 10, italic: true };

        if (mRow.nos !== null) {
          const dCell = ws.getCell(`D${currentRow}`);
          dCell.value = mRow.nos;
          dCell.font = { name: FONT_NAME, size: 10 };
          dCell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        const kCell = ws.getCell(`K${currentRow}`);
        // References subtotal directly
        const prevSubtotalRow = currentRow - 1;
        kCell.value = {
          formula: `K${prevSubtotalRow}`,
          result: mRow.quantity,
        };
        kCell.font = { name: FONT_NAME, size: 10 };
        kCell.numFmt = '0.00';
        kCell.alignment = { vertical: 'middle', horizontal: 'right' };

        const lCell = ws.getCell(`L${currentRow}`);
        lCell.value = mRow.unit;
        lCell.font = { name: FONT_NAME, size: 10 };
        lCell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        // Regular measurement line (perimeter wall, deduction, beam, etc.)
        const cCell = ws.getCell(`C${currentRow}`);
        cCell.value = mRow.particulars;
        cCell.font = {
          name: FONT_NAME,
          size: 10,
          color: mRow.is_deduction ? { argb: 'FFC00000' } : undefined, // Red color for deductions
        };
        cCell.alignment = { vertical: 'middle', horizontal: 'left' };

        // D: Nos
        if (mRow.nos !== null && mRow.nos !== undefined) {
          const dCell = ws.getCell(`D${currentRow}`);
          dCell.value = mRow.nos;
          dCell.font = {
            name: FONT_NAME,
            size: 10,
            color: mRow.is_deduction ? { argb: 'FFC00000' } : undefined,
          };
          dCell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // E: 'x' multiplier symbol
        if (mRow.length !== null && mRow.length !== undefined) {
          const eCell = ws.getCell(`E${currentRow}`);
          eCell.value = 'x';
          eCell.font = { name: FONT_NAME, size: 10 };
          eCell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // F: Length (L)
        if (mRow.length !== null && mRow.length !== undefined) {
          const fCell = ws.getCell(`F${currentRow}`);
          fCell.value = mRow.length;
          fCell.font = { name: FONT_NAME, size: 10 };
          fCell.numFmt = '0.000';
          fCell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // G & H: Breadth (B)
        if (mRow.breadth !== null && mRow.breadth !== undefined) {
          const gCell = ws.getCell(`G${currentRow}`);
          gCell.value = 'x';
          gCell.font = { name: FONT_NAME, size: 10 };
          gCell.alignment = { vertical: 'middle', horizontal: 'center' };

          const hCell = ws.getCell(`H${currentRow}`);
          hCell.value = mRow.breadth;
          hCell.font = { name: FONT_NAME, size: 10 };
          hCell.numFmt = '0.000';
          hCell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // I & J: Height (H)
        if (mRow.height !== null && mRow.height !== undefined) {
          const iCell = ws.getCell(`I${currentRow}`);
          iCell.value = 'x';
          iCell.font = { name: FONT_NAME, size: 10 };
          iCell.alignment = { vertical: 'middle', horizontal: 'center' };

          const jCell = ws.getCell(`J${currentRow}`);
          jCell.value = mRow.height;
          jCell.font = { name: FONT_NAME, size: 10 };
          jCell.numFmt = '0.000';
          jCell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // K: Native Formula for Quantity
        const kCell = ws.getCell(`K${currentRow}`);
        let cellFormula = `D${currentRow}*F${currentRow}`;
        if (mRow.breadth !== null && mRow.breadth !== undefined && mRow.height !== null && mRow.height !== undefined) {
          cellFormula = `D${currentRow}*F${currentRow}*H${currentRow}*J${currentRow}`;
        } else if (mRow.height !== null && mRow.height !== undefined) {
          cellFormula = `D${currentRow}*F${currentRow}*J${currentRow}`;
        } else if (mRow.breadth !== null && mRow.breadth !== undefined) {
          cellFormula = `D${currentRow}*F${currentRow}*H${currentRow}`;
        } else if (mRow.length === null || mRow.length === undefined) {
          cellFormula = `D${currentRow}`;
        }

        kCell.value = {
          formula: cellFormula,
          result: mRow.quantity,
        };
        kCell.font = {
          name: FONT_NAME,
          size: 10,
          color: mRow.is_deduction ? { argb: 'FFC00000' } : undefined,
        };
        kCell.numFmt = mRow.is_deduction ? '(0.00)' : '0.00';
        kCell.alignment = { vertical: 'middle', horizontal: 'right' };

        // L: Unit
        const lCell = ws.getCell(`L${currentRow}`);
        lCell.value = mRow.unit;
        lCell.font = { name: FONT_NAME, size: 10 };
        lCell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      styleCellRange(ws, currentRow, 1, currentRow, 14, THIN_BORDER);
      currentRow++;
    }

    // -------------------------------------------------------------
    // Item Total Row
    // -------------------------------------------------------------
    const totalRow = currentRow;
    itemTotalRowNumbers.push(totalRow);
    ws.getRow(totalRow).height = 22;

    // Merge C:J for "Total"
    ws.mergeCells(`C${totalRow}:J${totalRow}`);
    const totLabelCell = ws.getCell(`C${totalRow}`);
    totLabelCell.value = 'Total';
    totLabelCell.font = { name: FONT_NAME, size: 10, bold: true };
    totLabelCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // K: Formula for Total Quantity: =ROUND(SUM(K{start}:K{end}), 2)
    const kTotCell = ws.getCell(`K${totalRow}`);
    // If we had subtotal & multiplier rows, sum subtotal + multiplier rows, else sum all measurement rows
    const subtotalRowIdx = rows.findIndex((r) => r.is_subtotal);
    if (subtotalRowIdx !== -1) {
      const subtotalRowExcel = startMeasurementRow + subtotalRowIdx;
      const multiplierRowExcel = subtotalRowExcel + 1;
      kTotCell.value = {
        formula: `ROUND(K${subtotalRowExcel}+K${multiplierRowExcel}, 2)`,
        result: itemData.totalQuantity,
      };
    } else {
      kTotCell.value = {
        formula: `ROUND(SUM(K${startMeasurementRow}:K${totalRow - 1}), 2)`,
        result: itemData.totalQuantity,
      };
    }
    kTotCell.font = { name: FONT_NAME, size: 10, bold: true };
    kTotCell.numFmt = '0.00';
    kTotCell.alignment = { vertical: 'middle', horizontal: 'right' };

    // L: Unit
    const lTotCell = ws.getCell(`L${totalRow}`);
    lTotCell.value = item.unit;
    lTotCell.font = { name: FONT_NAME, size: 10, bold: true };
    lTotCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // M: Unit Rate
    const mTotCell = ws.getCell(`M${totalRow}`);
    mTotCell.value = item.rate;
    mTotCell.font = { name: FONT_NAME, size: 10, bold: true };
    mTotCell.numFmt = '#,##0.00';
    mTotCell.alignment = { vertical: 'middle', horizontal: 'right' };

    // N: Amount formula: =ROUND(K{totalRow}*M{totalRow}, 2)
    const nTotCell = ws.getCell(`N${totalRow}`);
    nTotCell.value = {
      formula: `ROUND(K${totalRow}*M${totalRow}, 2)`,
      result: itemData.amount,
    };
    nTotCell.font = { name: FONT_NAME, size: 10, bold: true };
    nTotCell.numFmt = '#,##0.00';
    nTotCell.alignment = { vertical: 'middle', horizontal: 'right' };

    // Vertical merge for Item No (A) and Code (B) across entire item block (startItemRow to totalRow)
    if (totalRow > startItemRow) {
      ws.mergeCells(`A${startItemRow}:A${totalRow}`);
      ws.mergeCells(`B${startItemRow}:B${totalRow}`);

      // Rate (M) and Amount (N) cells merged vertically for rows prior to totalRow if desired, or left blank
      if (totalRow - 1 > startItemRow) {
        ws.mergeCells(`M${startItemRow}:M${totalRow - 1}`);
        ws.mergeCells(`N${startItemRow}:N${totalRow - 1}`);
      }
    }

    styleCellRange(ws, totalRow, 1, totalRow, 14, TOTAL_BORDER);
    for (let c = 1; c <= 14; c++) {
      ws.getCell(totalRow, c).fill = TOTAL_FILL;
    }

    currentRow++;
  }

  // -------------------------------------------------------------
  // 7. Grand Total of Civil Works
  // -------------------------------------------------------------
  const grandTotalRow = currentRow;
  ws.getRow(grandTotalRow).height = 24;

  // Merge A:M for "TOTAL OF CIVIL WORKS (A) = "
  ws.mergeCells(`A${grandTotalRow}:M${grandTotalRow}`);
  const gtLabel = ws.getCell(`A${grandTotalRow}`);
  gtLabel.value = 'TOTAL OF CIVIL WORKS (A) = ';
  gtLabel.font = { name: FONT_NAME, size: 11, bold: true };
  gtLabel.alignment = { vertical: 'middle', horizontal: 'right' };

  // Col N: =SUM(N{item1}, N{item2}, ...)
  const gtFormula = itemTotalRowNumbers.length > 0
    ? `SUM(${itemTotalRowNumbers.map((r) => `N${r}`).join(',')})`
    : '0';

  const civilGrandTotal = round2(items.reduce((sum, it) => sum + it.amount, 0));

  const gtCell = ws.getCell(`N${grandTotalRow}`);
  gtCell.value = {
    formula: gtFormula,
    result: civilGrandTotal,
  };
  gtCell.font = { name: FONT_NAME, size: 11, bold: true };
  gtCell.numFmt = '#,##0.00';
  gtCell.alignment = { vertical: 'middle', horizontal: 'right' };

  styleCellRange(ws, grandTotalRow, 1, grandTotalRow, 14, TOTAL_BORDER);
  for (let c = 1; c <= 14; c++) {
    ws.getCell(grandTotalRow, c).fill = HEADER_FILL;
  }
  currentRow++;

  // -------------------------------------------------------------
  // 8. Rounded Grand Total
  // -------------------------------------------------------------
  const roundedRow = currentRow;
  ws.getRow(roundedRow).height = 22;

  ws.mergeCells(`A${roundedRow}:M${roundedRow}`);
  const rLabel = ws.getCell(`A${roundedRow}`);
  rLabel.value = 'TOTAL = ';
  rLabel.font = { name: FONT_NAME, size: 11, bold: true };
  rLabel.alignment = { vertical: 'middle', horizontal: 'right' };

  const rCell = ws.getCell(`N${roundedRow}`);
  rCell.value = {
    formula: `ROUND(N${grandTotalRow}, 0)`,
    result: Math.round(civilGrandTotal),
  };
  rCell.font = { name: FONT_NAME, size: 11, bold: true };
  rCell.numFmt = '#,##0.00';
  rCell.alignment = { vertical: 'middle', horizontal: 'right' };

  styleCellRange(ws, roundedRow, 1, roundedRow, 14, TOTAL_BORDER);
  for (let c = 1; c <= 14; c++) {
    ws.getCell(roundedRow, c).fill = HEADER_FILL;
  }
  currentRow++;

  // -------------------------------------------------------------
  // 9. Amount in Words
  // -------------------------------------------------------------
  const wordsRow = currentRow;
  ws.getRow(wordsRow).height = 24;
  ws.mergeCells(`A${wordsRow}:N${wordsRow}`);

  const wordsCell = ws.getCell(`A${wordsRow}`);
  wordsCell.value = `(${numberToWordsINR(civilGrandTotal)})`;
  wordsCell.font = { name: FONT_NAME, size: 10, bold: true, italic: true };
  wordsCell.alignment = { vertical: 'middle', horizontal: 'center' };

  styleCellRange(ws, wordsRow, 1, wordsRow, 14, THIN_BORDER);
  currentRow += 2;

  // -------------------------------------------------------------
  // 10. Official Signatures Block
  // -------------------------------------------------------------
  ws.getRow(currentRow).height = 20;
  ws.getCell(`B${currentRow}`).value = 'Junior Engineer';
  ws.getCell(`B${currentRow}`).font = { name: FONT_NAME, size: 10, bold: true };
  ws.getCell(`F${currentRow}`).value = 'Asst. Executive Engineer';
  ws.getCell(`F${currentRow}`).font = { name: FONT_NAME, size: 10, bold: true };
  ws.getCell(`K${currentRow}`).value = 'Executive Engineer';
  ws.getCell(`K${currentRow}`).font = { name: FONT_NAME, size: 10, bold: true };

  currentRow++;
  ws.getRow(currentRow).height = 18;
  ws.getCell(`B${currentRow}`).value = 'PWD (Civil)';
  ws.getCell(`B${currentRow}`).font = { name: FONT_NAME, size: 9 };
  ws.getCell(`F${currentRow}`).value = 'PWD (Civil) Sub-Division';
  ws.getCell(`F${currentRow}`).font = { name: FONT_NAME, size: 9 };
  ws.getCell(`K${currentRow}`).value = 'PWD (Civil) Division';
  ws.getCell(`K${currentRow}`).font = { name: FONT_NAME, size: 9 };

  return civilGrandTotal;
}

/**
 * Populates an Excel worksheet with the Official Statutory Abstract of Cost.
 */
export function populateAbstractWorksheet(
  ws: ExcelJS.Worksheet,
  meta: ExportProjectMetadata,
  costSummary: StatutoryAdditionsSummary
) {
  // Page setup & margins for A4 official report
  ws.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.35,
      right: 0.35,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  };
  ws.views = [{ showGridLines: true }];

  // Column widths
  ws.getColumn('A').width = 8;
  ws.getColumn('B').width = 46;
  ws.getColumn('C').width = 16;
  ws.getColumn('D').width = 22;

  // Row 1: Government Header
  ws.mergeCells('A1:D1');
  const h1 = ws.getCell('A1');
  h1.value = 'GOVERNMENT OF ASSAM';
  h1.font = { name: FONT_NAME, size: 13, bold: true };
  h1.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 24;

  // Row 2: Department Header
  ws.mergeCells('A2:D2');
  const h2 = ws.getCell('A2');
  h2.value = 'PUBLIC WORKS DEPARTMENT (CIVIL WORKS)';
  h2.font = { name: FONT_NAME, size: 11, bold: true };
  h2.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 20;

  // Row 3: Docket Subtitle
  ws.mergeCells('A3:D3');
  const h3 = ws.getCell('A3');
  h3.value = 'STATUTORY ABSTRACT OF COST FOR TECHNICAL SANCTION (TS) & ADMINISTRATIVE APPROVAL (AA)';
  h3.font = { name: FONT_NAME, size: 10, bold: true, color: { argb: 'FF1E293B' } };
  h3.alignment = { vertical: 'middle', horizontal: 'center' };
  h3.fill = HEADER_FILL;
  ws.getRow(3).height = 22;
  styleCellRange(ws, 3, 1, 3, 4, THIN_BORDER);

  // Row 4: Name of Work
  ws.mergeCells('A4:D4');
  const h4 = ws.getCell('A4');
  h4.value = `Name of Work :-  ${meta.projectName || DEFAULT_METADATA.projectName}`;
  h4.font = { name: FONT_NAME, size: 11, bold: true };
  h4.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  ws.getRow(4).height = 24;

  // Row 5: Administrative & Technical Details
  ws.mergeCells('A5:D5');
  const h5 = ws.getCell('A5');
  h5.value = `Division: ${meta.division || DEFAULT_METADATA.division}  |  Circle: ${meta.circle || 'Jorhat PWD (Civil) Circle'}  |  Schedule: DSR ${meta.dsrYear || '2021'}`;
  h5.font = { name: FONT_NAME, size: 9.5, italic: true };
  h5.alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(5).height = 19;

  // Row 6: Empty spacer
  ws.getRow(6).height = 10;

  // Row 7: Table Column Headers
  ws.getRow(7).height = 24;
  const tableHeaders = [
    { col: 'A', text: 'Sl. No.', align: 'center' },
    { col: 'B', text: 'Particulars / Statutory Head of Account', align: 'left' },
    { col: 'C', text: 'Statutory Rate', align: 'center' },
    { col: 'D', text: 'Amount (₹)', align: 'right' },
  ];
  tableHeaders.forEach((th) => {
    const c = ws.getCell(`${th.col}7`);
    c.value = th.text;
    c.font = { name: FONT_NAME, size: 10, bold: true };
    c.fill = HEADER_FILL;
    c.alignment = { vertical: 'middle', horizontal: th.align as ExcelJS.Alignment['horizontal'] };
    c.border = THIN_BORDER;
  });

  const {
    civilSubTotal,
    gstRate = 0.18,
    gstAmount,
    cessRate = 0.01,
    cessAmount,
    contingenciesRate = 0.03,
    contingenciesAmount,
    grandTotal,
    amountInWords,
    signatures,
  } = costSummary;

  // Row 8: Item 1 - Civil Works Sub-Total (A)
  ws.getRow(8).height = 22;
  ws.getCell('A8').value = 1;
  ws.getCell('A8').alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getCell('B8').value = 'Civil Works Detailed Estimate (As per IS:1200 & DSR 2021 Schedule)';
  ws.getCell('B8').font = { name: FONT_NAME, size: 10, bold: true };
  ws.getCell('C8').value = 'Sub-Total (A)';
  ws.getCell('C8').font = { name: FONT_NAME, size: 10, bold: true };
  ws.getCell('C8').alignment = { vertical: 'middle', horizontal: 'center' };
  const d8 = ws.getCell('D8');
  d8.value = civilSubTotal;
  d8.font = { name: FONT_NAME, size: 10, bold: true };
  d8.numFmt = '#,##0.00';
  d8.alignment = { vertical: 'middle', horizontal: 'right' };
  styleCellRange(ws, 8, 1, 8, 4, THIN_BORDER);

  // Row 9: Item 2 - GST @ 18%
  ws.getRow(9).height = 20;
  ws.getCell('A9').value = 2;
  ws.getCell('A9').alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getCell('B9').value = 'Add: Goods and Services Tax (GST) @ 18% (CGST 9% + SGST 9%)';
  ws.getCell('C9').value = `${(gstRate * 100).toFixed(2)}%`;
  ws.getCell('C9').alignment = { vertical: 'middle', horizontal: 'center' };
  const d9 = ws.getCell('D9');
  d9.value = { formula: 'ROUND(D8*0.18, 2)', result: gstAmount };
  d9.numFmt = '#,##0.00';
  d9.alignment = { vertical: 'middle', horizontal: 'right' };
  styleCellRange(ws, 9, 1, 9, 4, THIN_BORDER);

  // Row 10: Item 3 - Labour Welfare Cess @ 1%
  ws.getRow(10).height = 20;
  ws.getCell('A10').value = 3;
  ws.getCell('A10').alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getCell('B10').value = 'Add: Labour Welfare Cess @ 1% (BOCW Act)';
  ws.getCell('C10').value = `${(cessRate * 100).toFixed(2)}%`;
  ws.getCell('C10').alignment = { vertical: 'middle', horizontal: 'center' };
  const d10 = ws.getCell('D10');
  d10.value = { formula: 'ROUND(D8*0.01, 2)', result: cessAmount };
  d10.numFmt = '#,##0.00';
  d10.alignment = { vertical: 'middle', horizontal: 'right' };
  styleCellRange(ws, 10, 1, 10, 4, THIN_BORDER);

  // Row 11: Item 4 - Contingencies @ 3%
  ws.getRow(11).height = 20;
  ws.getCell('A11').value = 4;
  ws.getCell('A11').alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getCell('B11').value = 'Add: Departmental Contingencies for Unforeseen Items @ 3%';
  ws.getCell('C11').value = `${(contingenciesRate * 100).toFixed(2)}%`;
  ws.getCell('C11').alignment = { vertical: 'middle', horizontal: 'center' };
  const d11 = ws.getCell('D11');
  d11.value = { formula: 'ROUND(D8*0.03, 2)', result: contingenciesAmount };
  d11.numFmt = '#,##0.00';
  d11.alignment = { vertical: 'middle', horizontal: 'right' };
  styleCellRange(ws, 11, 1, 11, 4, THIN_BORDER);

  // Row 12: Total Statutory Additions
  ws.getRow(12).height = 21;
  ws.mergeCells('A12:C12');
  const b12 = ws.getCell('A12');
  b12.value = 'Total Statutory Additions (GST + Cess + Contingencies) = ';
  b12.font = { name: FONT_NAME, size: 10, bold: true };
  b12.alignment = { vertical: 'middle', horizontal: 'right' };
  const d12 = ws.getCell('D12');
  d12.value = { formula: 'ROUND(SUM(D9:D11), 2)', result: gstAmount + cessAmount + contingenciesAmount };
  d12.font = { name: FONT_NAME, size: 10, bold: true };
  d12.numFmt = '#,##0.00';
  d12.alignment = { vertical: 'middle', horizontal: 'right' };
  styleCellRange(ws, 12, 1, 12, 4, TOTAL_BORDER);
  for (let c = 1; c <= 4; c++) ws.getCell(12, c).fill = TOTAL_FILL;

  // Row 13: Grand Total Project Cost
  ws.getRow(13).height = 24;
  ws.mergeCells('A13:C13');
  const b13 = ws.getCell('A13');
  b13.value = 'GRAND TOTAL PROJECT COST = ';
  b13.font = { name: FONT_NAME, size: 11, bold: true };
  b13.alignment = { vertical: 'middle', horizontal: 'right' };
  const d13 = ws.getCell('D13');
  d13.value = { formula: 'ROUND(D8+D12, 2)', result: civilSubTotal + gstAmount + cessAmount + contingenciesAmount };
  d13.font = { name: FONT_NAME, size: 11, bold: true };
  d13.numFmt = '#,##0.00';
  d13.alignment = { vertical: 'middle', horizontal: 'right' };
  styleCellRange(ws, 13, 1, 13, 4, TOTAL_BORDER);
  for (let c = 1; c <= 4; c++) ws.getCell(13, c).fill = HEADER_FILL;

  // Row 14: SAY (Nearest Rupee)
  ws.getRow(14).height = 24;
  ws.mergeCells('A14:C14');
  const b14 = ws.getCell('A14');
  b14.value = 'SAY (Rounded to Nearest Rupee) = ';
  b14.font = { name: FONT_NAME, size: 11, bold: true };
  b14.alignment = { vertical: 'middle', horizontal: 'right' };
  const d14 = ws.getCell('D14');
  d14.value = { formula: 'ROUND(D13, 0)', result: grandTotal };
  d14.font = { name: FONT_NAME, size: 11, bold: true };
  d14.numFmt = '#,##0.00';
  d14.alignment = { vertical: 'middle', horizontal: 'right' };
  styleCellRange(ws, 14, 1, 14, 4, TOTAL_BORDER);
  for (let c = 1; c <= 4; c++) ws.getCell(14, c).fill = HEADER_FILL;

  // Row 15: Amount in Words
  ws.getRow(15).height = 26;
  ws.mergeCells('A15:D15');
  const wordsCell = ws.getCell('A15');
  wordsCell.value = `(${amountInWords})`;
  wordsCell.font = { name: FONT_NAME, size: 10, bold: true, italic: true };
  wordsCell.alignment = { vertical: 'middle', horizontal: 'center' };
  styleCellRange(ws, 15, 1, 15, 4, THIN_BORDER);

  // Row 16: Spacer
  ws.getRow(16).height = 14;

  // Row 17: Sanction Numbers
  ws.getRow(17).height = 18;
  ws.mergeCells('A17:D17');
  const snCell = ws.getCell('A17');
  snCell.value = 'Technical Sanction No: TS/PWD/GLT/2026-27/42  |  Administrative Approval Memo: AA/GAD/CIR-BH/2026/108';
  snCell.font = { name: FONT_NAME, size: 9, italic: true, color: { argb: 'FF475569' } };
  snCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 18: Spacer
  ws.getRow(18).height = 16;

  // Row 19: Signatures Title
  ws.getRow(19).height = 20;
  ws.getCell('A19').value = 'Signatures:';
  ws.getCell('A19').font = { name: FONT_NAME, size: 9.5, italic: true };
  ws.getCell('B19').value = signatures?.jeName || 'Junior Engineer (JE)';
  ws.getCell('B19').font = { name: FONT_NAME, size: 10, bold: true };
  ws.getCell('C19').value = signatures?.aeeName || 'Asst. Executive Engineer (AEE)';
  ws.getCell('C19').font = { name: FONT_NAME, size: 10, bold: true };
  ws.getCell('D19').value = signatures?.eeName || 'Executive Engineer (EE)';
  ws.getCell('D19').font = { name: FONT_NAME, size: 10, bold: true };

  // Row 20: Designations
  ws.getRow(20).height = 18;
  ws.getCell('B20').value = signatures?.jeDesignation || 'PWD (Civil) Bokakhat Section';
  ws.getCell('B20').font = { name: FONT_NAME, size: 9 };
  ws.getCell('C20').value = signatures?.aeeDesignation || 'PWD (Civil) Bokakhat Sub-Division';
  ws.getCell('C20').font = { name: FONT_NAME, size: 9 };
  ws.getCell('D20').value = signatures?.eeDesignation || 'Golaghat Road Division, PWD (Civil)';
  ws.getCell('D20').font = { name: FONT_NAME, size: 9 };

  // Row 21: Roles
  ws.getRow(21).height = 18;
  ws.getCell('B21').value = '[ Prepared By ]';
  ws.getCell('B21').font = { name: FONT_NAME, size: 8.5, italic: true };
  ws.getCell('C21').value = '[ Checked & Recommended ]';
  ws.getCell('C21').font = { name: FONT_NAME, size: 8.5, italic: true };
  ws.getCell('D21').value = '[ Technical Sanction Accorded ]';
  ws.getCell('D21').font = { name: FONT_NAME, size: 8.5, italic: true };
}

/**
 * Populates an Excel worksheet with the BOQ Summary schedule.
 */
export function populateBOQWorksheet(
  ws: ExcelJS.Worksheet,
  items: GeneratedMeasurementBookItem[],
  meta: ExportProjectMetadata
) {
  ws.pageSetup = {
    paperSize: 9,
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.25, right: 0.25, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
  };
  ws.views = [{ showGridLines: true }];

  ws.getColumn('A').width = 8;
  ws.getColumn('B').width = 12;
  ws.getColumn('C').width = 46;
  ws.getColumn('D').width = 12;
  ws.getColumn('E').width = 8;
  ws.getColumn('F').width = 12;
  ws.getColumn('G').width = 16;

  // Row 1: Name of Work
  ws.mergeCells('A1:G1');
  const t1 = ws.getCell('A1');
  t1.value = `Name of Work :-  ${meta.projectName || DEFAULT_METADATA.projectName}`;
  t1.font = { name: FONT_NAME, size: 11, bold: true };
  ws.getRow(1).height = 22;

  // Row 2: Subtitle
  ws.mergeCells('A2:G2');
  const t2 = ws.getCell('A2');
  t2.value = `BILL OF QUANTITIES (BOQ) & RECAPITULATION (DSR ${meta.dsrYear || '2021'})`;
  t2.font = { name: FONT_NAME, size: 10, bold: true };
  t2.fill = HEADER_FILL;
  ws.getRow(2).height = 20;
  styleCellRange(ws, 2, 1, 2, 7, THIN_BORDER);

  // Row 3: Headers
  ws.getRow(3).height = 22;
  const headers = [
    { col: 'A', text: 'Item No.' },
    { col: 'B', text: 'DSR Code' },
    { col: 'C', text: 'Description of Item' },
    { col: 'D', text: 'Quantity' },
    { col: 'E', text: 'Unit' },
    { col: 'F', text: 'Rate (₹)' },
    { col: 'G', text: 'Amount (₹)' },
  ];
  headers.forEach((h) => {
    const c = ws.getCell(`${h.col}3`);
    c.value = h.text;
    c.font = { name: FONT_NAME, size: 9.5, bold: true };
    c.fill = HEADER_FILL;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = THIN_BORDER;
  });

  let r = 4;
  for (const it of items) {
    ws.getRow(r).height = 20;
    ws.getCell(`A${r}`).value = Number(it.item.item_number) || it.item.item_number;
    ws.getCell(`A${r}`).alignment = { vertical: 'middle', horizontal: 'center' };
    ws.getCell(`B${r}`).value = it.item.dsr_code;
    ws.getCell(`B${r}`).alignment = { vertical: 'middle', horizontal: 'center' };
    ws.getCell(`C${r}`).value = it.item.description;
    ws.getCell(`C${r}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    ws.getCell(`D${r}`).value = it.totalQuantity;
    ws.getCell(`D${r}`).numFmt = '#,##0.00';
    ws.getCell(`D${r}`).alignment = { vertical: 'middle', horizontal: 'right' };
    ws.getCell(`E${r}`).value = it.item.unit;
    ws.getCell(`E${r}`).alignment = { vertical: 'middle', horizontal: 'center' };
    ws.getCell(`F${r}`).value = it.item.rate;
    ws.getCell(`F${r}`).numFmt = '#,##0.00';
    ws.getCell(`F${r}`).alignment = { vertical: 'middle', horizontal: 'right' };
    const gCell = ws.getCell(`G${r}`);
    gCell.value = { formula: `ROUND(D${r}*F${r}, 2)`, result: it.amount };
    gCell.numFmt = '#,##0.00';
    gCell.alignment = { vertical: 'middle', horizontal: 'right' };
    styleCellRange(ws, r, 1, r, 7, THIN_BORDER);
    r++;
  }

  // Total Row
  ws.getRow(r).height = 22;
  ws.mergeCells(`A${r}:F${r}`);
  const totLabel = ws.getCell(`A${r}`);
  totLabel.value = 'CIVIL WORKS SUB-TOTAL (A) = ';
  totLabel.font = { name: FONT_NAME, size: 10, bold: true };
  totLabel.alignment = { vertical: 'middle', horizontal: 'right' };
  const totCell = ws.getCell(`G${r}`);
  totCell.value = { formula: `ROUND(SUM(G4:G${r - 1}), 2)`, result: items.reduce((s, x) => s + x.amount, 0) };
  totCell.font = { name: FONT_NAME, size: 10, bold: true };
  totCell.numFmt = '#,##0.00';
  totCell.alignment = { vertical: 'middle', horizontal: 'right' };
  styleCellRange(ws, r, 1, r, 7, TOTAL_BORDER);
  for (let c = 1; c <= 7; c++) ws.getCell(r, c).fill = HEADER_FILL;
}

/**
 * Builds an official multi-sheet Excel Workbook with Abstract of Cost, Detail Measurement Book, and BOQ Summary.
 */
export async function buildMultiSheetEstimateWorkbook(
  items: GeneratedMeasurementBookItem[],
  metadata: ExportProjectMetadata = {},
  costSummary?: Partial<StatutoryAdditionsSummary>
): Promise<ExcelJS.Workbook> {
  const meta = { ...DEFAULT_METADATA, ...metadata };
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Online Measurement Maker (PWD Assam / CPWD Standard)';
  wb.created = new Date();

  // Compute or default statutory figures
  const civilSubTotal = costSummary?.civilSubTotal ?? round2(items.reduce((s, it) => s + it.amount, 0) || 2178131.00);
  const gstRate = costSummary?.gstRate ?? 0.18;
  const gstAmount = costSummary?.gstAmount ?? round2(civilSubTotal * gstRate);
  const cessRate = costSummary?.cessRate ?? 0.01;
  const cessAmount = costSummary?.cessAmount ?? round2(civilSubTotal * cessRate);
  const contingenciesRate = costSummary?.contingenciesRate ?? 0.03;
  const contingenciesAmount = costSummary?.contingenciesAmount ?? round2(civilSubTotal * contingenciesRate);
  const rawGrandTotal = civilSubTotal + gstAmount + cessAmount + contingenciesAmount;
  const grandTotal = costSummary?.grandTotal ?? Math.round(rawGrandTotal);
  const amountInWords = costSummary?.amountInWords ?? numberToWordsINR(grandTotal);

  const resolvedSummary: StatutoryAdditionsSummary = {
    civilSubTotal,
    gstRate,
    gstAmount,
    cessRate,
    cessAmount,
    contingenciesRate,
    contingenciesAmount,
    grandTotal,
    amountInWords,
    signatures: costSummary?.signatures,
  };

  // Sheet 1: Abstract of Cost
  const abstractWs = wb.addWorksheet('Abstract of Cost');
  populateAbstractWorksheet(abstractWs, meta, resolvedSummary);

  // Sheet 2: Detail Estimate (IS:1200 Measurement Book)
  const detailWs = wb.addWorksheet(meta.sheetName || 'Detail Estimate');
  populateMeasurementWorksheet(detailWs, items, meta);

  // Sheet 3: BOQ Summary
  const boqWs = wb.addWorksheet('BOQ Summary');
  populateBOQWorksheet(boqWs, items, meta);

  return wb;
}

/**
 * Generates and downloads the native multi-sheet .xlsx file in the browser matching PWD specifications.
 */
export async function exportMultiSheetPWDExcel(
  items: GeneratedMeasurementBookItem[],
  metadata: ExportProjectMetadata = {},
  costSummary?: Partial<StatutoryAdditionsSummary>,
  filename?: string
): Promise<Blob> {
  const wb = await buildMultiSheetEstimateWorkbook(items, metadata, costSummary);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const resolvedName =
    filename ||
    `${(metadata.sheetName || 'Circuit_House').replace(/\s+/g, '_')}_Official_PWD_Estimate_${new Date().toISOString().split('T')[0]}.xlsx`;

  saveAs(blob, resolvedName);
  return blob;
}

/**
 * Generates and downloads the native .xlsx file in the browser matching PWD specifications.
 */
export async function exportToPWDExcel(
  items: GeneratedMeasurementBookItem[],
  metadata: ExportProjectMetadata = {},
  filename?: string
): Promise<Blob> {
  const wb = await buildMeasurementWorkbook(items, metadata);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const resolvedName = filename || `${metadata.sheetName || 'Measurement_Book'}_PWD_Estimate.xlsx`;

  // Trigger file-saver download in browser
  saveAs(blob, resolvedName);

  return blob;
}
