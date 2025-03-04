import { CardContainer } from "@/components/documents/CardContainer";
import { fetchData, getUid } from "@/actions/document";
import { User } from "@/types/api";

interface DocumentListProps {
  params: { username: string };
}

export default async function DocumentList({ params }: DocumentListProps) {
  // Destructure the username; no need to await params if it's an object
  const { username } = await params;
  console.log(username,"username")
  // Validate the username format
  if (username && !(username.startsWith('@') || username.startsWith('%40'))) {
    return (
      <div className="flex justify-center items-center w-full">
        Invalid user found
      </div>
    );
  }
  
  // Remove the "@" symbol for lookup
  const usernameWithoutAt = username.replace(/%40|@/g, '');
  
  // Fetch user data from the "users" table using a filter
  let user;
  try {
    const userRes = await fetchData<User>({
      table: "users",
      filter: [{ user_name: usernameWithoutAt }],
    });
    user = userRes.data[0];
  } catch (error) {
    console.error("Error fetching user:", error);
  }
  
  // If no user is found, return a "User not found" message
  if (!user) {
    return (
      <div className="flex justify-center items-center w-full">
        User not found
      </div>
    );
  }
  
  // Determine if the current logged-in user is the owner
  const currentUserId = await getUid();
  const documentOwner = currentUserId === user.user_id;
  
  return (
    <CardContainer userId={user.user_id}
      documentOwner={documentOwner}
    />
  );
}
