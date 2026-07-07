export type ImportStatus = 'complete' | 'needs_attention' | null;

export type ImportSummary = {
  created: number;
  needsAttention: number;
  skipped: number;
  rowDetails: {
    name: string;
    status: 'complete' | 'needs_attention' | 'skipped';
    message?: string;
  }[];
};

export type ImportValidationResult = {
  importStatus: ImportStatus;
  errors: string[];
  fieldErrors: Record<string, string>;
};

const DATE_PATTERN = /^\d{2}-[A-Za-z]{3}-\d{4}$/;
const TIME_24H_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;
const TIME_12H_PATTERN = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM|am|pm)$/;

function hasValues(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

export function validateImportedScheduler(data: Record<string, unknown>): ImportValidationResult {
  const fieldErrors: Record<string, string> = {};
  const errors: string[] = [];

  const requireField = (field: string, label: string) => {
    if (!hasValues(data[field])) {
      fieldErrors[field] = `Missing: ${label}`;
      errors.push(`Missing: ${label}`);
    }
  };

  requireField('scheduleName', 'Schedule Name');
  requireField('submissionType', 'Submission Type');
  requireField('pickupLocation', 'Pickup Location');
  requireField('dropOffLocation', 'Drop-off Location');
  requireField('productCode', 'Product Code');
  requireField('carCode', 'Car Code');
  requireField('lorCode', 'LOR');
  requireField('daysOfWeek', 'Days of Week');
  requireField('scheduleTime', 'Schedule Time');

  const dateRangeType = data.dateRangeType as string | undefined;
  if (dateRangeType === 'fixed') {
    if (!hasValues(data.fixedStartDate)) {
      fieldErrors.fixedStartDate = 'Missing: Fixed start date';
      errors.push('Missing: Fixed start date');
    }
    if (!hasValues(data.fixedEndDate)) {
      fieldErrors.fixedEndDate = 'Missing: Fixed end date';
      errors.push('Missing: Fixed end date');
    }
    if (hasValues(data.fixedStartDate) && !DATE_PATTERN.test(String(data.fixedStartDate))) {
      fieldErrors.fixedStartDate = 'Invalid date format (use dd-Mmm-YYYY)';
      errors.push('Invalid fixed start date format');
    }
    if (hasValues(data.fixedEndDate) && !DATE_PATTERN.test(String(data.fixedEndDate))) {
      fieldErrors.fixedEndDate = 'Invalid date format (use dd-Mmm-YYYY)';
      errors.push('Invalid fixed end date format');
    }
  } else if (dateRangeType === 'daysOut') {
    if (!hasValues(data.daysOutValue)) {
      fieldErrors.daysOutValue = 'Missing: Days Out value';
      errors.push('Missing: Days Out value');
    }
  } else {
    fieldErrors.dateRangeType = 'Missing: Date range configuration';
    errors.push('Missing: Date range configuration');
  }

  if (hasValues(data.scheduleTime) && !TIME_24H_PATTERN.test(String(data.scheduleTime))) {
    fieldErrors.scheduleTime = 'Generation Time must be 24-hour format (e.g., 18:30)';
    errors.push('Invalid Generation Time format');
  }

  if (hasValues(data.pickupTime) && !TIME_12H_PATTERN.test(String(data.pickupTime))) {
    fieldErrors.pickupTime = 'Pickup time must be 12-hour format with AM/PM';
    errors.push('Invalid pickup time format');
  }

  if (hasValues(data.dropoffTime) && !TIME_12H_PATTERN.test(String(data.dropoffTime))) {
    fieldErrors.dropoffTime = 'Dropoff time must be 12-hour format with AM/PM';
    errors.push('Invalid dropoff time format');
  }

  const uniqueErrors = [...new Set(errors)];
  return {
    importStatus: uniqueErrors.length > 0 ? 'needs_attention' : 'complete',
    errors: uniqueErrors,
    fieldErrors,
  };
}

export function applyImportValidation<T extends Record<string, unknown>>(scheduler: T): T {
  const validation = validateImportedScheduler(scheduler);
  return {
    ...scheduler,
    importStatus: validation.importStatus,
    importValidationErrors: validation.errors,
    importFieldErrors: validation.fieldErrors,
  };
}

function buildMockScheduler(
  id: string,
  overrides: Record<string, unknown>,
  fileName: string
) {
  const base = {
    id,
    selectedSchedule: '',
    sameDropoff: false,
    dataSource: ['Amadeus'],
    getRateShoppedData: true,
    rateType: 'baseRate',
    dateRangeType: 'fixed',
    fixedStartDate: '01-Jan-2026',
    fixedEndDate: '31-Dec-2026',
    daysOutValue: '',
    pickupTime: '09:30 AM',
    dropoffTime: '05:30 PM',
    scheduleTime: '18:30',
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
    submitRatesToTetheredLocations: false,
    submitToTetheredProducts: false,
    submitOnlyRatesDifferent: false,
    submitExtraHourAndDayRates: false,
    submitToTetheredCars: false,
    submitToAllLORs: false,
    scheduleIsActive: true,
    overrideBlockedDates: false,
    notifyEmailAfter: false,
    notifyEmailValue: '180',
    emailAddresses: '',
    creationSource: 'excel' as const,
    importedAt: new Date().toISOString(),
    importFileName: fileName,
    createdDate: new Date().toISOString().split('T')[0],
  };

  return applyImportValidation({ ...base, ...overrides });
}

/** Mock Excel import until real .xlsx parsing is available */
export function parseMockExcelImport(file: File, startId: number): {
  schedulers: Record<string, unknown>[];
  summary: ImportSummary;
} {
  const baseName = file.name.replace(/\.xlsx$/i, '') || 'Import';

  const completeScheduler = buildMockScheduler(String(startId), {
    scheduleName: `${baseName}_Complete`,
    submissionType: 'Automatic',
    pickupLocation: ['New York'],
    dropOffLocation: ['New York'],
    productCode: ['AD'],
    carCode: ['ECAR'],
    lorCode: ['7'],
    daysOfWeek: ['Mon', 'Wed', 'Fri'],
  }, file.name);

  const incompleteScheduler = buildMockScheduler(String(startId + 1), {
    scheduleName: `${baseName}_NeedsReview`,
    submissionType: '',
    pickupLocation: ['Chicago'],
    dropOffLocation: ['Chicago'],
    productCode: ['AE'],
    carCode: ['CCAR'],
    lorCode: [],
    daysOfWeek: ['Tue'],
    scheduleTime: '',
    fixedStartDate: '',
    fixedEndDate: '',
  }, file.name);

  const rowDetails: ImportSummary['rowDetails'] = [
    {
      name: String(completeScheduler.scheduleName),
      status: completeScheduler.importStatus === 'needs_attention' ? 'needs_attention' : 'complete',
    },
    {
      name: String(incompleteScheduler.scheduleName),
      status: 'needs_attention',
      message: incompleteScheduler.importValidationErrors?.slice(0, 2).join('; '),
    },
    {
      name: 'Row 4 (invalid format)',
      status: 'skipped',
      message: 'Invalid date format in Details worksheet',
    },
  ];

  const summary: ImportSummary = {
    created: 2,
    needsAttention: incompleteScheduler.importStatus === 'needs_attention' ? 1 : 0,
    skipped: 1,
    rowDetails,
  };

  if (completeScheduler.importStatus === 'needs_attention') {
    summary.needsAttention += 1;
  }

  return {
    schedulers: [completeScheduler, incompleteScheduler],
    summary,
  };
}

export function getDataStatusLabel(importStatus: ImportStatus): string | null {
  if (importStatus === 'needs_attention') return 'Needs attention';
  return null;
}

export function fieldHasImportError(
  fieldErrors: Record<string, string> | undefined,
  field: string
): boolean {
  return Boolean(fieldErrors?.[field]);
}

export function getImportFieldError(
  fieldErrors: Record<string, string> | undefined,
  field: string
): string | undefined {
  return fieldErrors?.[field];
}

export function importFieldClassName(
  fieldErrors: Record<string, string> | undefined,
  field: string,
  base = 'h-7'
): string {
  return fieldHasImportError(fieldErrors, field)
    ? `${base} border-amber-400 focus-visible:ring-amber-400`
    : base;
}
