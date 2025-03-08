"use client";
import { useSidebar } from "@/context/SidebarContext";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface MobileSidePanelProps {
  children: ReactNode;
}

export default function MobileSidePanel({
  children,
}: MobileSidePanelProps) {
  const {isSidebarOpen,toggleSidebar} = useSidebar()
  return (
    <div onClick={toggleSidebar}
      className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
        isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Prevent closing when clicking backdrop */}
      <div
        className="absolute inset-0"
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gray-50 shadow-lg transition-transform ease-in-out duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="lg:hidden absolute top-4 right-4"
          onClick={toggleSidebar}
        >
          <X className="w-6 h-6" />
        </button>

        {children}
      </div>
    </div>
  );
}
