"use client";

import axios from "axios";
import { useEffect, useState } from "react";

type JobDefinition = {
  _id: string;
  title: string;
};

type Props = {
  onClose: () => void;
  onSave: (newId?: string) => void;
};

export default function JobInstanceModal({ onClose, onSave }: Props) {
  const [jobDefinitions, setJobDefinitions] = useState<JobDefinition[]>([]);
  const [jobDefinitionId, setJobDefinitionId] = useState("");

  const [year, setYear] = useState(new Date().getFullYear());
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobDefinitions = async () => {
      try {
        const res = await axios(`/localapi/mgmt/base/archiving/job_definition/list`);
        setJobDefinitions(res.data || []);
      } catch (err) {
        console.error("Failed to fetch job definitions", err);
      }
    };
    fetchJobDefinitions();
  }, []);

  const handleSubmit = async () => {
    if (!jobDefinitionId || !name) {
      setError("Job Definition and Name are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const selectedDef = jobDefinitions.find(j => j._id === jobDefinitionId);
      const newId = name.replace(/ /g, "_").toLowerCase();
      const payload = {
        _id: newId,
        name,
        job_definition_id: jobDefinitionId,
        definition_name: selectedDef?.title || "",
        year,
        status: "Pending",
        created_at: new Date(),
        tasks: [],
      };

      const res = await fetch("/localapi/mgmt/base/archiving/job_instance/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save job instance");

      const result = await res.json();
      onSave(result?.data?._id);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error saving job instance.");
    } finally {
      setSaving(false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <i className="fas fa-tasks text-white text-xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white">Create New Job Instance</h2>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Job Definition Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 flex items-center">
              <i className="fas fa-list-check mr-2 text-blue-600"></i>
              Select a Job Definition
            </label>
            <div className="relative">
              <select
                value={jobDefinitionId}
                onChange={(e) => setJobDefinitionId(e.target.value)}
                className="w-full p-3 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                disabled={saving}
              >
                <option value="">-- Select a Job Definition --</option>
                {jobDefinitions.map((jd) => (
                  <option key={jd._id} value={jd._id}>
                    {jd.title}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i className="fas fa-cogs"></i>
              </div>
              {/* Dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          {/* Year & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Year Dropdown */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center">
                <i className="fas fa-calendar-days mr-2 text-blue-600"></i>
                Year
              </label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full p-3 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                  disabled={saving}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fas fa-calendar"></i>
                </div>
                {/* Dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            {/* Job Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center">
                <i className="fas fa-pen mr-2 text-blue-600"></i>
                Job Instance Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 shadow-sm"
                  placeholder="Enter job instance name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fas fa-signature"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
              <div className="text-red-500 mr-3">
                <i className="fas fa-exclamation-circle text-lg"></i>
              </div>
              <div>
                <p className="font-medium text-red-800">Action required</p>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle mr-2"></i>
                Create New Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
