# Healthcare Translation Web App with Generative AI

A real-time, multilingual translation web application designed for healthcare communication between patients and healthcare providers. This application converts spoken input into text, provides live transcripts, and offers translated versions with audio playback.

## 🎯 Project Overview

This project was developed as a pre-interview assignment for Nao Medical, demonstrating technical proficiency in:
- Generative AI integration (OpenAI API)
- Speech recognition and synthesis
- Real-time translation capabilities
- Mobile-first responsive design
- Healthcare-focused user experience

## ✨ Core Features

### 🎤 Voice-to-Text with AI Enhancement
- Real-time speech recognition using Web Speech API
- Enhanced transcription accuracy for medical terminology
- Support for multiple input languages
- Manual text input as fallback

### 🌐 Real-Time Translation
- Powered by OpenAI GPT-4 for accurate medical translations
- Preserves medical terminology and context
- Supports 10+ languages including healthcare-relevant ones
- Debounced API calls to optimize performance

### 🔊 Audio Playback
- Text-to-speech for translated content
- Voice selection based on target language
- Accessible audio controls

### 📱 Mobile-First Design
- Responsive interface optimized for mobile devices
- Touch-friendly controls
- Cross-platform compatibility

### 🔒 Security & Privacy
- Rate limiting to prevent API abuse
- No persistent storage of patient data
- Secure API key handling
- Basic security measures for healthcare compliance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
```bash
cd healthcare-translate
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

### Basic Workflow
1. **Select Languages**: Choose your input and output languages from the dropdown menus
2. **Start Recording**: Click "Start Mic" to begin voice recognition
3. **Speak**: Talk clearly into your microphone - the app will transcribe in real-time
4. **View Translation**: The translated text appears automatically in the right panel
5. **Listen**: Click "Speak Translation" to hear the translated audio
6. **Copy**: Use the "Copy" button to copy translated text to clipboard

### Manual Input
- Type directly into the "Original" text area for manual translation
- Perfect for when voice recognition isn't available or preferred

### Language Support
- **English** (en)
- **Spanish** (es) 
- **Urdu** (ur)
- **Arabic** (ar)
- **Bengali** (bn)
- **French** (fr)
- **German** (de)
- **Hindi** (hi)
- **Tagalog** (tl)
- **Chinese** (zh)

## 🛠 Technical Architecture

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS for responsive design
- **Speech Recognition**: Web Speech API
- **Speech Synthesis**: Web Speech Synthesis API

### Backend
- **API Routes**: Next.js API routes for translation
- **AI Integration**: OpenAI GPT-4 for translation
- **Rate Limiting**: Custom rate limiting implementation
- **Validation**: Zod schema validation

### Key Components
- `page.tsx`: Main application interface
- `route.ts`: Translation API endpoint
- `languages.ts`: Language configuration
- `rateLimit.ts`: Rate limiting utility
- `useDebouncedValue.ts`: Custom hook for debounced API calls

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-4o-mini)

### API Rate Limiting
- 20 requests per minute per IP address
- Configurable in `src/lib/rateLimit.ts`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 🔒 Security Considerations

### Data Privacy
- No patient data is stored or persisted
- All translations are processed in memory only
- API calls are rate-limited to prevent abuse

### API Security
- OpenAI API key is stored securely in environment variables
- Input validation using Zod schemas
- Error handling prevents sensitive data exposure

### Healthcare Compliance
- Basic security measures implemented
- No PHI (Protected Health Information) storage
- Suitable for prototype/demo purposes

## 🧪 Testing

### Manual Testing Checklist
- [ ] Voice recognition works in different languages
- [ ] Translation accuracy for medical terms
- [ ] Audio playback functionality
- [ ] Mobile responsiveness
- [ ] Error handling for network issues
- [ ] Rate limiting behavior

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## 📝 Development Notes

### Generative AI Usage
This project demonstrates efficient use of generative AI for:
1. **Translation**: OpenAI GPT-4 provides context-aware medical translations
2. **Code Assistance**: AI tools were used for rapid development and debugging
3. **Problem Solving**: AI helped with speech recognition edge cases

### Performance Optimizations
- Debounced API calls (600ms delay)
- Rate limiting to prevent API abuse
- Efficient React state management
- Optimized bundle size with Next.js

## 🤝 Contributing

This is a demonstration project for Nao Medical. For questions or improvements, please contact the development team.

## 📄 License

This project is created for demonstration purposes as part of the Nao Medical pre-interview assignment.

---

**Developed with ❤️ for Nao Medical**
