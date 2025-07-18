'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatbotStyle, defaultChatbotStyle } from '@/types/chatbot'
import { EmbedPreview } from './embed-preview'

interface ChatbotStylingProps {
  initialStyles?: ChatbotStyle
  onStylesChange: (styles: ChatbotStyle) => void
  onSave: () => void
  isLoading?: boolean
  chatbotName?: string
}

export function ChatbotStyling({
  initialStyles = defaultChatbotStyle,
  onStylesChange,
  onSave,
  isLoading = false,
  chatbotName = 'My Chatbot',
}: ChatbotStylingProps) {
  // Use the parent's state directly instead of local state to prevent focus loss
  const styles = initialStyles

  const updateStyle = useCallback((key: keyof ChatbotStyle, value: string) => {
    const newStyles = { ...styles, [key]: value }
    onStylesChange(newStyles)
  }, [styles, onStylesChange])

  const resetToDefaults = useCallback(() => {
    onStylesChange(defaultChatbotStyle)
  }, [onStylesChange])

  const ColorInput = useCallback(({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string
    value: string
    onChange: (value: string) => void 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded border border-border cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  ), [])

  const SelectInput = useCallback(({
    label,
    value,
    onChange,
    options,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md bg-background h-[40px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ), [])

  const TextInput = useCallback(({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ), [])

  const UnitInput = useCallback(({
    label,
    value,
    onChange,
    placeholder,
    units = ['px', 'rem', 'em', '%'],
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    units?: string[]
  }) => {
    // Extract number and unit from value
    const extractNumberAndUnit = (val: string) => {
      if (!val || val.trim() === '') {
        return { number: '', unit: units[0] }
      }
      
      // Match number (including decimals) and optional unit
      const match = val.trim().match(/^(\d*\.?\d*)(.*)$/)
      if (match) {
        const num = match[1] || ''
        let unit = match[2].trim()
        
        // If no unit provided, use default
        if (!unit) {
          unit = units[0]
        }
        
        // Validate that unit is in our allowed units
        if (!units.includes(unit)) {
          unit = units[0]
        }
        
        return { number: num, unit }
      }
      return { number: '', unit: units[0] }
    }

    const { number, unit } = extractNumberAndUnit(value)

    const handleNumberChange = (newNumber: string) => {
      // Only allow numbers, decimal points, and empty string
      if (newNumber === '' || /^\d*\.?\d*$/.test(newNumber)) {
        // Don't add unit if number is empty
        if (newNumber === '') {
          onChange('')
        } else {
          onChange(newNumber + unit)
        }
      }
    }

    const handleUnitChange = (newUnit: string) => {
      // Don't add unit if there's no number
      if (number === '') {
        onChange('')
      } else {
        onChange(number + newUnit)
      }
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">{label}</label>
        <div className="flex gap-1">
          <Input
            type="text"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder={placeholder || "16"}
            className="flex-1"
          />
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background h-[40px] min-w-[70px]"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }, [])

  const fontFamilyOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter (Default)' },
    { value: 'system-ui, sans-serif', label: 'System UI' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Courier New", monospace', label: 'Courier New' },
  ]

  const fontWeightOptions = [
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Normal (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customize Appearance</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Styles'}
          </Button>
        </div>
      </div>

      {/* Layout: Controls on left, Preview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Style Controls */}
        <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4">{/* scrollable controls */}

      {/* Colors Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-base border-b pb-2">Colors</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorInput
            label="Primary Color"
            value={styles.primaryColor}
            onChange={(value) => updateStyle('primaryColor', value)}
          />
          <ColorInput
            label="Background Color"
            value={styles.backgroundColor}
            onChange={(value) => updateStyle('backgroundColor', value)}
          />
          <ColorInput
            label="User Message Color"
            value={styles.userMessageColor}
            onChange={(value) => updateStyle('userMessageColor', value)}
          />
          <ColorInput
            label="Bot Message Color"
            value={styles.botMessageColor}
            onChange={(value) => updateStyle('botMessageColor', value)}
          />
          <ColorInput
            label="Text Color"
            value={styles.textColor}
            onChange={(value) => updateStyle('textColor', value)}
          />
          <ColorInput
            label="Border Color"
            value={styles.borderColor}
            onChange={(value) => updateStyle('borderColor', value)}
          />
        </div>
      </div>

      {/* Typography Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-base border-b pb-2">Typography</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectInput
            label="Font Family"
            value={styles.fontFamily}
            onChange={(value) => updateStyle('fontFamily', value)}
            options={fontFamilyOptions}
          />
          <UnitInput
            label="Font Size"
            value={styles.fontSize}
            onChange={(value) => updateStyle('fontSize', value)}
            placeholder="14"
            units={['px', 'rem', 'em']}
          />
          <SelectInput
            label="Font Weight"
            value={styles.fontWeight}
            onChange={(value) => updateStyle('fontWeight', value)}
            options={fontWeightOptions}
          />
        </div>
      </div>

      {/* Layout & Spacing Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-base border-b pb-2">Layout & Spacing</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UnitInput
            label="Border Radius"
            value={styles.borderRadius}
            onChange={(value) => updateStyle('borderRadius', value)}
            placeholder="12"
            units={['px', 'rem', 'em', '%']}
          />
          <UnitInput
            label="Padding"
            value={styles.padding}
            onChange={(value) => updateStyle('padding', value)}
            placeholder="16"
            units={['px', 'rem', 'em']}
          />
          <UnitInput
            label="Max Width"
            value={styles.maxWidth}
            onChange={(value) => updateStyle('maxWidth', value)}
            placeholder="48"
            units={['px', 'rem', 'em', '%', 'vw']}
          />
          <UnitInput
            label="Height"
            value={styles.height}
            onChange={(value) => updateStyle('height', value)}
            placeholder="600"
            units={['px', 'rem', 'em', 'vh']}
          />
          <UnitInput
            label="Message Spacing"
            value={styles.messageSpacing}
            onChange={(value) => updateStyle('messageSpacing', value)}
            placeholder="16"
            units={['px', 'rem', 'em']}
          />
          <UnitInput
            label="Message Padding"
            value={styles.messagePadding}
            onChange={(value) => updateStyle('messagePadding', value)}
            placeholder="16"
            units={['px', 'rem', 'em']}
          />
        </div>
      </div>

      {/* Input & Button Styling */}
      <div className="space-y-4">
        <h4 className="font-medium text-base border-b pb-2">Input & Button Colors</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorInput
            label="Input Background"
            value={styles.inputBackgroundColor}
            onChange={(value) => updateStyle('inputBackgroundColor', value)}
          />
          <ColorInput
            label="Input Border"
            value={styles.inputBorderColor}
            onChange={(value) => updateStyle('inputBorderColor', value)}
          />
          <ColorInput
            label="Input Text"
            value={styles.inputTextColor}
            onChange={(value) => updateStyle('inputTextColor', value)}
          />
          <ColorInput
            label="Button Background"
            value={styles.buttonBackgroundColor}
            onChange={(value) => updateStyle('buttonBackgroundColor', value)}
          />
          <ColorInput
            label="Button Text"
            value={styles.buttonTextColor}
            onChange={(value) => updateStyle('buttonTextColor', value)}
          />
          <ColorInput
            label="Button Hover"
            value={styles.buttonHoverColor}
            onChange={(value) => updateStyle('buttonHoverColor', value)}
          />
        </div>
      </div>
      </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <h4 className="font-medium text-base border-b pb-2">Live Preview</h4>
          <div className="sticky top-4">
            <EmbedPreview styles={styles} chatbotName={chatbotName} />
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">💡 Preview Tips:</p>
              <ul className="text-xs space-y-1">
                <li>• Click the chat button to see the opened state</li>
                <li>• Changes update instantly as you edit styles</li>
                <li>• This shows exactly how it will appear on your website</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 