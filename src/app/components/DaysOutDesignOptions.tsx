import React, { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { Input } from './ui/input';
import { CustomButton } from './CustomButton';

export function DaysOutDesignOptions() {
  // Option 1 State - Tag/Chip Based
  const [option1Tags, setOption1Tags] = useState<string[]>(['1-10', '20', '25-30']);
  const [option1Input, setOption1Input] = useState('');

  // Option 2 State - Range Builder
  const [option2Ranges, setOption2Ranges] = useState([
    { id: 1, from: '1', to: '10' },
    { id: 2, from: '20', to: '20' },
    { id: 3, from: '25', to: '30' }
  ]);

  // Option 3 State - Preset + Custom
  const presetRanges = [
    { label: '1-7 days', value: '1-7' },
    { label: '8-14 days', value: '8-14' },
    { label: '15-30 days', value: '15-30' },
    { label: '31-60 days', value: '31-60' },
    { label: '61-90 days', value: '61-90' },
  ];
  const [option3Selected, setOption3Selected] = useState<string[]>(['1-7', '15-30']);
  const [option3Custom, setOption3Custom] = useState('');

  // Option 4 State - Interactive Pills
  const [option4Days, setOption4Days] = useState<number[]>([1, 2, 3, 4, 5, 10, 15, 20, 25, 30]);
  const [option4Selected, setOption4Selected] = useState<number[]>([1, 2, 3, 4, 5, 10, 20, 25, 26, 27, 28, 29, 30]);

  const addOption1Tag = () => {
    if (option1Input.trim()) {
      setOption1Tags([...option1Tags, option1Input.trim()]);
      setOption1Input('');
    }
  };

  const removeOption1Tag = (index: number) => {
    setOption1Tags(option1Tags.filter((_, i) => i !== index));
  };

  const addOption2Range = () => {
    setOption2Ranges([...option2Ranges, { id: Date.now(), from: '', to: '' }]);
  };

  const updateOption2Range = (id: number, field: 'from' | 'to', value: string) => {
    setOption2Ranges(option2Ranges.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  const removeOption2Range = (id: number) => {
    setOption2Ranges(option2Ranges.filter(range => range.id !== id));
  };

  const toggleOption3Preset = (value: string) => {
    if (option3Selected.includes(value)) {
      setOption3Selected(option3Selected.filter(v => v !== value));
    } else {
      setOption3Selected([...option3Selected, value]);
    }
  };

  const toggleOption4Day = (day: number) => {
    if (option4Selected.includes(day)) {
      setOption4Selected(option4Selected.filter(d => d !== day));
    } else {
      setOption4Selected([...option4Selected, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Days Out Selection - Design Options</h1>
          <p className="text-gray-600">Compare different UI approaches for selecting day ranges</p>
        </div>

        {/* CURRENT DESIGN */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Design</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Basic Input</span>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="e.g. 1-10, 20, 25, 25-30"
              className="h-9"
            />
            <p className="text-xs text-gray-500">⚠️ Issues: Manual parsing required, easy to make syntax errors, no validation</p>
          </div>
        </div>

        {/* OPTION 1: TAG/CHIP BASED */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Option 1: Tag-Based Input</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Recommended</span>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {option1Tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#fff3e0] border border-[#ff9800] rounded-full text-sm"
                >
                  <span className="text-gray-700">{tag}</span>
                  <button
                    onClick={() => removeOption1Tag(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={option1Input}
                onChange={(e) => setOption1Input(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addOption1Tag();
                  }
                }}
                placeholder="Type range (e.g., 1-10 or 15) and press Enter"
                className="h-9 flex-1"
              />
              <CustomButton variant="outline" onClick={addOption1Tag}>
                <Plus className="w-4 h-4" />
              </CustomButton>
            </div>
            <p className="text-xs text-gray-500">✅ Benefits: Visual feedback, easy to remove individual ranges, clear value display</p>
          </div>
        </div>

        {/* OPTION 2: RANGE BUILDER */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Option 2: Range Builder</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Structured</span>
          </div>
          <div className="space-y-3">
            {option2Ranges.map((range) => (
              <div key={range.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-600 w-12">From:</label>
                  <Input
                    type="number"
                    value={range.from}
                    onChange={(e) => updateOption2Range(range.id, 'from', e.target.value)}
                    placeholder="1"
                    className="h-8 w-24"
                  />
                  <label className="text-sm text-gray-600 w-8">To:</label>
                  <Input
                    type="number"
                    value={range.to}
                    onChange={(e) => updateOption2Range(range.id, 'to', e.target.value)}
                    placeholder="10"
                    className="h-8 w-24"
                  />
                  <div className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600 min-w-[80px] text-center">
                    {range.from && range.to ? (
                      range.from === range.to ? range.from : `${range.from}-${range.to}`
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeOption2Range(range.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
            <CustomButton variant="outline" onClick={addOption2Range} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Range
            </CustomButton>
            <p className="text-xs text-gray-500">✅ Benefits: Prevents syntax errors, clear from/to structure, number validation built-in</p>
          </div>
        </div>

        {/* OPTION 3: PRESET + CUSTOM */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Option 3: Quick Presets + Custom</h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Fast Selection</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2">Quick Presets:</label>
              <div className="flex flex-wrap gap-2">
                {presetRanges.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => toggleOption3Preset(preset.value)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      option3Selected.includes(preset.value)
                        ? 'border-[#ff9800] bg-[#fff3e0] text-gray-900'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">Custom Range:</label>
              <Input
                value={option3Custom}
                onChange={(e) => setOption3Custom(e.target.value)}
                placeholder="e.g., 91-120 or 45"
                className="h-9"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Selected:</p>
              <p className="text-sm font-medium text-gray-900">
                {option3Selected.join(', ')}
                {option3Custom ? `, ${option3Custom}` : ''}
              </p>
            </div>
            <p className="text-xs text-gray-500">✅ Benefits: Fast selection for common ranges, flexibility for custom values</p>
          </div>
        </div>

        {/* OPTION 4: INTERACTIVE PILLS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Option 4: Interactive Day Pills</h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Visual</span>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {option4Days.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleOption4Day(day)}
                  className={`w-12 h-12 rounded-lg font-medium text-sm transition-all ${
                    option4Selected.includes(day)
                      ? 'bg-[#ff9800] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Add custom day"
                className="h-8 w-32"
              />
              <CustomButton variant="outline" className="h-8">
                Add
              </CustomButton>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Selected days:</p>
              <p className="text-sm font-medium text-gray-900">
                {option4Selected.length} days selected
              </p>
            </div>
            <p className="text-xs text-gray-500">⚠️ Note: Works well for small sets, but may not scale for large ranges (e.g., 1-365)</p>
          </div>
        </div>

        {/* RECOMMENDATION */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-[#ff9800] p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#ff9800]" />
            Recommendation
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Based on your use case, I recommend <strong>Option 1 (Tag-Based Input)</strong> or <strong>Option 3 (Quick Presets + Custom)</strong>:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#ff9800] font-bold">•</span>
              <span><strong>Option 1</strong> provides maximum flexibility while preventing syntax errors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff9800] font-bold">•</span>
              <span><strong>Option 3</strong> speeds up common selections with preset buttons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff9800] font-bold">•</span>
              <span>Both maintain the same data format (comma-separated ranges) for backend compatibility</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
