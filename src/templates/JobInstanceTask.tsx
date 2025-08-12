"use client";

import React, { useEffect, useState } from "react";
import DataList from "./DataList";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { loadPage } from "loader-lib";
import { useContent } from "seti-ramesesv1";
import JobInstanceNewTask from "./JobInstanceNewTask";

type Task = {
  task_id: string;
  task_name: string;
  script_name: string;
  status: string;
  records_processed: number;
  progress: number;
  state: string;
};

type JobInstance = {
  _id: string;
  name: string;
  title: string;
  state: string;
  description: string;
  definition_name: string;
  tasks: Task[];
};

type Params = {
  jobInstancename: string;
  jobInstanceId: string;
  jobInstanceTitle: string;
  jobDefinitionId: string;
};

const JobInstanceTask: React.FC<{ params: Params }> = ({ params }) => {
  const { jobInstanceId, jobInstancename, jobInstanceTitle, } = params;
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [jobInstance, setJobInstance] = useState<JobInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setContent } = useContent();
  const [jobDefinitionId, setJobDefinitionId] = useState<string>("");
  const target = "main";

  const cols = [
    { name: "task_name" as const, label: "Task Name" },
    { name: "script_name" as const, label: "Script" },
    { name: "status" as const, label: "Status" },
    { name: "records_processed" as const, label: "Records Processed" },
    { name: "progress" as const, label: "Progress (%)" },
    { name: "state" as const, label: "State" },
  ];

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
    } catch (err) {
      console.error("Failed to fetch job instance:", err);
      setError("Failed to load job instance. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const listHandler = async () => {
    return tasks;
  };

  const handleBack = async () => {
    const page = await loadPage({
      page: "Job-Instance",
      target: target,
    });
    setContent(target, () => page);
  };

  useEffect(() => {
    if (jobInstanceId) {
        fetchJobInstance();
    }
  }, [jobInstanceId]);

  return (
    <div className="p-6 font-sans">
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : jobInstance ? (
        <>
          {/* START: Inserted Code */}
          <div className="flex items-center mb-6">
            {/* Back button with right margin for spacing */}
            <button
              onClick={handleBack}
              className="mr-3 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Title - Aligned with the button */}
            <h2 className="text-2xl font-bold">
              <span className="text-gray-500">Job Instance</span>
            </h2>
          </div>
        

         
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Job Definition</p>
              <p className="font-medium">{jobInstance.definition_name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{jobInstance.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">State</p>
              <p className="font-medium">{jobInstance.state}</p>
            </div>
          </div>

          {/* Task List Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition"
            >
              + New Task
            </button>
          </div>

          {/* Task List */}
          <DataList
            cols={cols}
            handler={listHandler}
            allowSearch
            searchMode="manual"
            searchFields={["task_name", "script_name", "status", "state"]}
          />

          {/* Modal */}
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
        </>
      ) : null}
    </div>
  );
};

export default JobInstanceTask;