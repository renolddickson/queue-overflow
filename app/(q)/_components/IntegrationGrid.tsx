import { memo } from "react"
import { FeedData } from "@/types/api"
import FeedItem from "./FeedItem"

type IntegrationGridProps = {
  integrations: FeedData[]
}

const IntegrationGrid = memo(({ integrations }: IntegrationGridProps) => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col">
      {integrations.map((integration) => (
        <FeedItem key={integration.id} data={integration} />
      ))}
    </div>
  )
})

IntegrationGrid.displayName = "IntegrationGrid"

export default IntegrationGrid;

