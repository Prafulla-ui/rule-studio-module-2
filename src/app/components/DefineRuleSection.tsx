import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { CustomSelect } from './CustomSelect';
import { MultiSelect } from './MultiSelect';
import {
  RULE_BRAND_OPTIONS,
  RULE_CAR_CODE_OPTIONS,
  RULE_LOR_OPTIONS,
  RULE_PICKUP_LOCATION_OPTIONS,
  RULE_PRODUCT_CODE_OPTIONS,
  toSelectOptions,
} from '../constants/ruleDefineOptions';

export interface DefineRuleSectionValues {
  name: string;
  brand: string;
  pickupLocation: string[];
  sameDropoff: boolean;
  dropOffLocation: string[];
  productCode: string;
  lor: string[];
  carCode: string[];
}

interface DefineRuleSectionProps {
  values: DefineRuleSectionValues;
  onChange: (updates: Partial<DefineRuleSectionValues>) => void;
  nameInputId?: string;
  nameError?: string;
  duplicateDefineRuleUnchanged?: boolean;
}

export function DefineRuleSection({
  values,
  onChange,
  nameInputId,
  nameError,
  duplicateDefineRuleUnchanged = false,
}: DefineRuleSectionProps) {
  const handlePickupLocationChange = (pickupLocation: string[]) => {
    if (values.sameDropoff) {
      onChange({ pickupLocation, dropOffLocation: pickupLocation });
      return;
    }
    onChange({ pickupLocation });
  };

  const handleSameDropoffChange = (checked: boolean) => {
    if (checked) {
      onChange({
        sameDropoff: true,
        dropOffLocation: values.pickupLocation,
      });
      return;
    }
    onChange({ sameDropoff: false });
  };

  return (
    <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-[#2c3e50] text-base font-medium">Define Rule</h3>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-[#666666]">Rule Name *</Label>
        <Input
          id={nameInputId}
          placeholder="Enter rule name"
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-7"
        />
        {nameError && <p className="text-xs text-amber-700">{nameError}</p>}
      </div>

      <div
        className={`border rounded-lg bg-white p-4 ${
          duplicateDefineRuleUnchanged ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-200'
        }`}
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[120px] flex-1">
            <Label className="text-xs text-[#666666] mb-1.5 block">Brand</Label>
            <CustomSelect
              value={values.brand}
              onChange={(brand) => onChange({ brand })}
              options={toSelectOptions(RULE_BRAND_OPTIONS)}
              placeholder="Select"
              selectClassName="h-7"
            />
          </div>

          <div className="min-w-[150px] flex-1">
            <Label className="text-xs text-[#666666] mb-1.5 block">Pickup Location</Label>
            <MultiSelect
              value={values.pickupLocation}
              onChange={handlePickupLocationChange}
              options={RULE_PICKUP_LOCATION_OPTIONS}
              placeholder="select*"
            />
          </div>

          <div className="flex items-center pb-1.5 min-w-[110px]">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`same-dropoff-${nameInputId || 'rule'}`}
                checked={values.sameDropoff}
                onCheckedChange={(checked) => handleSameDropoffChange(Boolean(checked))}
                className="border-[#ff9800] data-[state=checked]:bg-[#ff9800]"
              />
              <Label
                htmlFor={`same-dropoff-${nameInputId || 'rule'}`}
                className="text-xs text-gray-700 cursor-pointer whitespace-nowrap"
              >
                Same DropOff
              </Label>
            </div>
          </div>

          <div className="min-w-[150px] flex-1">
            <Label className="text-xs text-[#666666] mb-1.5 block">Drop-Off Location</Label>
            <MultiSelect
              value={values.sameDropoff ? values.pickupLocation : values.dropOffLocation}
              onChange={(dropOffLocation) => onChange({ dropOffLocation })}
              options={RULE_PICKUP_LOCATION_OPTIONS}
              placeholder="select*"
              disabled={values.sameDropoff}
            />
          </div>

          <div className="min-w-[120px] flex-1">
            <Label className="text-xs text-[#666666] mb-1.5 block">Product Code</Label>
            <CustomSelect
              value={values.productCode}
              onChange={(productCode) => onChange({ productCode })}
              options={toSelectOptions(RULE_PRODUCT_CODE_OPTIONS)}
              placeholder="select*"
              selectClassName="h-7"
            />
          </div>

          <div className="min-w-[110px] flex-1">
            <Label className="text-xs text-[#666666] mb-1.5 block">LOR</Label>
            <MultiSelect
              value={values.lor}
              onChange={(lor) => onChange({ lor })}
              options={RULE_LOR_OPTIONS}
              placeholder="select*"
            />
          </div>

          <div className="min-w-[120px] flex-1">
            <Label className="text-xs text-[#666666] mb-1.5 block">Car Code</Label>
            <MultiSelect
              value={values.carCode}
              onChange={(carCode) => onChange({ carCode })}
              options={RULE_CAR_CODE_OPTIONS}
              placeholder="select*"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function getDefineRuleSectionValues(ruleData: {
  name?: string;
  brand?: string;
  pickupLocation?: string[];
  sameDropoff?: boolean;
  dropOffLocation?: string[];
  productCode?: string;
  lor?: string[];
  lors?: string[];
  carCode?: string[];
}): DefineRuleSectionValues {
  const lorValues =
    ruleData.lor?.length
      ? ruleData.lor
      : ruleData.lors?.length
        ? ruleData.lors
        : [];

  return {
    name: ruleData.name || '',
    brand: ruleData.brand || '',
    pickupLocation: ruleData.pickupLocation || [],
    sameDropoff: ruleData.sameDropoff ?? true,
    dropOffLocation: ruleData.dropOffLocation || [],
    productCode: ruleData.productCode || '',
    lor: lorValues,
    carCode: ruleData.carCode || [],
  };
}
