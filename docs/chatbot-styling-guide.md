# Chatbot Custom Styling System

This system allows users to fully customize the appearance of their embedded chatbots including colors, fonts, layout, and sizing.

## Features

- **Color Customization**: Primary, background, message colors, borders, text colors
- **Typography**: Font family, size, and weight options
- **Layout & Spacing**: Border radius, padding, dimensions, message spacing
- **Input & Button Styling**: Custom colors for form elements
- **Embed Customization**: Full control over chat button and iframe appearance
- **Real-time Preview**: Changes are applied immediately in the embed
- **Message Handling**: Proper close communication between iframe and parent
- **Responsive Design**: Adapts to different screen sizes and styles
- **Default Templates**: Sensible defaults that work well out of the box

## Database Requirements

Before using this system, you need to run the migration in `docs/styling-migration.sql` to add the required database columns:

1. `custom_styles` (TEXT) - Stores JSON configuration for chatbot styles
2. `user_id` (UUID) - For row-level security (if not already present)

## Usage

### 1. Accessing the Style Editor

1. Navigate to your chatbots dashboard
2. Click "Edit" on any chatbot
3. Scroll down to the "Customize Appearance" section

### 2. Customizing Styles

The styling interface is organized into sections:

#### Colors

- **Primary Color**: Main accent color for the chatbot
- **Background Color**: Main background of the chat interface
- **User Message Color**: Background color for user messages
- **Bot Message Color**: Background color for bot responses
- **Text Color**: Primary text color
- **Border Color**: Color for borders and dividers

#### Typography

- **Font Family**: Choose from system fonts or web fonts
- **Font Size**: Text size (12px - 18px)
- **Font Weight**: Text weight (300 - 700)

#### Layout & Spacing

- **Border Radius**: Roundness of corners (e.g., "12px")
- **Padding**: Internal spacing (e.g., "16px")
- **Max Width**: Maximum width of chat container (e.g., "48rem")
- **Height**: Height of chat interface (e.g., "600px")
- **Message Spacing**: Space between messages
- **Message Padding**: Internal padding for messages

#### Input & Button Colors

- **Input Background**: Background color for text input
- **Input Border**: Border color for text input
- **Input Text**: Text color in input field
- **Button Background**: Background color for send button
- **Button Text**: Text color for button
- **Button Hover**: Background color when hovering

### 3. Saving Styles

1. Make your desired changes using the style editor
2. Click "Save Styles" to apply changes
3. Your embed will automatically use the new styles

### 4. Resetting to Defaults

Click "Reset to Defaults" to restore the original styling.

### 5. Embed Integration

The styling system automatically integrates with the embed script (`public/embed.js`):

- **Automatic Style Fetching**: The embed script fetches your custom styles when loaded
- **Chat Button Styling**: Button colors, hover effects, and dimensions are customized
- **Iframe Styling**: Chat window size, border radius, and background are applied
- **Close Handling**: Clicking the X inside the chat properly closes the embed
- **Smooth Animations**: CSS transitions provide a polished user experience

**Embed Usage:**

```html
<!-- Add this to any website -->
<div data-chatbot-id="your-api-key-here"></div>
<script src="https://yourapp.com/embed.js"></script>
```

## Technical Implementation

### API Endpoints

- `POST /api/chatbots/[id]/styles` - Save custom styles for a chatbot
- `GET /api/chatbots/[id]/styles` - Retrieve styles for a chatbot
- `POST /api/public/styles` - Public endpoint for fetching styles in embeds

### TypeScript Interfaces

```typescript
interface ChatbotStyle {
  primaryColor: string;
  backgroundColor: string;
  userMessageColor: string;
  botMessageColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  borderRadius: string;
  padding: string;
  maxWidth: string;
  height: string;
  messageSpacing: string;
  messagePadding: string;
  inputBackgroundColor: string;
  inputBorderColor: string;
  inputTextColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;
}
```

### Components

- `ChatbotStyling` - Main styling interface component
- `EmbedChatPage` - Updated embed page with style application
- `embed.js` - Smart embed script with styling and message handling
- Type definitions in `src/types/chatbot.ts`

### Embed Script Features

The updated `embed.js` script provides:

- **Dynamic Style Loading**: Fetches custom styles via API on page load
- **Chat Button Customization**: Applies button colors, hover effects, and branding
- **Iframe Positioning**: Respects maxWidth and height settings
- **Message Communication**: Listens for close events from the chat interface
- **Fallback Handling**: Uses default styles if custom styles fail to load
- **Visual Feedback**: Smooth transitions and hover effects
- **Security**: Origin validation for cross-frame communication

## Style Examples

### Corporate Blue Theme

```json
{
  "primaryColor": "#1e40af",
  "backgroundColor": "#ffffff",
  "userMessageColor": "#eff6ff",
  "botMessageColor": "#1e40af",
  "textColor": "#1f2937",
  "borderColor": "#d1d5db",
  "fontFamily": "Inter, sans-serif",
  "fontSize": "14px",
  "fontWeight": "400",
  "borderRadius": "8px",
  "buttonBackgroundColor": "#1e40af",
  "buttonTextColor": "#ffffff",
  "buttonHoverColor": "#1d4ed8"
}
```

### Dark Theme

```json
{
  "primaryColor": "#10b981",
  "backgroundColor": "#1f2937",
  "userMessageColor": "#374151",
  "botMessageColor": "#10b981",
  "textColor": "#f9fafb",
  "borderColor": "#4b5563",
  "fontFamily": "Inter, sans-serif",
  "fontSize": "14px",
  "fontWeight": "400",
  "borderRadius": "12px",
  "buttonBackgroundColor": "#10b981",
  "buttonTextColor": "#ffffff",
  "buttonHoverColor": "#059669"
}
```

## Security Considerations

- Styles are validated on the server before saving
- Row-level security ensures users can only modify their own chatbot styles
- CSS injection is prevented by using controlled style application
- Public API only exposes styling data, not sensitive chatbot information

## Browser Compatibility

The styling system uses modern CSS features and is compatible with:

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+

## Troubleshooting

### Styles Not Applying

1. Check that the database migration has been run
2. Verify the API endpoints are accessible
3. Check browser console for JavaScript errors

### Custom Fonts Not Loading

1. Ensure font names are spelled correctly
2. Use web-safe fonts or properly loaded web fonts
3. Check font availability in the target environment

### Performance Issues

1. Avoid extremely large font sizes
2. Use efficient color values (hex codes preferred)
3. Test on various devices and connection speeds
