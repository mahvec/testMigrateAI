import React, { useState } from 'react'
import MigrationWorkspace from './pages/MigrationWorkspace'
import AnalysisDashboard from './pages/AnalysisDashboard'
import PromptEditor from './pages/PromptEditor'
import { Code2, BarChart3, Terminal, ChevronLeft, ChevronRight } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'migration' | 'analysis' | 'prompts'>('migration')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const navItems = [
    { id: 'migration', label: 'Migration', icon: Code2 },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'prompts', label: 'Prompts', icon: Terminal },
  ]

  return (
    <div className="flex h-screen bg-background text-primary">
      {/* Sidebar Navigation */}
      <aside className={`bg-surface border-r border-border transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isSidebarCollapsed && <span className="font-bold text-accent tracking-tight uppercase">TestMigrate AI</span>}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 hover:bg-background rounded transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-accent/10 text-accent font-medium shadow-sm' 
                  : 'text-muted hover:bg-background hover:text-primary'
              }`}
            >
              <item.icon size={20} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {!isSidebarCollapsed && (
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold">
              v1.0.0
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'migration' && <MigrationWorkspace />}
        {activeTab === 'analysis' && <AnalysisDashboard />}
        {activeTab === 'prompts' && <PromptEditor />}
      </main>
    </div>
  )
}

export default App
