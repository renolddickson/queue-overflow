import SearchBar from "./_components/SearchBar"
import IntegrationGrid from "./_components/IntegrationGrid"
import { fetchAllFeeds } from "@/actions/document"
import { FeedData } from "@/types/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, ThumbsUp, MessageSquare, Share2, Layers, FileText } from "lucide-react"
import Image from "next/image"
import DocumentPlaceholder from "@/components/common/DocumentPlaceholder"

// import Pagination from "./_components/Pagination"
// import MobileSidePanel from "@/components/MobileSidePanel"
// import DynamicDocFilter from "./_components/DynamicDocFilter"

// const ITEMS_PER_PAGE = 30

// Extract unique values for a given field from documents
// function extractUniqueValues(documents: DocumentData[], field: keyof DocumentData): string[] {
//   const values = new Set<string>()

//   documents.forEach((doc) => {
//     const value = doc[field]
//     if (typeof value === "string" && value) {
//       values.add(value)
//     }
//   })

//   return Array.from(values).sort()
// }

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    search?: string
    page?: string
    subjects?: string
    languages?: string
    difficulty?: string
  }>
}) {
  const awaitedParam = await searchParams;

  // 2) Extract unique values for filter options
  // const categories = extractUniqueValues(documents, "category")
  // const subjects = extractUniqueValues(documents, "subject")
  // const languages = extractUniqueValues(documents, "language")
  // const difficulties = extractUniqueValues(documents, "difficulty")

  // 3) Read query params
  const selectedCategory = awaitedParam.category ? awaitedParam.category.split(",") : ["All"]
  const searchQuery = awaitedParam.search || ""
  const currentPage = Number(awaitedParam.page) || 1
  // const selectedSubjects = awaitedParam.subjects ? awaitedParam.subjects.split(",") : []
  // const selectedLanguages = awaitedParam.languages ? awaitedParam.languages.split(",") : []
  // const selectedDifficulty = awaitedParam.difficulty ? awaitedParam.difficulty.split(",") : []

  // 4) Filter documents based on search params
  // const filteredDocuments = documents.filter((doc) => {
  //   // If "All" is selected, skip category filtering
  //   const categoryMatch = selectedCategory.includes("All") || (doc.category && selectedCategory.includes(doc.category))

  //   // Search by title or description
  //   const searchMatch =
  //     !searchQuery ||
  //     doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     doc.description.toLowerCase().includes(searchQuery.toLowerCase())

  //   // Filter by subject
  //   const subjectMatch = selectedSubjects.length === 0 || (doc.subject && selectedSubjects.includes(doc.subject))

  //   // Filter by language
  //   const languageMatch = selectedLanguages.length === 0 || (doc.language && selectedLanguages.includes(doc.language))

  //   // Filter by difficulty
  //   const difficultyMatch =
  //     selectedDifficulty.length === 0 || (doc.difficulty && selectedDifficulty.includes(doc.difficulty))

  //   return categoryMatch && searchMatch && subjectMatch && languageMatch && difficultyMatch
  // })
  let docData: FeedData[] = [];
  try{
    const response = await fetchAllFeeds(searchQuery);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    docData = (response.data as any[]);
  }
  catch(err){
    console.log('Error occured '+err);
  }
  // 5) Paginate results
  // const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)
  // const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // 6) Define filter groups with counts
  // const getOptionCount = (field: keyof DocumentData, value: string): number => {
  //   return documents.filter((doc) => doc[field] === value).length
  // }

  // const filterGroups = [
  //   {
  //     title: "Category",
  //     param: "category",
  //     type: "radio" as const, // single-select
  //     options: [
  //       // "All" option
  //       { value: "All", label: "All" },
  //       // Map the categories with counts
  //       ...categories.map((cat) => ({
  //         value: cat,
  //         label: cat,
  //         count: getOptionCount("category", cat),
  //       })),
  //     ],
  //   },
  //   {
  //     title: "Subject",
  //     param: "subjects",
  //     type: "checkbox" as const,
  //     options: subjects.map((subject) => ({
  //       value: subject,
  //       label: subject,
  //       count: getOptionCount("subject", subject),
  //     })),
  //   },
  //   {
  //     title: "Language",
  //     param: "languages",
  //     type: "checkbox" as const,
  //     options: languages.map((language) => ({
  //       value: language,
  //       label: language,
  //       count: getOptionCount("language", language),
  //     })),
  //   },
  //   {
  //     title: "Difficulty",
  //     param: "difficulty",
  //     type: "radio" as const,
  //     options: difficulties.map((difficulty) => ({
  //       value: difficulty,
  //       label: difficulty,
  //       count: getOptionCount("difficulty", difficulty),
  //     })),
  //   },
  // ]

  // 7) Collect the user's current selections
  // const selectedFilters = {
  //   category: selectedCategory,
  //   subjects: selectedSubjects,
  //   languages: selectedLanguages,
  //   difficulty: selectedDifficulty,
  // }

  const categories = ["All", "Technology", "Design", "Business", "Lifestyle", "Education"];

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Category Navigation */}
      <div className="sticky top-16 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 h-12">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === "All" ? "/" : `/?category=${cat}`}
                className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-primary ${
                  (cat === "All" && selectedCategory.includes("All")) || selectedCategory.includes(cat)
                    ? "text-primary border-b-2 border-primary h-full flex items-center"
                    : "text-slate-500"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {searchQuery ? `Search for "${searchQuery}"` : "Discover stories"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Through things you care about.
            </p>
          </div>
          
          <SearchBar
            currentSearch={searchQuery}
            currentCategory={selectedCategory.join(",")}
            currentPage={currentPage}
          />
        </div>

        {!searchQuery && docData && docData.length > 0 && (
          <div className="relative group cursor-pointer overflow-hidden rounded-3xl bg-slate-900 aspect-[21/9] md:aspect-[3/1]">
            {docData[0].cover_image ? (
              <Image 
                src={docData[0].cover_image} 
                alt="Featured" 
                fill 
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
              />
            ) : (
              <DocumentPlaceholder type={docData[0].type} title={docData[0].title} className="opacity-40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-12 space-y-4 max-w-2xl">
              <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">Featured Story</span>
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {docData[0].title}
              </h2>
              <p className="text-slate-300 line-clamp-2 text-sm md:text-base">
                {docData[0].description}
              </p>
              <Link href={`/${docData[0].type}/${docData[0].id}`}>
                <Button className="mt-4 bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8">Read Story</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {searchQuery ? 'Search Results' : 'Latest Stories'}
             </h2>
             <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Sorted by:</span>
                <span className="font-bold text-slate-900 dark:text-white">Recent</span>
             </div>
          </div>
          {docData && docData.length > 0 ? (
            <div className="space-y-10">
               <IntegrationGrid integrations={docData} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Search className="text-slate-400 w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">No results found</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2">
                 We couldn&apos;t find any stories matching your current filters. Try adjusting your search.
               </p>
               <Link href="/" className="mt-6">
                  <Button variant="outline">Clear all filters</Button>
               </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
