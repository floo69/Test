import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import { ReportFilter, ReportType } from "../../types/reports";
interface PlacementReportsProps {
  studentId: string;
  studentBranch: string;
  studentBatch: string;
}

const PlacementReports: React.FC<PlacementReportsProps> = ({
  studentId,
  studentBranch,
  studentBatch,
}) => {
  const [filters, setFilters] = useState<ReportFilter>({
    type: "individual",
    format: "pdf",
  });

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/reports/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          ...filters,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placement_report_${filters.type}_${
        new Date().toISOString().split("T")[0]
      }.${filters.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Placement Reports</h2>
        <button
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download size={20} className="mr-2" />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-2">Report Type</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value as ReportType })
            }
          >
            <option value="individual">Individual Report</option>
            <option value="branch">Branch Report</option>
            <option value="batch">Batch Report</option>
          </select>
        </div>

        {filters.type !== "individual" && (
          <>
            <div>
              <label className="block mb-2">Year</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Branch</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={filters.branch}
                onChange={(e) =>
                  setFilters({ ...filters, branch: e.target.value })
                }
              >
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block mb-2">Format</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={filters.format}
            onChange={(e) =>
              setFilters({
                ...filters,
                format: e.target.value as "pdf" | "excel" | "csv",
              })
            }
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex items-center mb-2">
          <FileText size={20} className="mr-2 text-blue-600" />
          <span className="font-semibold">Available Reports</span>
        </div>
        <ul className="space-y-2">
          <li className="flex justify-between items-center">
            <span>Individual Placement Report</span>
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </li>
          {studentBranch && (
            <li className="flex justify-between items-center">
              <span>{studentBranch} Branch Report</span>
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </li>
          )}
          <li className="flex justify-between items-center">
            <span>Batch {studentBatch} Report</span>
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PlacementReports;
