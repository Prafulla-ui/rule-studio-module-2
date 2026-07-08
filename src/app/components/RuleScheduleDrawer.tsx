import React, { useState, useEffect } from 'react';
import { X, Info, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverScrollArea,
  PopoverTrigger,
} from "./ui/popover";

interface Rule {
  id: string;
  name: string;
  status: string;
  fleetTypes: string[];
  condition: string;
  action: string;
  schedule: string;
  createdDate: string;
  lastExecuted: string | null;
  executionCount: number;
  revenueImpact: string;
  scheduleData?: any;
  location?: string;
  productType?: string;
  lor?: string;
}

interface RuleScheduleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: Rule | null;
  onSave: (ruleId: string, updatedData: any) => void;
}

export function RuleScheduleDrawer({ open, onOpenChange, rule, onSave }: RuleScheduleDrawerProps) {
  const [scheduleData, setScheduleData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isRecurring: false,
    repeatFrequency: 'weekly',
    dailyInterval: 1,
    days: [] as string[],
    monthlyType: 'dayOfMonth',
    monthlyDay: 1,
    monthlyInterval: 1,
    monthlyWeekOccurrence: '1st',
    monthlyWeekDay: 'Monday',
    endRepeat: 'never',
    endRepeatDate: '',
    timezone: 'EST',
    locations: ['All'] as string[],
    productTypes: [] as string[],
    lors: [] as string[],
    carType: '',
    fleetTypes: [] as string[]
  });

  const [isRuleSummaryExpanded, setIsRuleSummaryExpanded] = useState(false);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [productTypePopoverOpen, setProductTypePopoverOpen] = useState(false);
  const [lorPopoverOpen, setLorPopoverOpen] = useState(false);
  const [fleetTypePopoverOpen, setFleetTypePopoverOpen] = useState(false);

  useEffect(() => {
    if (rule?.scheduleData) {
      setScheduleData({
        ...rule.scheduleData,
        locations: rule.scheduleData.locations || ['All'],
        productTypes: rule.scheduleData.productTypes || [],
        lors: rule.scheduleData.lors || [],
        fleetTypes: rule.scheduleData.fleetTypes || rule.fleetTypes || []
      });
    } else {
      // Reset to defaults
      setScheduleData({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        isRecurring: false,
        repeatFrequency: 'weekly',
        dailyInterval: 1,
        days: [],
        monthlyType: 'dayOfMonth',
        monthlyDay: 1,
        monthlyInterval: 1,
        monthlyWeekOccurrence: '1st',
        monthlyWeekDay: 'Monday',
        endRepeat: 'never',
        endRepeatDate: '',
        timezone: 'EST',
        locations: ['All'],
        productTypes: [],
        lors: [],
        carType: '',
        fleetTypes: rule?.fleetTypes || []
      });
    }
  }, [rule]);

  const toggleDay = (day: string) => {
    setScheduleData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const toggleFleetType = (type: string) => {
    setScheduleData(prev => ({
      ...prev,
      fleetTypes: prev.fleetTypes.includes(type)
        ? prev.fleetTypes.filter(t => t !== type)
        : [...prev.fleetTypes, type]
    }));
  };

  const toggleLocation = (location: string) => {
    setScheduleData(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  };

  const toggleProductType = (type: string) => {
    setScheduleData(prev => ({
      ...prev,
      productTypes: prev.productTypes.includes(type)
        ? prev.productTypes.filter(t => t !== type)
        : [...prev.productTypes, type]
    }));
  };

  const toggleLor = (lor: string) => {
    setScheduleData(prev => ({
      ...prev,
      lors: prev.lors.includes(lor)
        ? prev.lors.filter(l => l !== lor)
        : [...prev.lors, lor]
    }));
  };

  const fleetTypes = ['Compact', 'Sedan', 'SUV', 'XUV', 'Luxury', 'Sports', 'Van'];
  const locations = ['All', 'BGLV1-BGLV1', 'BGLV1-PDX', 'BGLV1-PHX', 'BGLV1-SFO'];
  const productTypes = ['Daily Rental', 'Weekly Rental', 'Monthly Rental', 'Subscription'];
  const lorOptions = ['1-3 days', '4-7 days', '8-14 days', '15-30 days', '30+ days'];

  const handleSave = () => {
    if (!rule) return;

    // Validate required fields
    if (!scheduleData.startDate || !scheduleData.startTime) {
      alert('Please select a start date and time');
      return;
    }

    // Format schedule string based on configuration
    let scheduleStr = '';
    if (scheduleData.startDate && scheduleData.startTime) {
      scheduleStr = `${scheduleData.startDate} ${scheduleData.startTime}`;
      
      if (scheduleData.isRecurring) {
        if (scheduleData.repeatFrequency === 'daily') {
          scheduleStr += ` | Repeats every ${scheduleData.dailyInterval} day(s)`;
        } else if (scheduleData.repeatFrequency === 'weekly') {
          scheduleStr += ` | Repeats weekly on ${scheduleData.days.join(', ')}`;
        } else if (scheduleData.repeatFrequency === 'monthly') {
          if (scheduleData.monthlyType === 'dayOfMonth') {
            scheduleStr += ` | Repeats on day ${scheduleData.monthlyDay} of every ${scheduleData.monthlyInterval} month(s)`;
          } else {
            scheduleStr += ` | Repeats on the ${scheduleData.monthlyWeekOccurrence} ${scheduleData.monthlyWeekDay} of every ${scheduleData.monthlyInterval} month(s)`;
          }
        }
        
        if (scheduleData.endRepeat === 'onDate' && scheduleData.endRepeatDate) {
          scheduleStr += ` | Until ${scheduleData.endRepeatDate}`;
        }
      } else if (scheduleData.endDate && scheduleData.endTime) {
        scheduleStr += ` - ${scheduleData.endDate} ${scheduleData.endTime}`;
      }
      
      scheduleStr += ` (${scheduleData.timezone})`;
    } else {
      scheduleStr = 'Not scheduled';
    }

    onSave(rule.id, {
      schedule: scheduleStr,
      scheduleData: scheduleData,
      status: 'scheduled'
    });

    onOpenChange(false);
  };

  if (!rule) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="!w-[750px] !max-w-[750px] ml-auto h-screen">
        <div className="w-full h-full flex flex-col">
          <DrawerHeader className="border-b border-gray-200 px-6 py-4 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-8">
                <DrawerTitle className="text-lg text-[#2c3e50] font-medium mb-1">Edit Schedule - {rule.name}</DrawerTitle>
                <DrawerDescription className="text-sm text-gray-500">
                  Define when and how often this rule should execute
                </DrawerDescription>
              </div>
              <DrawerClose className="p-2 hover:bg-gray-100 rounded transition-colors -mt-1">
                <X className="h-5 w-5 text-gray-500" />
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Schedule Parameters */}
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-200">
                <h3 className="text-[#2c3e50] text-base font-medium">Schedule Parameters</h3>
                <p className="text-sm text-gray-500 mt-1">Define which vehicles and locations this schedule applies to</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Location</Label>
                  <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-7 bg-white border border-[#ced4da] rounded px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                      >
                        <span className={scheduleData.locations.length > 0 ? "text-gray-900" : "text-gray-400"}>
                          {scheduleData.locations.length > 0
                            ? scheduleData.locations.join(', ')
                            : 'Select locations'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[--radix-popover-trigger-width] p-3 flex flex-col overflow-hidden max-h-[min(320px,var(--radix-popover-content-available-height,320px))]"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-radix-popper-content-wrapper]')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <PopoverScrollArea className="space-y-2">
                        {locations.map((loc) => (
                          <div
                            key={loc}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleLocation(loc);
                            }}
                          >
                            <Checkbox
                              checked={scheduleData.locations.includes(loc)}
                              onCheckedChange={() => toggleLocation(loc)}
                              className="data-[state=checked]:bg-[#ff9800] data-[state=checked]:border-[#ff9800]"
                            />
                            <span className="text-sm text-gray-900">{loc}</span>
                          </div>
                        ))}
                      </PopoverScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Product Type</Label>
                  <Popover open={productTypePopoverOpen} onOpenChange={setProductTypePopoverOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-7 bg-white border border-[#ced4da] rounded px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                      >
                        <span className={scheduleData.productTypes.length > 0 ? "text-gray-900" : "text-gray-400"}>
                          {scheduleData.productTypes.length > 0
                            ? scheduleData.productTypes.join(', ')
                            : 'Select product types'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[--radix-popover-trigger-width] p-3 flex flex-col overflow-hidden max-h-[min(320px,var(--radix-popover-content-available-height,320px))]"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-radix-popper-content-wrapper]')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <PopoverScrollArea className="space-y-2">
                        {productTypes.map((type) => (
                          <div
                            key={type}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleProductType(type);
                            }}
                          >
                            <Checkbox
                              checked={scheduleData.productTypes.includes(type)}
                              onCheckedChange={() => toggleProductType(type)}
                              className="data-[state=checked]:bg-[#ff9800] data-[state=checked]:border-[#ff9800]"
                            />
                            <span className="text-sm text-gray-900">{type}</span>
                          </div>
                        ))}
                      </PopoverScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">LOR (Length of Rental)</Label>
                  <Popover open={lorPopoverOpen} onOpenChange={setLorPopoverOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-7 bg-white border border-[#ced4da] rounded px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                      >
                        <span className={scheduleData.lors.length > 0 ? "text-gray-900" : "text-gray-400"}>
                          {scheduleData.lors.length > 0
                            ? scheduleData.lors.join(', ')
                            : 'Select LORs'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[--radix-popover-trigger-width] p-3 flex flex-col overflow-hidden max-h-[min(320px,var(--radix-popover-content-available-height,320px))]"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-radix-popper-content-wrapper]')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <PopoverScrollArea className="space-y-2">
                        {lorOptions.map((lor) => (
                          <div
                            key={lor}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleLor(lor);
                            }}
                          >
                            <Checkbox
                              checked={scheduleData.lors.includes(lor)}
                              onCheckedChange={() => toggleLor(lor)}
                              className="data-[state=checked]:bg-[#ff9800] data-[state=checked]:border-[#ff9800]"
                            />
                            <span className="text-sm text-gray-900">{lor}</span>
                          </div>
                        ))}
                      </PopoverScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Fleet Types *</Label>
                  <Popover open={fleetTypePopoverOpen} onOpenChange={setFleetTypePopoverOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-7 bg-white border border-[#ced4da] rounded px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                      >
                        <span className={scheduleData.fleetTypes.length > 0 ? "text-gray-900" : "text-gray-400"}>
                          {scheduleData.fleetTypes.length > 0
                            ? scheduleData.fleetTypes.join(', ')
                            : 'Select fleet types'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[--radix-popover-trigger-width] p-3 flex flex-col overflow-hidden max-h-[min(320px,var(--radix-popover-content-available-height,320px))]"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-radix-popper-content-wrapper]')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <PopoverScrollArea className="space-y-2">
                        {fleetTypes.map((type) => (
                          <div
                            key={type}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFleetType(type);
                            }}
                          >
                            <Checkbox
                              checked={scheduleData.fleetTypes.includes(type)}
                              onCheckedChange={() => toggleFleetType(type)}
                              className="data-[state=checked]:bg-[#ff9800] data-[state=checked]:border-[#ff9800]"
                            />
                            <span className="text-sm text-gray-900">{type}</span>
                          </div>
                        ))}
                      </PopoverScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Schedule Configuration */}
            <div className="space-y-6 pt-4 border-t border-gray-200">
              <div className="pb-3 border-b border-gray-200">
                <h3 className="text-[#2c3e50] text-base font-medium">Schedule Configuration</h3>
                <p className="text-sm text-gray-500 mt-1">Set when this pricing rule should be active</p>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Start Date</Label>
                  <Input
                    type="date"
                    value={scheduleData.startDate}
                    onChange={(e) => setScheduleData({
                      ...scheduleData,
                      startDate: e.target.value
                    })}
                    className="h-7"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Start Time</Label>
                  <Input
                    type="time"
                    value={scheduleData.startTime}
                    onChange={(e) => setScheduleData({
                      ...scheduleData,
                      startTime: e.target.value
                    })}
                    className="h-7"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">End Date</Label>
                  <Input
                    type="date"
                    value={scheduleData.endDate}
                    onChange={(e) => setScheduleData({
                      ...scheduleData,
                      endDate: e.target.value
                    })}
                    className="h-7"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">End Time</Label>
                  <Input
                    type="time"
                    value={scheduleData.endTime}
                    onChange={(e) => setScheduleData({
                      ...scheduleData,
                      endTime: e.target.value
                    })}
                    className="h-7"
                  />
                </div>
              </div>

              {/* Recurrence Toggle */}
              <div className="pt-3 pb-3 border-t border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    checked={scheduleData.isRecurring}
                    onCheckedChange={(checked) => setScheduleData({
                      ...scheduleData,
                      isRecurring: !!checked
                    })}
                    className="data-[state=checked]:bg-[#ff9800] data-[state=checked]:border-[#ff9800]"
                  />
                  <span className="text-sm text-gray-900">Make this a recurring schedule</span>
                </label>
              </div>

              {/* Recurrence Options */}
              {scheduleData.isRecurring && (
                <div className="pl-8 pr-4 py-5 space-y-6 border-l-4 border-blue-500 bg-blue-50/30 rounded-r-lg">
                  {/* Repeat Frequency */}
                  <div className="space-y-3">
                    <Label className="text-gray-900">Repeat:</Label>
                    <div className="flex items-center gap-5 flex-wrap">
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="repeatFrequency"
                          value="daily"
                          checked={scheduleData.repeatFrequency === 'daily'}
                          onChange={(e) => setScheduleData({
                            ...scheduleData,
                            repeatFrequency: e.target.value
                          })}
                          className="w-4 h-4 cursor-pointer accent-blue-600"
                        />
                        <span className="text-gray-900">Daily</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="repeatFrequency"
                          value="weekly"
                          checked={scheduleData.repeatFrequency === 'weekly'}
                          onChange={(e) => setScheduleData({
                            ...scheduleData,
                            repeatFrequency: e.target.value
                          })}
                          className="w-4 h-4 cursor-pointer accent-blue-600"
                        />
                        <span className="text-gray-900">Weekly</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="repeatFrequency"
                          value="monthly"
                          checked={scheduleData.repeatFrequency === 'monthly'}
                          onChange={(e) => setScheduleData({
                            ...scheduleData,
                            repeatFrequency: e.target.value
                          })}
                          className="w-4 h-4 cursor-pointer accent-blue-600"
                        />
                        <span className="text-gray-900">Monthly</span>
                      </label>
                    </div>
                  </div>

                  {/* Daily Interval */}
                  {scheduleData.repeatFrequency === 'daily' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-gray-900">Repeat every</span>
                        <Input
                          type="number"
                          min="1"
                          value={scheduleData.dailyInterval}
                          onChange={(e) => setScheduleData({
                            ...scheduleData,
                            dailyInterval: parseInt(e.target.value) || 1
                          })}
                          className="w-20 h-10"
                        />
                        <span className="text-gray-900">day(s)</span>
                      </div>
                    </div>
                  )}

                  {/* Repeat on - Days of Week (show only for weekly) */}
                  {scheduleData.repeatFrequency === 'weekly' && (
                    <div className="space-y-3">
                      <Label className="text-gray-900">Repeat on:</Label>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`w-11 h-11 rounded-lg text-sm transition-all border-2 flex items-center justify-center ${
                              scheduleData.days.includes(day)
                                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                          >
                            {day.charAt(0)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly Recurrence Details */}
                  {scheduleData.repeatFrequency === 'monthly' && (
                    <div className="space-y-4 p-5 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-gray-900">Monthly Recurrence Details</h4>
                      
                      {/* Option 1: Day of the month */}
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="monthlyType"
                          value="dayOfMonth"
                          checked={scheduleData.monthlyType === 'dayOfMonth'}
                          onChange={(e) => setScheduleData({
                            ...scheduleData,
                            monthlyType: e.target.value
                          })}
                          className="w-4 h-4 mt-1 cursor-pointer accent-blue-600"
                        />
                        <div className="flex items-center gap-2.5 flex-wrap flex-1">
                          <span className="text-gray-900">Repeat on Day</span>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            value={scheduleData.monthlyDay}
                            onClick={() => setScheduleData({
                              ...scheduleData,
                              monthlyType: 'dayOfMonth'
                            })}
                            onChange={(e) => setScheduleData({
                              ...scheduleData,
                              monthlyDay: parseInt(e.target.value) || 1,
                              monthlyType: 'dayOfMonth'
                            })}
                            className="w-20 h-10"
                          />
                          <span className="text-gray-900">of every</span>
                          <Input
                            type="number"
                            min="1"
                            value={scheduleData.monthlyInterval}
                            onClick={() => setScheduleData({
                              ...scheduleData,
                              monthlyType: 'dayOfMonth'
                            })}
                            onChange={(e) => setScheduleData({
                              ...scheduleData,
                              monthlyInterval: parseInt(e.target.value) || 1,
                              monthlyType: 'dayOfMonth'
                            })}
                            className="w-20 h-10"
                          />
                          <span className="text-gray-900">month(s)</span>
                        </div>
                      </div>

                      {/* Option 2: Nth day of the week */}
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="monthlyType"
                          value="dayOfWeek"
                          checked={scheduleData.monthlyType === 'dayOfWeek'}
                          onChange={(e) => setScheduleData({
                            ...scheduleData,
                            monthlyType: e.target.value
                          })}
                          className="w-4 h-4 mt-1 cursor-pointer accent-blue-600"
                        />
                        <div className="flex items-center gap-2.5 flex-wrap flex-1">
                          <span className="text-gray-900">The</span>
                          <Select
                            value={scheduleData.monthlyWeekOccurrence}
                            onValueChange={(value) => setScheduleData({
                              ...scheduleData,
                              monthlyWeekOccurrence: value,
                              monthlyType: 'dayOfWeek'
                            })}
                          >
                            <SelectTrigger 
                              className="w-28 h-10"
                              onClick={() => setScheduleData({
                                ...scheduleData,
                                monthlyType: 'dayOfWeek'
                              })}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1st">1st</SelectItem>
                              <SelectItem value="2nd">2nd</SelectItem>
                              <SelectItem value="3rd">3rd</SelectItem>
                              <SelectItem value="4th">4th</SelectItem>
                              <SelectItem value="last">Last</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={scheduleData.monthlyWeekDay}
                            onValueChange={(value) => setScheduleData({
                              ...scheduleData,
                              monthlyWeekDay: value,
                              monthlyType: 'dayOfWeek'
                            })}
                          >
                            <SelectTrigger 
                              className="w-36 h-10"
                              onClick={() => setScheduleData({
                                ...scheduleData,
                                monthlyType: 'dayOfWeek'
                              })}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Monday">Monday</SelectItem>
                              <SelectItem value="Tuesday">Tuesday</SelectItem>
                              <SelectItem value="Wednesday">Wednesday</SelectItem>
                              <SelectItem value="Thursday">Thursday</SelectItem>
                              <SelectItem value="Friday">Friday</SelectItem>
                              <SelectItem value="Saturday">Saturday</SelectItem>
                              <SelectItem value="Sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-gray-900">of every</span>
                          <Input
                            type="number"
                            min="1"
                            value={scheduleData.monthlyInterval}
                            onClick={() => setScheduleData({
                              ...scheduleData,
                              monthlyType: 'dayOfWeek'
                            })}
                            onChange={(e) => setScheduleData({
                              ...scheduleData,
                              monthlyInterval: parseInt(e.target.value) || 1,
                              monthlyType: 'dayOfWeek'
                            })}
                            className="w-20 h-10"
                          />
                          <span className="text-gray-900">month(s)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* End Repeat */}
                  <div className="space-y-3">
                    <Label className="text-gray-900">End repeat:</Label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="endRepeat"
                          value="never"
                          checked={scheduleData.endRepeat === 'never'}
                          onChange={(e) => setScheduleData({
                            ...scheduleData,
                            endRepeat: e.target.value
                          })}
                          className="w-4 h-4 cursor-pointer accent-blue-600"
                        />
                        <span className="text-gray-900">Never</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="endRepeat"
                            value="onDate"
                            checked={scheduleData.endRepeat === 'onDate'}
                            onChange={(e) => setScheduleData({
                              ...scheduleData,
                              endRepeat: e.target.value
                            })}
                            className="w-4 h-4 cursor-pointer accent-blue-600"
                          />
                          <span className="text-gray-900">On date:</span>
                        </label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={scheduleData.endRepeatDate}
                            onChange={(e) => setScheduleData({
                              ...scheduleData,
                              endRepeatDate: e.target.value,
                              endRepeat: 'onDate'
                            })}
                            disabled={scheduleData.endRepeat !== 'onDate'}
                            className="w-48 h-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timezone */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label className="text-xs text-[#666666]">Time Zone</Label>
                  <Select
                    value={scheduleData.timezone}
                    onValueChange={(value) => setScheduleData({
                      ...scheduleData,
                      timezone: value
                    })}
                  >
                    <SelectTrigger className="h-11 max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern Standard Time</SelectItem>
                      <SelectItem value="CST">Central Standard Time</SelectItem>
                      <SelectItem value="MST">Mountain Standard Time</SelectItem>
                      <SelectItem value="PST">Pacific Standard Time</SelectItem>
                      <SelectItem value="IST">Indian Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p>Set the active period for this rule. Use recurrence to repeat the rule at regular intervals.</p>
              </div>
            </div>

            {/* Schedule Preview */}
            {(scheduleData.startDate || scheduleData.startTime) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-5 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                  <div className="flex-1">
                    <h4 className="text-blue-900 mb-2">Schedule Preview</h4>
                    <div className="space-y-1.5 text-sm text-blue-800">
                      {scheduleData.startDate && scheduleData.startTime && (
                        <div className="flex items-start gap-2">
                          <span className="opacity-70">Starts:</span>
                          <span>
                            {new Date(scheduleData.startDate + 'T00:00:00').toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })} at {new Date('2000-01-01T' + scheduleData.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      )}
                      
                      {!scheduleData.isRecurring && scheduleData.endDate && scheduleData.endTime && (
                        <div className="flex items-start gap-2">
                          <span className="opacity-70">Ends:</span>
                          <span>
                            {new Date(scheduleData.endDate + 'T00:00:00').toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })} at {new Date('2000-01-01T' + scheduleData.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      )}

                      {scheduleData.isRecurring && (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="opacity-70">Repeats:</span>
                            <span>
                              {scheduleData.repeatFrequency === 'daily' && 
                                `Every ${scheduleData.dailyInterval} day${scheduleData.dailyInterval > 1 ? 's' : ''}`
                              }
                              {scheduleData.repeatFrequency === 'weekly' && 
                                scheduleData.days.length > 0 && 
                                `Weekly on ${scheduleData.days.join(', ')}`
                              }
                              {scheduleData.repeatFrequency === 'weekly' && 
                                scheduleData.days.length === 0 && 
                                `Weekly (select days)`
                              }
                              {scheduleData.repeatFrequency === 'monthly' && 
                                scheduleData.monthlyType === 'dayOfMonth' &&
                                `Monthly on day ${scheduleData.monthlyDay} of every ${scheduleData.monthlyInterval} month${scheduleData.monthlyInterval > 1 ? 's' : ''}`
                              }
                              {scheduleData.repeatFrequency === 'monthly' && 
                                scheduleData.monthlyType === 'dayOfWeek' &&
                                `Monthly on the ${scheduleData.monthlyWeekOccurrence} ${scheduleData.monthlyWeekDay} of every ${scheduleData.monthlyInterval} month${scheduleData.monthlyInterval > 1 ? 's' : ''}`
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <span className="opacity-70">Until:</span>
                            <span>
                              {scheduleData.endRepeat === 'never' && 'Forever'}
                              {scheduleData.endRepeat === 'onDate' && scheduleData.endRepeatDate && 
                                new Date(scheduleData.endRepeatDate).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              }
                              {scheduleData.endRepeat === 'onDate' && !scheduleData.endRepeatDate && 
                                '(Select end date)'
                              }
                            </span>
                          </div>
                        </>
                      )}

                      {scheduleData.timezone && (
                        <div className="flex items-start gap-2">
                          <span className="opacity-70">Timezone:</span>
                          <span>{scheduleData.timezone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rule Summary - Preview */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsRuleSummaryExpanded(!isRuleSummaryExpanded)}
                className="flex items-center gap-2 w-full pb-3 border-b border-gray-200"
              >
                <h3 className="text-[#2c3e50] text-base font-medium">Rule Summary</h3>
                {isRuleSummaryExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500 transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500 transition-transform" />
                )}
              </button>
              
              {isRuleSummaryExpanded && (
                <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-500 min-w-[100px]">Location:</span>
                    <span className="text-sm text-gray-900">
                      {scheduleData.locations.length > 0 ? scheduleData.locations.join(', ') : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-500 min-w-[100px]">Product Type:</span>
                    <span className="text-sm text-gray-900">
                      {scheduleData.productTypes.length > 0 ? scheduleData.productTypes.join(', ') : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-500 min-w-[100px]">LOR:</span>
                    <span className="text-sm text-gray-900">
                      {scheduleData.lors.length > 0 ? scheduleData.lors.join(', ') : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-500 min-w-[100px]">Fleet Types:</span>
                    <span className="text-sm text-gray-900">
                      {scheduleData.fleetTypes.length > 0 ? scheduleData.fleetTypes.join(', ') : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-500 min-w-[100px]">Condition:</span>
                    <span className="text-sm text-gray-900">{rule.condition}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-500 min-w-[100px]">Action:</span>
                    <span className="text-sm text-gray-900">{rule.action}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                onClick={() => onOpenChange(false)}
                className="h-9 px-5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-9 px-6 bg-[#ff9800] text-white rounded hover:bg-[#f57c00] transition-colors text-sm font-medium"
              >
                Save Schedule
              </button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}