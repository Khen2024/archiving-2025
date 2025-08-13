"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { loadPage } from "loader-lib";
import { useContent } from "seti-ramesesv1";
import JobInstanceNewTask from "./JobInstanceNewTask";
import axios from "axios";

type Task = {
  id: string;
  name: string;
  script_name: string;
  status: string;
  records_processed: number;
  progress: number;
  state: string;
  created_at?: string;
  updated_at?: string;
};

type JobInstance = {
  _id: string;
  name: string;
  title: string;
  state: string;
  description: string;
  definition_name: string;
  tasks: Task[];
  job_definition_id?: string;
};

type JobDefinition = {
  _id: string;
  description: string;
  title: string;
};

type Params = {
  jobInstancename: string;
  jobInstanceId: string;
  jobInstanceTitle: string;
  jobDefinitionId: string;
};

const JobInstanceTask: React.FC<{ params: Params }> = ({ params }) => {
  const { jobInstanceId } = params;
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [jobDef, setJobDef] = useState<JobDefinition | null>(null);
  const [jobInstance, setJobInstance] = useState<JobInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setContent } = useContent();
  const [jobDefinitionId, setJobDefinitionId] = useState("");
  const target = "main";

  const fetchJobInstance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `/localapi/mgmt/base/archiving/job_instance/${jobInstanceId}`
      );
      const result = res.data;

      setJobInstance(result);
      setJobDefinitionId(result.job_definition_id || "");
      setTasks(result.tasks || []);
      
      if (result.job_definition_id) {
        await fetchJobDefinition(result.job_definition_id);
      }
    } catch (err) {
      console.error("Failed to fetch job instance:", err);
      setError("Failed to load job instance. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobDefinition = async (definitionId: string) => {
    try {
      const res = await axios.get(
        `/localapi/mgmt/base/archiving/job_definition/${definitionId}`
      );
      setJobDef(res.data);
    } catch (err) {
      console.error("Failed to fetch job definition:", err);
    }
  };

  const handleBack = async () => {
    const page = await loadPage({
      page: "Job-Instance",
      target,
    });
    setContent(target, () => page);
  };

  const handleDeleteClick = (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTaskToDelete(taskId);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete || !jobInstanceId) return;
    setDeleteError(null);

  try {


    // filter to find the specific task to delete 
    const payload = {
      filter: { _id: jobInstanceId },
      update: {
        $pull: {
          tasks:{ id: taskToDelete },
        },
      },
    };


    // API call to delete the task 
  const response = await fetch(
    `/localapi/mgmt/base/archiving/job_instance/update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: 'Failed to delete task. Please try again.' 
    }));
    throw new Error(errorData.message);
  }

  setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));

  setShowDeleteModal(false);
  setTaskToDelete(null);
} catch (err) {
  console.error("Failed to delete task:", err);
  setDeleteError(`Error: ${(err as Error).message}`);
}
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
    setDeleteError(null);
  };

  useEffect(() => {
    if (jobInstanceId) {
      fetchJobInstance();
    }
  }, [jobInstanceId]);

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : jobInstance ? (
        <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-md">
          {/* Header Section */}
          <div className="flex items-center mb-6 border-b pb-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-4"
              title="Back to Job Instances"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
           
            <h2 className="text-2xl font-bold">
              <span className="text-gray-500">Job Instance</span>
            </h2>
          </div>

          {/* Job Instance Info Section */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Job Definition</p>
              <p className="font-medium">{jobDef?.title || jobInstance.definition_name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Job Instance</p>
              <p className="font-medium">{jobInstance.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Job Definition Description</p>
              <p className="font-medium">{jobDef?.description || "No description available"}</p>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">Tasks</h2>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">Add Task</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Task Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Script Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Records Processed</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">State</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600  tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.script_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.records_processed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.progress}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.state}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">
                        No tasks found. Add one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* Add New Task Modal */}
      {showModal && (
        <JobInstanceNewTask
          jobInstanceId={jobInstanceId}
          jobDefinitionId={jobDefinitionId}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchJobInstance();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Task Deletion</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this task?</p>
            
            {deleteError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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

export default JobInstanceTask;