import { DocumentData } from "@/types/api"
import IntegrationCard from "./IntegrationCard"

type IntegrationGridProps = {
  integrations: DocumentData[]
}

export default function IntegrationGrid({ integrations }: IntegrationGridProps) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {integrations.map((integration) => <IntegrationCard key={integration.id} integration={integration} />)}
    </div>
  )
}

