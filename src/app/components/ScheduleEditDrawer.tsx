import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { CustomButton } from './CustomButton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface Schedule {
  id: string;
  scheduleName: string;
  location: string[];
  productType: string[];
  lor: string[];
  carType: string[];
  ruleName: string[];
  scheduler?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  repeat: string;
  status: string;
}

interface ScheduleEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
  onSave: (scheduleId: string, updatedData: any) => void;
  rules: any[];
}

export function ScheduleEditDrawer({ open, onOpenChange, schedule, onSave, rules }: ScheduleEditDrawerProps) {
  const [scheduleData, setScheduleData] = useState({
    scheduleName: '',
    ruleId: '',
    ruleName: '',
    scheduler: ''
  });

  const [rulePopoverOpen, setRulePopoverOpen] = useState(false);
  const [schedulerPopoverOpen, setSchedulerPopoverOpen] = useState(false);

  const schedulerOptions = ['BRS_181-300_LOR28', 'BRS_181-300_LOR21', 'BRS_181-300_LOR14', 'BRS_181-300_LOR13', 'BRS_181-300_LOR12', 'BRS_181-300_LOR11'];

  // Scheduler metadata mapping
  const schedulerMetadata: { [key: string]: { location: string; product: string; lor: string; daysOut: string; car: string } } = {
    'BRS_181-300_LOR28': {
      location: 'BGLV1-PDX, BGLV1-SFO, BGLV1-BGLV1',
      product: 'AD, AE, AF',
      lor: '1, 2, 3, 4',
      daysOut: '181-300',
      car: 'C, D'
    },
    'BRS_181-300_LOR21': {
      location: 'BGLV1-PDX, BGLV1-SFO',
      product: 'AD, AE',
      lor: '1, 2, 3, 4',
      daysOut: '181-300',
      car: 'C, D'
    },
    'BRS_181-300_LOR14': {
      location: 'BGLV1-BGLV1, BGLV1-PHX',
      product: 'AF',
      lor: '3, 4',
      daysOut: '181-300',
      car: 'A, B'
    },
    'BRS_181-300_LOR13': {
      location: 'BGLV1-PDX, BGLV1-BGLV1',
      product: 'AD',
      lor: '1, 2, 3',
      daysOut: '181-300',
      car: 'B, C'
    },
    'BRS_181-300_LOR12': {
      location: 'BGLV1-SFO, BGLV1-PHX',
      product: 'AD, AE',
      lor: '1, 2',
      daysOut: '181-300',
      car: 'A, B, C'
    },
    'BRS_181-300_LOR11': {
      location: 'BGLV1-PHX',
      product: 'AD',
      lor: '1, 2',
      daysOut: '181-300',
      car: 'A, B'
    }
  };

  // Pre-populate form when schedule is provided
  useEffect(() => {
    if (schedule) {
      // Find the rule by name
      const ruleName = schedule.ruleName && schedule.ruleName.length > 0 ? schedule.ruleName[0] : '';
      const matchingRule = rules.find(r => r.name === ruleName);
      
      setScheduleData({
        scheduleName: schedule.scheduleName || '',
        ruleId: matchingRule?.id || '',
        ruleName: ruleName,
        scheduler: schedule.scheduler || ''
      });
    }
  }, [schedule, rules]);

  const handleSave = () => {
    if (!schedule) return;
    
    const scheduleInfo = {
      scheduleName: scheduleData.scheduleName,
      ruleName: [scheduleData.ruleName],
      scheduler: scheduleData.scheduler
    };
    
    onSave(schedule.id, scheduleInfo);
  };

  const canSave = () => {
    return scheduleData.scheduleName && scheduleData.ruleId && scheduleData.scheduler;
  };

  const handleRuleChange = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    setScheduleData(prev => ({
      ...prev,
      ruleId: ruleId,
      ruleName: rule?.name || ''
    }));
    setRulePopoverOpen(false);
  };

  const handleSchedulerChange = (scheduler: string) => {
    setScheduleData(prev => ({
      ...prev,
      scheduler: scheduler
    }));
    setSchedulerPopoverOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-[750px] bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-lg text-[#2c3e50] font-semibold mb-1">
              Edit Strategy - {schedule?.scheduleName}
            </h2>
            <p className="text-sm text-gray-500">
              Update your strategy name, rule, and scheduler
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Strategy Configuration Section */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-[#2c3e50] text-base font-medium">Strategy Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">Define your strategy name, rule, and scheduler</p>
            </div>

            {/* Strategy Name */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[#666666]">Strategy Name *</Label>
              <Input
                placeholder="e.g., Morning Rush, Evening Peak, Weekend Premium, Holiday Special"
                value={scheduleData.scheduleName}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduleName: e.target.value })}
                className="h-7"
              />
            </div>

            {/* Select Rule */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[#666666]">Select Rule *</Label>
              <Popover open={rulePopoverOpen} onOpenChange={setRulePopoverOpen} modal={false}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-7 bg-white border border-[#ced4da] rounded px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                  >
                    <span className={scheduleData.ruleName ? "text-gray-900" : "text-gray-400"}>
                      {scheduleData.ruleName || 'Select Rule'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[--radix-popover-trigger-width] p-2" 
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[data-radix-popper-content-wrapper]')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="space-y-1">
                    {rules.filter(rule => rule.status === 'Scheduled').map(rule => (
                      <div
                        key={rule.id}
                        className={`p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors ${
                          scheduleData.ruleId === rule.id ? 'bg-orange-50' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRuleChange(rule.id);
                        }}
                      >
                        <span className="text-sm text-gray-900">{rule.name}</span>
                      </div>
                    ))}
                    {rules.filter(rule => rule.status === 'Scheduled').length === 0 && (
                      <div className="p-2 text-sm text-gray-500">No scheduled rules available</div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Select Scheduler */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[#666666]">Select Scheduler *</Label>
              <Popover open={schedulerPopoverOpen} onOpenChange={setSchedulerPopoverOpen} modal={false}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-7 bg-white border border-[#ced4da] rounded px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                  >
                    <span className={scheduleData.scheduler ? "text-gray-900" : "text-gray-400"}>
                      {scheduleData.scheduler || 'Select Scheduler'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[--radix-popover-trigger-width] p-2" 
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[data-radix-popper-content-wrapper]')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="space-y-1">
                    {schedulerOptions.map(scheduler => (
                      <div
                        key={scheduler}
                        className={`p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors ${
                          scheduleData.scheduler === scheduler ? 'bg-orange-50' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSchedulerChange(scheduler);
                        }}
                      >
                        <span className="text-sm text-gray-900">{scheduler}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Scheduler Metadata - Read Only */}
          {scheduleData.scheduler && schedulerMetadata[scheduleData.scheduler] && (
            <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-[#2c3e50] text-base font-medium">Scheduler Details</h3>
                <p className="text-sm text-gray-500 mt-1">Configuration details for selected scheduler</p>
              </div>

              <div className="space-y-4">
                {/* Location */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Location</Label>
                  <div className="h-7 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 flex items-center">
                    {schedulerMetadata[scheduleData.scheduler].location}
                  </div>
                </div>

                {/* Days Out */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Days Out</Label>
                  <div className="h-7 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 flex items-center">
                    {schedulerMetadata[scheduleData.scheduler].daysOut}
                  </div>
                </div>

                {/* Product Code */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Product Code</Label>
                  <div className="h-7 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 flex items-center">
                    {schedulerMetadata[scheduleData.scheduler].product}
                  </div>
                </div>

                {/* LOR */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">LoR</Label>
                  <div className="h-7 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 flex items-center">
                    {schedulerMetadata[scheduleData.scheduler].lor}
                  </div>
                </div>

                {/* Car Codes */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Car Codes</Label>
                  <div className="h-7 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 flex items-center">
                    {schedulerMetadata[scheduleData.scheduler].car}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <CustomButton
            variant="secondary"
            onClick={() => onOpenChange(false)}
            size="lg"
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handleSave}
            disabled={!canSave()}
            size="lg"
          >
            Save Changes
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
