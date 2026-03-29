import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getFriendlyLabel(toolName: string, args: Record<string, string>): string {
  const filename = args.path ? args.path.split("/").pop() ?? args.path : "";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create": return `Creating ${filename}`;
      case "str_replace":
      case "insert": return `Editing ${filename}`;
      case "view": return `Reading ${filename}`;
      case "undo_edit": return `Undoing edit in ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename": return `Renaming ${filename}`;
      case "delete": return `Deleting ${filename}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const label = getFriendlyLabel(toolInvocation.toolName, toolInvocation.args);
  const isDone = toolInvocation.state === "result" && "result" in toolInvocation && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
