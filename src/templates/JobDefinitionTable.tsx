"use client";

import React, { useEffect, useState } from "react";
import { loadPage } from "loader-lib";
import { useContent } from "seti-ramesesv1";
import JobDefinitionModal from "./JobDefinitionModal";
import { Briefcase, Plus, FileText, Trash2 } from "lucide-react";
import JobDefinitionScript from "./JobDefinitionScript";

type JobDefinition = {
  _id: string;
  title: string;
  description: string;
  status?: string;
};

const JobDefinitionTable: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [jobDefinitions, setJobDefinitions] = useState<JobDefinition[]>([]);
  const { setContent } = useContent();
  const target = "main";

  const fetchJobs = async () => {
    try {
      const res = await fetch(
        "/localapi/mgmt/base/archiving/job_definition/list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch job definitions");
      }

      const result = await res.json();
      
      const jobs: JobDefinition[] = result?.data || result || [];
      setJobDefinitions(jobs);
    } catch (e) {
      console.error("Error fetching jobs:", e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRowClick = async (job: JobDefinition) => {
    const page = await loadPage({
      page: "Job-Definition-Script",
      target,
      params: {
        jobDefinitionId: job._id,
        jobDefinitionTitle: job.title,
      
      },
    });
    setContent(target, () => page);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job definition?")) return;

    try {
      const res = await fetch(
        `/localapi/mgmt/base/archiving/job_definition/${jobId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete job definition");
      }

      setJobDefinitions((prev) => prev.filter((job) => job._id !== jobId));
    } catch (e) {
      console.error("Error deleting job definition:", e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans antialiased">
  
      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Title & Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Job Definitions
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">New Job Definition</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobDefinitions.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {job.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {job.status || "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleRowClick(job)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="View Details"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {jobDefinitions.length === 0 && (
              <p className="text-gray-500 text-sm p-4 text-center">
                No job definitions found.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <JobDefinitionModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
};

export default JobDefinitionTable;
