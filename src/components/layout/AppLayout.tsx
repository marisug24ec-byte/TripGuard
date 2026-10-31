import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { DisruptionSimulatorModal } from '../simulator/DisruptionSimulatorModal';

export const AppLayout: React.FC = () => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpenMobile(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-navy-950 z-10">
            <Sidebar onCloseMobile={() => setIsSidebarOpenMobile(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)} 
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 bg-gradient-to-b from-navy-950 via-navy-900/60 to-navy-950">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global What-If Disruption Simulator Modal */}
      <DisruptionSimulatorModal 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
      />
    </div>
  );
};
