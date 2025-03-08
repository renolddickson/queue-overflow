import Header from "@/components/shared/Header";
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
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <SidebarProvider>
    <div className="flex min-h-screen flex-col">
        <Header />
      <div className="flex flex-1 relative">
        {children}
      </div>
    </div>
    </SidebarProvider>
    </ThemeProvider>
  );
}