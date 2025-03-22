import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Filter } from "lucide-react";
import ApplyModal from "../components/ApplyModal";
import EditProfileModal from "../components/EditProfileModal";
import axios from "axios";
import SignUp from "../components/SignUp";
import PlacementReports from "../components/student/PlacementReports";

const studentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type StudentFormData = z.infer<typeof studentSchema>;

const StudentPortal: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<{
    title: string;
    company: string;
  } | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentStudent, setCurrentStudent] = useState({
    id: "",
    branch: "",
    batch: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      setLoginError(null);
      const response = await axios.post(
        "http://localhost:3000/students/login",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("Login successful:", response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error logging in:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          "An error occurred during login. Please try again.";
        setLoginError(errorMessage);
      } else {
        setLoginError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleApplyClick = (title: string, company: string) => {
    setSelectedInternship({ title, company });
    setIsApplyModalOpen(true);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCurrentStudent();
    }
  }, [isLoggedIn]);

  const fetchCurrentStudent = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/students/current`,
        {
          withCredentials: true,
        }
      );
      setCurrentStudent(response.data);
    } catch (error) {
      console.error("Error fetching current student:", error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Student Portal</h1>
        {showSignUp ? (
          <SignUp onSignUpSuccess={() => setShowSignUp(false)} />
        ) : (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Login</h2>
            {loginError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {loginError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Login
              </button>
            </form>
            <p className="text-center text-gray-600 mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Internship Search</h2>
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Search internships..."
                className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition duration-300">
                <Search size={20} />
              </button>
            </div>
            <div className="flex items-center">
              <Filter size={20} className="mr-2" />
              <span className="font-semibold">Filters:</span>
              <button className="ml-4 px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition duration-300">
                Industry
              </button>
              <button className="ml-2 px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition duration-300">
                Duration
              </button>
              <button className="ml-2 px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition duration-300">
                Location
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Internship Listings</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold">
                  Software Engineering Intern
                </h3>
                <p className="text-gray-600">TechCorp Inc.</p>
                <p className="text-sm text-gray-500">
                  Mumbai, Maharashtra • 3 months
                </p>
                <button
                  onClick={() =>
                    handleApplyClick(
                      "Software Engineering Intern",
                      "TechCorp Inc."
                    )
                  }
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Apply Now
                </button>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold">Data Science Intern</h3>
                <p className="text-gray-600">Analytics Pro</p>
                <p className="text-sm text-gray-500">
                  Pune, Maharashtra • 6 months
                </p>
                <button
                  onClick={() =>
                    handleApplyClick("Data Science Intern", "Analytics Pro")
                  }
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <PlacementReports
            studentId={currentStudent.id}
            studentBranch={currentStudent.branch}
            studentBatch={currentStudent.batch}
          />
        </div>
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> John Doe
              </p>
              <p>
                <strong>Email:</strong> john.doe@fcrit.ac.in
              </p>
              <p>
                <strong>Department:</strong> Computer Engineering
              </p>
              <p>
                <strong>Year:</strong> 3rd Year
              </p>
            </div>
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Edit Profile
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Application Status</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">
                  Software Engineering Intern - TechCorp Inc.
                </h3>
                <p className="text-sm text-green-600">Application Submitted</p>
              </div>
              <div>
                <h3 className="font-semibold">
                  Web Development Intern - WebSolutions Ltd.
                </h3>
                <p className="text-sm text-yellow-600">Under Review</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedInternship && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          internshipTitle={selectedInternship.title}
          companyName={selectedInternship.company}
        />
      )}

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />
    </div>
  );
};

export default StudentPortal;
