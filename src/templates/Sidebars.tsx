"use client";

import { useState } from "react";
import { loadPage } from "loader-lib";
import { ContentPanel, Sidebar, useContent } from "seti-ramesesv1";


const sidebarData = [
  {
    title: "Job Definition",
    type: "",
    items: [
      {
        title: "Job Definition",
        page: "Job-Definition",
        icon: "",
      },
      {
        title: "Job Instance",
        page: "Job-Instance",
        icon: "",
      },
    ],
  },
];

const Sidebars = () => {
  const [activePage, setActivePage] = useState("Job Definition");
  const [target] = useState<any>("main");
  const { setContent } = useContent();

  const handleClick = async (item: Record<string, any>) => {
    setActivePage(item.page);
    const page = await loadPage({ page: item.page, target });
    setContent(target, () => page);
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        onClick={handleClick} 
        items={sidebarData} 
        activeItem={activePage} 
      />
      <ContentPanel id={target} />
    </div>
  );
};

export default Sidebars;
