'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatbotStyle, defaultChatbotStyle } from '@/types/chatbot'

interface ChatbotStylingProps {
  initialStyles?: ChatbotStyle
  onStylesChange: (styles: ChatbotStyle) => void
  onSave: () => void
  isLoading?: boolean
}

export function ChatbotStyling({
  initialStyles = defaultChatbotStyle,
  onStylesChange,
  onSave,
  isLoading = false,
}: ChatbotStylingProps) {
  const [styles, setStyles] = useState<ChatbotStyle>(initialStyles)

  const updateStyle = (key: keyof ChatbotStyle, value: string) => {
    const newStyles = { ...styles, [key]: value }
    setStyles(newStyles)
    onStylesChange(newStyles)
  }

  const resetToDefaults = () => {
    setStyles(defaultChatbotStyle)
    onStylesChange(defaultChatbotStyle)
  }

  const ColorInput = ({ 
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
  )

  const SelectInput = ({
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
  )

  const TextInput = ({
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
  )

  const fontFamilyOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter (Default)' },
    { value: 'system-ui, sans-serif', label: 'System UI' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Courier New", monospace', label: 'Courier New' },
  ]

  const fontSizeOptions = [
    { value: '12px', label: 'Small (12px)' },
    { value: '14px', label: 'Medium (14px)' },
    { value: '16px', label: 'Large (16px)' },
    { value: '18px', label: 'Extra Large (18px)' },
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
          <SelectInput
            label="Font Size"
            value={styles.fontSize}
            onChange={(value) => updateStyle('fontSize', value)}
            options={fontSizeOptions}
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
          <TextInput
            label="Border Radius"
            value={styles.borderRadius}
            onChange={(value) => updateStyle('borderRadius', value)}
            placeholder="12px"
          />
          <TextInput
            label="Padding"
            value={styles.padding}
            onChange={(value) => updateStyle('padding', value)}
            placeholder="16px"
          />
          <TextInput
            label="Max Width"
            value={styles.maxWidth}
            onChange={(value) => updateStyle('maxWidth', value)}
            placeholder="48rem"
          />
          <TextInput
            label="Height"
            value={styles.height}
            onChange={(value) => updateStyle('height', value)}
            placeholder="600px"
          />
          <TextInput
            label="Message Spacing"
            value={styles.messageSpacing}
            onChange={(value) => updateStyle('messageSpacing', value)}
            placeholder="16px"
          />
          <TextInput
            label="Message Padding"
            value={styles.messagePadding}
            onChange={(value) => updateStyle('messagePadding', value)}
            placeholder="16px"
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
  )
} 