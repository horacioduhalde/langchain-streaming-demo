import { Badge } from "@/components/ui/badge"
import { useToolSwitcher } from "@/app/context/toolSwitcherContext";

export function ToolBadge() {
  const { selectedToolName, githubRepo, selectedModelName, selectedPersonality } = useToolSwitcher();
  return (
    <>
      {selectedModelName && (
        <Badge variant="outline" className="ml-2 rounded-none">
          {selectedModelName}
        </Badge>
      )}
      <Badge variant="outline" className="ml-2 rounded-none">
        {selectedToolName}
      </Badge>
      {selectedToolName && githubRepo && (
        <Badge variant="outline" className="ml-2 rounded-none">
          {githubRepo}
        </Badge>
      )}
      {selectedPersonality && (
        <Badge variant="outline" className="ml-2 rounded-none">
          {selectedPersonality}
        </Badge>
      )}

    </>
  )
}
