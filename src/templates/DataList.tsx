"use client";

import React, { useEffect, useState } from "react";

type CustomRenderMap<T> = {
  [K in keyof T]?: (val: T[K], row: T) => React.ReactNode;
} & {
  actions?: (val: any, row: T) => React.ReactNode;
};

type Props<T> = {
  cols: { name: keyof T; label: string }[];
  handler: (searchQuery: string) => Promise<T[]>;
  allowSearch?: boolean;
  searchMode?: "manual" | "auto";
  searchFields?: (keyof T)[];
  rowClick?: (row: T) => void;
  customRender?: CustomRenderMap<T>;
};

export default function DataList<T extends { [key: string]: any }>({
  cols,
  handler,
  allowSearch = true,
  searchMode = "manual",
  rowClick,
  customRender,
}: Props<T>) {
  const [data, setData] = useState<T[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const results = await handler(searchQuery);
      setData(results);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setData([]);
    }
  };

  useEffect(() => {
    if (searchMode === "auto") {
      fetchData();
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  return (
    <div className="space-y-4">
      {allowSearch && (
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="px-2 py-1 border border-gray-300 rounded w-64"
            />
            {searchMode === "manual" && (
              <button
                onClick={handleSearch}
                className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600"
              >
                Search
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {cols.map((col) => (
                <th key={String(col.name)} className="px-4 py-2">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => rowClick?.(row)}
                >
                  {cols.map((col) => (
                    <td
                      key={String(col.name)}
                      className="px-4 py-2"
                      onClick={(e) => {
                        // prevent rowClick when clicking inside actions cell
                        if (col.name === "actions") e.stopPropagation();
                      }}
                    >
                      {customRender && customRender[col.name]
                        ? customRender[col.name]!(row[col.name], row)
                        : String(row[col.name] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={cols.length} className="px-4 py-2 text-center">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
