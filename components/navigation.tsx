import { ChevronRight, Settings, FileText, BarChart3 } from "lucide-react"
import type { NavigationSection } from "@/types"

const navigation: NavigationSection[] = [
  {
    title: "Getting started",
    icon: FileText,
    isActive: true,
    items: [
      { title: "Platform overview/ What is Playcart?", isActive: true },
      { title: "Building ads/checkouts" },
      { title: "Deploying ads" },
      { title: "Tracking & reporting" },
    ],
  },
  {
    title: "Campaign checklist",
    icon: BarChart3,
    items: [],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [],
  },
]

export default function Navigation() {
  return (
    <nav className="w-64 border-r bg-gray-50 px-4 py-6 sticky top-16 h-fit">
      <div className="space-y-4">
        {navigation.map((section) => (
          <div key={section.title}>
            <div
              className={`flex items-center gap-2 rounded-lg px-2 py-2 ${
                section.isActive ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <section.icon className="h-4 w-4" />
              <span className="font-medium">{section.title}</span>
              {section.items.length > 0 && (
                <ChevronRight className={`ml-auto h-4 w-4 ${section.isActive ? "rotate-90" : ""}`} />
              )}
            </div>
            {section.items.length > 0 && section.isActive && (
              <div className="mt-1 ml-4 space-y-1">
                {section.items.map((item) => (
                  <a
                    key={item.title}
                    href="#"
                    className={`block rounded-lg px-2 py-2 text-sm ${
                      item.isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}

