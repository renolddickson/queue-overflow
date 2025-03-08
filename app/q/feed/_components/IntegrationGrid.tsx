import { DocumentData } from "@/types/api"
import IntegrationCard from "./IntegrationCard"

type IntegrationGridProps = {
  integrations: DocumentData[]
}

export default function IntegrationGrid({ integrations }: IntegrationGridProps) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {integrations.length > 0 ? (
        integrations.map((integration) => <IntegrationCard key={integration.id} integration={integration} />)
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          No integrations found matching your criteria.
        </div>
      )}
    </div>
  )
}

