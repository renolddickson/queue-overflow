'use client';
import { ChevronRight } from "lucide-react";
import type { Topics } from "@/types";
import Icon from "./shared/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

const topics: Topics[] = [
  {
    title: "Getting started",
    icon: 'FileText',
    id: '1',
    subTopics: [
      { title: "Platform overview/ What is Playcart?", id: '1' },
      { title: "Building ads/checkouts", id: '2' },
      { title: "Deploying ads", id: '3' },
      { title: "Tracking & reporting", id: '4' },
    ],
  },
  {
    id: '2',
    title: "Campaign checklist",
    icon: 'BarChart3',
    subTopics: [],
  },
  {
    id: '3',
    title: "Settings",
    icon: 'Settings',
    subTopics: [],
  },
];

export default function LeftPanel() {
  const pathname = usePathname();
  const currentMenu = topics.find(topic => pathname.startsWith(`/q/${topic.id}`))?.id || "";

  return (
    <nav className="w-64 border-r bg-gray-50 px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)]">
      <div className="space-y-4">
        {topics.map((section) => {
          const isActive = currentMenu === section.id;
          const hasSubTopics = section.subTopics.length > 0;
          if (!hasSubTopics) {
            return null; // Return nothing if there are no subtopics
          }
          
          return (
            <div key={section.id}>
              <Link
                href={`/q/${section.id}/${section.subTopics[0]?.id || ''}`}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 transition ${
                  isActive ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon name={section.icon} />
                <span className="font-medium">{section.title}</span>
                  <ChevronRight
                    className={`ml-auto h-4 w-4 transition-transform ${
                      isActive ? "rotate-90" : ""
                    }`}
                  />
              </Link>

              {isActive && (
                <div className="mt-1 ml-4 space-y-1">
                  {section.subTopics.map((item) => (
                    <Link
                      key={item.id}
                      href={`/q/${section.id}/${item.id}`}
                      className={`block rounded-lg px-2 py-2 text-sm transition ${
                        pathname === `/q/${section.id}/${item.id}`
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
