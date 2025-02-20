import React from "react";

// Define the structure of a topic
interface Topic {
  id: string | number; // Unique identifier for the topic
  title: string; // Title of the topic
}

// Define the props for the MainContent component
interface MainContentProps {
  selectedTopic: Topic; // The currently selected topic
  selectedSubtopic: string; // The currently selected subtopic
}

const MainContent: React.FC<MainContentProps> = ({ selectedTopic, selectedSubtopic }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{selectedTopic.title}</h1>
      <h2 className="text-2xl font-semibold mb-4">{selectedSubtopic}</h2>
      <p className="mb-4">
        This is the main content area for {selectedTopic.title} - {selectedSubtopic}.
      </p>
      {/* Add more content here */}
    </div>
  );
};

export default MainContent;