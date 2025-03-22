import express from "express";
import { AuthRequest } from "../middleware/auth";
import { authenticateStudent } from "../middleware/auth";
import { generateReport } from "../services/reportGenerator";
import { Response } from "express";

const router = express.Router();

router.post(
  "/download",
  authenticateStudent,
  async (req: AuthRequest, res: Response) => {
    try {
      const { studentId, type, format, year, branch } = req.body;

      // Verify authorization
      if (type === "individual" && studentId !== req.user?.id) {
        res.status(403).json({ error: "Unauthorized access to report" });
        return;
      }

      // Generate report
      const reportData = await generateReport({
        type,
        studentId,
        year,
        branch,
        format,
      });

      // Set appropriate headers based on format
      const contentType = {
        pdf: "application/pdf",
        excel:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        csv: "text/csv",
      }[format as "pdf" | "excel" | "csv"];

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=placement_report.${format}`
      );
      res.send(reportData);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  }
);

export default router;
