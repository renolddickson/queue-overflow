import { fetchData } from "@/actions/document";
import { DocumentData } from "@/types/api";
import { fetchUserData, getUid } from "@/actions/auth";
import IntegrationGrid from "../(q)/_components/IntegrationGrid";
import { redirect } from "next/navigation";

export default async function DocumentListPage() {
  const currentUserId = await getUid();

  if (!currentUserId) {
    redirect('/auth');
  }

  // Fetch documents for the current user
  let documents: any[] = [];
  try {
    const [docRes, userRes] = await Promise.all([
      fetchData<DocumentData>({
        table: "documents",
        filter: { user_id: currentUserId },
      }),
      fetchUserData(currentUserId)
    ]);
    
    // Attach user data to each document for the cards to display correctly
    const userData = userRes.data;
    documents = (docRes.data || []).map(doc => ({
      ...doc,
      user: userData
    }));
  } catch (error) {
    console.error("Error fetching documents:", error);
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          My Projects
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Manage and view all your documentation and posts.
        </p>
      </div>

      {documents.length > 0 ? (
        <IntegrationGrid integrations={documents as any} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No projects found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2">
            You haven't created any documents or posts yet.
          </p>
        </div>
      )}
    </div>
  );
}
