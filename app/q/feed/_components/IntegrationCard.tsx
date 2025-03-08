import { Card, CardContent } from "@/components/ui/card"
import { DocumentData } from "@/types/api"

type IntegrationCardProps = {
  integration: DocumentData
}

export default function IntegrationCard({ integration }: IntegrationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 group h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300"
          >
          </div>
          <h3 className="font-semibold text-sm">{integration.title}</h3>
        </div>
        <p className="text-xs text-gray-500 flex-grow overflow-hidden">
          {integration.description.length > 150
            ? `${integration.description.substring(0, 150)}...`
            : integration.description}
        </p>
      </CardContent>
    </Card>
  )
}

