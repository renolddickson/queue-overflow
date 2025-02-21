import { X } from "lucide-react";
import Navigation from "./LeftPanel";

interface MobileSidePanelProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
 }
export default function MobileSidePanel({ isSidebarOpen, setIsSidebarOpen }: MobileSidePanelProps) {

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
    <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button
          className="lg:hidden absolute top-4 right-4"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>

        <Navigation />
      </div>
      </div>
  );
}
