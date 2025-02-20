import React from 'react';

interface SubtopicSidebarProps {
  subtopics: string[]; // Array of subtopic strings
  selectedSubtopic: string; // Currently selected subtopic
  onSelectSubtopic: (subtopic: string) => void; // Function to handle subtopic selection
}

const SubtopicSidebar: React.FC<SubtopicSidebarProps> = ({ subtopics, selectedSubtopic, onSelectSubtopic }) => {
  return (
    <nav className="w-64 bg-gray-50 overflow-y-auto hidden lg:block">
      <ul className="p-4">
        {subtopics.map((subtopic) => (
          <li
            key={subtopic}
            className={`py-2 px-4 cursor-pointer rounded ${
              subtopic === selectedSubtopic ? "bg-blue-500 text-white" : "hover:bg-gray-200"
            }`}
            onClick={() => onSelectSubtopic(subtopic)}
          >
            {subtopic}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SubtopicSidebar;