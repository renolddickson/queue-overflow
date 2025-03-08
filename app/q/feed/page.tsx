import SearchBar from "./_components/SearchBar"
import IntegrationGrid from "./_components/IntegrationGrid"
import Pagination from "./_components/Pagination"
import MobileSidePanel from "@/components/MobileSidePanel"
import DynamicDocFilter from "./_components/DynamicDocFilter"

const ITEMS_PER_PAGE = 30

export interface DocumentData {
  id: string
  title: string
  description: string
  cover_image: string
  updated_at: string
  category?: string
  subject?: string
  language?: string
  difficulty?: string
}

// This would be replaced with your actual API fetch function
async function fetchDocuments(): Promise<DocumentData[]> {
  // Example API call - replace with your actual API endpoint
  // const res = await fetch('https://your-api-endpoint/documents')
  // return res.json()

  // For now, returning mock data that matches the DocumentData interface
  return [
    {
      id: "1",
      title: "Getting Started with Next.js",
      description: "Learn the basics of Next.js framework",
      cover_image: "/placeholder.svg",
      updated_at: "2023-05-15",
      category: "Frameworks",
      subject: "Computer Science",
      language: "English",
      difficulty: "Beginner",
    },
    {
      id: "2",
      title: "Advanced React Patterns",
      description: "Deep dive into advanced React patterns",
      cover_image: "/placeholder.svg",
      updated_at: "2023-06-20",
      category: "Libraries",
      subject: "Computer Science",
      language: "English",
      difficulty: "Advanced",
    },
    // Add more mock documents as needed
  ]
}

// Extract unique values for a given field from documents
function extractUniqueValues(documents: DocumentData[], field: keyof DocumentData): string[] {
  const values = new Set<string>()

  documents.forEach((doc) => {
    const value = doc[field]
    if (typeof value === "string" && value) {
      values.add(value)
    }
  })

  return Array.from(values).sort()
}

export default async function Page({
  searchParams,
}: {
  searchParams: {
    category?: string
    search?: string
    page?: string
    subjects?: string
    languages?: string
    difficulty?: string
  }
}) {
  const awaitedParam = await searchParams;
  // 1) Fetch documents from API
  const documents = await fetchDocuments()

  // 2) Extract unique values for filter options
  const categories = extractUniqueValues(documents, "category")
  const subjects = extractUniqueValues(documents, "subject")
  const languages = extractUniqueValues(documents, "language")
  const difficulties = extractUniqueValues(documents, "difficulty")

  // 3) Read query params
  const selectedCategory = awaitedParam.category ? awaitedParam.category.split(",") : ["All"]
  const searchQuery = awaitedParam.search || ""
  const currentPage = Number(awaitedParam.page) || 1
  const selectedSubjects = awaitedParam.subjects ? awaitedParam.subjects.split(",") : []
  const selectedLanguages = awaitedParam.languages ? awaitedParam.languages.split(",") : []
  const selectedDifficulty = awaitedParam.difficulty ? awaitedParam.difficulty.split(",") : []

  // 4) Filter documents based on search params
  const filteredDocuments = documents.filter((doc) => {
    // If "All" is selected, skip category filtering
    const categoryMatch = selectedCategory.includes("All") || (doc.category && selectedCategory.includes(doc.category))

    // Search by title or description
    const searchMatch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by subject
    const subjectMatch = selectedSubjects.length === 0 || (doc.subject && selectedSubjects.includes(doc.subject))

    // Filter by language
    const languageMatch = selectedLanguages.length === 0 || (doc.language && selectedLanguages.includes(doc.language))

    // Filter by difficulty
    const difficultyMatch =
      selectedDifficulty.length === 0 || (doc.difficulty && selectedDifficulty.includes(doc.difficulty))

    return categoryMatch && searchMatch && subjectMatch && languageMatch && difficultyMatch
  })

  // 5) Paginate results
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)
  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // 6) Define filter groups with counts
  const getOptionCount = (field: keyof DocumentData, value: string): number => {
    return documents.filter((doc) => doc[field] === value).length
  }

  const filterGroups = [
    {
      title: "Category",
      param: "category",
      type: "radio" as const, // single-select
      options: [
        // "All" option
        { value: "All", label: "All" },
        // Map the categories with counts
        ...categories.map((cat) => ({
          value: cat,
          label: cat,
          count: getOptionCount("category", cat),
        })),
      ],
    },
    {
      title: "Subject",
      param: "subjects",
      type: "checkbox" as const,
      options: subjects.map((subject) => ({
        value: subject,
        label: subject,
        count: getOptionCount("subject", subject),
      })),
    },
    {
      title: "Language",
      param: "languages",
      type: "checkbox" as const,
      options: languages.map((language) => ({
        value: language,
        label: language,
        count: getOptionCount("language", language),
      })),
    },
    {
      title: "Difficulty",
      param: "difficulty",
      type: "radio" as const,
      options: difficulties.map((difficulty) => ({
        value: difficulty,
        label: difficulty,
        count: getOptionCount("difficulty", difficulty),
      })),
    },
  ]

  // 7) Collect the user's current selections
  const selectedFilters = {
    category: selectedCategory,
    subjects: selectedSubjects,
    languages: selectedLanguages,
    difficulty: selectedDifficulty,
  }

  return (
    <>
      {/* Desktop filter sidebar */}
      <div className="hidden md:block">
        <DynamicDocFilter filterGroups={filterGroups} selectedFilters={selectedFilters} />
      </div>

      {/* Main content: search bar, documents grid, pagination */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 space-y-4">
          <h1 className="text-lg font-bold">All Results</h1>
          <SearchBar
            currentSearch={searchQuery}
            currentCategory={selectedCategory.join(",")}
            currentPage={currentPage}
          />
        </div>

        <div className="flex-1 overflow-auto px-4 md:px-6">
          <IntegrationGrid integrations={paginatedDocuments} />
        </div>

        <div className="p-4 md:p-6 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            currentCategory={selectedCategory.join(",")}
            currentSearch={searchQuery}
          />
        </div>
      </main>

      {/* Mobile side panel (toggles open/close) */}
      <MobileSidePanel>
        <DynamicDocFilter filterGroups={filterGroups} selectedFilters={selectedFilters} />
      </MobileSidePanel>
    </>
  )
}

