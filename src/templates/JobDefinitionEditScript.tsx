"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
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

type Params = {
  jobDefinitionId: string;
  scriptId: string;
};

const JobDefinitionEditScript: React.FC<{ params: Params }> = ({ params }) => {
  const { jobDefinitionId, scriptId } = params;
  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const { setContent } = useContent();
  const target = "main";

  const fetchScript = async () => {
    try {
      const res = await axios.get(
        `/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}/scripts/${scriptId}`
      );
      setScript(res.data);
      setEditedName(res.data.name);
      setEditedContent(res.data.content);
    } catch (err) {
      console.error("Failed to fetch script:", err);
      setError("Failed to load script. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScript();
  }, [jobDefinitionId, scriptId]);

  const handleBack = async () => {
    const page = await loadPage({
      page: "Job-Definition-Script",
      target: target,
      params: { jobDefinitionId }
    });
    setContent(target, () => page);
  };

  const handleSave = async () => {
    if (!script) return;

    try {
      await axios.put(
        `/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}/scripts/${scriptId}`,
        {
          name: editedName,
          content: editedContent,
          description: script.description
        }
      );
      setIsEditing(false);
      fetchScript(); // Refresh the data
    } catch (err) {
      console.error("Failed to update script:", err);
      alert("Error updating script. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this script?")) return;

    try {
      await axios.delete(
        `/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}/scripts/${scriptId}`
      );
      // Redirect back after deletion
      const page = await loadPage({
        page: "Job-Definition-Script",
        target: target,
        params: { jobDefinitionId }
      });
      setContent(target, () => page);
    } catch (err) {
      console.error("Failed to delete script:", err);
      alert("Error deleting script. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 font-sans">
        <p>Loading...</p> 
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 font-sans">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="p-6 font-sans">
        <p>Script not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      <button
        onClick={handleBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Scripts
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Editing Script" : "Script Details"}
        </h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Script Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-gray-900">{script.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Created At
          </label>
          <p className="text-gray-600">
            {new Date(script.created_at).toLocaleString()}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Updated
          </label>
          <p className="text-gray-600">
            {new Date(script.updated_at).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Script Content
          </label>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              spellCheck="false"
            />
          ) : (
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm text-gray-900 font-mono whitespace-pre-wrap">
              {script.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDefinitionEditScript;