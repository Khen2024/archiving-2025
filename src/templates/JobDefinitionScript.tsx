"use client";

import React, { useEffect, useState } from "react";
import { JobDefinitionNewScript } from "./JobDefinitionNewScript";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { loadPage } from "loader-lib";
import { useContent } from "seti-ramesesv1";
import axios from "axios";
import { u } from "../../../react-ui/dist/types-090e4955";

type Script = {
  id: string;
  name: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
  description?: string;
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
  jobInstanceId?: string;
};



const JobDefinitionScript: React.FC<{ params: Params }> = ({ params }) => {
  const { jobDefinitionId } = params;
  const [jobDef, setJobDef] = useState<JobDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scriptToDelete, setScriptToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { setContent } = useContent();
  const target = "main";

  const fetchJobDefinition = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/localapi/mgmt/base/archiving/job_definition/${jobDefinitionId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch job definition data.");
      }

      const data = await response.json();
      setJobDef(data);
      setError(null);
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

  const handleBack = async () => {
    const page = await loadPage({
      page: "Job-Definition",
      target: target,
    });
    setContent(target, () => page);
  };

  const handleEditScript = async (script: Script) => {
    const page = await loadPage({
      page: "Job-Definition-Edit-Script",
      target: target,
      params: {
        jobDefinitionId: jobDefinitionId,
        scriptId: script.id,
      },
    });
    setContent(target, () => page);
  };

  const handleDeleteClick = (scriptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScriptToDelete(scriptId);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteScript = async () => {
    if (!scriptToDelete || !jobDef) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    

    // filter the job definition to find the script to delete
    const updatePayload = {
      filter: { _id: jobDefinitionId },
      update: {
        $pull: {
          scripts:{ id: scriptToDelete },
        },
      },
    };
   
    
    try { 

      // API call to delete the script from the job definition

      const response = await fetch(
        `/localapi/mgmt/base/archiving/job_definition/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
        
      );
      console.log("Response :", response);

      if (!response.ok) {
       
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
        
          errorData = { message: response.statusText };
        }
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      
      setJobDef((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          scripts: prev.scripts.filter(
            (script) => script.id !== scriptToDelete
          ),
        };
      });

      handleCloseDeleteModal(); 

    } catch (err) {
      console.error("Failed to delete script:", err);
      setDeleteError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setScriptToDelete(null);
    setDeleteError(null);
    setIsDeleting(false);
  };


  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : jobDef ? (
        <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-md">
           {/* Header Section */}
           <div className="flex items-center mb-6 border-b pb-4">
             <button
               onClick={handleBack}
               className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-4"
               title="Back to Job Definitions"
             >
               <ArrowLeft className="w-6 h-6" />
             </button>
            
             {/* Title */}
             <h2 className="text-2xl font-bold">
               <span className="text-gray-500">Job Definition</span>
             </h2>
           </div>
                      
           <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-gray-50 p-4 rounded-lg">
               <p className="text-sm text-gray-500">Job Definition</p>
               <p className="font-medium">{jobDef.title}</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-lg">
               <p className="text-sm text-gray-500">Description</p>
               <p className="font-medium">{jobDef.description}</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-lg">
               <p className="text-sm text-gray-500">State</p>
               <p className="font-medium">{jobDef.state}</p>
             </div>
           </div>
           
           {/* Scripts Section */}
           <div className="mt-8">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-semibold text-gray-700">Scripts</h2>
               <button
                 onClick={() => setShowModal(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
               >
                 <Plus className="h-5 w-5" />
                 <span className="text-sm font-medium">Add Script</span>
               </button>
             </div>

             <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
               <table className="min-w-full bg-white">
                 <thead className="bg-gray-100">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Type</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Content Preview</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                   {jobDef.scripts?.length > 0 ? (
                     jobDef.scripts.map((script) => (
                       <tr key={script.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{script.name}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{script.type}</td>
                         <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-md">{script.content}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm">
                           <div className="flex items-center space-x-4">
                             <button
                               onClick={() => handleEditScript(script)}
                               className="text-blue-600 hover:text-blue-800 transition-colors"
                               title="View/Edit Script"
                             >
                               <FileText className="h-5 w-5" />
                             </button>
                             <button
                               onClick={(e) => handleDeleteClick(script.id, e)}
                               className="text-red-600 hover:text-red-800 transition-colors"
                               title="Delete Script"
                             >
                               <Trash2 className="h-5 w-5" />
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={4} className="text-center py-6 text-gray-500">
                         No scripts found. Add one to get started.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      ) : null}

      {/* Add New Script Modal */}
      {showModal && (
        <JobDefinitionNewScript
          jobDefinitionId={jobDefinitionId}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchJobDefinition();
          }}
          jobDefinitionTitle={jobDef?.title || ""}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this script? This action cannot be undone.
            </p>
            
            {deleteError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteScript}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDefinitionScript;