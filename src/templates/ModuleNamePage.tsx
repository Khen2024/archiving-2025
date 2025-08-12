import { loadPage } from "loader-lib";
import { useEffect, useState } from "react";
import { ContentPanel, TabList, useContent } from "seti-ramesesv1";

const tabItems = [
  { id: "main", label: "Dashboard" },
  { id: "txn", label: "Transactions" },
  { id: "mgmt", label: "Management" },
  { id: "master", label: "Master" },
  { id: "insight", label: "Insight" },
  { id: "settings", label: "Settings" },
];

const ModuleMainPage = () => {
  const [tabId, setTabId] = useState("main");
  const [target] = useState("module");
  const { setContent } = useContent();

  const openItem = async (item: Record<string, any>) => {
    try {
      setTabId(item.id);
      localStorage.setItem("activetab", item.id);

      const page = await loadPage({
        page: item.id,
        target,
      });
      setContent(target, () => page);
    } catch (error) {
      console.error("Error loading tab content:", error);
    }
  };

  useEffect(() => {
    const savedTab = localStorage.getItem("activetab");
    const tab = tabItems.find((t) => t.id === savedTab) || tabItems[0];
    openItem(tab);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TabList items={tabItems} openItem={openItem} value={tabId} />
      <div className="flex-1 overflow-auto">
        <ContentPanel id={target} />
      </div>
    </div>
  );
};

export default ModuleMainPage;
