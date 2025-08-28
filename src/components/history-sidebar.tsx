'use client';
import { SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import { FileClock, Image, Mic, Trash2, Video } from "lucide-react";
import type { AnalysisResultItem } from '@/types';
import { Button } from "./ui/button";

type HistorySidebarProps = {
  history: AnalysisResultItem[];
  onSelectItem: (item: AnalysisResultItem) => void;
  onClearHistory: () => void;
};


export default function HistorySidebar({ history, onSelectItem, onClearHistory }: HistorySidebarProps) {

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Deepfake':
        return 'text-red-500';
      case 'Authentic':
        return 'text-green-500';
      default:
        return 'text-yellow-500';
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
        case 'image': return Image;
        case 'audio': return Mic;
        case 'video': return Video;
        default: return FileClock;
    }
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2" data-tour-step="4">
            <FileClock className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Analysis History</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        {history.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
                No analysis history yet.
            </div>
        ) : (
            <SidebarMenu className="px-2">
            {history.map((item) => {
                const Icon = getIcon(item.type);
                return (
                    <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton onClick={() => onSelectItem(item)}>
                        <Icon className="w-4 h-4" />
                        <div className="flex flex-col items-start w-full overflow-hidden">
                            <span className="truncate w-full">{item.name}</span>
                            <span className={`text-xs ${getResultColor(item.classification)}`}>{item.classification}</span>
                        </div>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            })}
            </SidebarMenu>
        )}
      </SidebarContent>
      {history.length > 0 && (
        <>
            <SidebarSeparator />
            <SidebarFooter>
                <Button variant="ghost" className="w-full justify-start" onClick={onClearHistory}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear History
                </Button>
            </SidebarFooter>
        </>
      )}
    </>
  );
}
