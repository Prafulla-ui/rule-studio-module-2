export const RULE_BRAND_OPTIONS = [
  'Budget',
  'Avis',
  'Hertz',
  'Enterprise',
  'National',
  'Alamo',
  'Dollar',
  'Thrifty',
  'Sixt',
];

export const RULE_PICKUP_LOCATION_OPTIONS = [
  'YLW',
  'LAS',
  'SFO',
  'PDX',
  'PHX',
  'LAX',
  'ORD',
  'DEN',
  'BOS',
  'SEA',
  'MIA',
  'ATL',
  'DFW',
  'IAH',
  'MCO',
];

export const RULE_PRODUCT_CODE_OPTIONS = [
  'AD',
  'AE',
  'AF',
  'AG',
  'AH',
  'AI',
  'AJ',
  'AK',
  'AL',
  'AM',
];

export const RULE_LOR_OPTIONS = ['1', '2', '3', '4'];

export const RULE_CAR_CODE_OPTIONS = [
  'A',
  'B',
  'C',
  'E',
  'F',
  'G',
  'H',
  'K',
  'L',
  'S',
  'V',
  'W',
  'XA',
  'XB',
  'XE',
  'XF',
  'XG',
  'XH',
  'XP',
  'XV',
  'XX',
];

export const DEFAULT_DEFINE_RULE_ATTRIBUTES = {
  brand: 'Budget',
  pickupLocation: ['YLW', 'LAS', 'SFO'],
  sameDropoff: true,
  dropOffLocation: ['YLW', 'LAS', 'SFO'],
  productCode: 'AD',
  lor: ['1'],
  carCode: ['A', 'B'],
};

export interface DefineRuleAttributes {
  brand: string;
  pickupLocation: string[];
  sameDropoff: boolean;
  dropOffLocation: string[];
  productCode: string;
  lor: string[];
  carCode: string[];
}

export function toSelectOptions(values: string[]) {
  return values.map((value) => ({ value, label: value }));
}
