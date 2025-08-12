"use client";

import React, { useState } from "react";
import { loadPage } from "loader-lib";
import { useContent } from "seti-ramesesv1";
import JobInstanceModal from "./JobInstanceModal";
import DataList from "./DataList";
import { Briefcase, Plus, FileText, Trash2 } from "lucide-react";

type JobInstance = {
  _id: string;
  jobDefinitionTitle: string;
  jobDefinitionId: string;
  status: string;
  created_at: string;
  name: string;
  year: string;
};

const JobInstanceTable: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { setContent } = useContent();
  const target = "main";

  const handleNewInstance = () => {
    setShowModal(true);
  };

  const listHandler = async (searchQuery: string) => {
    try {
      const res = await fetch("/localapi/mgmt/base/archiving/job_instance/list");
      const data: JobInstance[] = await res.json();

      if (!searchQuery) return data;

      const lower = searchQuery.toLowerCase();
      return data.filter(
        (inst) =>
          inst.jobDefinitionTitle.toLowerCase().includes(lower) ||
          inst.status.toLowerCase().includes(lower)
      );
    } catch (e) {
      console.error("Error fetching job instances:", e);
      return [];
    }
  };

  const cols: { name: keyof JobInstance; label: string }[] = [
    { name: "name", label: "Job Instance" },
    { name: "status", label: "Status" },
    { name: "created_at", label: "Created At" },
    { name: "year", label: "Year" },
  ];

  const handleRowClick = async (row: JobInstance) => {
    const page = await loadPage({
      page: "Job-Instance-Task",
      target,
      params: {
        jobInstanceId: row._id,
        jobInstancename: row.name,
        jobInstanceTitle: row.jobDefinitionTitle,
        jobDefinitionId: row.jobDefinitionId,
      },
    });

    setContent(target, () => page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job instance?")) return;

    try {
      await fetch(`/localapi/mgmt/base/archiving/job_instance/${id}`, {
        method: "DELETE",
      });
      
    } catch (e) {
      console.error("Error deleting job instance:", e);
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
              Job Instances
            </h2>
            <button
              onClick={handleNewInstance}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">New Job Instance</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <DataList
              cols={[
                ...cols,
                {
                  name: "actions" as keyof JobInstance,
                  label: "Actions",
                },
              ]}
              handler={listHandler}
              allowSearch
              searchMode="manual"
              searchFields={["name", "status"]}
              rowClick={handleRowClick}
              customRender={{
                status: (val) => (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      val === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {val}
                  </span>
                ),
                actions: (_val, row) => (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRowClick(row)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      title="View Details"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(row._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Instance"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <JobInstanceModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            // Trigger DataList refresh if needed
          }}
        />
      )}
    </div>
  );
};

export default JobInstanceTable;
