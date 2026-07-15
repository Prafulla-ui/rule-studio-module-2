import { sampleRules } from '../data/sampleRules';
import {
  DEFAULT_DEFINE_RULE_ATTRIBUTES,
  RULE_CAR_CODE_OPTIONS,
} from '../constants/ruleDefineOptions';

const ALL_FLEET_TYPES = ['Compact', 'Sedan', 'SUV', 'XUV', 'Luxury', 'Sports', 'Van'];

const defaultFirstCondition = {
  enabled: true,
  leftMinMax: 'Min',
  leftOptions: ['Hertz', 'Budget'],
  leftValue: '10',
  operator: 'Less or Equal',
  rightMinMax: 'Min',
  rightOptions: ['National', 'Alamo'],
  rightValue: '12',
};

const defaultConditionalRule = {
  enabled: true,
  type: 'if',
  mainCondition: {
    type: 'Utilization',
    operator: 'Range',
    value: '60',
    valueEnd: '75',
    unit: '%',
    utilizationType: 'Actual',
  },
  subConditions: [
    {
      connector: 'And',
      type: 'Days out',
      dateRangeType: 'daysOut',
      operator: 'Range',
      value: '1',
      valueEnd: '7',
      unit: 'days',
      pickupStartDate: '',
      pickupEndDate: '',
    },
  ],
  actions: ['Vendor Price'],
  selectedDays: [] as string[],
  valueDetails: { value: '5', priceEndsWith: '9' },
  currentPriceDetails: {
    currentPrice: '10',
    currentPriceUnit: '$',
    byFix: 'Lower',
    min: 'Min',
    minMaxOptions: [] as string[],
    minMaxValue: '3',
    minMaxValueUnit: '%',
    minMaxOperators: '',
    minMaxOperatorsUnit: '%',
    priceEndsWith: '',
    priceEndsWithUnit: '%',
  },
  vendorPriceDetails: {
    currentPrice: '8',
    currentPriceUnit: '$',
    byFix: 'Lower',
    min: 'Min',
    minMaxOptions: ['Hertz', 'Avis'] as string[],
    minMaxValue: '2',
    minMaxValueUnit: '%',
    minMaxOperators: 'Less or Equal',
    minMaxOperatorsUnit: '%',
    priceEndsWith: '5',
    priceEndsWithUnit: '%',
    butNoInputValue: '',
    butNoCheckbox: false,
  },
};

function normalizeFirstConditions(conditions: any[] | undefined) {
  const source = conditions?.length ? conditions : [defaultFirstCondition];
  return source.map((condition) => ({
    ...defaultFirstCondition,
    ...condition,
    enabled: condition.enabled ?? true,
    leftOptions:
      condition.leftOptions?.length > 0
        ? condition.leftOptions
        : defaultFirstCondition.leftOptions,
    rightOptions:
      condition.rightOptions?.length > 0
        ? condition.rightOptions
        : defaultFirstCondition.rightOptions,
    leftValue: condition.leftValue || defaultFirstCondition.leftValue,
    rightValue: condition.rightValue || defaultFirstCondition.rightValue,
  }));
}

function normalizeConditionalRules(rules: any[] | undefined) {
  const source = rules?.length ? rules : [defaultConditionalRule];
  return source.map((rule) => ({
    ...defaultConditionalRule,
    ...rule,
    enabled: rule.enabled ?? true,
    actions: rule.actions?.length ? rule.actions : ['Vendor Price'],
    mainCondition: {
      ...defaultConditionalRule.mainCondition,
      ...(rule.mainCondition || {}),
      utilizationType: rule.mainCondition?.utilizationType || 'Actual',
      value: rule.mainCondition?.value || defaultConditionalRule.mainCondition.value,
      valueEnd:
        rule.mainCondition?.valueEnd ||
        rule.mainCondition?.value ||
        defaultConditionalRule.mainCondition.valueEnd,
    },
    subConditions: (rule.subConditions?.length ? rule.subConditions : defaultConditionalRule.subConditions).map(
      (subCondition: any) => ({
        ...defaultConditionalRule.subConditions[0],
        ...subCondition,
        dateRangeType: subCondition.dateRangeType || 'daysOut',
        value: subCondition.value || defaultConditionalRule.subConditions[0].value,
        valueEnd:
          subCondition.valueEnd ||
          subCondition.value ||
          defaultConditionalRule.subConditions[0].valueEnd,
        pickupStartDate: subCondition.pickupStartDate || '',
        pickupEndDate: subCondition.pickupEndDate || '',
      })
    ),
    valueDetails: {
      ...defaultConditionalRule.valueDetails,
      ...(rule.valueDetails || {}),
      value: rule.valueDetails?.value || defaultConditionalRule.valueDetails.value,
    },
    currentPriceDetails: {
      ...defaultConditionalRule.currentPriceDetails,
      ...(rule.currentPriceDetails || {}),
    },
    vendorPriceDetails: {
      ...defaultConditionalRule.vendorPriceDetails,
      ...(rule.vendorPriceDetails || {}),
      minMaxOptions:
        rule.vendorPriceDetails?.minMaxOptions?.length > 0
          ? rule.vendorPriceDetails.minMaxOptions
          : defaultConditionalRule.vendorPriceDetails.minMaxOptions,
    },
  }));
}

export function hydrateRuleForForm(rule: Record<string, any>) {
  const template = sampleRules.find((sampleRule) => sampleRule.id === rule.id);
  const merged = template ? { ...template, ...rule } : { ...rule };

  const fleetTypes = merged.fleetTypes?.includes('All Fleet Types')
    ? ALL_FLEET_TYPES
    : (merged.fleetTypes || []).filter(
        (type: string) => type !== '4WD' && type !== 'Convertible'
      );

  const pickupLocation =
    merged.pickupLocation?.length > 0
      ? merged.pickupLocation
      : merged.locations?.length > 0
        ? merged.locations
        : DEFAULT_DEFINE_RULE_ATTRIBUTES.pickupLocation;

  const sameDropoff = merged.sameDropoff ?? DEFAULT_DEFINE_RULE_ATTRIBUTES.sameDropoff;
  const productCode =
    merged.productCode ||
    merged.productTypes?.[0] ||
    DEFAULT_DEFINE_RULE_ATTRIBUTES.productCode;
  const lor =
    merged.lor?.length > 0
      ? merged.lor
      : merged.lors?.length > 0
        ? merged.lors
        : DEFAULT_DEFINE_RULE_ATTRIBUTES.lor;
  const carCode =
    merged.carCode?.length > 0
      ? merged.carCode
      : merged.fleetTypes?.length > 0
        ? merged.fleetTypes
        : DEFAULT_DEFINE_RULE_ATTRIBUTES.carCode;

  return {
    ...merged,
    description:
      merged.description ||
      `${merged.name} pricing rule for ${merged.location || 'all locations'}.`,
    brand: merged.brand || DEFAULT_DEFINE_RULE_ATTRIBUTES.brand,
    pickupLocation,
    sameDropoff,
    dropOffLocation:
      merged.dropOffLocation?.length > 0
        ? merged.dropOffLocation
        : sameDropoff
          ? pickupLocation
          : [],
    productCode,
    lor,
    carCode,
    locations: pickupLocation,
    productTypes: [productCode],
    lors: lor,
    fleetTypes: carCode.length ? carCode : fleetTypes.length ? fleetTypes : RULE_CAR_CODE_OPTIONS.slice(0, 5),
    firstConditions: normalizeFirstConditions(merged.firstConditions),
    conditionalRules: normalizeConditionalRules(merged.conditionalRules),
    elseCondition: merged.elseCondition || {
      enabled: false,
      action: { type: '', value: '', valueType: 'percentage' },
    },
  };
}

export function extractRuleFormState(rule: Record<string, any>) {
  const hydrated = hydrateRuleForForm(rule);
  return {
    name: hydrated.name || '',
    description: hydrated.description || '',
    brand: hydrated.brand || DEFAULT_DEFINE_RULE_ATTRIBUTES.brand,
    pickupLocation: hydrated.pickupLocation || DEFAULT_DEFINE_RULE_ATTRIBUTES.pickupLocation,
    sameDropoff: hydrated.sameDropoff ?? DEFAULT_DEFINE_RULE_ATTRIBUTES.sameDropoff,
    dropOffLocation:
      hydrated.dropOffLocation?.length > 0
        ? hydrated.dropOffLocation
        : hydrated.sameDropoff
          ? hydrated.pickupLocation
          : [],
    productCode: hydrated.productCode || DEFAULT_DEFINE_RULE_ATTRIBUTES.productCode,
    lor: hydrated.lor?.length ? hydrated.lor : hydrated.lors || DEFAULT_DEFINE_RULE_ATTRIBUTES.lor,
    carCode:
      hydrated.carCode?.length > 0
        ? hydrated.carCode
        : DEFAULT_DEFINE_RULE_ATTRIBUTES.carCode,
    locations: hydrated.pickupLocation || hydrated.locations || ['All'],
    productTypes: hydrated.productCode
      ? [hydrated.productCode]
      : hydrated.productTypes || [],
    lors: hydrated.lor?.length ? hydrated.lor : hydrated.lors || [],
    fleetTypes: hydrated.carCode?.length ? hydrated.carCode : hydrated.fleetTypes || [],
    firstConditions: hydrated.firstConditions,
    conditionalRules: hydrated.conditionalRules,
    elseCondition: hydrated.elseCondition || {
      enabled: false,
      action: { type: '', value: '', valueType: 'percentage' },
    },
  };
}

export function hydrateRulesList(rules: Record<string, any>[]) {
  return rules.map((rule) => hydrateRuleForForm(rule));
}
