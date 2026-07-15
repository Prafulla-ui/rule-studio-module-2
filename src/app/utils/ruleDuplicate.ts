import { DEFAULT_DEFINE_RULE_ATTRIBUTES } from '../constants/ruleDefineOptions';
import { hydrateRuleForForm } from './ruleFormHydration';

const MAX_RULE_NAME_LENGTH = 120;

function deepClone<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }
  return structuredClone(value);
}

export function generateDuplicateRuleName(
  sourceName: string,
  existingNames: string[]
): string {
  const normalizedExisting = new Set(
    existingNames.map((name) => name.trim().toLowerCase())
  );

  const buildCandidate = (suffix: string) => {
    const suffixText = suffix ? ` ${suffix}` : '';
    const maxBaseLength = MAX_RULE_NAME_LENGTH - suffixText.length;
    const baseName =
      sourceName.length > maxBaseLength
        ? sourceName.slice(0, Math.max(0, maxBaseLength)).trimEnd()
        : sourceName;
    return `${baseName}${suffixText}`;
  };

  const firstCandidate = buildCandidate('(Copy)');
  if (!normalizedExisting.has(firstCandidate.trim().toLowerCase())) {
    return firstCandidate;
  }

  let copyIndex = 2;
  while (copyIndex < 1000) {
    const candidate = buildCandidate(`(Copy ${copyIndex})`);
    if (!normalizedExisting.has(candidate.trim().toLowerCase())) {
      return candidate;
    }
    copyIndex += 1;
  }

  return buildCandidate(`(Copy ${Date.now()})`);
}

export function hasRuleDefinitionConfig(rule: Record<string, unknown>): boolean {
  return Boolean(
    (Array.isArray(rule.firstConditions) && rule.firstConditions.length > 0) ||
      (Array.isArray(rule.conditionalRules) && rule.conditionalRules.length > 0)
  );
}

export function hasCopiedSchedule(rule: Record<string, unknown>): boolean {
  const schedule = typeof rule.schedule === 'string' ? rule.schedule.trim() : '';
  if (!schedule || schedule === 'Not scheduled') {
    return false;
  }

  if (rule.scheduleData && typeof rule.scheduleData === 'object') {
    const scheduleData = rule.scheduleData as Record<string, unknown>;
    return Boolean(scheduleData.startDate && scheduleData.startTime);
  }

  return true;
}

export function deriveStatusFromSchedule(
  schedule: string | undefined,
  scheduleData?: Record<string, unknown>
): 'scheduled' | 'draft' {
  if (scheduleData?.startDate && scheduleData?.startTime) {
    return 'scheduled';
  }

  const normalizedSchedule = schedule?.trim();
  if (normalizedSchedule && normalizedSchedule !== 'Not scheduled') {
    return 'scheduled';
  }

  return 'draft';
}

function normalizeFirstConditions(rule: Record<string, unknown>) {
  if (Array.isArray(rule.firstConditions) && rule.firstConditions.length > 0) {
    return deepClone(rule.firstConditions);
  }

  return [
    {
      enabled: true,
      leftMinMax: 'Min',
      leftOptions: [] as string[],
      leftValue: '',
      operator: 'Less or Equal',
      rightMinMax: 'Min',
      rightOptions: [] as string[],
      rightValue: '',
    },
  ];
}

function normalizeConditionalRules(rule: Record<string, unknown>) {
  const defaultRule = {
    enabled: true,
    type: 'if',
    mainCondition: {
      type: 'Utilization',
      operator: 'Less than',
      value: '',
      valueEnd: '',
      unit: '%',
      utilizationType: 'Actual',
    },
    subConditions: [
      {
        connector: 'And',
        type: 'Days out',
        dateRangeType: 'daysOut',
        operator: 'Less than or equal to',
        value: '',
        valueEnd: '',
        unit: 'days',
        pickupStartDate: '',
        pickupEndDate: '',
      },
    ],
    actions: [],
    selectedDays: [] as string[],
    valueDetails: {
      value: '',
      priceEndsWith: '',
    },
    currentPriceDetails: {
      currentPrice: '',
      currentPriceUnit: '$',
      byFix: 'Lower',
      min: 'Min',
      minMaxOptions: [] as string[],
      minMaxValue: '',
      minMaxValueUnit: '%',
      minMaxOperators: '',
      minMaxOperatorsUnit: '%',
      priceEndsWith: '',
      priceEndsWithUnit: '%',
    },
    vendorPriceDetails: {
      currentPrice: '',
      currentPriceUnit: '$',
      byFix: 'Lower',
      min: 'Min',
      minMaxOptions: [] as string[],
      minMaxValue: '',
      minMaxValueUnit: '%',
      minMaxOperators: '',
      minMaxOperatorsUnit: '%',
      priceEndsWith: '',
      priceEndsWithUnit: '%',
      butNoInputValue: '',
      butNoCheckbox: false,
    },
  };

  if (!Array.isArray(rule.conditionalRules) || rule.conditionalRules.length === 0) {
    return [defaultRule];
  }

  return deepClone(rule.conditionalRules).map((conditionalRule: Record<string, unknown>) => ({
    ...conditionalRule,
    subConditions: (Array.isArray(conditionalRule.subConditions)
      ? conditionalRule.subConditions
      : []
    ).map((subCondition: Record<string, unknown>) => ({
      ...subCondition,
      dateRangeType: subCondition.dateRangeType || 'daysOut',
      pickupStartDate: subCondition.pickupStartDate || '',
      pickupEndDate: subCondition.pickupEndDate || '',
    })),
    valueDetails: conditionalRule.valueDetails || {
      value: '',
      priceEndsWith: '',
    },
    currentPriceDetails: conditionalRule.currentPriceDetails || {
      currentPrice: '',
      currentPriceUnit: '$',
      byFix: 'Lower',
      min: 'Min',
      minMaxOperators: '',
      minMaxOperatorsUnit: '%',
      priceEndsWith: '',
      priceEndsWithUnit: '%',
    },
    vendorPriceDetails: conditionalRule.vendorPriceDetails || {
      currentPrice: '',
      currentPriceUnit: '$',
      byFix: 'Lower',
      min: 'Min',
      minMaxOptions: [],
      minMaxValue: '',
      minMaxValueUnit: '%',
      minMaxOperators: '',
      minMaxOperatorsUnit: '%',
      priceEndsWith: '',
      priceEndsWithUnit: '%',
      butNoInputValue: '',
      butNoCheckbox: false,
    },
  }));
}

export function buildDuplicateFormState(
  sourceRule: Record<string, unknown>,
  duplicateName: string
) {
  const rule = hydrateRuleForForm(sourceRule as Record<string, any>);
  const locations = Array.isArray(rule.locations)
    ? deepClone(rule.locations)
    : rule.location
      ? [String(rule.location)]
      : ['All'];

  const productTypes = Array.isArray(rule.productTypes)
    ? deepClone(rule.productTypes)
    : rule.productType
      ? [String(rule.productType)]
      : [];

  const fleetTypes = Array.isArray(rule.fleetTypes)
    ? deepClone(rule.fleetTypes)
    : [];

  const schedule =
    typeof rule.schedule === 'string' && rule.schedule.trim()
      ? rule.schedule
      : 'Not scheduled';

  const scheduleData = rule.scheduleData
    ? deepClone(rule.scheduleData)
    : undefined;

  return {
    name: duplicateName,
    description: typeof rule.description === 'string' ? rule.description : '',
    brand: rule.brand || '',
    pickupLocation: Array.isArray(rule.pickupLocation) ? deepClone(rule.pickupLocation) : locations,
    sameDropoff: rule.sameDropoff ?? true,
    dropOffLocation: Array.isArray(rule.dropOffLocation)
      ? deepClone(rule.dropOffLocation)
      : Array.isArray(rule.pickupLocation)
        ? deepClone(rule.pickupLocation)
        : locations,
    productCode: rule.productCode || productTypes[0] || '',
    lor: Array.isArray(rule.lor) && rule.lor.length
      ? deepClone(rule.lor)
      : Array.isArray(rule.lors) && rule.lors.length
        ? deepClone(rule.lors)
        : DEFAULT_DEFINE_RULE_ATTRIBUTES.lor,
    carCode: Array.isArray(rule.carCode) ? deepClone(rule.carCode) : fleetTypes,
    locations,
    productTypes,
    lors: Array.isArray(rule.lors) && rule.lors.length
      ? deepClone(rule.lors)
      : Array.isArray(rule.lor) && rule.lor.length
        ? deepClone(rule.lor)
        : DEFAULT_DEFINE_RULE_ATTRIBUTES.lor,
    fleetTypes,
    firstConditions: normalizeFirstConditions(rule),
    conditionalRules: normalizeConditionalRules(rule),
    elseCondition: rule.elseCondition
      ? deepClone(rule.elseCondition)
      : {
          enabled: false,
          action: { type: '', value: '', valueType: 'percentage' },
        },
    schedule,
    scheduleData,
    hasFullConfig: hasRuleDefinitionConfig(rule),
    hasCopiedSchedule: hasCopiedSchedule(rule),
  };
}

export function isDuplicateNameTaken(
  name: string,
  existingNames: string[]
): boolean {
  const normalized = name.trim().toLowerCase();
  return existingNames.some(
    (existingName) => existingName.trim().toLowerCase() === normalized
  );
}

export interface DefineRuleComparisonValues {
  brand: string;
  pickupLocation: string[];
  sameDropoff: boolean;
  dropOffLocation: string[];
  productCode: string;
  lor: string[];
  carCode: string[];
}

function sortStrings(values: string[]) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}

export function extractDefineRuleComparisonValues(
  rule: Record<string, any>
): DefineRuleComparisonValues {
  const pickupLocation = rule.pickupLocation?.length
    ? [...rule.pickupLocation]
    : rule.locations?.length
      ? [...rule.locations]
      : [];

  const sameDropoff = rule.sameDropoff ?? true;
  const lor = rule.lor?.length
    ? [...rule.lor]
    : rule.lors?.length
      ? [...rule.lors]
      : [];
  const carCode = rule.carCode?.length
    ? [...rule.carCode]
    : rule.fleetTypes?.length
      ? [...rule.fleetTypes]
      : [];

  const dropOffLocation = sameDropoff
    ? pickupLocation
    : rule.dropOffLocation?.length
      ? [...rule.dropOffLocation]
      : [];

  return {
    brand: rule.brand || '',
    pickupLocation: sortStrings(pickupLocation),
    sameDropoff,
    dropOffLocation: sortStrings(dropOffLocation),
    productCode: rule.productCode || rule.productTypes?.[0] || '',
    lor: sortStrings(lor),
    carCode: sortStrings(carCode),
  };
}

export function isDefineRuleUnchanged(
  sourceRule: Record<string, any>,
  currentRule: Record<string, any>
): boolean {
  const source = extractDefineRuleComparisonValues(sourceRule);
  const current = extractDefineRuleComparisonValues(currentRule);

  return (
    source.brand === current.brand &&
    source.sameDropoff === current.sameDropoff &&
    source.productCode === current.productCode &&
    arraysEqual(source.pickupLocation, current.pickupLocation) &&
    arraysEqual(source.dropOffLocation, current.dropOffLocation) &&
    arraysEqual(source.lor, current.lor) &&
    arraysEqual(source.carCode, current.carCode)
  );
}
