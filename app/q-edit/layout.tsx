import Header from "@/components/shared/Header";

export default function QEditLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
    <>
    <Header />
    {children}
    </>
  )
}