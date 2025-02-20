interface TableOfContentsProps {
  topics: string[]
}

export default function TableOfContents({ topics }: TableOfContentsProps) {
  return (
    <div className="hidden w-64 border-l px-4 py-6 lg:block sticky top-16 h-fit">
      <h3 className="mb-4 text-sm font-medium text-gray-500">On this page</h3>
      <nav className="space-y-2">
        {topics.map((topic, i) => (
          <a
            key={topic}
            href={`#${topic.toLowerCase().replace(/\s+/g, "-")}`}
            className={`block rounded-lg px-3 py-2 text-sm ${
              i === 0 ? "text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {topic}
          </a>
        ))}
      </nav>
    </div>
  )
}

