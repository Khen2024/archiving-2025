"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { JobDefinitionNewScript } from "./JobDefinitionNewScript";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { loadPage } from "loader-lib";
import { useContent } from "seti-ramesesv1";

type Script = {
  script_id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
  description: string;
};

type JobDefinition = {
  _id: string;
  name: string;
  title: string;
  state: string;
  description: string;
  scripts: Script[];
};

type Params = {
  jobDefinitionId: string;
};

const JobDefinitionScript: React.FC<{ params: Params }> = ({ params }) => {
  const { jobDefinitionId } = params;
  const [jobDef, setJobDef] = useState<JobDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { setContent } = useContent();
  const target = "main";

  const fetchJobDefinition = async () => {
    try {
      const res = await axios.get(
        `/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}`
      );
      setJobDef(res.data);
    } catch (err) { 
      console.error("Failed to fetch job definition:", err);
      setError("Failed to load job definition. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDefinition();
  }, [jobDefinitionId]);

  const handleEditScript = async (script: Script) => {
    const page = await loadPage({
      page: "Job-Definition-Edit-Script",
      target: target,
      params: {
        jobDefinitionId: jobDefinitionId,
        scriptId: script.script_id
      }
    });
    setContent(target, () => page);
  };

  const handleDeleteScript = async (scriptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this script?")) return;

    try {
      await axios.delete(
        `/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}/scripts/${scriptId}`
      );
      fetchJobDefinition();
    } catch (err) {
      console.error("Failed to delete script:", err);
      alert("Error deleting script. Please try again.");
    }
  };

  const handleBack = async () => {
    const page = await loadPage({
      page: "Job-Definition", 
      target: target,
    });
    setContent(target, () => page);
  };

  return (
    <div className="p-6 font-sans">
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : jobDef ? (
        <>
          {/* Updated Back Button and Title Section */}
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="mr-3 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold">
              <span className="text-gray-500">Job Definition</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Job Description</p>
              <p className="font-medium">{jobDef.description} </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{jobDef.title}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-medium">{jobDef.title} Job Definition</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">State</p>
              <p className="font-medium">{jobDef.state}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Scripts</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
            >
              + Add Script
            </button>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                  <th className="px-6 py-3 border-b">TITLE</th>
                  <th className="px-6 py-3 border-b">CONTENT</th>
                  <th className="px-6 py-3 border-b">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {jobDef.scripts?.map((script) => (
                  <tr
                    key={script.script_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td 
                      className="px-6 py-3 border-b text-sm text-gray-800 cursor-pointer"
                      onClick={() => handleEditScript(script)}
                    >
                      {script.name}
                    </td>
                    <td 
                      className="px-6 py-3 border-b text-sm text-gray-500 truncate max-w-xs cursor-pointer"
                      onClick={() => handleEditScript(script)}
                    >
                      {script.content}
                    </td>
                    <td className="px-6 py-3 border-b text-sm text-gray-800">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditScript(script)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="View/Edit Script"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteScript(script.script_id, e)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Script"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <JobDefinitionNewScript
                  jobDefinitionId={jobDefinitionId}
                  onClose={() => setShowModal(false)}
                  onSave={() => {
                    setShowModal(false);
                    fetchJobDefinition();
                  } } jobDefinitionTitle={""}            />
          )}
        </>
      ) : null}
    </div>
  );
};

export default JobDefinitionScript;