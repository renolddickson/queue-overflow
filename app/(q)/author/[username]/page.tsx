import { CardContainer } from "@/app/(q)/author/[username]/_components/CardContainer";
import { fetchData } from "@/actions/document";
import { User, DocumentData } from "@/types/api";
import { fetchUserData, getUid } from "@/actions/auth";
import { Banner } from "./_components/Banner";
import { getFollowStatus, getFollowStats } from "@/actions/follow";

interface DocumentListProps { 
  params: Promise<{ username: string}> ;
}

export default async function DocumentList({ params }: DocumentListProps) {
  const { username } = await params; // No need for `await params`
  const isUsername = username.startsWith('@') || username.startsWith('%40');

  const usernameWithoutAt = username.replace(/%40|@/g, '');

  let user: User | undefined;
  if(isUsername){
    try {
      const userRes = await fetchData<User>({
        table: "users",
        filter: { user_name: usernameWithoutAt },
      });
      user = userRes.data[0];
    } catch (error) {
      console.error("Error fetching user:", error);
    }
    }else{
      user = (await fetchUserData(username)).data;
    }

  if (!user) {
    return (
      <div className="flex justify-center items-center w-full">
        User not found
      </div>
    );
  }

  const currentUserId = await getUid();
  const isDocOwner = currentUserId === user.user_id;

  // 🔹 Fetch documents on the server with strict security filtering
  let documents: DocumentData[] = [];
  try {
    const docRes = await fetchData<DocumentData>({
      table: "documents",
      filter: { 
        user_id: user.user_id,
        ...(isDocOwner ? {} : { publish_state: 'published' }) 
      },
    });
    documents = docRes.data || [];
  } catch (error) {
    console.error("Error fetching documents:", error);
  }

  // Fetch follow data
  const { followed } = await getFollowStatus(user.user_id);
  const { followers, following } = await getFollowStats(user.user_id);

  return (
    <div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex w-full flex-col p-4'>
    <Banner 
      userData={user} 
      isDocOwner={isDocOwner} 
      initialFollowed={followed}
      followerCount={followers}
      followingCount={following}
    />
    <CardContainer 
      userId={user.user_id}
      isDocOwner={isDocOwner}
      initialDocuments={documents}
      userData={user}
      />
    </div>
  );
}
