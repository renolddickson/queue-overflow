'use client'
import { Plus } from "lucide-react"
import type { Topics } from "@/types"
import { usePathname } from "next/navigation"
import Icon from "../shared/Icon"

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

export default function LeftPanelEditor() {
  const pathname = usePathname();
  const addTopic=()=>{
    topics.push(
      {
        title: "Topic"+topics.length+1,
        icon: 'FileText',
        isActive: true,
        id:(topics.length+1).toString(),
        subTopics: [],
      }
    )
  }

  return (
    <nav className="w-64 border-r bg-gray-50 px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)]">
      <div className="space-y-4">
        <button className="w-full border border-dashed border-gray-400 rounded-lg flex justify-center gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={addTopic}>
          <Plus /> Add Topic
        </button>
      {topics.map((section) => {
          return (
            <div key={section.id}>
              <div
                className={`flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition`}
              >
                <Icon name={section.icon} />
                <span className="font-medium">{section.title}</span>
                  <Plus
                    className={'ml-auto h-4 w-4'}
                  />
              </div>
                <div className="mt-1 ml-4 space-y-1">
                  {section.subTopics.map((item) => (
                    <a
                      key={item.id}
                      onClick={(e) => {
                        e.preventDefault();
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
            </div>
          );
        })}
      </div>
    </nav>
  )
}

