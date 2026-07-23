import Header from "@/components/shared/Header";
import AppSidebar from "@/components/shared/AppSidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "next-themes";
import { createClient } from "@/utils/supabase";
import ProfileGuard from "@/components/common/ProfileGuard";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('user_name, display_name')
      .eq('user_id', user.id)
      .single();
    profile = data;
  }

  return (
    <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem
    disableTransitionOnChange
  >
    <SidebarProvider>
    <ProfileGuard userProfile={profile} />
    <div className="flex min-h-screen flex-col">
        <Header />
      <div className="flex flex-1 relative">
        <AppSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
    </SidebarProvider>
    </ThemeProvider>
  );
}