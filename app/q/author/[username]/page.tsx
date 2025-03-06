import { CardContainer } from "@/app/q/author/[username]/_components/CardContainer";
import { fetchData, getUid } from "@/actions/document";
import { User, DocumentData } from "@/types/api";

interface DocumentListProps {
  params: { username: string };
}

export default async function DocumentList({ params }: DocumentListProps) {
  const { username } = await params; // No need for `await params`
  
  if (username && !(username.startsWith('@') || username.startsWith('%40'))) {
    return (
      <div className="flex justify-center items-center w-full">
        Invalid user found
      </div>
    );
  }

  const usernameWithoutAt = username.replace(/%40|@/g, '');

  let user: User | undefined;
  try {
    const userRes = await fetchData<User>({
      table: "users",
      filter: [{ user_name: usernameWithoutAt }],
    });
    user = userRes.data[0];
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center w-full">
        User not found
      </div>
    );
  }

  const currentUserId = await getUid();
  const documentOwner = currentUserId === user.user_id;

  // 🔹 Fetch documents on the server and pass them as props
  let documents: DocumentData[] = [];
  try {
    const docRes = await fetchData<DocumentData>({
      table: "documents",
      filter: [{ user_id: user.user_id }],
    });
    documents = docRes.data || [];
  } catch (error) {
    console.error("Error fetching documents:", error);
  }

  return (
    <CardContainer 
      userId={user.user_id}
      documentOwner={documentOwner}
      initialDocuments={documents} // 🔹 Pass as prop
    />
  );
}
