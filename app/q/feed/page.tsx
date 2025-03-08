import SearchBar from "./_components/SearchBar";
import CategoryFilter from "./_components/CategoryFilter";
import IntegrationGrid from "./_components/IntegrationGrid";
import Pagination from "./_components/Pagination";
import { categories, integrations } from "./_data/integrations";
import MobileSidePanel from "@/components/MobileSidePanel";


const ITEMS_PER_PAGE = 30

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}) {
  const myparams = await searchParams;
  const selectedCategory = myparams.category || "All"
  const searchQuery = myparams.search || ""
  const currentPage = Number(myparams.page) || 1

  // Filter integrations on the server
  const filteredIntegrations = integrations.filter((integration) => {
    const categoryMatch = selectedCategory === "All" || integration.category === selectedCategory
    const searchMatch =
      !searchQuery ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  const totalPages = Math.ceil(filteredIntegrations.length / ITEMS_PER_PAGE)
  const paginatedIntegrations = filteredIntegrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )
const Filter =()=>{
  return <CategoryFilter categories={categories} selectedCategory={selectedCategory} />
}
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="hidden md:block">
      <Filter />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 space-y-4">
          <h1 className="text-2xl font-bold">Integrations</h1>
          <SearchBar currentSearch={searchQuery} currentCategory={selectedCategory} currentPage={currentPage} />
        </div>
        <div className="flex-1 overflow-auto px-4 md:px-6">
          <IntegrationGrid integrations={paginatedIntegrations} />
        </div>
        <div className="p-4 md:p-6 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            currentCategory={selectedCategory}
            currentSearch={searchQuery}
          />
        </div>
      </main>
      <MobileSidePanel>
        <Filter />
      </MobileSidePanel>
    </div>
  )
}

