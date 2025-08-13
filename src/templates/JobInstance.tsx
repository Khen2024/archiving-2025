"use client";

import React, { useState } from "react";
import { loadPage } from "loader-lib";
import { useContent } from "seti-ramesesv1";
import JobInstanceModal from "./JobInstanceModal";
import DataList from "./DataList";
import { Plus, FileText, Trash2 } from "lucide-react";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force DataList refresh
  const { setContent } = useContent();
  const target = "main";

  const handleNewInstance = () => {
    setShowModal(true);
  };

  const listHandler = async (searchQuery: string) => {
    try {
      const res = await fetch(
        "/localapi/mgmt/base/archiving/job_instance/list"
      );
      if (!res.ok) {
        throw new Error("Failed to fetch job instances");
      }
      const result = await res.json();
      const data: JobInstance[] = result?.data || result || [];

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

  const handleDeleteClick = (instanceId: string) => {
    setJobToDelete(instanceId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;

    try {
      const res = await fetch(
        "/localapi/mgmt/base/archiving/job_instance/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: jobToDelete }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete job instance");
      }

      setShowDeleteModal(false);
      setJobToDelete(null);
      setRefreshKey((prevKey) => prevKey + 1); // Increment key to trigger a refresh
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
              key={refreshKey} // Use key to force re-render on delete
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(row._id);
                      }}
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

      {/* Modal for New Instance */}
      {showModal && (
        <JobInstanceModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            setRefreshKey((prevKey) => prevKey + 1); // Refresh list on save
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job instance?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setJobToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobInstanceTable;