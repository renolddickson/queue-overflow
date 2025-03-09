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