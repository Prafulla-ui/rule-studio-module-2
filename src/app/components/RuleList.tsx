import { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Plus, Calendar, Clock, LayoutGrid, List, MoreVertical, Play, Pause, Delete, X, Info } from 'lucide-react';
import { CustomButton } from './CustomButton';
import { toast } from 'sonner@2.0.3';
import { RuleScheduleDrawer } from './RuleScheduleDrawer';
import { RuleEditDrawer } from './RuleEditDrawer';
import { ScheduleEditDrawer } from './ScheduleEditDrawer';
import { SchedulerList } from './SchedulerList';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { CustomSelect } from './CustomSelect';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface Rule {
  id: string;
  name: string;
  status: string;
  fleetTypes: string[];
  location?: string;
  productType?: string;
  condition: string;
  action: string;
  schedule: string;
  createdDate: string;
  lastExecuted: string | null;
  executionCount: number;
  revenueImpact: string;
  scheduleNames?: string[];
}

interface RuleListProps {
  rules: Rule[];
  schedulers: any[];
  onUpdateStatus: (ruleId: string, newStatus: string) => void;
  onDelete: (ruleId: string) => void;
  onUpdateRule: (ruleId: string, updatedData: any) => void;
  onEdit: (rule: Rule) => void;
  onCreateRule?: () => void;
  onCreateSchedule?: () => void;
  onCreateScheduler?: () => void;
  onUpdateScheduler?: (updatedScheduler: any, options?: { skipToast?: boolean }) => void;
  onDeleteScheduler?: (schedulerId: string) => void;
  onBulkUpdateSchedulers?: (schedulerIds: string[], updates: Record<string, any>) => void;
  onBulkDeleteSchedulers?: (schedulerIds: string[]) => void;
}

export function RuleList({ rules, schedulers, onUpdateStatus, onDelete, onUpdateRule, onEdit, onCreateRule, onCreateSchedule, onCreateScheduler, onUpdateScheduler, onDeleteScheduler, onBulkUpdateSchedulers, onBulkDeleteSchedulers }: RuleListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fleetTypeFilter, setFleetTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('manage-scheduler');
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);
  const [scheduleEditDrawerOpen, setScheduleEditDrawerOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [deleteScheduleDialogOpen, setDeleteScheduleDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any | null>(null);
  
  // First-time user states
  const [isFirstTimeRules, setIsFirstTimeRules] = useState(true);
  const [isFirstTimeStrategy, setIsFirstTimeStrategy] = useState(true);
  const [isFirstTimeScheduler, setIsFirstTimeScheduler] = useState(true);
  const [demoSchedulerData, setDemoSchedulerData] = useState(() => [...demoSchedulers]);

  useEffect(() => {
    if (schedulers.length > 0) {
      setIsFirstTimeScheduler(false);
    }
  }, [schedulers.length]);
  
  // Schedule-specific filters
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('all');
  const [scheduleViewMode, setScheduleViewMode] = useState<'card' | 'list'>('list');
  
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
  
  // Mock schedules data
  const [schedules, setSchedules] = useState([
    {
      id: 'sch-1',
      scheduleName: 'Weekend Premium Pricing',
      location: ['BGLV1-PDX', 'BGLV1-SFO'],
      productType: ['AD', 'AE'],
      lor: ['1', '2', '3', '4'],
      carType: ['C', 'D'],
      ruleName: ['Weekend Premium Surge'],
      scheduler: 'BRS_181-300_LOR28',
      startDate: '2025-11-15',
      startTime: '06:00',
      endDate: '2025-12-15',
      endTime: '23:00',
      repeat: 'Weekly - Sat, Sun',
      status: 'active'
    },
    {
      id: 'sch-2',
      scheduleName: 'Holiday Special',
      location: ['BGLV1-BGLV1', 'BGLV1-PHX'],
      productType: ['AF'],
      lor: ['3', '4'],
      carType: ['A', 'B'],
      ruleName: ['Holiday Peak Pricing'],
      scheduler: 'BRS_181-300_LOR21',
      startDate: '2025-12-20',
      startTime: '00:00',
      endDate: '2026-01-05',
      endTime: '23:59',
      repeat: 'Never',
      status: 'active'
    },
    {
      id: 'sch-3',
      scheduleName: 'Weekday Discount',
      location: ['BGLV1-PHX'],
      productType: ['AD'],
      lor: ['1', '2'],
      carType: ['A', 'B'],
      ruleName: ['Weekday Economy Boost', 'Low Utilization Discount'],
      scheduler: 'BRS_181-300_LOR14',
      startDate: '2025-11-13',
      startTime: '09:00',
      endDate: '',
      endTime: '',
      repeat: 'Daily - Every 1 day(s)',
      status: 'inactive'
    },
    {
      id: 'sch-4',
      scheduleName: 'Morning Rush',
      location: ['BGLV1-PDX', 'BGLV1-BGLV1'],
      productType: ['AD'],
      lor: ['1', '2', '3'],
      carType: ['B', 'C'],
      ruleName: ['Airport Rush Hour Premium'],
      scheduler: 'BRS_181-300_LOR13',
      startDate: '2025-11-10',
      startTime: '06:00',
      endDate: '',
      endTime: '10:00',
      repeat: 'Weekly - Mon, Tue, Wed, Thu, Fri',
      status: 'active'
    },
    {
      id: 'sch-5',
      scheduleName: 'Evening Peak',
      location: ['BGLV1-SFO', 'BGLV1-PHX'],
      productType: ['AD', 'AE'],
      lor: ['1', '2'],
      carType: ['A', 'B', 'C'],
      ruleName: ['Airport Rush Hour Premium', 'High Demand Premium'],
      scheduler: 'BRS_181-300_LOR12',
      startDate: '2025-11-12',
      startTime: '16:00',
      endDate: '',
      endTime: '20:00',
      repeat: 'Weekly - Mon, Tue, Wed, Thu, Fri',
      status: 'active'
    },
    {
      id: 'sch-6',
      scheduleName: 'Mag 7 Match',
      location: ['BGLV1-PDX', 'BGLV1-SFO', 'BGLV1-BGLV1'],
      productType: ['AD', 'AE', 'AF'],
      lor: ['1', '2', '3', '4'],
      carType: ['C', 'D'],
      ruleName: ['Competitor Match - SUV', 'Luxury Fleet Premium'],
      scheduler: 'BRS_181-300_LOR11',
      startDate: '2025-11-01',
      startTime: '00:00',
      endDate: '',
      endTime: '',
      repeat: 'Daily - Every 1 day(s)',
      status: 'active'
    },
    {
      id: 'sch-7',
      scheduleName: 'Early Bird Special',
      location: ['BGLV1-PHX', 'BGLV1-SFO'],
      productType: ['AD'],
      lor: ['3', '4'],
      carType: ['A', 'B'],
      ruleName: ['Early Bird Discount'],
      scheduler: 'BRS_181-300_LOR28',
      startDate: '2025-11-20',
      startTime: '05:00',
      endDate: '2026-02-28',
      endTime: '09:00',
      repeat: 'Daily - Every 1 day(s)',
      status: 'inactive'
    },
    {
      id: 'sch-8',
      scheduleName: 'Monthly Subscriber Deal',
      location: ['BGLV1-PDX', 'BGLV1-SFO', 'BGLV1-BGLV1', 'BGLV1-PHX'],
      productType: ['AF', 'AG'],
      lor: ['4'],
      carType: ['A', 'B', 'C'],
      ruleName: ['Monthly Subscriber Discount', 'Long Term Loyalty Bonus', 'Retention Pricing'],
      scheduler: 'BRS_181-300_LOR21',
      startDate: '2025-10-01',
      startTime: '00:00',
      endDate: '',
      endTime: '',
      repeat: 'Daily - Every 1 day(s)',
      status: 'active'
    }
  ]);

  // Show empty arrays for first-time user mode
  const displayRules = isFirstTimeRules ? [] : rules;
  const displaySchedules = isFirstTimeStrategy ? [] : schedules;
  const displaySchedulers =
    schedulers.length > 0
      ? schedulers
      : isFirstTimeScheduler
        ? []
        : demoSchedulerData;

  const handleBulkUpdateDemoOrReal = (schedulerIds: string[], updates: Record<string, any>) => {
    if (onBulkUpdateSchedulers) {
      onBulkUpdateSchedulers(schedulerIds, updates);
      return;
    }
    if (schedulers.length > 0) {
      schedulerIds.forEach((id) => {
        const scheduler = schedulers.find((s) => s.id === id);
        if (scheduler) onUpdateScheduler?.({ ...scheduler, ...updates });
      });
    } else {
      setDemoSchedulerData((prev) =>
        prev.map((s) => (schedulerIds.includes(s.id) ? { ...s, ...updates } : s))
      );
      toast.success(`Updated ${schedulerIds.length} scheduler(s)`);
    }
  };

  const handleBulkDeleteDemoOrReal = (schedulerIds: string[]) => {
    if (onBulkDeleteSchedulers) {
      onBulkDeleteSchedulers(schedulerIds);
      return;
    }
    if (schedulers.length > 0) {
      schedulerIds.forEach((id) => onDeleteScheduler?.(id));
    } else {
      setDemoSchedulerData((prev) => prev.filter((s) => !schedulerIds.includes(s.id)));
      toast.success(`Deleted ${schedulerIds.length} scheduler(s)`);
    }
  };

  // Filter rules
  const filteredRules = displayRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter schedules
  const filteredSchedules = displaySchedules.filter(schedule => {
    const matchesSearch = schedule.scheduleName.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) ||
                         schedule.ruleName.some(name => name.toLowerCase().includes(scheduleSearchQuery.toLowerCase())) ||
                         schedule.location.some(loc => loc.toLowerCase().includes(scheduleSearchQuery.toLowerCase()));
    const matchesStatus = scheduleStatusFilter === 'all' || schedule.status === scheduleStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Function to count schedules linked to a rule
  const getScheduleCount = (rule: any) => {
    // If rule is in draft or inactive state, it's not linked to any schedule
    if (rule.status === 'draft' || rule.status === 'inactive') {
      return 0;
    }
    
    // Return the scheduleCount from the rule object
    return rule.scheduleCount || 0;
  };

  // Pagination
  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRules = filteredRules.slice(startIndex, startIndex + itemsPerPage);

  const handleScheduleClick = (rule: Rule) => {
    setEditingRule(rule);
    setScheduleDrawerOpen(true);
  };

  const handleEditClick = (rule: Rule) => {
    setEditingRule(rule);
    setEditDrawerOpen(true);
  };

  const handleSaveSchedule = (ruleId: string, updatedData: any) => {
    const ruleName = editingRule?.name || 'Rule';
    onUpdateRule(ruleId, updatedData);
    setScheduleDrawerOpen(false);
    setEditingRule(null);
    
    toast.success('Schedule saved successfully!', {
      description: `"${ruleName}" has been scheduled and is now ready to execute.`,
      duration: 4000,
    });
  };

  const handleSaveEdit = (ruleId: string, updatedData: any) => {
    const ruleName = editingRule?.name || 'Rule';
    onUpdateRule(ruleId, updatedData);
    setEditDrawerOpen(false);
    setEditingRule(null);
    
    toast.success('Rule updated successfully!', {
      description: `"${ruleName}" has been updated.`,
      duration: 4000,
    });
  };

  const handleDeleteClick = (rule: Rule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ruleToDelete) {
      onDelete(ruleToDelete.id);
      toast.success('Rule deleted', {
        description: `\"${ruleToDelete.name}\" has been removed.`,
        duration: 3000,
      });
    }
    setDeleteDialogOpen(false);
    setRuleToDelete(null);
  };

  const handleDeleteScheduleClick = (schedule: any) => {
    setScheduleToDelete(schedule);
    setDeleteScheduleDialogOpen(true);
  };

  const handleConfirmScheduleDelete = () => {
    if (scheduleToDelete) {
      setSchedules(schedules.filter(s => s.id !== scheduleToDelete.id));
      toast.success('Strategy deleted', {
        description: `\"${scheduleToDelete.scheduleName}\" has been removed.`,
        duration: 3000,
      });
    }
    setDeleteScheduleDialogOpen(false);
    setScheduleToDelete(null);
  };

  const handleScheduleStatusToggle = (scheduleId: string, newStatus: string) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, status: newStatus }
        : schedule
    ));
    
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      toast.success(
        newStatus === 'active' ? 'Schedule activated' : 'Schedule deactivated',
        {
          description: `\"${schedule.scheduleName}\" is now ${newStatus}.`,
          duration: 3000,
        }
      );
    }
  };

  const handleEditScheduleClick = (schedule: any) => {
    setEditingSchedule(schedule);
    setScheduleEditDrawerOpen(true);
  };

  const handleSaveScheduleEdit = (scheduleId: string, updatedData: any) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { 
            ...schedule,
            scheduleName: updatedData.scheduleName,
            location: updatedData.locations || [],
            productType: updatedData.productTypes || [],
            lor: updatedData.lors || [],
            carType: updatedData.carTypes || [],
            ruleName: updatedData.ruleNames || [],
            startDate: updatedData.startDate,
            endDate: updatedData.endDate,
            repeat: updatedData.recurrencePattern !== 'Does not repeat' 
              ? (updatedData.recurrencePattern === 'Daily' 
                  ? `Daily - Every ${updatedData.repeatEvery} day(s)` 
                  : updatedData.recurrencePattern === 'Weekly'
                    ? `Weekly - ${updatedData.repeatOn.join(', ')}`
                    : updatedData.recurrencePattern)
              : 'Never'
          }
        : schedule
    ));
    
    setScheduleEditDrawerOpen(false);
    setEditingSchedule(null);
    
    toast.success('Schedule updated successfully!', {
      description: `\"${updatedData.scheduleName}\" has been updated.`,
      duration: 4000,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'draft':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const uniqueFleetTypes = Array.from(new Set(rules.flatMap(r => r.fleetTypes)));

  // Calculate status counts
  const statusCounts = {
    active: rules.filter(r => r.status === 'active').length,
    scheduled: rules.filter(r => r.status === 'scheduled').length,
    draft: rules.filter(r => r.status === 'draft').length,
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex">
            <button
              onClick={() => setActiveTab('manage-scheduler')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'manage-scheduler'
                  ? 'text-[#ff9800]'
                  : 'text-[#666666] hover:text-[#ff9800]'
              }`}
            >
              <span
                className={`inline-flex items-center gap-1.5 pb-2 ${
                  activeTab === 'manage-scheduler' ? 'border-b-2 border-[#ff9800]' : ''
                }`}
              >
                Manage Schedulers
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                      aria-label="Schedulers definition"
                    >
                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Define when pricing jobs run, including timing, recurrence, and activation.
                    </p>
                  </PopoverContent>
                </Popover>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('manage-rules')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'manage-rules'
                  ? 'text-[#ff9800]'
                  : 'text-[#666666] hover:text-[#ff9800]'
              }`}
            >
              <span
                className={`inline-flex items-center gap-1.5 pb-2 ${
                  activeTab === 'manage-rules' ? 'border-b-2 border-[#ff9800]' : ''
                }`}
              >
                Manage Rules
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                      aria-label="Rules definition"
                    >
                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Define what pricing logic applies, including conditions and actions.
                    </p>
                  </PopoverContent>
                </Popover>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('manage-schedule')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'manage-schedule'
                  ? 'text-[#ff9800]'
                  : 'text-[#666666] hover:text-[#ff9800]'
              }`}
            >
              <span
                className={`inline-flex items-center gap-1.5 pb-2 ${
                  activeTab === 'manage-schedule' ? 'border-b-2 border-[#ff9800]' : ''
                }`}
              >
                Manage Strategies
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                      aria-label="Strategies definition"
                    >
                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Define how rules are bundled and deployed through scheduled execution plans.
                    </p>
                  </PopoverContent>
                </Popover>
              </span>
            </button>
          </div>
          
          {/* Action Buttons */}
          <div>
            {activeTab === 'manage-scheduler' && onCreateScheduler && (
              <CustomButton onClick={onCreateScheduler} variant="primary" size="md">
                Create Scheduler
              </CustomButton>
            )}
            {activeTab === 'manage-rules' && onCreateRule && (
              <CustomButton onClick={onCreateRule} variant="primary" size="md">
                Create Rule
              </CustomButton>
            )}
            {activeTab === 'manage-schedule' && onCreateSchedule && (
              <CustomButton onClick={onCreateSchedule} variant="primary" size="md">
                Create Strategy
              </CustomButton>
            )}
          </div>
        </div>
      </div>

      {/* Manage Scheduler Tab Content */}
      {activeTab === 'manage-scheduler' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-900 font-medium">Demo Mode Toggle</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-700">
                {isFirstTimeScheduler ? 'First-Time User View' : 'Existing User View'}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isFirstTimeScheduler}
                  onChange={(e) => setIsFirstTimeScheduler(!e.target.checked)}
                  className="w-4 h-4 text-[#ff9800] border-gray-300 rounded focus:ring-[#ff9800]"
                />
                <span className="text-xs text-blue-700">Show Existing Data</span>
              </label>
            </div>
          </div>

          <SchedulerList
            schedulers={displaySchedulers}
            schedules={schedules}
            onCreateScheduler={onCreateScheduler}
            onUpdateScheduler={(updated, options) => {
              if (schedulers.length > 0) {
                onUpdateScheduler?.(updated, options);
              } else {
                setDemoSchedulerData((prev) =>
                  prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
                );
                if (!options?.skipToast) {
                  toast.success('Scheduler updated successfully');
                }
              }
            }}
            onDeleteScheduler={(id) => {
              if (schedulers.length > 0) {
                onDeleteScheduler?.(id);
              } else {
                setDemoSchedulerData((prev) => prev.filter((s) => s.id !== id));
              }
            }}
            onBulkUpdateSchedulers={handleBulkUpdateDemoOrReal}
            onBulkDeleteSchedulers={handleBulkDeleteDemoOrReal}
          />
        </>
      )}

      {/* Manage Rules Tab Content */}
      {activeTab === 'manage-rules' && (
        <>
          {/* Toggle for Testing - Switch between First-Time and Existing Flow */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-900 font-medium">Demo Mode Toggle</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-700">
                {isFirstTimeRules ? 'First-Time User View' : 'Existing User View'}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isFirstTimeRules}
                  onChange={(e) => setIsFirstTimeRules(!e.target.checked)}
                  className="w-4 h-4 text-[#ff9800] border-gray-300 rounded focus:ring-[#ff9800]"
                />
                <span className="text-xs text-blue-700">Show Existing Data</span>
              </label>
            </div>
          </div>

          {filteredRules.length === 0 && isFirstTimeRules ? (
            // Empty State for First-Time Users
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="h-8 w-8 text-[#ff9800]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to Rule Management
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  You haven't created any rules yet. Rules define the pricing logic and conditions that drive your automated pricing strategies.
                </p>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 text-left">
                  <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Getting Started
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1.5 ml-6 list-disc">
                    <li>Click the "Create Rule" button above to begin</li>
                    <li>Define conditions (utilization rates, competitor pricing, time triggers)</li>
                    <li>Set actions (price adjustments, fixed pricing, competitor matching)</li>
                    <li>Save your rule to use it in strategies</li>
                  </ul>
                </div>
                <CustomButton 
                  variant="primary" 
                  onClick={onCreateRule}
                  className="mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Rule
                </CustomButton>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Section - Only show on Manage Rules tab */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
          {/* Filters Row */}
          <div className="mb-4">
            {/* Search */}
            <div className="max-w-md">
              <label className="block text-xs text-[#666666] mb-1.5 h-[14px]">Search Rules</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-7 pl-3 pr-9 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ff9800] focus:border-[#ff9800]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Results and View Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <p className="text-sm text-[#666666]">
              Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRules.length)} of {filteredRules.length} rules
            </p>
          </div>
        </div>

      {/* Card View */}
       {viewMode === 'card' && (
        <div className="space-y-3">
          {paginatedRules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-12 text-center text-gray-500">
              No rules found. {searchQuery && 'Try adjusting your search.'}
            </div>
          ) : (
            paginatedRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* Header - Name and Actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-medium">{rule.name}</h3>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(rule)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Rule"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(rule)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'list' && (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs text-[#666666]">Rule Name</th>
                <th className="px-4 py-3 text-left text-xs text-[#666666] w-[15%]">Created Date</th>
                <th className="px-4 py-3 text-center text-xs text-[#666666] w-[10%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRules.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                    No rules found. {searchQuery && 'Try adjusting your search.'}
                  </td>
                </tr>
              ) : (
                paginatedRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 font-medium">{rule.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{rule.createdDate}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(rule)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit Rule"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rule)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="h-8 px-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ff9800] focus:border-[#ff9800]"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRules.length)} of {filteredRules.length}
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded text-sm flex items-center justify-center ${
                        currentPage === pageNum
                          ? 'bg-[#ff9800] text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
            </>
          )}
        </>
      )}

      {/* Manage Schedule Tab Content */}
      {activeTab === 'manage-schedule' && (
        <>
          {/* Toggle for Testing - Switch between First-Time and Existing Flow */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-900 font-medium">Demo Mode Toggle</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-700">
                {isFirstTimeStrategy ? 'First-Time User View' : 'Existing User View'}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isFirstTimeStrategy}
                  onChange={(e) => setIsFirstTimeStrategy(!e.target.checked)}
                  className="w-4 h-4 text-[#ff9800] border-gray-300 rounded focus:ring-[#ff9800]"
                />
                <span className="text-xs text-blue-700">Show Existing Data</span>
              </label>
            </div>
          </div>

          {filteredSchedules.length === 0 && isFirstTimeStrategy ? (
            // Empty State for First-Time Users
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-[#ff9800]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to Strategy Management
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  You haven't created any strategies yet. Strategies combine your rules with schedulers to execute automated pricing at specific times and intervals.
                </p>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 text-left">
                  <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Getting Started
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1.5 ml-6 list-disc">
                    <li>Click the "Create Strategy" button above to start</li>
                    <li>Select the rules you want to apply</li>
                    <li>Choose a scheduler to define when the strategy runs</li>
                    <li>Save your strategy to activate it</li>
                  </ul>
                </div>
                <CustomButton 
                  variant="primary" 
                  onClick={onCreateSchedule}
                  className="mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Strategy
                </CustomButton>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Section for Schedules */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
            {/* Filters Row */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              {/* Search */}
              <div className="col-span-3">
                <label className="block text-xs text-[#666666] mb-1.5 h-[14px]">Search Schedules</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by strategy name or rule name"
                    value={scheduleSearchQuery}
                    onChange={(e) => setScheduleSearchQuery(e.target.value)}
                    className="w-full h-7 pl-3 pr-9 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ff9800] focus:border-[#ff9800]"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5 mb-1.5 h-[14px]">
                  <label className="block text-xs text-[#666666]">Status</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                        <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] p-0" align="start">
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Status Definitions</h4>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-100">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 shrink-0">
                              Active
                            </span>
                            <p className="text-sm text-gray-700">
                              Schedule is currently running and executing based on its configuration.
                            </p>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 shrink-0">
                              Inactive
                            </span>
                            <p className="text-sm text-gray-700">
                              Schedule execution is temporarily stopped. Can be reactivated anytime.
                            </p>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <select
                  value={scheduleStatusFilter}
                  onChange={(e) => setScheduleStatusFilter(e.target.value)}
                  className="w-full h-7 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ff9800] focus:border-[#ff9800] bg-white"
                >
                  <option value="all">All Status ({schedules.length})</option>
                  <option value="active">Active ({schedules.filter(s => s.status === 'active').length})</option>
                  <option value="inactive">Inactive ({schedules.filter(s => s.status === 'inactive').length})</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="col-span-1 flex items-end">
                <button
                  onClick={() => {
                    setScheduleSearchQuery('');
                    setScheduleStatusFilter('all');
                  }}
                  className="text-[#ff9800] hover:text-[#f57c00] transition-colors font-normal mb-1.5"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results and View Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <p className="text-sm text-[#666666]">
                Showing {filteredSchedules.length} of {schedules.length} schedules
              </p>
            </div>
          </div>

          {/* Card View for Schedules */}
          {scheduleViewMode === 'card' && (
            <div className="space-y-3">
              {filteredSchedules.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-12 text-center text-gray-500">
                  No schedules found. {scheduleSearchQuery && 'Try adjusting your search.'}
                </div>
              ) : (
                filteredSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Header - Name, Status, and Actions */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-gray-900 font-medium">{schedule.scheduleName}</h3>
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded ${getStatusColor(schedule.status)}`}>
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </span>
                      </div>

                      {/* Right Side - Actions */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.status === 'active'}
                          onCheckedChange={(checked) => handleScheduleStatusToggle(schedule.id, checked ? 'active' : 'inactive')}
                          className="data-[state=checked]:bg-[#ff9800]"
                        />
                        <button
                          onClick={() => handleEditScheduleClick(schedule)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit Schedule"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteScheduleClick(schedule)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete Schedule"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <span className="text-xs text-[#666666] block mb-1">Selected Rule</span>
                        <span className="text-sm text-gray-900">
                          {schedule.ruleName && schedule.ruleName.length > 0 
                            ? schedule.ruleName[0] 
                            : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[#666666] block mb-1">Selected Scheduler</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">
                            {schedule.scheduler || '-'}
                          </span>
                          {schedule.scheduler && schedulerMetadata[schedule.scheduler] && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-[#ff9800] cursor-help hover:text-[#f57c00] transition-colors flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-white border border-gray-200 shadow-lg p-4 max-w-sm"
                              >
                                <div className="space-y-2">
                                  <div className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-2">
                                    Scheduler Details
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <div className="text-[#666666] mb-0.5">Location:</div>
                                      <div className="text-gray-900 font-medium">
                                        {schedulerMetadata[schedule.scheduler].location}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[#666666] mb-0.5">Days Out:</div>
                                      <div className="text-gray-900 font-medium">
                                        {schedulerMetadata[schedule.scheduler].daysOut}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[#666666] mb-0.5">Product Code:</div>
                                      <div className="text-gray-900 font-medium">
                                        {schedulerMetadata[schedule.scheduler].product}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[#666666] mb-0.5">LoR:</div>
                                      <div className="text-gray-900 font-medium">
                                        {schedulerMetadata[schedule.scheduler].lor}
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <div className="text-[#666666] mb-0.5">Car Codes:</div>
                                      <div className="text-gray-900 font-medium">
                                        {schedulerMetadata[schedule.scheduler].car}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Schedules Table */}
          {scheduleViewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs text-[#666666]">Strategy Name</th>
                    <th className="px-4 py-3 text-left text-xs text-[#666666]">Selected Rule</th>
                    <th className="px-4 py-3 text-left text-xs text-[#666666]">Selected Scheduler</th>
                    <th className="px-4 py-3 text-left text-xs text-[#666666]">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-[#666666]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        No schedules found. {scheduleSearchQuery && 'Try adjusting your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 font-medium">{schedule.scheduleName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {schedule.ruleName && schedule.ruleName.length > 0 
                              ? schedule.ruleName[0] 
                              : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-900">
                              {schedule.scheduler || '-'}
                            </div>
                            {schedule.scheduler && schedulerMetadata[schedule.scheduler] && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-[#ff9800] cursor-help hover:text-[#f57c00] transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="top" 
                                  className="bg-white border border-gray-200 shadow-lg p-4 max-w-sm"
                                >
                                  <div className="space-y-2">
                                    <div className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-2">
                                      Scheduler Details
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div>
                                        <div className="text-[#666666] mb-0.5">Location:</div>
                                        <div className="text-gray-900 font-medium">
                                          {schedulerMetadata[schedule.scheduler].location}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[#666666] mb-0.5">Days Out:</div>
                                        <div className="text-gray-900 font-medium">
                                          {schedulerMetadata[schedule.scheduler].daysOut}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[#666666] mb-0.5">Product Code:</div>
                                        <div className="text-gray-900 font-medium">
                                          {schedulerMetadata[schedule.scheduler].product}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[#666666] mb-0.5">LoR:</div>
                                        <div className="text-gray-900 font-medium">
                                          {schedulerMetadata[schedule.scheduler].lor}
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <div className="text-[#666666] mb-0.5">Car Codes:</div>
                                        <div className="text-gray-900 font-medium">
                                          {schedulerMetadata[schedule.scheduler].car}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded ${getStatusColor(schedule.status)}`}>
                            {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={schedule.status === 'active'}
                              onCheckedChange={(checked) => handleScheduleStatusToggle(schedule.id, checked ? 'active' : 'inactive')}
                              className="data-[state=checked]:bg-[#ff9800]"
                            />
                            <button
                              onClick={() => handleEditScheduleClick(schedule)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Edit Schedule"
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteScheduleClick(schedule)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Delete Schedule"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
            </>
          )}
        </>
      )}

      {/* Schedule/Edit Drawer */}
      <RuleScheduleDrawer 
        open={scheduleDrawerOpen}
        onOpenChange={setScheduleDrawerOpen}
        rule={editingRule}
        onSave={handleSaveSchedule}
      />
      <RuleEditDrawer 
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        rule={editingRule}
        onSave={handleSaveEdit}
      />
      <ScheduleEditDrawer 
        open={scheduleEditDrawerOpen}
        onOpenChange={setScheduleEditDrawerOpen}
        schedule={editingSchedule}
        onSave={handleSaveScheduleEdit}
        rules={rules}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule: {ruleToDelete?.name}?</AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-3">
            <AlertDialogDescription>
              You're about to permanently delete this pricing rule. This action cannot be undone.
            </AlertDialogDescription>
            
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
              <p className="text-amber-900 font-medium mb-2">⚠️ What will happen:</p>
              <ul className="space-y-1 text-amber-800">
                <li>• All scheduled executions will be cancelled</li>
                <li>• Historical data for this rule will be archived</li>
                <li>• Pricing will revert to default settings for affected fleet types</li>
                <li>• This rule cannot be recovered after deletion</li>
              </ul>
            </div>
            
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-gray-900">"{ruleToDelete?.name}"</span>?
            </AlertDialogDescription>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="h-9 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Schedule Dialog */}
      <AlertDialog open={deleteScheduleDialogOpen} onOpenChange={setDeleteScheduleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Strategy: {scheduleToDelete?.scheduleName}?</AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="space-y-3">
            <AlertDialogDescription>
              You're about to permanently delete this pricing strategy. This action cannot be undone.
            </AlertDialogDescription>
            
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
              <p className="text-amber-900 font-medium mb-2">⚠️ What will happen:</p>
              <ul className="space-y-1 text-amber-800">
                <li>• All scheduled executions will be cancelled</li>
                <li>• Historical data for this strategy will be archived</li>
                <li>• Pricing will revert to default settings for affected fleet types</li>
                <li>• This strategy cannot be recovered after deletion</li>
              </ul>
            </div>
            
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-gray-900">"{scheduleToDelete?.scheduleName}"</span>?
            </AlertDialogDescription>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmScheduleDelete}
              className="h-9 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Strategy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const demoSchedulers = [
  {
    id: 'demo-long-1',
    scheduleName: 'Multiple-Scheduler-Format_Complete_Validation_Test_Record_001',
    submissionType: 'Automatic',
    pickupLocation: ['BGLV1-PDX', 'BGLV1-SFO'],
    dropOffLocation: ['BGLV1-PDX', 'BGLV1-SFO'],
    sameDropoff: true,
    productCode: ['AD', 'AE'],
    carCode: ['C', 'D'],
    lorCode: ['1', '2', '3'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '181-300',
    daysOfWeek: ['Mon', 'Wed', 'Fri'],
    pickupTime: '08:00',
    dropoffTime: '18:00',
    scheduleTime: '06:00',
    startDate: '2025-11-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Mon', 'Wed', 'Fri'],
    endType: 'never',
    createdDate: 'Jul 8, 2026',
    scheduleIsActive: true,
  },
  {
    id: 'demo-long-2',
    scheduleName: 'BRS_Premium_Weekend_Airport_Extended_Location_Bundle_LOR28_DaysOut',
    submissionType: 'Automatic',
    pickupLocation: ['Los Angeles', 'San Diego', 'Las Vegas'],
    dropOffLocation: ['Los Angeles', 'San Diego'],
    sameDropoff: false,
    productCode: ['AF', 'AG'],
    carCode: ['FCAR', 'PCAR'],
    lorCode: ['2', '3', '4'],
    getRateShoppedData: true,
    rateType: 'finalRate',
    dataSource: ['ExpediaCOUK'],
    dateRangeType: 'daysOut',
    daysOutValue: '14-60',
    daysOfWeek: ['Sat', 'Sun'],
    pickupTime: '09:00',
    dropoffTime: '21:00',
    scheduleTime: '08:00',
    startDate: '2025-10-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Sat', 'Sun'],
    endType: 'never',
    createdDate: 'Jul 8, 2026',
    scheduleIsActive: true,
  },
  {
    id: 'demo-long-3',
    scheduleName: 'Enterprise_Rate_Submission_Automatic_Nightly_Batch_Processing_Scheduler',
    submissionType: 'Manual',
    pickupLocation: ['New York', 'Chicago', 'Boston'],
    dropOffLocation: ['New York', 'Chicago'],
    sameDropoff: false,
    productCode: ['AD'],
    carCode: ['ECAR', 'CCAR'],
    lorCode: ['5', '6', '7'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '90-180',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    pickupTime: '08:30',
    dropoffTime: '17:30',
    scheduleTime: '07:00',
    startDate: '2025-11-01',
    repeatType: 'daily',
    everyValue: '1',
    selectedDays: [],
    endType: 'never',
    createdDate: 'Jul 8, 2026',
    scheduleIsActive: true,
    importStatus: 'needs_attention',
    importValidationErrors: ['Submission Type is required', 'LOR is required'],
    creationSource: 'excel',
  },
  {
    id: 'demo-1',
    scheduleName: 'BRS_181-300_LOR28',
    submissionType: 'Automatic',
    pickupLocation: ['BGLV1-PDX', 'BGLV1-SFO', 'BGLV1-BGLV1'],
    dropOffLocation: ['BGLV1-PDX', 'BGLV1-SFO', 'BGLV1-BGLV1'],
    sameDropoff: false,
    productCode: ['AD', 'AE', 'AF'],
    carCode: ['C', 'D'],
    lorCode: ['1', '2', '3', '4'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '181-300',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    pickupTime: '08:00',
    dropoffTime: '18:00',
    scheduleTime: '06:00',
    startDate: '2025-11-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Mon', 'Wed', 'Fri'],
    endType: 'never',
    createdDate: 'Oct 15, 2025',
  },
  {
    id: 'demo-2',
    scheduleName: 'BRS_181-300_LOR21',
    submissionType: 'Automatic',
    pickupLocation: ['BGLV1-PDX', 'BGLV1-SFO'],
    dropOffLocation: ['BGLV1-PDX', 'BGLV1-SFO'],
    sameDropoff: true,
    productCode: ['AD', 'AE'],
    carCode: ['C', 'D'],
    lorCode: ['1', '2', '3', '4'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaCOUK'],
    dateRangeType: 'daysOut',
    daysOutValue: '181-300',
    daysOfWeek: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
    pickupTime: '09:00',
    dropoffTime: '17:00',
    scheduleTime: '07:30',
    startDate: '2025-10-20',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Sat', 'Sun'],
    endType: 'never',
    createdDate: 'Oct 20, 2025',
  },
  {
    id: 'demo-3',
    scheduleName: 'BRS_181-300_LOR14',
    submissionType: 'Manual',
    pickupLocation: ['BGLV1-BGLV1', 'BGLV1-PHX'],
    dropOffLocation: ['BGLV1-BGLV1', 'BGLV1-PHX'],
    sameDropoff: false,
    productCode: ['AF'],
    carCode: ['A', 'B'],
    lorCode: ['3', '4'],
    getRateShoppedData: true,
    rateType: 'finalRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '181-300',
    daysOfWeek: ['Tue', 'Thu'],
    pickupTime: '10:00',
    dropoffTime: '16:00',
    scheduleTime: '08:00',
    startDate: '2025-11-10',
    repeatType: 'daily',
    everyValue: '1',
    selectedDays: [],
    endType: 'never',
    createdDate: 'Nov 1, 2025',
  },
  {
    id: 'demo-4',
    scheduleName: 'BRS_181-300_LOR13',
    submissionType: 'Automatic',
    pickupLocation: ['BGLV1-PDX', 'BGLV1-BGLV1'],
    dropOffLocation: ['BGLV1-PDX', 'BGLV1-BGLV1'],
    sameDropoff: true,
    productCode: ['AD'],
    carCode: ['B', 'C'],
    lorCode: ['1', '2', '3'],
    getRateShoppedData: false,
    rateType: 'baseRate',
    dataSource: ['ExpediaCOUK'],
    dateRangeType: 'fixed',
    fixedStartDate: '2025-12-01',
    fixedEndDate: '2025-12-31',
    daysOutValue: '',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    pickupTime: '07:00',
    dropoffTime: '19:00',
    scheduleTime: '05:30',
    startDate: '2025-12-01',
    repeatType: 'doesNotRepeat',
    everyValue: '1',
    selectedDays: [],
    endType: 'never',
    createdDate: 'Nov 8, 2025',
    scheduleIsActive: false,
    lastUsedAt: '2025-11-20',
  },
  {
    id: 'demo-5',
    scheduleName: 'BRS_181-300_LOR12',
    submissionType: 'Automatic',
    pickupLocation: ['BGLV1-SFO', 'BGLV1-PHX'],
    dropOffLocation: ['BGLV1-SFO', 'BGLV1-PHX'],
    sameDropoff: false,
    productCode: ['AD', 'AE'],
    carCode: ['A', 'B', 'C'],
    lorCode: ['1', '2'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaAPI_1xV3', 'ExpediaCOUK'],
    dateRangeType: 'daysOut',
    daysOutValue: '181-300',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    pickupTime: '06:30',
    dropoffTime: '20:00',
    scheduleTime: '06:00',
    startDate: '2025-11-15',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    endType: 'on',
    endDate: '2026-03-31',
    createdDate: 'Nov 12, 2025',
  },
  {
    id: 'demo-6',
    scheduleName: 'BRS_181-300_LOR11',
    submissionType: 'Manual',
    pickupLocation: ['BGLV1-PHX'],
    dropOffLocation: ['BGLV1-PHX'],
    sameDropoff: true,
    productCode: ['AD'],
    carCode: ['A', 'B'],
    lorCode: ['1', '2'],
    getRateShoppedData: true,
    rateType: 'finalRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '181-300',
    daysOfWeek: ['Sun'],
    pickupTime: '11:00',
    dropoffTime: '15:00',
    scheduleTime: '09:00',
    startDate: '2025-10-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Sun'],
    endType: 'never',
    createdDate: 'Oct 5, 2025',
  },
  {
    id: 'demo-7',
    scheduleName: 'BRS_90-180_LOR7',
    submissionType: 'Automatic',
    pickupLocation: ['New York', 'Chicago'],
    dropOffLocation: ['New York', 'Chicago'],
    sameDropoff: true,
    productCode: ['AD', 'AE'],
    carCode: ['ECAR', 'CCAR'],
    lorCode: ['5', '6', '7'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '90-180',
    daysOfWeek: ['Mon', 'Wed', 'Fri'],
    pickupTime: '08:30',
    dropoffTime: '17:30',
    scheduleTime: '07:00',
    startDate: '2025-11-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Mon', 'Wed', 'Fri'],
    endType: 'never',
    createdDate: 'Sep 18, 2025',
  },
  {
    id: 'demo-8',
    scheduleName: 'BRS_Weekend_Premium',
    submissionType: 'Automatic',
    pickupLocation: ['Los Angeles', 'San Diego'],
    dropOffLocation: ['Los Angeles', 'San Diego'],
    sameDropoff: false,
    productCode: ['AF', 'AG'],
    carCode: ['FCAR', 'PCAR'],
    lorCode: ['2', '3', '4'],
    getRateShoppedData: true,
    rateType: 'finalRate',
    dataSource: ['ExpediaCOUK'],
    dateRangeType: 'daysOut',
    daysOutValue: '14-60',
    daysOfWeek: ['Sat', 'Sun'],
    pickupTime: '09:00',
    dropoffTime: '21:00',
    scheduleTime: '08:00',
    startDate: '2025-10-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Sat', 'Sun'],
    endType: 'never',
    createdDate: 'Sep 25, 2025',
  },
  {
    id: 'demo-9',
    scheduleName: 'BRS_Airport_Morning',
    submissionType: 'Manual',
    pickupLocation: ['Chicago', 'Houston'],
    dropOffLocation: ['Chicago', 'Houston'],
    sameDropoff: true,
    productCode: ['AD'],
    carCode: ['ICAR', 'SCAR'],
    lorCode: ['1', '2', '3'],
    getRateShoppedData: false,
    rateType: 'baseRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'fixed',
    fixedStartDate: '2025-11-01',
    fixedEndDate: '2026-02-28',
    daysOutValue: '',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    pickupTime: '06:00',
    dropoffTime: '12:00',
    scheduleTime: '05:00',
    startDate: '2025-11-01',
    repeatType: 'daily',
    everyValue: '1',
    selectedDays: [],
    endType: 'never',
    createdDate: 'Oct 2, 2025',
  },
  {
    id: 'demo-10',
    scheduleName: 'BRS_Holiday_Surge',
    submissionType: 'Automatic',
    pickupLocation: ['Phoenix', 'Dallas'],
    dropOffLocation: ['Phoenix', 'Dallas'],
    sameDropoff: false,
    productCode: ['AE', 'AF', 'AG'],
    carCode: ['MCAR', 'LCAR'],
    lorCode: ['7', '8', '9', '10'],
    getRateShoppedData: true,
    rateType: 'finalRate',
    dataSource: ['ExpediaAPI_1xV3', 'ExpediaCOUK'],
    dateRangeType: 'daysOut',
    daysOutValue: '30-90',
    daysOfWeek: ['Thu', 'Fri', 'Sat', 'Sun'],
    pickupTime: '10:00',
    dropoffTime: '18:00',
    scheduleTime: '09:30',
    startDate: '2025-12-15',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Thu', 'Fri', 'Sat', 'Sun'],
    endType: 'on',
    endDate: '2026-01-15',
    createdDate: 'Nov 20, 2025',
  },
  {
    id: 'demo-11',
    scheduleName: 'BRS_Economy_Weekday',
    submissionType: 'Automatic',
    pickupLocation: ['Philadelphia', 'San Antonio'],
    dropOffLocation: ['Philadelphia', 'San Antonio'],
    sameDropoff: true,
    productCode: ['AD', 'AE'],
    carCode: ['ECAR', 'CCAR', 'ICAR'],
    lorCode: ['1', '2', '3', '4', '5'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaCOUK'],
    dateRangeType: 'daysOut',
    daysOutValue: '7-30',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    pickupTime: '07:30',
    dropoffTime: '16:30',
    scheduleTime: '06:45',
    startDate: '2025-11-05',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    endType: 'never',
    createdDate: 'Nov 5, 2025',
  },
  {
    id: 'demo-12',
    scheduleName: 'BRS_LongTerm_LOR28',
    submissionType: 'Manual',
    pickupLocation: ['San Jose', 'New York'],
    dropOffLocation: ['San Jose', 'New York'],
    sameDropoff: false,
    productCode: ['AH', 'AI'],
    carCode: ['XCAR', 'RCAR'],
    lorCode: ['14', '21', '28'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '181-300',
    daysOfWeek: ['Tue', 'Thu', 'Sat'],
    pickupTime: '11:30',
    dropoffTime: '14:30',
    scheduleTime: '10:00',
    startDate: '2025-10-15',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Tue', 'Thu', 'Sat'],
    endType: 'never',
    createdDate: 'Oct 28, 2025',
    scheduleIsActive: true,
    lastUsedAt: '2026-06-15',
  },
  {
    id: 'demo-13',
    scheduleName: 'BRS_Summer_Peak',
    submissionType: 'Automatic',
    pickupLocation: ['Miami', 'Orlando'],
    dropOffLocation: ['Miami', 'Orlando'],
    sameDropoff: true,
    productCode: ['AD', 'AE'],
    carCode: ['ECAR', 'SCAR'],
    lorCode: ['3', '4', '5'],
    getRateShoppedData: true,
    rateType: 'finalRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '30-90',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    pickupTime: '08:00',
    dropoffTime: '18:00',
    scheduleTime: '07:00',
    startDate: '2026-05-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Mon', 'Wed', 'Fri'],
    endType: 'never',
    createdDate: 'May 10, 2026',
    scheduleIsActive: true,
    lastUsedAt: '2026-06-28',
  },
  {
    id: 'demo-14',
    scheduleName: 'BRS_OffSeason_Hold',
    submissionType: 'Manual',
    pickupLocation: ['Denver', 'Salt Lake City'],
    dropOffLocation: ['Denver', 'Salt Lake City'],
    sameDropoff: false,
    productCode: ['AF'],
    carCode: ['CCAR', 'ICAR'],
    lorCode: ['2', '3'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaCOUK'],
    dateRangeType: 'fixed',
    fixedStartDate: '2025-09-01',
    fixedEndDate: '2025-11-30',
    daysOutValue: '',
    daysOfWeek: ['Tue', 'Thu'],
    pickupTime: '09:30',
    dropoffTime: '16:00',
    scheduleTime: '08:30',
    startDate: '2025-09-01',
    repeatType: 'doesNotRepeat',
    everyValue: '1',
    selectedDays: [],
    endType: 'never',
    createdDate: 'Aug 20, 2025',
    scheduleIsActive: false,
    lastUsedAt: '2026-05-20',
  },
  {
    id: 'demo-15',
    scheduleName: 'BRS_Legacy_Weekend',
    submissionType: 'Automatic',
    pickupLocation: ['Boston', 'Hartford'],
    dropOffLocation: ['Boston', 'Hartford'],
    sameDropoff: true,
    productCode: ['AD'],
    carCode: ['FCAR'],
    lorCode: ['6', '7'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaAPI_1xV3'],
    dateRangeType: 'daysOut',
    daysOutValue: '14-45',
    daysOfWeek: ['Sat', 'Sun'],
    pickupTime: '10:00',
    dropoffTime: '20:00',
    scheduleTime: '09:00',
    startDate: '2024-03-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Sat', 'Sun'],
    endType: 'never',
    createdDate: 'Feb 10, 2024',
    scheduleIsActive: false,
    lastUsedAt: '2024-12-01',
  },
  {
    id: 'demo-16',
    scheduleName: 'BRS_Corporate_Rates',
    submissionType: 'Automatic',
    pickupLocation: ['Atlanta', 'Charlotte'],
    dropOffLocation: ['Atlanta', 'Charlotte'],
    sameDropoff: true,
    productCode: ['AE', 'AF', 'AG'],
    carCode: ['PCAR', 'LCAR'],
    lorCode: ['1', '2', '3', '4'],
    getRateShoppedData: true,
    rateType: 'finalRate',
    dataSource: ['ExpediaAPI_1xV3', 'ExpediaCOUK'],
    dateRangeType: 'daysOut',
    daysOutValue: '7-21',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    pickupTime: '07:00',
    dropoffTime: '17:00',
    scheduleTime: '06:30',
    startDate: '2026-04-01',
    repeatType: 'daily',
    everyValue: '1',
    selectedDays: [],
    endType: 'never',
    createdDate: 'Apr 2, 2026',
    scheduleIsActive: true,
    lastUsedAt: '2026-07-01',
  },
  {
    id: 'demo-17',
    scheduleName: 'BRS_Retired_Airport',
    submissionType: 'Manual',
    pickupLocation: ['Seattle', 'Portland'],
    dropOffLocation: ['Seattle', 'Portland'],
    sameDropoff: false,
    productCode: ['AH'],
    carCode: ['MCAR'],
    lorCode: ['1'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: ['ExpediaCOUK'],
    dateRangeType: 'daysOut',
    daysOutValue: '60-120',
    daysOfWeek: ['Mon'],
    pickupTime: '06:00',
    dropoffTime: '12:00',
    scheduleTime: '05:00',
    startDate: '2023-06-01',
    repeatType: 'weekly',
    everyValue: '1',
    selectedDays: ['Mon'],
    endType: 'never',
    createdDate: 'Jun 1, 2023',
    scheduleIsActive: false,
    lastUsedAt: '2024-08-15',
  },
];