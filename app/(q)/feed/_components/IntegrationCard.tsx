import { Card, CardContent } from "@/components/ui/card"
import { FeedData } from "@/types/api"
import Link from "next/link"
import Image from "next/image"

type IntegrationCardProps = {
  integration: FeedData
}

export default function IntegrationCard({ integration }: IntegrationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 group h-full relative">
      {/* Integration overlay link covering the entire card */}
      <Link
        href={`q/${integration.type}/${integration.id}`}
        className="absolute inset-0 z-10"
      />
      <CardContent className="p-4 flex flex-col h-full relative">
        <div className="flex flex-col space-y-2 mb-2">
          <div className="relative w-full h-32 overflow-hidden flex items-center justify-center transition-colors duration-300">
            {integration.cover_image ? (
              <Image
                src={integration.cover_image}
                alt={integration.title}
                fill
                className="object-contain"
              />
            ) : (
              <div className="h-full w-full flex justify-center items-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-sm">{integration.title}</h3>
        </div>
        <p className="text-xs text-gray-500 flex-grow overflow-hidden">
          {integration.description.length > 150
            ? `${integration.description.substring(0, 150)}...`
            : integration.description}
        </p>
        {/* Author link positioned above the overlay */}
        <div className="relative z-20">
          <Link
            href={`author/@${integration.user.user_name}`}
            className="grid grid-cols-[auto,1fr] items-center gap-2 justify-start"
          >
            <div className="relative w-6 h-6 aspect-square rounded-full overflow-hidden">
              <Image
                src={integration?.user?.profile_image ?? '/assets/no-avatar.png'}
                alt="profile_pic"
                fill
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              {integration?.user?.display_name && (
                <span className="text-black font-bold text-sm dark:text-white">
                  {integration.user.display_name}
                </span>
              )}
              <span className="text-gray-400 text-xs">
                @{integration?.user?.user_name}
              </span>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
