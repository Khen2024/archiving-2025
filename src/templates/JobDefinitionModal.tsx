"use client";

import { useState } from "react";
import { Form, Text, useBinding} from "@ramesesinc/client";

type Props = {
  onClose: () => void;
  onSave: (newId?: string) => void; 
};

type JobDefinitionData = {
  _id: string;
  title: string;
  description: string;
}
export default function JobDefinitionModal({ onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const _id = title ? title : "job-definition-" + Date.now().toString(16);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const binding = useBinding();


  
  const handleSubmit = async () => {
    const {title, description} = binding.getData();
    if (!title || !description) {
      setError("Both title and description are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {

      const newtitle = title.replace(/ /g, "_").toLowerCase();

      const data  = {
      _id : newtitle,
      title: title,
      description: description,
      }
      const res = await fetch("/localapi/mgmt/base/archiving/job_definition/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify( data),
      });

      if (!res.ok) throw new Error("Failed to save");

      const result = await res.json(); 
      const newId = result?.data?._id;

      onSave(newId);
      onClose();
    } catch (e) {
      console.error(e);
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800">New Job Definition</h3>
        </div>

        <div className="p-6 space-y-4">

          < Form binding = {binding}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            {/* <input
              placeholder="Job title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            /> */}
            < Text binding = {binding} name="title" label="" placeholder="Title" textcase="none" />
            


          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            {/* <textarea
              placeholder="Job description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              disabled={saving}
            /> */}

            < Text binding = {binding} name="description" label="" placeholder="Description" textcase="none" />
          </div>
          </Form>

          {error && (
            <div className="text-red-600 bg-red-50 px-3 py-2 rounded-md text-sm">
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
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}