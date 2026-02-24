import { RouteConfig } from "@/types";
import { Topics } from "@/types/api";

export const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  export const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (image: string) => void,
    setFile: (file: File) => void,
  ): Promise<void> => {
    if (!e.target.files || !e.target.files[0]) {
      throw new Error("No file selected");
    }
    const file = e.target.files[0];
    const dataUrl = await readFileAsDataURL(file);
    setImage(dataUrl);
    setFile(file);
  };

export function getPrevNextSubtopics(topics: Topics[], currentId: string): RouteConfig {
  const flattened: { id: string, title: string }[] = [];
  
  topics.forEach(topic => {
    flattened.push({ id: topic.id, title: topic.title });
    topic.subTopics.forEach(sub => {
      flattened.push({ id: sub.id, title: sub.title });
    });
  });

  const currentIndex = flattened.findIndex(item => item.id === currentId);
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? (flattened[currentIndex - 1] as any) : null;
  const next = currentIndex < flattened.length - 1 ? (flattened[currentIndex + 1] as any) : null;

  return { prev, next };
}