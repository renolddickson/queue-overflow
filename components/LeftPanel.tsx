'use client'
import { ChevronRight } from "lucide-react"
import type { Topics } from "@/types"
import Icon from "./shared/Icon"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

const topics: Topics[] = [
  {
    title: "Getting started",
    icon: 'FileText',
    isActive: true,
    id:'1',
    subTopics: [
      { title: "Platform overview/ What is Playcart?", isActive: true,id:'1' },
      { title: "Building ads/checkouts",id:'2' },
      { title: "Deploying ads",id:'3' },
      { title: "Tracking & reporting",id:'4' },
    ],
  },
  {
    id:'2',
    title: "Campaign checklist",
    icon: 'BarChart3',
    subTopics: [],
  },
  {
    id:'3',
    title: "Settings",
    icon: 'Settings',
    subTopics: [],
  },
]

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentMenu, setCurrentMenu] = useState(topics[0]?.id || "");
  
  useEffect(() => {
    // Sync the current menu with the route path
    const matchedTopic = topics.find((topic) => `/q/${topic.id}` === pathname);
    if (matchedTopic) {
      setCurrentMenu(matchedTopic.id);
    }
  }, [pathname, topics]);

  const handleNavigation = (id?:string,subId?:string) => {
    router.push(`/q/${id?id+'/':''}${subId?subId:''}`);
  };
  return (
    <nav className="w-64 border-r bg-gray-50 px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)]">
      <div className="space-y-4">
      {topics.map((section) => {
          const isActive = currentMenu === section.id;
          const hasSubTopics = section.subTopics.length > 0;

          return (
            <div key={section.id}>
              <div
                onClick={() => {
                  if (!hasSubTopics) {
                    handleNavigation(section.id);
                  } else {
                    setCurrentMenu(isActive ? "" : section.id);
                    if(currentMenu !== section.id)
                    handleNavigation(section.subTopics[0].id,section.id);
                  }
                }}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition ${
                  isActive ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon name={section.icon} />
                <span className="font-medium">{section.title}</span>
                {hasSubTopics && (
                  <ChevronRight
                    className={`ml-auto h-4 w-4 transition-transform ${
                      isActive ? "rotate-90" : ""
                    }`}
                  />
                )}
              </div>

              {hasSubTopics && isActive && (
                <div className="mt-1 ml-4 space-y-1">
                  {section.subTopics.map((item) => (
                    <a
                      key={item.id}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(section.id,item.id);
                      }}
                      className={`block rounded-lg px-2 py-2 text-sm transition cursor-pointer ${
                        pathname === `/q/${section.id}/${item.id}`
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  )
}

