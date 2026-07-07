import React, { useState } from 'react';
import { ArrowLeft, Info, ChevronDown } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface ScheduleCreatorProps {
  onSave: (schedule: any) => void;
  onCancel: () => void;
  rules: any[];
}

export function ScheduleCreator({ onSave, onCancel, rules }: ScheduleCreatorProps) {
  const [scheduleData, setScheduleData] = useState({
    scheduleName: '',
    ruleId: '',
    ruleName: '',
    scheduler: '',
    locations: ['All'] as string[],
    productTypes: ['All'] as string[],
    lors: ['All'] as string[],
    carTypes: ['All'] as string[],
    startDate: '',
    endDate: '',
    recurrencePattern: 'Does not repeat',
    repeatEvery: '1',
    repeatUnit: 'week',
    repeatOn: [] as string[],
    repeatEndType: 'Never',
    repeatEndDate: '',
    monthlyPattern: 'day', // 'day' or 'weekday'
    monthlyDay: '1',
    monthlyWeek: 'first', // 'first', 'second', 'third', 'fourth', 'last'
    monthlyWeekday: 'Monday',
    yearlyMonth: 'January',
    yearlyDay: '1'
  });

  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [productTypePopoverOpen, setProductTypePopoverOpen] = useState(false);
  const [lorPopoverOpen, setLorPopoverOpen] = useState(false);
  const [carTypePopoverOpen, setCarTypePopoverOpen] = useState(false);
  const [rulePopoverOpen, setRulePopoverOpen] = useState(false);
  const [schedulerPopoverOpen, setSchedulerPopoverOpen] = useState(false);

  const locations = ['All', 'BGLV1-BGLV1', 'BGLV1-PDX', 'BGLV1-PHX', 'BGLV1-SFO'];
  const productTypes = ['All', 'AD', 'AE', 'AF', 'AG'];
  const lorOptions = ['All', '1', '2', '3', '4'];
  const carTypes = ['All', 'A', 'B', 'C', 'D'];
  const schedulerOptions = ['BRS_181-300_LOR28', 'BRS_181-300_LOR21', 'BRS_181-300_LOR14', 'BRS_181-300_LOR13', 'BRS_181-300_LOR12', 'BRS_181-300_LOR11'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const toggleDay = (day: string) => {
    setScheduleData(prev => ({
      ...prev,
      repeatOn: prev.repeatOn.includes(day)
        ? prev.repeatOn.filter(d => d !== day)
        : [...prev.repeatOn, day]
    }));
  };

  const generateRecurrenceSummary = () => {
    if (!scheduleData.startDate || scheduleData.recurrencePattern === 'Does not repeat') {
      return 'No recurrence set.';
    }

    const startDate = new Date(scheduleData.startDate);
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (scheduleData.recurrencePattern === 'Daily') {
      const every = parseInt(scheduleData.repeatEvery) || 1;
      return `Occurs every ${every > 1 ? every + ' days' : 'day'} starting ${dateStr}.`;
    }

    if (scheduleData.recurrencePattern === 'Weekly') {
      if (scheduleData.repeatOn.length === 0) {
        return `Occurs weekly starting ${dateStr}.`;
      }
      const days = scheduleData.repeatOn.join(', ');
      return `Occurs every ${days} starting ${dateStr}.`;
    }

    if (scheduleData.recurrencePattern === 'Monthly') {
      if (scheduleData.monthlyPattern === 'day') {
        return `Occurs on day ${scheduleData.monthlyDay} of every month starting ${dateStr}.`;
      } else {
        return `Occurs on the ${scheduleData.monthlyWeek} ${scheduleData.monthlyWeekday} of every month starting ${dateStr}.`;
      }
    }

    if (scheduleData.recurrencePattern === 'Yearly') {
      return `Occurs on ${scheduleData.yearlyMonth} ${scheduleData.yearlyDay} every year starting ${dateStr}.`;
    }

    if (scheduleData.recurrencePattern === 'Custom') {
      const every = parseInt(scheduleData.repeatEvery) || 1;
      const unit = scheduleData.repeatUnit;
      return `Occurs every ${every} ${unit}(s) starting ${dateStr}.`;
    }

    return '';
  };

  const handleSave = () => {
    const scheduleInfo = {
      ...scheduleData,
      schedule: generateScheduleDescription()
    };
    
    onSave(scheduleInfo);
  };

  const generateScheduleDescription = () => {
    if (!scheduleData.startDate) return 'Not scheduled';
    
    let desc = `Starts ${scheduleData.startDate}`;
    
    if (scheduleData.recurrencePattern !== 'Does not repeat') {
      if (scheduleData.recurrencePattern === 'Daily') {
        desc += `, repeats every ${scheduleData.repeatEvery} day(s)`;
      } else if (scheduleData.recurrencePattern === 'Weekly') {
        desc += `, repeats on ${scheduleData.repeatOn.join(', ')}`;
      } else if (scheduleData.recurrencePattern === 'Monthly') {
        if (scheduleData.monthlyPattern === 'day') {
          desc += `, repeats on the ${scheduleData.monthlyDay} day of the month`;
        } else {
          desc += `, repeats on the ${scheduleData.monthlyWeek} ${scheduleData.monthlyWeekday} of the month`;
        }
      } else if (scheduleData.recurrencePattern === 'Yearly') {
        desc += `, repeats on ${scheduleData.yearlyMonth} ${scheduleData.yearlyDay}`;
      }
    }
    
    return desc;
  };

  const generatePreviewText = () => {
    if (scheduleData.recurrencePattern === 'Does not repeat') {
      return `Scheduled to run once on ${scheduleData.startDate || 'Start Date'}.`;
    }

    let text = '';
    if (scheduleData.recurrencePattern === 'Daily') {
      text = `Repeats every ${scheduleData.repeatEvery} day(s)`;
    } else if (scheduleData.recurrencePattern === 'Weekly') {
      const daysList = scheduleData.repeatOn.length > 0 ? scheduleData.repeatOn.join(', ') : 'selected days';
      text = `Repeats every week on ${daysList}`;
    } else if (scheduleData.recurrencePattern === 'Monthly') {
      if (scheduleData.monthlyPattern === 'day') {
        text = `Repeats every month on the ${scheduleData.monthlyDay} day`;
      } else {
        text = `Repeats every month on the ${scheduleData.monthlyWeek} ${scheduleData.monthlyWeekday}`;
      }
    } else if (scheduleData.recurrencePattern === 'Yearly') {
      text = `Repeats every year on ${scheduleData.yearlyMonth} ${scheduleData.yearlyDay}`;
    }

    text += `, starting on ${scheduleData.startDate || 'Start Date'}`;

    if (scheduleData.repeatEndType === 'On' && scheduleData.repeatEndDate) {
      text += `, ending on ${scheduleData.repeatEndDate}`;
    } else {
      text += ', with no end date';
    }

    text += '.';
    return text;
  };

  const calculateUpcomingDates = () => {
    if (!scheduleData.startDate) return [];

    const dates: string[] = [];
    const startDate = new Date(scheduleData.startDate);
    const maxDates = 10;

    if (scheduleData.recurrencePattern === 'Does not repeat') {
      // Single occurrence
      return [formatDate(startDate)];
    }

    let currentDate = new Date(startDate);
    const endDate = scheduleData.repeatEndType === 'On' && scheduleData.repeatEndDate 
      ? new Date(scheduleData.repeatEndDate) 
      : null;

    if (scheduleData.recurrencePattern === 'Daily') {
      const repeatEvery = parseInt(scheduleData.repeatEvery) || 1;
      for (let i = 0; i < maxDates; i++) {
        if (endDate && currentDate > endDate) break;
        dates.push(formatDate(currentDate));
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + repeatEvery);
      }
    } else if (scheduleData.recurrencePattern === 'Weekly' && scheduleData.repeatOn.length > 0) {
      const dayMap: { [key: string]: number } = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      
      const selectedDayNumbers = scheduleData.repeatOn.map(day => dayMap[day]).sort((a, b) => a - b);
      
      let searchDate = new Date(currentDate);
      let count = 0;
      
      while (count < maxDates) {
        const currentDay = searchDate.getDay();
        
        if (selectedDayNumbers.includes(currentDay) && searchDate >= startDate) {
          if (endDate && searchDate > endDate) break;
          dates.push(formatDate(searchDate));
          count++;
        }
        
        searchDate.setDate(searchDate.getDate() + 1);
      }
    } else if (scheduleData.recurrencePattern === 'Monthly') {
      const dayMap: { [key: string]: number } = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      
      const selectedDayNumber = dayMap[scheduleData.monthlyWeekday];
      
      let searchDate = new Date(currentDate);
      let count = 0;
      
      while (count < maxDates) {
        const currentDay = searchDate.getDay();
        
        if (scheduleData.monthlyPattern === 'day') {
          if (searchDate.getDate() === parseInt(scheduleData.monthlyDay) && searchDate >= startDate) {
            if (endDate && searchDate > endDate) break;
            dates.push(formatDate(searchDate));
            count++;
          }
        } else {
          if (currentDay === selectedDayNumber && searchDate >= startDate) {
            if (endDate && searchDate > endDate) break;
            dates.push(formatDate(searchDate));
            count++;
          }
        }
        
        searchDate.setMonth(searchDate.getMonth() + 1);
      }
    } else if (scheduleData.recurrencePattern === 'Yearly') {
      let searchDate = new Date(currentDate);
      let count = 0;
      
      while (count < maxDates) {
        const currentMonth = searchDate.getMonth();
        const currentDay = searchDate.getDate();
        
        if (currentMonth === new Date(scheduleData.yearlyMonth).getMonth() && currentDay === parseInt(scheduleData.yearlyDay) && searchDate >= startDate) {
          if (endDate && searchDate > endDate) break;
          dates.push(formatDate(searchDate));
          count++;
        }
        
        searchDate.setFullYear(searchDate.getFullYear() + 1);
      }
    }

    return dates;
  };

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const canSave = () => {
    return scheduleData.scheduleName && scheduleData.ruleId;
  };



  const toggleLocation = (location: string) => {
    setScheduleData(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  };

  const toggleProductType = (productType: string) => {
    setScheduleData(prev => ({
      ...prev,
      productTypes: prev.productTypes.includes(productType)
        ? prev.productTypes.filter(pt => pt !== productType)
        : [...prev.productTypes, productType]
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

  const toggleCarType = (carType: string) => {
    setScheduleData(prev => ({
      ...prev,
      carTypes: prev.carTypes.includes(carType)
        ? prev.carTypes.filter(ct => ct !== carType)
        : [...prev.carTypes, carType]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-center relative">
            {/* Left - Back Button */}
            <button
              onClick={onCancel}
              className="absolute left-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>

            {/* Center - Title */}
            <h1 className="text-lg text-[#2c3e50] font-semibold">Create Strategy</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden m-6">
          <div className="p-6 space-y-6">
            {/* Schedule Config Section */}
            <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-[#2c3e50] text-base font-medium">Strategy Parameters</h3>
                <p className="text-sm text-gray-500 mt-1">Define your strategy name, rule, and scheduler</p>
              </div>

              {/* Strategy Name and Select Rule */}
              <div className="grid grid-cols-2 gap-4">
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
                  <Label className="text-xs text-[#666666]">Select Rule</Label>
                  <Select
                    value={scheduleData.ruleId}
                    onValueChange={(value) => {
                      const selectedRule = rules.find(r => r.id === value);
                      setScheduleData({ 
                        ...scheduleData, 
                        ruleId: value,
                        ruleName: selectedRule?.name || ''
                      });
                    }}
                  >
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Select Rule" />
                    </SelectTrigger>
                    <SelectContent>
                      {rules
                        .filter(rule => rule.status === 'draft' || !rule.schedule || rule.schedule === 'Not scheduled')
                        .map(rule => (
                          <SelectItem key={rule.id} value={rule.id}>
                            {rule.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Select Scheduler */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#666666]">Select Scheduler</Label>
                  <Select
                    value={scheduleData.scheduler}
                    onValueChange={(value) => setScheduleData({ ...scheduleData, scheduler: value })}
                  >
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Select Scheduler" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedulerOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scheduler Metadata - Read Only */}
              {scheduleData.scheduler && schedulerMetadata[scheduleData.scheduler] && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="pb-3">
                    <h3 className="text-[#2c3e50] text-base font-medium">Scheduler Details</h3>
                    <p className="text-sm text-gray-500 mt-1">Configuration details for selected scheduler</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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


          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="h-9 px-5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave()}
              className="h-9 px-6 bg-[#ff9800] text-white rounded hover:bg-[#f57c00] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}