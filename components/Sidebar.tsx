const Sidebar = ({ topics, selectedTopic, onSelectTopic, isMobileMenuOpen }) => {
  return (
    <nav
      className={`w-64 bg-gray-100 overflow-y-auto transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50" : "hidden md:block"
      }`}
    >
      <ul className="p-4">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className={`py-2 px-4 cursor-pointer rounded ${
              topic === selectedTopic ? "bg-blue-500 text-white" : "hover:bg-gray-200"
            }`}
            onClick={() => onSelectTopic(topic)}
          >
            {topic.title}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar

