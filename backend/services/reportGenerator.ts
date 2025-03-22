import { RowDataPacket, OkPacket } from "mysql2";
import db from "../db";
import * as ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

interface ReportData extends RowDataPacket {
  name?: string;
  branch?: string;
  placement_status?: string;
  cgpa?: number;
  // Add other fields as needed
}

export const generateReport = async (params: {
  type: string;
  studentId: string;
  year?: string;
  branch?: string;
  format: "pdf" | "excel" | "csv";
}): Promise<Buffer> => {
  const { type, studentId, year, branch, format } = params;

  // Get data based on report type
  const data = await fetchReportData(type, studentId, year, branch);

  // Generate report in requested format
  switch (format) {
    case "pdf":
      return generatePDFReport(data);
    case "excel":
      return generateExcelReport(data);
    case "csv":
      return generateCSVReport(data);
    default:
      throw new Error("Unsupported format");
  }
};

async function fetchReportData(
  type: string,
  studentId: string,
  year?: string,
  branch?: string
): Promise<ReportData[]> {
  let query = "";
  const params: any[] = [];

  switch (type) {
    case "individual":
      query = `
        SELECT s.*, p.company_name, p.role, p.ctc, p.offer_date
        FROM students s
        LEFT JOIN placements p ON s.id = p.student_id
        WHERE s.id = ?
      `;
      params.push(studentId);
      break;

    case "branch":
      query = `
        SELECT s.branch, 
               COUNT(*) as total_students,
               COUNT(p.id) as placed_students,
               AVG(p.ctc) as avg_ctc,
               MAX(p.ctc) as highest_ctc
        FROM students s
        LEFT JOIN placements p ON s.id = p.student_id
        WHERE s.branch = ?
        GROUP BY s.branch
      `;
      params.push(branch);
      break;

    case "batch":
      query = `
        SELECT s.batch_year,
               COUNT(*) as total_students,
               COUNT(p.id) as placed_students,
               AVG(p.ctc) as avg_ctc
        FROM students s
        LEFT JOIN placements p ON s.id = p.student_id
        WHERE s.batch_year = ?
        GROUP BY s.batch_year
      `;
      params.push(year);
      break;

    default:
      throw new Error("Invalid report type");
  }

  const [rows] = await db.query<ReportData[]>(query, params);
  return rows;
}

async function generatePDFReport(data: ReportData[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Add content to PDF
    doc.fontSize(16).text("Placement Report", { align: "center" });
    doc.moveDown();

    // Add data in tabular format
    data.forEach((row) => {
      doc.fontSize(12).text(JSON.stringify(row, null, 2));
      doc.moveDown();
    });

    doc.end();
  });
}

async function generateExcelReport(data: ReportData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Placement Report");

  // Add headers
  const headers = Object.keys(data[0] || {});
  worksheet.addRow(headers);

  // Add data
  data.forEach((row) => {
    worksheet.addRow(Object.values(row));
  });

  return workbook.xlsx.writeBuffer() as Promise<Buffer>;
}

function generateCSVReport(data: ReportData[]): Buffer {
  const headers = Object.keys(data[0] || {}).join(",");
  const rows = data.map((row) => Object.values(row).join(","));
  const csv = [headers, ...rows].join("\n");
  return Buffer.from(csv);
}
