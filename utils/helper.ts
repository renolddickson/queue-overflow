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

 export function getPrevNextSubtopics(topics:Topics[], subId:string):RouteConfig {
    let currentDataIndex = -1;
    let currentSubIndex = -1;
  
    for (let i = 0; i < topics.length; i++) {
      const subTopics = topics[i].subTopics;
      const index = subTopics.findIndex(sub => sub.id === subId);
      if (index !== -1) {
        currentDataIndex = i;
        currentSubIndex = index;
        break;
      }
    }
  
    if (currentDataIndex === -1) {
      return { prev: null, next: null };
    }
  
    let prev = null;
    if (currentSubIndex > 0) {
      prev = topics[currentDataIndex].subTopics[currentSubIndex - 1];
    } else if (currentDataIndex > 0) {
      const previousDataSubTopics = topics[currentDataIndex - 1].subTopics;
      prev = previousDataSubTopics[previousDataSubTopics.length - 1];
    }
  
    let next = null;
    const currentSubTopics = topics[currentDataIndex].subTopics;
    if (currentSubIndex < currentSubTopics.length - 1) {
      next = currentSubTopics[currentSubIndex + 1];
    } else if (currentDataIndex < topics.length - 1) {
      const nextDataSubTopics = topics[currentDataIndex + 1].subTopics;
      next = nextDataSubTopics[0];
    }
  
    return { prev, next };
  }