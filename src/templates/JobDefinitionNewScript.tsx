"use client";

import { useState } from "react";

function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomBytes = Math.random().toString(16).substring(2, 16);
  return timestamp + randomBytes.padEnd(16, "0");
}

export function JobDefinitionNewScript({
  jobDefinitionId,
  jobDefinitionTitle,
  onClose,
  onSave,
}: {
  jobDefinitionTitle: string;
  jobDefinitionId: string;
  onClose: () => void;
  onSave: (newScriptId?: string) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("python");
  const [content, setScript] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); 

  const handleSubmit = async () => {
    if (!name.trim() || !content.trim()) {
      setError("Both name and script content are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const currentTime = new Date().toISOString();
      
      const newScript = {
        id: generateObjectId(),
        name: name.trim(),
        type,
        content: content.trim(),
        created_at: currentTime,
        updated_at: currentTime,
      };

      const res = await fetch(`/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
        },
      });

      const responseData = (await res.json() ?? {});

      responseData.scripts = responseData.scripts ?? [];

      

      
       const requestData = {
        "filter": {
          "_id": jobDefinitionId,
        },
        "update": {
          "scripts": [...responseData.scripts, newScript]
        }
      };  
      
      const updateRes = await fetch(`/localapi/mgmt/base/archiving/job_definition/update`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      console.log("Update response:", updateRes);


      if (!res.ok) {
        console.error("Update failed:", responseData);
        throw new Error(
          responseData.message || 
          `Failed to save script (Status: ${res.status})`
        );
      }

      onSave(newScript.id);
      onClose();
    } catch (e) {
      console.error("Error saving script:", e);
      setError(`Failed to save script: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800">
            New Script for "{jobDefinitionTitle || jobDefinitionId}"
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Script Name *
            </label>
            <input
              type="text"
              placeholder="Enter script name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Script Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
              required
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Script Content *
            </label>
            <textarea
              placeholder="// Enter your script here"
              value={content}
              onChange={(e) => setScript(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] font-mono text-sm"
              disabled={saving}
              spellCheck={false}
              required
            />
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
            {saving ? "Saving..." : "Save Script"}
          </button>
        </div>
      </div>
    </div>
  );
}