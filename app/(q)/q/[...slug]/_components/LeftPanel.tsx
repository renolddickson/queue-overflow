"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Icon from "@/components/shared/Icon";
import Link from "next/link";

type Topic = {
  id: string;
  title: string;
  icon: string;
  position: number;
  subTopics: { id: string; title: string; position: number }[];
};

export default function LeftPanel({
  initialPath,
  topics,
  docId,
}: {
  initialPath: string;
  topics: Topic[];
  docId: string;
}) {
  const [activePath, setActivePath] = useState(initialPath ?? "");
  const pathParts = activePath.split("/");
  const activeSubTopicId = pathParts[pathParts.length - 1];

  const handleLinkClick = (path: string) => {
    setActivePath(path);
  };

  return (
    <nav className="w-64 border-r border-gray-200 dark:border-gray-700 px-4 py-6 sticky top-16 min-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="space-y-6">
        {topics.map((section) => {
          if (section.subTopics.length === 0) return null;
          const isActiveTopic = section.subTopics.some(
            (st) => st.id === activeSubTopicId
          );

          return (
            <div key={section.id}>
              <Link
                href={`/q/doc/${docId}/${section.subTopics[0]?.id || ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLinkClick(
                    `/q/doc/${docId}/${section.subTopics[0]?.id || ""}`
                  );
                }}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition 
                  ${isActiveTopic
                    ? "bg-white shadow dark:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"}
                `}
              >
                <Icon name={section.icon} className="text-blue-500 dark:text-blue-400" />
                <span className="font-medium truncate">{section.title}</span>
                <ChevronRight
                  className={`ml-auto h-4 w-4 transition-transform ${
                    isActiveTopic ? "rotate-90 text-blue-500 dark:text-blue-400" : ""
                  }`}
                />
              </Link>

              {isActiveTopic && (
                <div className="mt-2 ml-6 space-y-1">
                  {section.subTopics.map((item) => (
                    <Link
                      key={item.id}
                      href={`/q/doc/${docId}/${item.id}`}
                      onClick={() =>
                        handleLinkClick(`/q/doc/${docId}/${item.id}`)
                      }
                      className={`
                        block px-3 py-1 rounded-md text-sm transition
                        ${
                          activeSubTopicId === item.id
                            ? "bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-blue-300"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        }
                      `}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
