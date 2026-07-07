import React from 'react';
import { Bell, Settings, UserCircle2 } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const tabs = [
    'TECHNICAL CHARTS',
    'DATA STUDIO',
    'REVENUE INSIGHTS',
    'FUTURE TRENDS',
    'RATE LOGS',
    'SETTINGS'
  ];

  const settingsOptions = [
    'Manage Fleet',
    'Min Max',
    'Blackout Dates',
    'Manage Car Groupings',
    'Manage Rules & Strategy'
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Dark Background */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            {/* Left Side - Branding */}
            <div className="flex items-center gap-2">
              <span className="text-[#d4a574] text-sm">CARGAIN</span>
              <span className="text-gray-400 text-sm">|</span>
              <span className="text-white text-sm">Budget US Licensees Las Vegas</span>
            </div>

            {/* Center - Navigation */}
            <nav className="flex items-center gap-6 flex-1 justify-center">
              <button className="text-sm text-white hover:text-[#ff9800] transition-colors">
                SHOP
              </button>
              <button className="text-sm text-white hover:text-[#ff9800] transition-colors">
                Rate.Insights
              </button>
              <button className="text-sm text-white hover:text-[#ff9800] transition-colors">
                RATE UPDATE
              </button>
              <button className="px-4 py-1 bg-white text-[#1a1a1a] text-sm font-medium rounded hover:bg-gray-100 transition-colors">
                REV.AI
              </button>
            </nav>

            {/* Right Side - Icons */}
            <div className="flex items-center gap-3">
              <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                <Bell className="h-4 w-4 text-white" />
              </button>
              <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                <Bell className="h-4 w-4 text-white" />
              </button>
              <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                <Settings className="h-4 w-4 text-white" />
              </button>
              <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                <UserCircle2 className="h-4 w-4 text-white" />
              </button>
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">BU</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Bar - Light Background with Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-10">
            {/* Navigation Tabs - Moved to the right */}
            <nav className="flex items-center gap-6 flex-1 justify-center ml-48">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  className="relative"
                >
                  <button
                    onClick={() => {
                      if (tab === 'SETTINGS') {
                        setShowSettingsDropdown(!showSettingsDropdown);
                      } else {
                        onTabChange?.(tab);
                        setShowSettingsDropdown(false);
                      }
                    }}
                    className={`text-[11px] font-normal transition-colors ${
                      activeTab === tab
                        ? 'text-[#4a90e2] border-b-2 border-[#4a90e2] -mb-[1px]'
                        : 'text-[#666666] hover:text-[#4a90e2]'
                    }`}
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {tab}
                  </button>
                  
                  {/* Settings Dropdown */}
                  {tab === 'SETTINGS' && showSettingsDropdown && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded min-w-[260px] py-2 z-50">
                      {settingsOptions.map((option, index) => (
                        <button
                          key={option}
                          className="block w-full text-left px-6 py-2.5 text-sm text-[#2c3e50] hover:bg-gray-50 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Last Updated */}
            <div className="text-[11px] text-[#666666]" style={{ fontFamily: 'Georgia, serif' }}>
              Last Updated: {formattedDate} {formattedTime} GMT-07:00
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}