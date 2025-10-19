# Aura Health Dashboard Features

## 🎨 Modern UI Design

### **Sidebar Layout**
- **File Upload Section**: Clean upload interface with camera and file options
- **AI Model Selection**: Dropdown to choose between OpenRouter, Gemini, and Claude
- **Health Stats**: Real-time statistics showing receipts scanned, health scores, and warnings
- **Recent Receipts**: Scrollable list of previously scanned receipts with thumbnails

### **Main Content Area**
- **Tabbed Interface**: Two main tabs for different functionalities
  - **Receipt Analysis**: Detailed view of scanned receipts with health insights
  - **Chat with Astrea**: AI assistant for health questions and recommendations

## 🔧 Key Features

### **Receipt Scanning**
- Drag & drop or click to upload receipt images
- Real-time OCR processing with loading indicators
- Instant health analysis with warnings and suggestions
- Visual receipt thumbnails in sidebar

### **Health Analysis**
- **Health Score**: Percentage-based scoring system
- **Warnings**: Drug interactions, allergens, and dietary conflicts
- **Suggestions**: Alternative recommendations and healthy choices
- **Raw Text**: Full OCR extracted text for verification

### **AI Chat (Astrea)**
- **Multiple AI Models**: Choose between OpenRouter, Gemini, and Claude
- **Context-Aware**: Understands your receipt history and health profile
- **Real-Time Responses**: Instant answers to health questions
- **Professional UI**: Clean chat interface with avatars and timestamps

## 🎯 UI Components Used

### **Shadcn/UI Components**
- `Card` - For receipt analysis display
- `Tabs` - For main content switching
- `Badge` - For health scores and statistics
- `Avatar` - For chat user/bot identification
- `ScrollArea` - For scrollable content areas
- `Button` - For actions and navigation
- `Input` - For chat input and file selection

### **Design System**
- **Color Palette**: Professional slate colors with emerald accents
- **Typography**: Clear hierarchy with proper font weights
- **Spacing**: Consistent padding and margins throughout
- **Responsive**: Works on all screen sizes
- **Dark Mode**: Full dark mode support

## 📱 User Experience

### **Workflow**
1. **Upload Receipt**: Use sidebar to upload or scan receipt
2. **View Analysis**: Switch to "Receipt Analysis" tab to see health insights
3. **Chat with AI**: Use "Chat with Astrea" tab for questions and recommendations
4. **Track Progress**: Monitor health stats and recent receipts in sidebar

### **Visual Feedback**
- Loading states during OCR processing
- Health score badges with color coding
- Warning and suggestion cards with appropriate icons
- Real-time typing indicators in chat
- Smooth transitions and hover effects

## 🚀 Technical Implementation

### **State Management**
- Receipt data with full analysis results
- Chat message history with timestamps
- AI model selection and configuration
- UI state for tabs and interactions

### **AI Integration**
- OpenRouter API for Claude models
- Google Gemini API support
- Fallback mock responses for development
- Context-aware health recommendations

### **Performance**
- Optimized image handling
- Efficient scroll areas for large datasets
- Lazy loading of receipt data
- Responsive design for all devices

The dashboard now provides a professional, modern interface for receipt analysis and health insights with a clean sidebar layout and tabbed main content area.
