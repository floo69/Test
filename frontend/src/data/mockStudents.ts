import { Student } from "../types/student";

export const mockStudents: Student[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    branch: "CSE",
    year: "3rd",
    semester: "5th",
    placementStatus: "In Progress",
    cgpa: 8.5,
    skills: [
      { id: "1", name: "React", category: "Technology", level: "Intermediate" },
      { id: "2", name: "Python", category: "Programming", level: "Advanced" },
    ],
    certifications: [
      {
        id: "1",
        name: "AWS Cloud Practitioner",
        issuer: "Amazon",
        date: "2024-01-15",
      },
    ],
    internshipHistory: [
      {
        id: "1",
        companyName: "TechCorp",
        role: "Software Engineer Intern",
        startDate: "2024-05-01",
        endDate: "2024-07-31",
        stipend: 25000,
        offerReceived: true,
        ctcOffered: 1200000,
      },
    ],
    specialCategories: [],
    created_at: "2024-03-23",
    updated_at: "2024-03-23",
  },
  // Add more mock students here
];
