export interface PlacementReport {
  id: string;
  studentId: string;
  type: ReportType;
  year: string;
  branch: string;
  generatedAt: string;
  data: {
    name: string;
    rollNumber: string;
    branch: string;
    batch: string;
    placementStatus: string;
    companyName?: string;
    packageOffered?: number;
    offerLetterUrl?: string;
  };
}

export type ReportType = "individual" | "branch" | "batch";

export interface ReportFilter {
  year?: string;
  branch?: string;
  placementStatus?: string;
  type: ReportType;
  format: "pdf" | "excel" | "csv";
}
