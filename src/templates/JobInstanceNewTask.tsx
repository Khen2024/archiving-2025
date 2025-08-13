"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";


function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomBytes = Math.random().toString(16).substring(2, 16);
  return timestamp + randomBytes.padEnd(16, "0");
}

const JobInstanceNewTask = ({
  jobInstanceId,
  jobDefinitionId,
  onClose,
  onSave,
}: {
  jobDefinitionId: string;
  jobInstanceId: string;
  onClose: () => void;
  onSave: () => void;
}) => {
  
  const [taskName, setTaskName] = useState("");
  const [scriptName, setScriptName] = useState(""); 

  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [jobDefinitionScripts, setJobDefinitionScripts] = useState<Record<string, any>[]>([]);


  const fetchJobDefinition = async () => {
    try {
      const res = await axios.get(
        `/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}`
      );
      
      setJobDefinitionScripts(res.data.scripts || []);
    } catch (err) {
      console.error("Failed to fetch job definition:", err);
      setError("Failed to load script options. Please try again later.");
    }
  };


  useEffect(() => {
    fetchJobDefinition();
  }, [jobDefinitionId]); 

  
  const handleSubmit = async () => {
    
    if (!taskName.trim() || !scriptName.trim()) {
      setError("Both task name and a script selection are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
     
      const currentTime = new Date().toISOString();
      const newTaskId = taskName.replace(/\s+/g, "_").toLowerCase() + "_" + generateObjectId();

      const newTask = {
        id: newTaskId,
        name: taskName.trim(),
        script_name: scriptName.trim(), 
        status: "pending",
        records_processed: 0,
        progress: 0,
        state: "created",
        created_at: currentTime,
        updated_at: currentTime,
      };

      
      const res = await fetch(`/localapi/mgmt/base/archiving/job_instance/${jobInstanceId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch current job instance data");
      }
      const jobInstanceData = await res.json();
      
    
      const requestData = {
        filter: {
          _id: jobInstanceId
        },
        update: {
         
          tasks: [...jobInstanceData.tasks, newTask]
        }
      };
      
      console.log("Request data for update:", JSON.stringify(requestData, null, 2));

    
      const updateRes = await fetch(`/localapi/mgmt/base/archiving/job_instance/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const updateResponseData = await updateRes.json();
      
      if (!updateRes.ok) {
        console.error("Update failed:", updateResponseData);
        throw new Error(
          updateResponseData.message ||
          `Failed to create task (Status: ${updateRes.status})`
        );
      }
      
      console.log("Update successful:", updateResponseData);

     
      onSave();
      onClose();

    } catch (err) {
      console.error("Error creating task:", err);
      setError(`Failed to create task: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Create a New Task
          </h3>
        </div>

        <div className="p-6 space-y-5">
          {/* Task Name Input */}
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
              Task Name *
            </label>
            <input
              id="taskName"
              type="text"
              placeholder="e.g., Process Invoices"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={saving}
              required
            />
          </div>

          {/* Script Name Dropdown */}
          <div>
            <label htmlFor="scriptName" className="block text-sm font-medium text-gray-700 mb-1">
              Script *
            </label>
            <select
              id="scriptName"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
              disabled={saving || jobDefinitionScripts.length === 0}
              required
            >
              <option value="">-- Select a script --</option>
              {jobDefinitionScripts.map((script: any) => (
                <option key={script.script_id} value={script.name}>
                  {script.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="text-red-600 bg-red-50 px-3 py-2 rounded-md text-sm whitespace-pre-wrap border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !taskName || !scriptName}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobInstanceNewTask;
