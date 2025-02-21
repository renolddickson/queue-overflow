import Navigation from "@/components/LeftPanel";
import Header from "@/components/shared/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
        <Header />
      <div className="flex flex-1 relative">
      <div className="hidden md:block">
        <Navigation />
      </div>
        {children}
      </div>
    </div>
  );
}