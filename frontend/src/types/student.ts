export interface Student {
  id: string;
  name: string;
  email: string;
  branch: Branch;
  year: Year;
  semester: Semester;
  placementStatus: PlacementStatus;
  cgpa: number;
  skills: Skill[];
  certifications: Certification[];
  internshipHistory: InternshipHistory[];
  specialCategories: SpecialCategory[];
  created_at: string;
  updated_at: string;
}

export type Branch = "CSE" | "ECE" | "ME" | "Civil" | "EEE";
export type Year = "1st" | "2nd" | "3rd" | "4th";
export type Semester =
  | "1st"
  | "2nd"
  | "3rd"
  | "4th"
  | "5th"
  | "6th"
  | "7th"
  | "8th";
export type PlacementStatus = "Placed" | "Not Placed" | "In Progress";

export interface Skill {
  id: string;
  name: string;
  category: "Programming" | "Technology" | "Soft Skills";
  level: "Beginner" | "Intermediate" | "Advanced";
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  validUntil?: string;
  credentialUrl?: string;
}

export interface InternshipHistory {
  id: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string;
  stipend?: number;
  offerReceived: boolean;
  ctcOffered?: number;
}

export interface SpecialCategory {
  type: "Differently-abled" | "Backlog" | "Higher Studies";
  details: string;
  verificationStatus: "Pending" | "Verified" | "Rejected";
}
