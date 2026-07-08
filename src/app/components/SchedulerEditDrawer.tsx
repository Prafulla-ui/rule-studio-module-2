import { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';
import { CustomButton } from './CustomButton';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { CustomSelect } from './CustomSelect';
import { MultiSelect } from './MultiSelect';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { InfoTooltip } from './InfoTooltip';
import { toast } from 'sonner@2.0.3';
import {
  applyImportValidation,
  fieldHasImportError,
  getImportFieldError,
  importFieldClassName,
  validateImportedScheduler,
} from '../utils/schedulerImportValidation';
import { normalizeTimeTo12Hour, TIME_12H_SELECT_OPTIONS } from '../utils/timeFormat';

interface SchedulerEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scheduler: any;
  onSave: (updatedScheduler: any) => void;
  existingSchedulers?: any[];
}

export function SchedulerEditDrawer({ isOpen, onClose, scheduler, onSave, existingSchedulers = [] }: SchedulerEditDrawerProps) {
  const [schedulerData, setSchedulerData] = useState({
    id: '',
    scheduleName: '',
    selectedSchedule: '',
    submissionType: '',
    pickupLocation: [] as string[],
    dropOffLocation: [] as string[],
    sameDropoff: false,
    productCode: [] as string[],
    carCode: [] as string[],
    lorCode: [] as string[],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dataSource: [] as string[],
    dateRangeType: 'fixed',
    fixedStartDate: '',
    fixedEndDate: '',
    daysOutValue: '',
    daysOfWeek: [] as string[],
    pickupTime: '',
    dropoffTime: '',
    scheduleTime: '',
    startDate: '',
    repeatType: 'doesNotRepeat',
    everyValue: '1',
    selectedDays: [] as string[],
    monthlyType: 'dayOfMonth',
    monthlyDayOfMonth: '1',
    monthlyDayOfWeek: 'first',
    monthlyWeekday: 'monday',
    yearlyMonth: 'january',
    yearlyDay: '1',
    endType: 'never',
    endDate: '',
    endAfterOccurrences: '',
    customFrequency: 'days',
    customInterval: '1',
    emailAddresses: '',
    submitRatesToTetheredLocations: true,
    submitToTetheredProducts: true,
    submitOnlyRatesDifferent: false,
    submitExtraHourAndDayRates: false,
    submitToTetheredCars: true,
    submitToAllLORs: false,
    scheduleIsActive: true,
    overrideBlockedDates: false,
    notifyEmailAfter: true,
    notifyEmailValue: '180'
  });

  const [daysOutInput, setDaysOutInput] = useState('');
  const daysOutTags = schedulerData.daysOutValue
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const addDaysOutTag = (rawValue?: string) => {
    const nextTag = (rawValue ?? daysOutInput).trim();
    if (!nextTag) return;
    if (daysOutTags.includes(nextTag)) {
      setDaysOutInput('');
      return;
    }
    setSchedulerData({
      ...schedulerData,
      daysOutValue: [...daysOutTags, nextTag].join(', '),
    });
    setDaysOutInput('');
  };

  const removeDaysOutTag = (index: number) => {
    const nextTags = daysOutTags.filter((_, i) => i !== index);
    setSchedulerData({ ...schedulerData, daysOutValue: nextTags.join(', ') });
  };

  useEffect(() => {
    if (isOpen && scheduler) {
      setDaysOutInput('');
      setSchedulerData({
        ...scheduler,
        submitRatesToTetheredLocations: true,
        submitToTetheredProducts: true,
        submitToTetheredCars: true,
        scheduleIsActive: true,
        notifyEmailAfter: true,
        notifyEmailValue: scheduler.notifyEmailValue || '180',
        pickupTime: normalizeTimeTo12Hour(scheduler.pickupTime || ''),
        dropoffTime: normalizeTimeTo12Hour(scheduler.dropoffTime || ''),
      });
    }
  }, [isOpen, scheduler]);

  // Handle schedule selection and auto-fill
  const handleScheduleSelect = (scheduleId: string) => {
    const selectedScheduler = existingSchedulers.find(s => s.id === scheduleId);
    if (selectedScheduler) {
      // Auto-fill all fields from the selected schedule, but keep the current id
      setSchedulerData({
        ...selectedScheduler,
        id: schedulerData.id, // Keep the current scheduler's id
        selectedSchedule: scheduleId,
        scheduleName: selectedScheduler.scheduleName || '',
        pickupTime: normalizeTimeTo12Hour(selectedScheduler.pickupTime || ''),
        dropoffTime: normalizeTimeTo12Hour(selectedScheduler.dropoffTime || ''),
      });
    } else {
      // Clear selection
      setSchedulerData({
        ...schedulerData,
        selectedSchedule: scheduleId,
      });
    }
  };

  const handleSave = () => {
    if (!schedulerData.scheduleName) {
      toast.error('Please enter a schedule name');
      return;
    }
    let updatedScheduler = { ...schedulerData };
    if (schedulerData.creationSource === 'excel') {
      updatedScheduler = applyImportValidation(updatedScheduler);
      if (updatedScheduler.importStatus === 'complete') {
        toast.success('Scheduler updated. Data status is now complete.');
      } else {
        toast.warning('Scheduler saved with remaining issues. Please fix highlighted fields.');
      }
    } else {
      toast.success('Scheduler updated successfully');
    }
    onSave(updatedScheduler);
  };

  const isExcelImport = schedulerData.creationSource === 'excel';

  const liveImportValidation = useMemo(() => {
    if (!isExcelImport) return null;
    return validateImportedScheduler(schedulerData as Record<string, unknown>);
  }, [schedulerData, isExcelImport]);

  const fieldErrors = (liveImportValidation?.fieldErrors ??
    schedulerData.importFieldErrors ??
    {}) as Record<string, string>;
  const importValidationErrors =
    liveImportValidation?.errors ?? schedulerData.importValidationErrors ?? [];
  const needsAttention = isExcelImport
    ? liveImportValidation?.importStatus === 'needs_attention'
    : schedulerData.importStatus === 'needs_attention';
  const allImportIssuesResolved =
    isExcelImport && liveImportValidation?.importStatus === 'complete';

  const renderFieldError = (field: string) => {
    const error = getImportFieldError(fieldErrors, field);
    if (!error) return null;
    return <p className="text-[11px] text-amber-700 mt-1">{error}</p>;
  };

  const fieldLabelClass = (field: string) =>
    fieldHasImportError(fieldErrors, field) ? 'block text-xs text-amber-700 mb-1.5 font-medium' : 'block text-xs text-[#666666] mb-1.5';

  // Generate recurrence summary text
  const getRecurrenceSummary = () => {
    if (schedulerData.repeatType === 'doesNotRepeat') {
      return '';
    }

    const startDate = new Date(schedulerData.startDate);
    const dateStr = startDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let pattern = '';
    const every = schedulerData.everyValue || '1';

    switch (schedulerData.repeatType) {
      case 'daily':
        pattern = every === '1' ? 'every day' : `every ${every} days`;
        break;
      case 'weekly':
        const days = schedulerData.selectedDays.length > 0 
          ? schedulerData.selectedDays.join(', ') 
          : 'no days selected';
        pattern = `weekly on ${days}`;
        break;
      case 'monthly':
        if (schedulerData.monthlyType === 'dayOfMonth') {
          const day = schedulerData.monthlyDayOfMonth || '1';
          pattern = every === '1' 
            ? `monthly on day ${day}` 
            : `every ${every} months on day ${day}`;
        } else {
          const occurrence = schedulerData.monthlyDayOfWeek || 'first';
          const weekday = schedulerData.monthlyWeekday || 'Monday';
          pattern = every === '1'
            ? `monthly on the ${occurrence} ${weekday}`
            : `every ${every} months on the ${occurrence} ${weekday}`;
        }
        break;
      case 'yearly':
        const month = schedulerData.yearlyMonth || 'January';
        const day = schedulerData.yearlyDay || '1';
        pattern = `yearly on ${month} ${day}`;
        break;
      case 'custom':
        const freq = schedulerData.customFrequency || 'days';
        const interval = schedulerData.customInterval || '1';
        pattern = interval === '1' ? `every ${freq.slice(0, -1)}` : `every ${interval} ${freq}`;
        break;
      default:
        return '';
    }

    let endText = '';
    if (schedulerData.endType === 'on' && schedulerData.endDate) {
      const endDate = new Date(schedulerData.endDate);
      endText = ` until ${endDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    } else if (schedulerData.endType === 'after' && schedulerData.endAfterOccurrences) {
      endText = ` for ${schedulerData.endAfterOccurrences} occurrences`;
    }

    return `Occurs ${pattern} starting ${dateStr}${endText}.`;
  };

  if (!scheduler) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} direction="right">
      <DrawerContent className="!w-[1000px] !max-w-[1000px] ml-auto h-screen">
        <div className="w-full h-full flex flex-col">
          <DrawerHeader className="border-b border-gray-200 px-6 py-4 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-8">
                <DrawerTitle className="text-lg text-[#2c3e50] font-medium mb-1">Edit Scheduler</DrawerTitle>
                <DrawerDescription className="text-sm text-gray-500">
                  Update scheduler details and settings
                </DrawerDescription>
              </div>
              <DrawerClose className="p-2 hover:bg-gray-100 rounded transition-colors -mt-1">
                <X className="h-5 w-5 text-gray-500" />
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white">
          {needsAttention && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Imported scheduler needs attention</p>
                <p className="text-xs text-amber-800 mt-1">
                  This scheduler was imported from Excel and has incomplete or invalid data.
                  Fix the highlighted fields below to clear this status.
                </p>
                {importValidationErrors.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs text-amber-800 list-disc ml-4">
                    {importValidationErrors.map((error: string) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          {allImportIssuesResolved && (
            <div className="rounded-lg border border-green-300 bg-green-50 p-4 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">All required fields are complete</p>
                <p className="text-xs text-green-800 mt-1">
                  Save your changes to update the scheduler status in the list.
                </p>
              </div>
            </div>
          )}
          {/* SCHEDULER INFORMATION */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-[#2c3e50] text-base font-medium">Scheduler Information</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={fieldLabelClass('scheduleName')}>Schedule Name <span className="text-red-500">*</span></label>
                <Input
                  value={schedulerData.scheduleName}
                  onChange={(e) => setSchedulerData({ ...schedulerData, scheduleName: e.target.value })}
                  placeholder="Enter schedule name"
                  className={importFieldClassName(fieldErrors, 'scheduleName')}
                />
                {renderFieldError('scheduleName')}
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Select Schedule</label>
                <CustomSelect
                  value={schedulerData.selectedSchedule}
                  onChange={handleScheduleSelect}
                  options={existingSchedulers
                    .filter(s => s.id !== schedulerData.id) // Exclude current scheduler
                    .map(scheduler => ({
                      value: scheduler.id,
                      label: scheduler.scheduleName || `Schedule ${scheduler.id}`
                    }))}
                  placeholder={existingSchedulers.length <= 1 ? "No other schedules available" : "Choose a schedule"}
                  disabled={existingSchedulers.length <= 1}
                />
                <p className="text-[11px] text-[#666666] mt-1">
                  (Load a predefined schedule template to auto-fill details)
                </p>
              </div>
              <div>
                <label className={fieldLabelClass('submissionType')}>Submission Type <span className="text-red-500">*</span></label>
                <CustomSelect
                  value={schedulerData.submissionType}
                  onChange={(value) => setSchedulerData({ ...schedulerData, submissionType: value })}
                  options={[
                    { value: 'Automatic', label: 'Automatic' },
                    { value: 'Manual', label: 'Manual' }
                  ]}
                />
                {renderFieldError('submissionType')}
              </div>
            </div>
          </div>

          {/* LOCATION & PRODUCT CRITERIA */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-[#2c3e50] text-base font-medium">Location & Product Criteria</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className={fieldLabelClass('pickupLocation')}>Pickup Location <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.pickupLocation}
                  onChange={(value) => {
                    if (schedulerData.sameDropoff) {
                      setSchedulerData({ ...schedulerData, pickupLocation: value, dropOffLocation: value });
                    } else {
                      setSchedulerData({ ...schedulerData, pickupLocation: value });
                    }
                  }}
                  options={['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']}
                  placeholder="Select pickup locations"
                />
                {renderFieldError('pickupLocation')}
              </div>
              <div>
                <label className={fieldLabelClass('dropOffLocation')}>Drop-off Location <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.sameDropoff ? schedulerData.pickupLocation : schedulerData.dropOffLocation}
                  onChange={(value) => setSchedulerData({ ...schedulerData, dropOffLocation: value })}
                  options={['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']}
                  placeholder="Select drop-off locations"
                  disabled={schedulerData.sameDropoff}
                />
                {renderFieldError('dropOffLocation')}
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="same-dropoff-edit"
                    checked={schedulerData.sameDropoff}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSchedulerData({ ...schedulerData, sameDropoff: true, dropOffLocation: schedulerData.pickupLocation });
                      } else {
                        setSchedulerData({ ...schedulerData, sameDropoff: false });
                      }
                    }}
                    className="border-[#ff9800] data-[state=checked]:bg-[#ff9800]"
                  />
                  <label htmlFor="same-dropoff-edit" className="text-xs text-gray-700 cursor-pointer">
                    same drop off
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={fieldLabelClass('productCode')}>Product Code <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.productCode}
                  onChange={(value) => setSchedulerData({ ...schedulerData, productCode: value })}
                  options={['AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM']}
                  placeholder="Select product codes"
                />
                {renderFieldError('productCode')}
              </div>
              <div>
                <label className={fieldLabelClass('carCode')}>Car Code <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.carCode}
                  onChange={(value) => setSchedulerData({ ...schedulerData, carCode: value })}
                  options={['ECAR', 'CCAR', 'ICAR', 'SCAR', 'FCAR', 'PCAR', 'MVAR', 'FVAR']}
                  placeholder="Select car codes"
                />
                {renderFieldError('carCode')}
              </div>
              <div>
                <label className={fieldLabelClass('lorCode')}>LOR <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.lorCode}
                  onChange={(value) => setSchedulerData({ ...schedulerData, lorCode: value })}
                  options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}
                  placeholder="Select LOR"
                />
                {renderFieldError('lorCode')}
              </div>
            </div>
          </div>

          {/* DATA SOURCE */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-[#2c3e50] text-base font-medium">Data Source</h3>
            </div>
            <div className="flex items-start gap-8">
              <div className="w-1/3 min-w-[220px]">
                <label className="block text-xs text-[#666666] mb-1.5">Data Sources <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.dataSource}
                  onChange={(value) => setSchedulerData({ ...schedulerData, dataSource: value })}
                  options={['ExpediaAPI_1xV3', 'ExpediaCOUK']}
                  placeholder="Select data sources"
                />
              </div>

              <RadioGroup
                value={schedulerData.rateType}
                onValueChange={(value) => setSchedulerData({ ...schedulerData, rateType: value })}
                className="flex items-start gap-6 shrink-0"
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="baseRate" 
                      id="base-rate"
                      className="border-[#ff9800] text-[#ff9800]" 
                    />
                    <label htmlFor="base-rate" className="text-sm text-gray-700 cursor-pointer">
                      Base Rate
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 ml-6 mt-0.5">(Rental rate before taxes, fees, and additional charges)</p>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="finalRate" 
                      id="final-rate"
                      className="border-[#ff9800] text-[#ff9800]" 
                    />
                    <label htmlFor="final-rate" className="text-sm text-gray-700 cursor-pointer">
                      Final Rate
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 ml-6 mt-0.5">(Total rate including all taxes, fees, and surcharges)</p>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* DATE RANGE CONFIGURATION */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-[#2c3e50] text-base font-medium">Date Range Configuration</h3>
            </div>
            <div className="space-y-4">
              <RadioGroup
                value={schedulerData.dateRangeType}
                onValueChange={(value) => setSchedulerData({ ...schedulerData, dateRangeType: value })}
                className="flex items-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="fixed" 
                    id="fixed-range"
                    className="border-[#ff9800] text-[#ff9800]" 
                  />
                  <label htmlFor="fixed-range" className="text-sm text-gray-700 cursor-pointer">
                    Fixed
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="daysOut" 
                    id="days-out-range"
                    className="border-[#ff9800] text-[#ff9800]" 
                  />
                  <label htmlFor="days-out-range" className="text-sm text-gray-700 cursor-pointer">
                    Days Out
                  </label>
                </div>
              </RadioGroup>
              
              {schedulerData.dateRangeType === 'fixed' ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#666666] mb-1.5">Start Date <span className="text-red-500">*</span></label>
                    <Input
                      type="date"
                      value={schedulerData.fixedStartDate}
                      onChange={(e) => setSchedulerData({ ...schedulerData, fixedStartDate: e.target.value })}
                      className="h-7"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#666666] mb-1.5">End Date <span className="text-red-500">*</span></label>
                    <Input
                      type="date"
                      value={schedulerData.fixedEndDate}
                      onChange={(e) => setSchedulerData({ ...schedulerData, fixedEndDate: e.target.value })}
                      className="h-7"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Days Out</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {daysOutTags.map((tag, index) => (
                        <div
                          key={`${tag}-${index}`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#fff3e0] border border-[#ff9800] rounded-full text-sm"
                        >
                          <span className="text-gray-700">{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeDaysOutTag(index)}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={daysOutInput}
                        onChange={(e) => setDaysOutInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addDaysOutTag();
                          }
                        }}
                        placeholder="Type range (e.g., 1-10 or 15) and press Enter"
                        className="h-8 flex-1"
                      />
                      <CustomButton
                        variant="outline"
                        type="button"
                        onClick={() => addDaysOutTag()}
                      >
                        <Plus className="w-4 h-4" />
                      </CustomButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DAYS OF WEEK */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-[#2c3e50] text-base font-medium">Days of Week <span className="text-red-500">*</span></h3>
            </div>
            <div className="space-y-4">
              <div className="w-1/3">
                <label className="block text-xs text-[#666666] mb-1.5">Days of Week <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.daysOfWeek}
                  onChange={(value) => setSchedulerData({ ...schedulerData, daysOfWeek: value })}
                  options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                  placeholder="Select days"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#666666] mb-1.5">Pick-up Time</label>
                  <CustomSelect
                    value={schedulerData.pickupTime}
                    onChange={(value) => setSchedulerData({ ...schedulerData, pickupTime: value })}
                    options={TIME_12H_SELECT_OPTIONS}
                    placeholder="Select time"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666666] mb-1.5">Dropoff Time</label>
                  <CustomSelect
                    value={schedulerData.dropoffTime}
                    onChange={(value) => setSchedulerData({ ...schedulerData, dropoffTime: value })}
                    options={TIME_12H_SELECT_OPTIONS}
                    placeholder="Select time"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SCHEDULER SETTINGS */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-[#2c3e50] text-base font-medium">Scheduler Settings</h3>
            </div>
            
            <div className="space-y-4">
              {/* Recurrence Section */}
              <div className="grid grid-cols-3 gap-4">
                {/* Schedule Time */}
                <div>
                  <label className="block text-xs text-[#666666] mb-1.5">Schedule Time <span className="text-red-500">*</span></label>
                  <CustomSelect
                    value={schedulerData.scheduleTime}
                    onChange={(value) => setSchedulerData({ ...schedulerData, scheduleTime: value })}
                    options={(() => {
                      const times = [];
                      for (let hour = 0; hour < 24; hour++) {
                        for (let min = 0; min < 60; min += 15) {
                          const h = hour.toString().padStart(2, '0');
                          const m = min.toString().padStart(2, '0');
                          const time = `${h}:${m}`;
                          times.push({ value: time, label: time });
                        }
                      }
                      return times;
                    })()}
                    placeholder="Select time"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs text-[#666666] mb-1.5">Start Date <span className="text-red-500">*</span></label>
                  <Input
                    type="date"
                    value={schedulerData.startDate}
                    onChange={(e) => setSchedulerData({ ...schedulerData, startDate: e.target.value })}
                    className="h-7"
                  />
                </div>

                {/* Repeat Type */}
                <div>
                  <label className="block text-xs text-[#666666] mb-1.5">Repeat</label>
                  <CustomSelect
                    value={schedulerData.repeatType}
                    onChange={(value) => setSchedulerData({ ...schedulerData, repeatType: value })}
                    options={[
                      { value: 'doesNotRepeat', label: 'Does not repeat' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                    ]}
                  />
                </div>
              </div>

              {/* Daily Options */}
              {schedulerData.repeatType === 'daily' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm text-gray-700">Every</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={schedulerData.everyValue}
                        onChange={(e) => setSchedulerData({ ...schedulerData, everyValue: e.target.value })}
                        className="h-7 w-20"
                      />
                      <span className="text-sm text-gray-700">day(s)</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm text-gray-700 pt-1">End</label>
                    <div className="flex items-center gap-2">
                      <CustomSelect
                        value={schedulerData.endType}
                        onChange={(value) => setSchedulerData({ ...schedulerData, endType: value })}
                        options={[
                          { value: 'never', label: 'Never' },
                          { value: 'on', label: 'On this day' },
                          { value: 'after', label: 'After' }
                        ]}
                        className="w-40"
                      />
                      {schedulerData.endType === 'on' && (
                        <Input
                          type="date"
                          value={schedulerData.endDate}
                          onChange={(e) => setSchedulerData({ ...schedulerData, endDate: e.target.value })}
                          className="h-7 flex-1"
                        />
                      )}
                      {schedulerData.endType === 'after' && (
                        <>
                          <Input
                            type="number"
                            min="1"
                            value={schedulerData.endAfterOccurrences}
                            onChange={(e) => setSchedulerData({ ...schedulerData, endAfterOccurrences: e.target.value })}
                            className="h-7 w-20"
                          />
                          <span className="text-sm text-gray-700">occurrence(s)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recurrence Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-gray-700">{getRecurrenceSummary()}</p>
                  </div>
                </div>
              )}

              {/* Weekly Options */}
              {schedulerData.repeatType === 'weekly' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm text-gray-700">On</label>
                    <div className="flex gap-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                        const dayValue = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index];
                        const isSelected = schedulerData.selectedDays.includes(dayValue);
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              const newDays = isSelected
                                ? schedulerData.selectedDays.filter(d => d !== dayValue)
                                : [...schedulerData.selectedDays, dayValue];
                              setSchedulerData({ ...schedulerData, selectedDays: newDays });
                            }}
                            className={`w-10 h-10 rounded-md font-medium text-sm transition-colors ${
                              isSelected
                                ? 'bg-[#ff9800] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm text-gray-700 pt-1">End</label>
                    <div className="flex items-center gap-2">
                      <CustomSelect
                        value={schedulerData.endType}
                        onChange={(value) => setSchedulerData({ ...schedulerData, endType: value })}
                        options={[
                          { value: 'never', label: 'Never' },
                          { value: 'on', label: 'On this day' },
                          { value: 'after', label: 'After' }
                        ]}
                        className="w-40"
                      />
                      {schedulerData.endType === 'on' && (
                        <Input
                          type="date"
                          value={schedulerData.endDate}
                          onChange={(e) => setSchedulerData({ ...schedulerData, endDate: e.target.value })}
                          className="h-7 flex-1"
                        />
                      )}
                      {schedulerData.endType === 'after' && (
                        <>
                          <Input
                            type="number"
                            min="1"
                            value={schedulerData.endAfterOccurrences}
                            onChange={(e) => setSchedulerData({ ...schedulerData, endAfterOccurrences: e.target.value })}
                            className="h-7 w-20"
                          />
                          <span className="text-sm text-gray-700">occurrence(s)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recurrence Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-gray-700">{getRecurrenceSummary()}</p>
                  </div>
                </div>
              )}

              {/* Monthly Options */}
              {schedulerData.repeatType === 'monthly' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm text-gray-700">Every</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={schedulerData.everyValue}
                        onChange={(e) => setSchedulerData({ ...schedulerData, everyValue: e.target.value })}
                        className="h-7 w-20"
                      />
                      <span className="text-sm text-gray-700">month(s)</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm text-gray-700 pt-1">On</label>
                    <RadioGroup
                      value={schedulerData.monthlyType}
                      onValueChange={(value) => setSchedulerData({ ...schedulerData, monthlyType: value })}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="dayOfMonth" id="day-of-month-edit" className="border-[#ff9800] text-[#ff9800]" />
                        <label htmlFor="day-of-month-edit" className="text-sm text-gray-700">Day</label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          value={schedulerData.monthlyDayOfMonth}
                          onChange={(e) => setSchedulerData({ ...schedulerData, monthlyDayOfMonth: e.target.value, monthlyType: 'dayOfMonth' })}
                          className="h-7 w-20"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="dayOfWeek" id="day-of-week-edit" className="border-[#ff9800] text-[#ff9800]" />
                        <label htmlFor="day-of-week-edit" className="text-sm text-gray-700">The</label>
                        <CustomSelect
                          value={schedulerData.monthlyDayOfWeek}
                          onChange={(value) => {
                            setSchedulerData({ ...schedulerData, monthlyDayOfWeek: value, monthlyType: 'dayOfWeek' });
                          }}
                          options={[
                            { value: 'first', label: 'First' },
                            { value: 'second', label: 'Second' },
                            { value: 'third', label: 'Third' },
                            { value: 'fourth', label: 'Fourth' },
                            { value: 'last', label: 'Last' }
                          ]}
                          className="w-32"
                        />
                        <CustomSelect
                          value={schedulerData.monthlyWeekday}
                          onChange={(value) => {
                            setSchedulerData({ ...schedulerData, monthlyWeekday: value, monthlyType: 'dayOfWeek' });
                          }}
                          options={[
                            { value: 'sunday', label: 'Sunday' },
                            { value: 'monday', label: 'Monday' },
                            { value: 'tuesday', label: 'Tuesday' },
                            { value: 'wednesday', label: 'Wednesday' },
                            { value: 'thursday', label: 'Thursday' },
                            { value: 'friday', label: 'Friday' },
                            { value: 'saturday', label: 'Saturday' }
                          ]}
                          className="w-40"
                        />
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm text-gray-700 pt-1">End</label>
                    <div className="flex items-center gap-2">
                      <CustomSelect
                        value={schedulerData.endType}
                        onChange={(value) => setSchedulerData({ ...schedulerData, endType: value })}
                        options={[
                          { value: 'never', label: 'Never' },
                          { value: 'on', label: 'On this day' },
                          { value: 'after', label: 'After' }
                        ]}
                        className="w-40"
                      />
                      {schedulerData.endType === 'on' && (
                        <Input
                          type="date"
                          value={schedulerData.endDate}
                          onChange={(e) => setSchedulerData({ ...schedulerData, endDate: e.target.value })}
                          className="h-7 flex-1"
                        />
                      )}
                      {schedulerData.endType === 'after' && (
                        <>
                          <Input
                            type="number"
                            min="1"
                            value={schedulerData.endAfterOccurrences}
                            onChange={(e) => setSchedulerData({ ...schedulerData, endAfterOccurrences: e.target.value })}
                            className="h-7 w-20"
                          />
                          <span className="text-sm text-gray-700">occurrence(s)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recurrence Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-gray-700">{getRecurrenceSummary()}</p>
                  </div>
                </div>
              )}

              {/* Yearly Options */}
              {schedulerData.repeatType === 'yearly' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm text-gray-700">Every</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={schedulerData.everyValue}
                        onChange={(e) => setSchedulerData({ ...schedulerData, everyValue: e.target.value })}
                        className="h-7 w-20"
                      />
                      <span className="text-sm text-gray-700">year(s)</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm text-gray-700">On</label>
                    <div className="flex items-center gap-2">
                      <CustomSelect
                        value={schedulerData.yearlyMonth}
                        onChange={(value) => setSchedulerData({ ...schedulerData, yearlyMonth: value })}
                        options={[
                          { value: 'january', label: 'January' },
                          { value: 'february', label: 'February' },
                          { value: 'march', label: 'March' },
                          { value: 'april', label: 'April' },
                          { value: 'may', label: 'May' },
                          { value: 'june', label: 'June' },
                          { value: 'july', label: 'July' },
                          { value: 'august', label: 'August' },
                          { value: 'september', label: 'September' },
                          { value: 'october', label: 'October' },
                          { value: 'november', label: 'November' },
                          { value: 'december', label: 'December' }
                        ]}
                        className="w-40"
                      />
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={schedulerData.yearlyDay}
                        onChange={(e) => setSchedulerData({ ...schedulerData, yearlyDay: e.target.value })}
                        className="h-7 w-20"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm text-gray-700 pt-1">End</label>
                    <div className="flex items-center gap-2">
                      <CustomSelect
                        value={schedulerData.endType}
                        onChange={(value) => setSchedulerData({ ...schedulerData, endType: value })}
                        options={[
                          { value: 'never', label: 'Never' },
                          { value: 'on', label: 'On this day' },
                          { value: 'after', label: 'After' }
                        ]}
                        className="w-40"
                      />
                      {schedulerData.endType === 'on' && (
                        <Input
                          type="date"
                          value={schedulerData.endDate}
                          onChange={(e) => setSchedulerData({ ...schedulerData, endDate: e.target.value })}
                          className="h-7 flex-1"
                        />
                      )}
                      {schedulerData.endType === 'after' && (
                        <>
                          <Input
                            type="number"
                            min="1"
                            value={schedulerData.endAfterOccurrences}
                            onChange={(e) => setSchedulerData({ ...schedulerData, endAfterOccurrences: e.target.value })}
                            className="h-7 w-20"
                          />
                          <span className="text-sm text-gray-700">occurrence(s)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recurrence Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-gray-700">{getRecurrenceSummary()}</p>
                  </div>
                </div>
              )}

              {/* Custom Options */}
              {schedulerData.repeatType === 'custom' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm text-gray-700">Every</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={schedulerData.customInterval}
                        onChange={(e) => setSchedulerData({ ...schedulerData, customInterval: e.target.value })}
                        className="h-7 w-20"
                      />
                      <CustomSelect
                        value={schedulerData.customFrequency}
                        onChange={(value) => setSchedulerData({ ...schedulerData, customFrequency: value })}
                        options={[
                          { value: 'days', label: 'Days' },
                          { value: 'weeks', label: 'Weeks' },
                          { value: 'months', label: 'Months' },
                          { value: 'years', label: 'Years' }
                        ]}
                        className="w-32"
                      />
                    </div>
                  </div>
                  
                  {schedulerData.customFrequency === 'weeks' && (
                    <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                      <label className="text-sm text-gray-700">On</label>
                      <div className="flex gap-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                          const dayValue = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index];
                          const isSelected = schedulerData.selectedDays.includes(dayValue);
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                const newDays = isSelected
                                  ? schedulerData.selectedDays.filter(d => d !== dayValue)
                                  : [...schedulerData.selectedDays, dayValue];
                                setSchedulerData({ ...schedulerData, selectedDays: newDays });
                              }}
                              className={`w-10 h-10 rounded-md font-medium text-sm transition-colors ${
                                isSelected
                                  ? 'bg-[#ff9800] text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm text-gray-700 pt-1">End</label>
                    <div className="flex items-center gap-2">
                      <CustomSelect
                        value={schedulerData.endType}
                        onChange={(value) => setSchedulerData({ ...schedulerData, endType: value })}
                        options={[
                          { value: 'never', label: 'Never' },
                          { value: 'on', label: 'On this day' },
                          { value: 'after', label: 'After' }
                        ]}
                        className="w-40"
                      />
                      {schedulerData.endType === 'on' && (
                        <Input
                          type="date"
                          value={schedulerData.endDate}
                          onChange={(e) => setSchedulerData({ ...schedulerData, endDate: e.target.value })}
                          className="h-7 flex-1"
                        />
                      )}
                      {schedulerData.endType === 'after' && (
                        <>
                          <Input
                            type="number"
                            min="1"
                            value={schedulerData.endAfterOccurrences}
                            onChange={(e) => setSchedulerData({ ...schedulerData, endAfterOccurrences: e.target.value })}
                            className="h-7 w-20"
                          />
                          <span className="text-sm text-gray-700">occurrence(s)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recurrence Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-gray-700">{getRecurrenceSummary()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ADVANCED OPTIONS */}
          <div>
            <h3 className="text-xs font-medium text-gray-700 mb-4 uppercase">Advanced Options</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px'}}>
              {/* Tethering */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-xs font-medium text-gray-600">Tethering</h4>
                  <InfoTooltip content="Tethering allows pricing updates to automatically apply to related locations, products, cars, or LORs that are linked together in your system configuration." />
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="tethered-locations-edit"
                      checked={schedulerData.submitRatesToTetheredLocations}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitRatesToTetheredLocations: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="tethered-locations-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit rates to tethered locations
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="tethered-products-edit"
                      checked={schedulerData.submitToTetheredProducts}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitToTetheredProducts: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="tethered-products-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit to tethered products
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="tethered-cars-edit"
                      checked={schedulerData.submitToTetheredCars}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitToTetheredCars: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="tethered-cars-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit to tethered cars
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="rates-different-edit"
                      checked={schedulerData.submitOnlyRatesDifferent}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitOnlyRatesDifferent: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="rates-different-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit only rates different from current rate
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="extra-hour-day-rates-edit"
                      checked={schedulerData.submitExtraHourAndDayRates}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitExtraHourAndDayRates: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="extra-hour-day-rates-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit extra hour and day rates
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="all-lors-edit"
                      checked={schedulerData.submitToAllLORs}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitToAllLORs: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="all-lors-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit to all LORs
                    </label>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-xs font-medium text-gray-600">Controls</h4>
                  <InfoTooltip content="General control settings for the scheduler behavior and overrides." />
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="schedule-active-edit"
                      checked={schedulerData.scheduleIsActive}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, scheduleIsActive: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="schedule-active-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Schedule is active
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="override-blocked-edit"
                      checked={schedulerData.overrideBlockedDates}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, overrideBlockedDates: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="override-blocked-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Override blocked dates
                    </label>
                  </div>
                </div>
              </div>

              {/* Incident Controls */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-xs font-medium text-gray-600">Incident Controls</h4>
                  <InfoTooltip content="Set up alerts to be notified if the scheduler stops responding or encounters issues." />
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="notify-email-edit"
                      checked={schedulerData.notifyEmailAfter}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, notifyEmailAfter: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="notify-email-edit" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Notify by email if scheduler doesn't respond after
                    </label>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={schedulerData.notifyEmailValue}
                        onChange={(e) => setSchedulerData({ ...schedulerData, notifyEmailValue: e.target.value })}
                        disabled={!schedulerData.notifyEmailAfter}
                        className="h-7 w-20"
                        placeholder="180"
                      />
                      <label className="text-xs text-[#666666]">mins*</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NOTIFICATION */}
          <div>
            <h3 className="text-xs font-medium text-gray-700 mb-4 uppercase">Notification</h3>
            <div>
              <label className="block text-xs text-[#666666] mb-1.5">Email Addresses</label>
              <Input
                value={schedulerData.emailAddresses}
                onChange={(e) => setSchedulerData({ ...schedulerData, emailAddresses: e.target.value })}
                placeholder="Enter email addresses separated by commas"
                className="h-7"
              />
            </div>
          </div>

        </div>

          <DrawerFooter className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-end gap-3 w-full">
              <CustomButton variant="outline" onClick={onClose}>
                Cancel
              </CustomButton>
              <CustomButton variant="primary" onClick={handleSave}>
                Update Scheduler
              </CustomButton>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
