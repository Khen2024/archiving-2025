"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomBytes = Math.random().toString(16).substring(2, 16);
  return timestamp + randomBytes.padEnd(16, "0");
}


type JobDefinition = {
  script_id: string;
  name: string;
  
};

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
  const [jobDefinition, setJobDefinition] = useState<Record<string,any>[]>([]);

    const fetchJobDefinition = async () => {
    try {
      const res = await axios.get(
        `/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}`
      );
      console.log("Job definition fetched:", res.data);

      const data = res.data;

      console.log("Job definition scripts:", data.scripts[0].name);


      setJobDefinition(data.scripts || []);
      
      
    } catch (err) { 
      console.error("Failed to fetch job definition:", err);
      setError("Failed to load job definition. Please try again later.");
    }
  };

  useEffect(() => {
  fetchJobDefinition();
}, []);

  const handleSubmit = async () => {
    // // if (!taskName.trim() || !scriptName.trim()) {
    //   setError("Both task name and script name are required.");
    //   return;
    // }

    setSaving(true);
    setError("");

    try {
      const currentTime = new Date().toISOString();

      const newTask = {
        task_id: generateObjectId(),
        task_name: taskName.trim(),
        script_name: scriptName.trim(),
        status: "pending",
        records_processed: 0,
        progress: 0,
        state: "created",
        created_at: currentTime,
        updated_at: currentTime,
      };

      
      const res = await fetch(`/localapi/mgmt/base/archiving/job_instance/${jobInstanceId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
        },
      });
      console.log("Response from GET job instance:", res);

      const responseData = await res.json();
      // console.log("Response data:", responseData.job_definition_id);
      // const jobDefId = responseData.job_definition_id;
      // // fetchJobDefinition(jobDefId);

      
      if (!res.ok) {
        throw new Error(responseData.message || "Failed to fetch job instance");
      }

      
      const requestData = {
        filter: {
          _id: jobInstanceId
        },
        update: {
          tasks: [...responseData.tasks, newTask]
        }
      };
      console.log("Request data for update:", requestData);
      
      const updateRes = await fetch(`/localapi/mgmt/base/archiving/job_instance/update`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const updateResponse = await updateRes.json();
      console.log("Update response:", updateResponse);

      if (!updateRes.ok) {
        console.error("Update failed:", updateResponse);
        throw new Error(
          updateResponse.message || 
          `Failed to create task (Status: ${updateRes.status})`
        );
      }

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800">
            New Task
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              placeholder="Enter task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
              required
            />
          </div>

          <div>
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Script Name *
            </label>
            <input
              type="text"
              placeholder="Enter script name"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
              required
            /> */}

            <select
                onChange={()=> console.log("Job definition changed")}
                className="w-full p-3 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                disabled={saving}
              >
                <option value="">-- Select a script --</option>
               

                {jobDefinition.map((jd:any) => (
                  
                  <option key={jd.script_id} value={jd.script_id}>
                    {jd.name}
                  </option>
                ))}
              </select>

            
          </div>

          {error && (
            <div className="text-red-600 bg-red-50 px-3 py-2 rounded-md text-sm whitespace-pre-wrap">
              {error}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobInstanceNewTask;