import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Briefcase, FileText, BarChart2 } from "lucide-react";
import ManageUsers from "./admin/ManageUsers";
import ApproveCompanies from "./admin/ApproveCompanies";
import ReviewInternships from "./admin/ReviewInternships";
import GenerateReports from "./admin/GenerateReports";
import axios from "axios";
import AdminSignUp from "../components/AdminSignUp";
import StudentManagement from "../components/admin/StudentManagement";

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AdminFormData = z.infer<typeof adminSchema>;

const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: AdminFormData) => {
    try {
      console.log("Attempting admin login with:", { email: data.email });
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admins/login`,
        data
      );
      console.log("Login response:", response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error logging in:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "An error occurred during login. Please try again.";
        // You might want to add state for login error message
        setServerError(errorMessage);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    }
  };
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        {showSignUp ? (
          <AdminSignUp onSignUpSuccess={() => setShowSignUp(false)} />
        ) : (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Admin Login</h2>
            {serverError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {serverError}
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
                className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300"
              >
                Login
              </button>
            </form>
            <p className="text-center text-gray-600 mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                className="text-purple-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "manageUsers":
        return <ManageUsers />;
      case "studentManagement":
        return <StudentManagement />;
      case "approveCompanies":
        return <ApproveCompanies />;
      case "reviewInternships":
        return <ReviewInternships />;
      case "generateReports":
        return <GenerateReports />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              icon={<Users size={24} />}
              title="Total Users"
              value="1,234"
            />
            <DashboardCard
              icon={<Briefcase size={24} />}
              title="Pending Companies"
              value="15"
            />
            <DashboardCard
              icon={<FileText size={24} />}
              title="Internships to Review"
              value="28"
            />
            <DashboardCard
              icon={<BarChart2 size={24} />}
              title="Reports Generated"
              value="42"
            />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="flex flex-wrap mb-8">
        <TabButton
          icon={<Users size={20} />}
          title="Manage Users"
          active={activeTab === "manageUsers"}
          onClick={() => setActiveTab("manageUsers")}
        />
        <TabButton
          icon={<Users size={20} />}
          title="Student Management"
          active={activeTab === "studentManagement"}
          onClick={() => setActiveTab("studentManagement")}
        />
        <TabButton
          icon={<Briefcase size={20} />}
          title="Approve Companies"
          active={activeTab === "approveCompanies"}
          onClick={() => setActiveTab("approveCompanies")}
        />
        <TabButton
          icon={<FileText size={20} />}
          title="Review Internships"
          active={activeTab === "reviewInternships"}
          onClick={() => setActiveTab("reviewInternships")}
        />
        <TabButton
          icon={<BarChart2 size={20} />}
          title="Generate Reports"
          active={activeTab === "generateReports"}
          onClick={() => setActiveTab("generateReports")}
        />
      </div>
      {renderContent()}
    </div>
  );
};

const TabButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, title, active, onClick }) => (
  <button
    className={`flex items-center px-4 py-2 mr-2 mb-2 rounded-md ${
      active ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
    } hover:bg-purple-700 hover:text-white transition duration-300`}
    onClick={onClick}
  >
    {icon}
    <span className="ml-2">{title}</span>
  </button>
);

const DashboardCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
}> = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      <div className="bg-purple-100 p-3 rounded-full mr-4">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminPanel;
