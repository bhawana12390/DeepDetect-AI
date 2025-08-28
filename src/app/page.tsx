
'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/header";
import AnalysisTabs from "@/components/analysis-tabs";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import HistorySidebar from "@/components/history-sidebar";
import type { AnalysisResultItem } from '@/types';

export default function Home() {
  const [history, setHistory] = useState<AnalysisResultItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResultItem | null>(null);

  // Load history from localStorage on initial client-side render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('analysisHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      // If parsing fails, it's better to clear the corrupted data
      localStorage.removeItem('analysisHistory');
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      if (history.length > 0) {
        localStorage.setItem('analysisHistory', JSON.stringify(history));
      } else {
        // If history is cleared via the button, remove it from storage
        const storedHistory = localStorage.getItem('analysisHistory');
        if (storedHistory) {
            localStorage.removeItem('analysisHistory');
        }
      }
    } catch (error) {
        console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleAnalysisComplete = (result: AnalysisResultItem) => {
    setHistory(prev => [result, ...prev]);
    setSelectedResult(result);
  };

  const handleSelectHistoryItem = (item: AnalysisResultItem) => {
    setSelectedResult(item);
  }

  const handleClearHistory = () => {
    setHistory([]);
    setSelectedResult(null);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <HistorySidebar 
          history={history} 
          onSelectItem={handleSelectHistoryItem}
          onClearHistory={handleClearHistory} 
        />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto py-4 sm:py-8 px-4">
            <AnalysisTabs 
              onAnalysisComplete={handleAnalysisComplete}
              selectedResult={selectedResult}
              key={selectedResult?.id}
            />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
