import Header from "@/components/shared/Header";
import { SidebarProvider } from "@/context/SidebarContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
    <div className="flex min-h-screen flex-col">
        <Header />
      <div className="flex flex-1 relative">
        {children}
      </div>
    </div>
    </SidebarProvider>
  );
}