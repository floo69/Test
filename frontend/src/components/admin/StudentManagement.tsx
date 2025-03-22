import React, { useState, useMemo } from "react";
import {
  Student,
  Branch,
  Year,
  Semester,
  PlacementStatus,
} from "../../types/student";
import { Search, Filter, Download, SortAsc, SortDesc } from "lucide-react";
import { mockStudents } from "../../data/mockStudents";

interface FilterState {
  branch: Branch | "";
  year: Year | "";
  semester: Semester | "";
  placementStatus: PlacementStatus | "";
  cgpaMin: string;
  cgpaMax: string;
  skills: string[];
  specialCategories: string[];
}

const StudentManagement: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    branch: "",
    year: "",
    semester: "",
    placementStatus: "",
    cgpaMin: "",
    cgpaMax: "",
    skills: [],
    specialCategories: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Student | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedAndFilteredStudents = useMemo(() => {
    let result = [...mockStudents];

    // Apply filters
    if (filters.branch) {
      result = result.filter((student) => student.branch === filters.branch);
    }
    if (filters.year) {
      result = result.filter((student) => student.year === filters.year);
    }
    if (filters.placementStatus) {
      result = result.filter(
        (student) => student.placementStatus === filters.placementStatus
      );
    }
    if (filters.cgpaMin) {
      result = result.filter(
        (student) => student.cgpa >= parseFloat(filters.cgpaMin)
      );
    }
    if (filters.cgpaMax) {
      result = result.filter(
        (student) => student.cgpa <= parseFloat(filters.cgpaMax)
      );
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [filters, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Student) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc size={16} />
    ) : (
      <SortDesc size={16} />
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Student Management</h2>

        {/* Search Bar */}
        <div className="flex mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            <Filter size={20} className="inline-block mr-2" />
            Filters
          </button>
          <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <Download size={20} className="inline-block mr-2" />
            Export
          </button>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <select
            className="px-3 py-2 border rounded-md"
            value={filters.branch}
            onChange={(e) =>
              setFilters({ ...filters, branch: e.target.value as Branch })
            }
          >
            <option value="">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="Civil">Civil</option>
            <option value="EEE">EEE</option>
          </select>

          <select
            className="px-3 py-2 border rounded-md"
            value={filters.year}
            onChange={(e) =>
              setFilters({ ...filters, year: e.target.value as Year })
            }
          >
            <option value="">All Years</option>
            <option value="1st">1st Year</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
          </select>

          <select
            className="px-3 py-2 border rounded-md"
            value={filters.placementStatus}
            onChange={(e) =>
              setFilters({
                ...filters,
                placementStatus: e.target.value as PlacementStatus,
              })
            }
          >
            <option value="">All Placement Status</option>
            <option value="Placed">Placed</option>
            <option value="Not Placed">Not Placed</option>
            <option value="In Progress">In Progress</option>
          </select>

          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min CGPA"
              className="w-1/2 px-3 py-2 border rounded-md"
              value={filters.cgpaMin}
              onChange={(e) =>
                setFilters({ ...filters, cgpaMin: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Max CGPA"
              className="w-1/2 px-3 py-2 border rounded-md"
              value={filters.cgpaMax}
              onChange={(e) =>
                setFilters({ ...filters, cgpaMax: e.target.value })
              }
            />
          </div>
        </div>

        {/* Student List Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name/Email {renderSortIcon("name")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch/Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CGPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placement Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.branch}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.year}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.cgpa.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.placementStatus === "Placed"
                          ? "bg-green-100 text-green-800"
                          : student.placementStatus === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.placementStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.skills.map((skill) => skill.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
