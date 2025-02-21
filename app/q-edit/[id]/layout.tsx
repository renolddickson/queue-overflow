import LeftPanelEditor from "@/components/editor/LeftPanelEditor";

export default function QEditIdLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div>
            <LeftPanelEditor />
            {children}
        </div>
    )}