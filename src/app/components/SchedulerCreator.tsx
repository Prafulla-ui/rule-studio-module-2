import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Download, FileEdit, FileSpreadsheet, Plus, X } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CustomSelect } from './CustomSelect';
import { MultiSelect } from './MultiSelect';
import { CustomButton } from './CustomButton';
import { InfoTooltip } from './InfoTooltip';
import { SchedulerImportDialog } from './SchedulerImportDialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import {
  parseMockExcelImport,
  type ImportSummary,
} from '../utils/schedulerImportValidation';

type CreationMethod = 'manual' | 'import';

function getInitialSchedulerData() {
  return {
    scheduleName: '',
    selectedSchedule: '',
    submissionType: '',
    pickupLocation: [] as string[],
    dropOffLocation: [] as string[],
    sameDropoff: false,
    productCode: [] as string[],
    carCode: [] as string[],
    lorCode: [] as string[],
    dataSource: [] as string[],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dateRangeType: 'fixed',
    fixedStartDate: '',
    fixedEndDate: '',
    daysOutValue: '1-10, 2-15, 3-20',
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
    submitRatesToTetheredLocations: true,
    submitToTetheredProducts: true,
    submitOnlyRatesDifferent: false,
    submitExtraHourAndDayRates: false,
    submitToTetheredCars: true,
    submitToAllLORs: false,
    scheduleIsActive: true,
    overrideBlockedDates: false,
    notifyEmailAfter: true,
    notifyEmailValue: '180',
    emailAddresses: '',
  };
}

function hasManualFormData(data: ReturnType<typeof getInitialSchedulerData>): boolean {
  return Boolean(
    data.scheduleName.trim() ||
    data.selectedSchedule ||
    data.submissionType ||
    data.pickupLocation.length > 0 ||
    data.dropOffLocation.length > 0 ||
    data.sameDropoff ||
    data.productCode.length > 0 ||
    data.carCode.length > 0 ||
    data.lorCode.length > 0 ||
    data.dataSource.length > 0 ||
    data.rateType !== 'baseRate' ||
    data.dateRangeType !== 'fixed' ||
    data.fixedStartDate ||
    data.fixedEndDate ||
    data.daysOutValue.trim() ||
    data.daysOfWeek.length > 0 ||
    data.pickupTime ||
    data.dropoffTime ||
    data.scheduleTime ||
    data.startDate ||
    data.repeatType !== 'doesNotRepeat' ||
    data.everyValue !== '1' ||
    data.selectedDays.length > 0 ||
    data.endType !== 'never' ||
    data.endDate ||
    data.endAfterOccurrences ||
    data.submitRatesToTetheredLocations ||
    data.submitToTetheredProducts ||
    data.submitOnlyRatesDifferent ||
    data.submitExtraHourAndDayRates ||
    data.submitToTetheredCars ||
    data.submitToAllLORs ||
    !data.scheduleIsActive ||
    data.overrideBlockedDates ||
    data.notifyEmailAfter ||
    data.emailAddresses.trim()
  );
}

interface SchedulerCreatorProps {
  onSave: (scheduler: any) => void;
  onCancel: () => void;
  onImportSave?: (schedulers: any[], summary: ImportSummary) => void;
  existingSchedulers?: any[];
}

export function SchedulerCreator({ onSave, onCancel, onImportSave, existingSchedulers = [] }: SchedulerCreatorProps) {
  const [schedulerData, setSchedulerData] = useState(getInitialSchedulerData);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>('manual');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [switchMethodDialogOpen, setSwitchMethodDialogOpen] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<CreationMethod | null>(null);
  const [pendingImportedSchedulers, setPendingImportedSchedulers] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importCancelDialogOpen, setImportCancelDialogOpen] = useState(false);

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

  const applyCreationMethod = (method: CreationMethod) => {
    setCreationMethod(method);
    if (method === 'manual') {
      setImportDialogOpen(false);
    }
  };

  const handleCreationMethodChange = (method: CreationMethod) => {
    if (method === creationMethod) return;
    if (
      creationMethod === 'manual' &&
      method === 'import' &&
      hasManualFormData(schedulerData)
    ) {
      setPendingMethod(method);
      setSwitchMethodDialogOpen(true);
      return;
    }
    applyCreationMethod(method);
  };

  const handleConfirmSwitchMethod = () => {
    if (pendingMethod) {
      setSchedulerData(getInitialSchedulerData());
      applyCreationMethod(pendingMethod);
    }
    setPendingMethod(null);
    setSwitchMethodDialogOpen(false);
  };

  const handleDownloadTemplate = () => {
    toast.info('Sample Excel template download will be available soon.');
  };

  const importCompleted = importSummary !== null && importSummary.created > 0;

  const handleImportFile = (file: File): ImportSummary | null => {
    const startId = existingSchedulers.length + 1;
    const { schedulers: imported, summary } = parseMockExcelImport(file, startId);
    setPendingImportedSchedulers(imported);
    setImportSummary(summary);
    return summary;
  };

  const handleImportSave = () => {
    if (!importCompleted || pendingImportedSchedulers.length === 0) return;
    if (onImportSave) {
      onImportSave(pendingImportedSchedulers, importSummary!);
    } else {
      toast.info('Import save is not configured');
      return;
    }

    setPendingImportedSchedulers([]);
    setImportSummary(null);
    setImportDialogOpen(false);
    onCancel();
  };

  const handleCancel = () => {
    if (creationMethod === 'import' && importCompleted) {
      setImportCancelDialogOpen(true);
      return;
    }
    onCancel();
  };

  const handleConfirmImportCancel = () => {
    setImportCancelDialogOpen(false);
    onCancel();
  };

  // Handle schedule selection and auto-fill
  const handleScheduleSelect = (scheduleId: string) => {
    const selectedScheduler = existingSchedulers.find(s => s.id === scheduleId);
    if (selectedScheduler) {
      // Auto-fill all fields from the selected schedule
      setSchedulerData({
        ...selectedScheduler,
        selectedSchedule: scheduleId,
        scheduleName: selectedScheduler.scheduleName || '',
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
    if (!schedulerData.scheduleName && !schedulerData.selectedSchedule) {
      toast.error('Please enter a schedule name or select a schedule');
      return;
    }
    onSave({ ...schedulerData, creationSource: 'manual', importStatus: null, importValidationErrors: [] });
    toast.success('Scheduler saved successfully');
  };

  const handleSubmit = () => {
    if (!schedulerData.scheduleName && !schedulerData.selectedSchedule) {
      toast.error('Please enter a schedule name or select a schedule');
      return;
    }
    onSave(schedulerData);
    toast.success('Scheduler submitted successfully');
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-center relative">
            {/* Left - Back Button */}
            <button
              onClick={handleCancel}
              className="absolute left-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>

            {/* Center - Title */}
            <h1 className="text-lg text-[#2c3e50] font-semibold">Create Scheduler</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden m-6">
          {/* Scheduler Configuration */}
          <div className="p-6 space-y-6">
          {/* CREATION METHOD SELECTOR */}
          <div className="rounded-lg border border-gray-200 bg-[#f8f9fa] p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#2c3e50]">
                How do you want to create this scheduler?
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select one option below. Only the chosen method will be used.
              </p>
            </div>
            <RadioGroup
              value={creationMethod}
              onValueChange={(value) => handleCreationMethodChange(value as CreationMethod)}
              aria-label="Scheduler creation method"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <label
                htmlFor="creation-method-manual"
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                  creationMethod === 'manual'
                    ? 'border-[#ff9800] bg-white shadow-md ring-2 ring-[#ff9800]/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                }`}
              >
                <RadioGroupItem
                  value="manual"
                  id="creation-method-manual"
                  className="shrink-0"
                />
                <div
                  className={`rounded-lg p-2.5 shrink-0 ${
                    creationMethod === 'manual' ? 'bg-[#ff9800] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FileEdit className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#2c3e50]">Create manually</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Fill in scheduler details using the form below
                  </p>
                </div>
              </label>
              <label
                htmlFor="creation-method-import"
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                  creationMethod === 'import'
                    ? 'border-[#ff9800] bg-white shadow-md ring-2 ring-[#ff9800]/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                }`}
              >
                <RadioGroupItem
                  value="import"
                  id="creation-method-import"
                  className="shrink-0"
                />
                <div
                  className={`rounded-lg p-2.5 shrink-0 ${
                    creationMethod === 'import' ? 'bg-[#ff9800] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#2c3e50]">Import from Excel</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Use a completed .xlsx template
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {creationMethod === 'import' && (
            <div className="bg-[#f8f9fa] rounded-lg border border-gray-200 p-8">
              <div className="max-w-lg mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center rounded-full bg-orange-100 p-3">
                    <FileSpreadsheet className="h-8 w-8 text-[#ff9800]" />
                  </div>
                  <h3 className="text-base font-medium text-[#2c3e50]">Import schedulers from Excel</h3>
                </div>

                <div className="max-w-sm mx-auto w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5">
                  <p className="text-xs font-medium text-gray-700 mb-2.5">Before you import</p>
                  <ul className="space-y-2 text-xs text-gray-600 list-disc list-inside leading-relaxed marker:text-[#ff9800]">
                    <li>File must be in .xlsx format (max 25 MB)</li>
                    <li>Details worksheet is mandatory</li>
                    <li>Do not change the template structure</li>
                    <li>Validation and import summaries shown after upload</li>
                  </ul>
                </div>

                <div className="max-w-sm mx-auto w-full flex flex-col items-center gap-3 pt-4 border-t border-gray-200">
                  <CustomButton
                    variant="primary"
                    size="md"
                    onClick={() => setImportDialogOpen(true)}
                    className="w-full"
                  >
                    Select Excel file
                  </CustomButton>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1.5 text-xs text-[#ff9800] hover:text-[#f57c00] transition-colors underline-offset-2 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download sample template
                  </button>
                  <p className="text-[11px] text-gray-400 text-center">
                    Use the sample template to prepare your file.
                  </p>
                </div>
              </div>
            </div>
          )}

          {creationMethod === 'manual' && (
          <>
          {/* SCHEDULER INFORMATION */}
          <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-[#2c3e50] text-base font-medium">Scheduler Information</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Schedule Name <span className="text-red-500">*</span></label>
                <Input
                  value={schedulerData.scheduleName}
                  onChange={(e) => setSchedulerData({ ...schedulerData, scheduleName: e.target.value })}
                  placeholder="Enter schedule name"
                  className="h-7"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Select Schedule</label>
                <CustomSelect
                  value={schedulerData.selectedSchedule}
                  onChange={handleScheduleSelect}
                  options={existingSchedulers.map(scheduler => ({
                    value: scheduler.id,
                    label: scheduler.scheduleName || `Schedule ${scheduler.id}`
                  }))}
                  placeholder={existingSchedulers.length === 0 ? "No schedules available" : "Choose a schedule"}
                  disabled={existingSchedulers.length === 0}
                />
                <p className="text-[11px] text-[#666666] mt-1">
                  (Load a predefined schedule template to auto-fill details)
                </p>
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Submission Type <span className="text-red-500">*</span></label>
                <CustomSelect
                  value={schedulerData.submissionType}
                  onChange={(value) => setSchedulerData({ ...schedulerData, submissionType: value })}
                  options={[
                    { value: 'Automatic', label: 'Automatic' },
                    { value: 'Manual', label: 'Manual' }
                  ]}
                />
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
                <label className="block text-xs text-[#666666] mb-1.5">Pickup Location <span className="text-red-500">*</span></label>
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
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Drop-off Location <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.sameDropoff ? schedulerData.pickupLocation : schedulerData.dropOffLocation}
                  onChange={(value) => setSchedulerData({ ...schedulerData, dropOffLocation: value })}
                  options={['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']}
                  placeholder="Select drop-off locations"
                  disabled={schedulerData.sameDropoff}
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="same-dropoff"
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
                  <label htmlFor="same-dropoff" className="text-xs text-gray-700 cursor-pointer">
                    same drop off
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Product Code <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.productCode}
                  onChange={(value) => setSchedulerData({ ...schedulerData, productCode: value })}
                  options={['AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM']}
                  placeholder="Select product codes"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">Car Code <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.carCode}
                  onChange={(value) => setSchedulerData({ ...schedulerData, carCode: value })}
                  options={['ECAR', 'CCAR', 'ICAR', 'SCAR', 'FCAR', 'PCAR', 'MCAR', 'LCAR', 'XCAR', 'RCAR']}
                  placeholder="Select car codes"
                />
              </div>
              <div>
                <label className="block text-xs text-[#666666] mb-1.5">LOR <span className="text-red-500">*</span></label>
                <MultiSelect
                  value={schedulerData.lorCode}
                  onChange={(value) => setSchedulerData({ ...schedulerData, lorCode: value })}
                  options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '14', '21', '28']}
                  placeholder="Select LOR codes"
                />
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
                      id="base-rate-radio"
                      className="border-[#ff9800] text-[#ff9800]" 
                    />
                    <label htmlFor="base-rate-radio" className="text-sm text-gray-700 cursor-pointer">
                      Base Rate
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 ml-6 mt-0.5">(Rental rate before taxes, fees, and additional charges)</p>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="finalRate" 
                      id="final-rate-radio"
                      className="border-[#ff9800] text-[#ff9800]" 
                    />
                    <label htmlFor="final-rate-radio" className="text-sm text-gray-700 cursor-pointer">
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
              {/* Radio Buttons for Fixed and Days Out */}
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
              
              {/* Conditional Fields based on selected radio button */}
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
                  <Input
                    type="time"
                    value={schedulerData.pickupTime}
                    onChange={(e) => setSchedulerData({ ...schedulerData, pickupTime: e.target.value })}
                    placeholder="HH:MM"
                    className="h-7"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666666] mb-1.5">Dropoff Time</label>
                  <Input
                    type="time"
                    value={schedulerData.dropoffTime}
                    onChange={(e) => setSchedulerData({ ...schedulerData, dropoffTime: e.target.value })}
                    placeholder="HH:MM"
                    className="h-7"
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
                        <RadioGroupItem value="dayOfMonth" id="day-of-month" className="border-[#ff9800] text-[#ff9800]" />
                        <label htmlFor="day-of-month" className="text-sm text-gray-700">Day</label>
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
                        <RadioGroupItem value="dayOfWeek" id="day-of-week" className="border-[#ff9800] text-[#ff9800]" />
                        <label htmlFor="day-of-week" className="text-sm text-gray-700">The</label>
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
                      id="tethered-locations"
                      checked={schedulerData.submitRatesToTetheredLocations}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitRatesToTetheredLocations: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="tethered-locations" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit rates to tethered locations
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="tethered-products"
                      checked={schedulerData.submitToTetheredProducts}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitToTetheredProducts: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="tethered-products" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit to tethered products
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="tethered-cars"
                      checked={schedulerData.submitToTetheredCars}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitToTetheredCars: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="tethered-cars" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit to tethered cars
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="rates-different"
                      checked={schedulerData.submitOnlyRatesDifferent}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitOnlyRatesDifferent: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="rates-different" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit only rates different from current rate
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="extra-hour-day-rates"
                      checked={schedulerData.submitExtraHourAndDayRates}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitExtraHourAndDayRates: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="extra-hour-day-rates" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Submit extra hour and day rates
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="all-lors"
                      checked={schedulerData.submitToAllLORs}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, submitToAllLORs: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="all-lors" className="text-xs text-gray-700 cursor-pointer leading-tight">
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
                      id="schedule-active"
                      checked={schedulerData.scheduleIsActive}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, scheduleIsActive: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="schedule-active" className="text-xs text-gray-700 cursor-pointer leading-tight">
                      Schedule is active
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="override-blocked"
                      checked={schedulerData.overrideBlockedDates}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, overrideBlockedDates: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="override-blocked" className="text-xs text-gray-700 cursor-pointer leading-tight">
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
                      id="notify-email"
                      checked={schedulerData.notifyEmailAfter}
                      onCheckedChange={(checked) => setSchedulerData({ ...schedulerData, notifyEmailAfter: checked as boolean })}
                      className="border-[#ff9800] data-[state=checked]:bg-[#ff9800] mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="notify-email" className="text-xs text-gray-700 cursor-pointer leading-tight">
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
              <Textarea
                value={schedulerData.emailAddresses}
                onChange={(e) => setSchedulerData({ ...schedulerData, emailAddresses: e.target.value })}
                placeholder="Enter email addresses separated by commas"
                className="min-h-[80px]"
              />
            </div>
          </div>

          </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <CustomButton onClick={handleCancel} variant="outline" size="md">
              Cancel
            </CustomButton>
            {creationMethod === 'manual' ? (
              <CustomButton onClick={handleSave} variant="primary" size="md">
                Save
              </CustomButton>
            ) : !importDialogOpen ? (
              <CustomButton
                onClick={handleImportSave}
                variant="primary"
                size="md"
                disabled={!importCompleted}
                title={!importCompleted ? 'Import a file before saving' : undefined}
              >
                Save
              </CustomButton>
            ) : null}
          </div>
          </div>
        </div>
      </div>

      <SchedulerImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportFile}
        onSave={handleImportSave}
      />

      <AlertDialog open={importCancelDialogOpen} onOpenChange={setImportCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave import screen?</AlertDialogTitle>
            <AlertDialogDescription>
              Leave without saving? Imported schedulers will not be added to the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <CustomButton variant="secondary" onClick={() => setImportCancelDialogOpen(false)}>
              Stay
            </CustomButton>
            <CustomButton variant="primary" onClick={handleConfirmImportCancel}>
              Leave
            </CustomButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={switchMethodDialogOpen} onOpenChange={setSwitchMethodDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch creation method?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching will discard unsaved form entries. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <CustomButton
              variant="secondary"
              onClick={() => {
                setPendingMethod(null);
                setSwitchMethodDialogOpen(false);
              }}
            >
              Stay on manual
            </CustomButton>
            <CustomButton variant="primary" onClick={handleConfirmSwitchMethod}>
              Continue
            </CustomButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
