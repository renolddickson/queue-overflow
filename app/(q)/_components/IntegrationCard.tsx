import { Card, CardContent } from "@/components/ui/card"
import { FeedData } from "@/types/api"
import Link from "next/link"
import Image from "next/image"
import { ThumbsUp, MessageSquare, Share2, Layers, FileText } from "lucide-react"
import DocumentPlaceholder from "@/components/common/DocumentPlaceholder"

type IntegrationCardProps = {
  integration: FeedData
}

export default function IntegrationCard({ integration }: IntegrationCardProps) {
  // Use deterministic mock data if real ones are missing
  const upvotes = integration.upvotes ?? (integration.title.length * 3) % 45;
  const comments = integration.comments_count ?? (integration.title.length * 2) % 12;
  const shares = integration.shares_count ?? (integration.title.length) % 8;

  const isMultiPage = integration.type === 'docs';

  return (
    <Card className="hover:shadow-xl transition-all duration-300 group h-full relative flex flex-col border-none bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <Link
        href={`/${integration.type}/${integration.id}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative w-full h-40 overflow-hidden bg-slate-50 dark:bg-slate-800">
        {integration.cover_image ? (
          <Image
            src={integration.cover_image}
            alt={integration.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <DocumentPlaceholder type={integration.type} title={integration.title} />
        )}

        <div className="absolute top-2 right-2 z-20">
          {isMultiPage && (
            <span className="p-1 rounded-md backdrop-blur-md bg-black/20 border border-white/20 text-white shadow-sm" title="Multi-page Document">
              <Layers size={12} strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1 relative">
        <div className="flex flex-col space-y-2 mb-4">
          <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {integration.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {integration.description || "No description available"}
          </p>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="relative z-20">
            <Link
              href={`/author/@${integration.user.user_name}`}
              className="flex items-center gap-2 group/author"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200">
                <Image
                  src={integration?.user?.profile_image ?? '/assets/no-avatar.png'}
                  alt="profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold dark:text-white line-clamp-1">
                  {integration.user.display_name}
                </span>
                <span className="text-[9px] text-slate-400">
                  @{integration?.user?.user_name}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-slate-400 relative z-20">
            <div className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer">
              <ThumbsUp size={12} />
              <span className="text-[10px] font-medium">{upvotes}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-green-500 transition-colors cursor-pointer">
              <MessageSquare size={12} />
              <span className="text-[10px] font-medium">{comments}</span>
            </div>
            <div className="hover:text-purple-500 transition-colors cursor-pointer">
              <Share2 size={12} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
