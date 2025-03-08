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
  const [activePath, setActivePath] = useState(initialPath??'');
  
  // Extract the active subtopic ID from the route path.
  // Assuming the path is always in the form: /q/view/docid/subtopicid
  const pathParts = activePath.split('/');
  const activeSubTopicId = pathParts[pathParts.length - 1];

  // Update the activePath state when a link is clicked.
  const handleLinkClick = (path: string) => {
    setActivePath(path);
  };

  return (
    <nav className="w-64 border-r px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)]">
      <div className="space-y-4">
        {topics &&
          topics.map((section) => {
            if (section.subTopics.length === 0) return null;
            // A topic is active if any of its subtopics match the active subtopic id.
            const isActiveTopic = section.subTopics.some(
              (subtopic) => subtopic.id === activeSubTopicId
            );

            return (
              <div key={section.id}>
                <Link
                  href={`/q/view/${docId}/${section.subTopics[0]?.id || ""}`}
                  onClick={(event) =>{
                    event.stopPropagation()
                    handleLinkClick(
                      `/q/view/${docId}/${section.subTopics[0]?.id || ""}`
                    )
                  }
                  }
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 transition ${
                    isActiveTopic ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon name={section.icon} />
                  <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {section.title}
                  </span>
                  <ChevronRight
                    className={`ml-auto h-4 w-4 transition-transform ${
                      isActiveTopic ? "rotate-90" : ""
                    }`}
                  />
                </Link>
                {isActiveTopic && (
                  <div className="mt-1 ml-4 space-y-1">
                    {section.subTopics.map((item) => (
                      <Link
                        key={item.id}
                        href={`/q/view/${docId}/${item.id}`}
                        onClick={() => handleLinkClick(`/q/view/${docId}/${item.id}`)}
                        className={`block rounded-lg px-2 py-2 text-sm transition ${
                          activeSubTopicId === item.id
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
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
