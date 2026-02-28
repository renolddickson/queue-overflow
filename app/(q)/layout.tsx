import Header from "@/components/shared/Header";
import AppSidebar from "@/components/shared/AppSidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "next-themes";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem
    disableTransitionOnChange
  >
    <SidebarProvider>
    <div className="flex min-h-screen flex-col">
        <Header />
      <div className="flex flex-1 relative">
        <AppSidebar />
        <div className="flex-1 min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
    </SidebarProvider>
    </ThemeProvider>
  );
}