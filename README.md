# 🤖 JoyChatbot - AI-Powered PDF Chat Assistant

A modern, intelligent chatbot with PDF document processing capabilities, powered by Google's Gemini AI and built with Next.js and TypeScript. JoyChatbot allows you to upload PDF documents and have intelligent conversations about their content, plus all the features of a smart conversational AI.

![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4)
![PDF.js](https://img.shields.io/badge/PDF.js-5.3.93-red)

## ✨ Features

- 🎯 **Smart Conversations** - Powered by Google Gemini 1.5 Flash for intelligent responses
- 📄 **PDF Document Processing** - Upload and chat about PDF documents (up to 10MB)
- 🧠 **Context Memory** - Maintains conversation history for coherent dialogues
- 📑 **Document Q&A** - Ask questions about uploaded PDF content
- 🌙 **Dark/Light Mode** - Toggle between themes for comfortable viewing
- 📜 **Scroll History** - Browse through previous conversations seamlessly
- ⚡ **Real-time Responses** - Fast and responsive chat experience
- 🎨 **Modern UI** - Clean, gradient-based design with smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🔄 **Auto-scroll** - Smart scrolling that respects user interaction
- 📎 **File Upload** - Easy drag-and-drop or click-to-upload PDF functionality
- 🗑️ **PDF Management** - Remove PDF context with one click

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joydeep1007/ai-powered-chatbot.git
   cd joychatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

   Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) (or [http://localhost:3001](http://localhost:3001) if port 3000 is in use) to start chatting with JoyChatbot!

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.4.1](https://nextjs.org/) - React framework for production
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- **AI Engine**: [Google Gemini 1.5 Flash](https://ai.google.dev/) - Advanced language model
- **PDF Processing**: [PDF.js 5.3.93](https://mozilla.github.io/pdf.js/) - Client-side PDF text extraction
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful & consistent icons
- **Fonts**: [Geist](https://vercel.com/font) - Modern font family

## 📁 Project Structure

```
joychatbot/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts      # Chat API endpoint with PDF context
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Main chat interface with PDF upload
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── PDFProcessor.client.ts # Client-side PDF processing wrapper
│   │   └── ui/                    # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── scroll-area.tsx
│   └── lib/
│       ├── pdfProcessor.ts        # Core PDF text extraction logic
│       └── utils.ts               # Utility functions
├── public/
│   └── pdf.worker.js              # PDF.js Web Worker for processing
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
└── package.json
```

## 🎯 Key Features Explained

### PDF Document Processing
- **Client-side Processing**: PDF text extraction happens in the browser using PDF.js
- **File Validation**: Automatically validates PDF files and enforces 10MB size limit
- **Text Extraction**: Extracts text content from all pages of uploaded PDFs
- **Context Integration**: PDF content is seamlessly integrated into chat conversations
- **Visual Feedback**: Shows processing status and PDF information (filename, page count)

### Conversation Memory
JoyChatbot remembers your conversation history, allowing for contextual responses that reference previous messages and uploaded PDF content.

### Smart Scrolling
- Automatically scrolls to new messages when you're at the bottom
- Preserves your reading position when scrolling up
- Floating "scroll to bottom" button for easy navigation

### Dark Mode
Toggle between light and dark themes with a smooth transition animation for comfortable viewing in any environment.

### PDF Chat Capabilities
- Upload PDFs and ask questions about their content
- Get intelligent answers based on document context
- Maintain document context throughout the conversation
- Easy removal of PDF context when needed

## 🔧 API Configuration

The chat API is configured to:
- Handle conversation context (maintains message history)
- Process PDF document content alongside chat messages
- Use Google Gemini 1.5 Flash model for intelligent responses
- Provide error handling and fallback responses
- Support both regular chat and document-based Q&A

### PDF Processing Features
- **File Upload**: Accepts PDF files up to 10MB
- **Text Extraction**: Uses PDF.js Web Worker for non-blocking processing
- **Context Integration**: PDF content is included in API requests for contextual responses
- **Error Handling**: Graceful handling of corrupted or unsupported files

## � How to Use

### Basic Chat
1. Type your message in the input field
2. Press Enter or click Send
3. Get intelligent responses from the AI

### PDF Document Chat
1. Click the paperclip (📎) icon to upload a PDF
2. Select a PDF file (max 10MB)
3. Wait for processing to complete
4. Ask questions about the document content
5. The AI will respond based on both the document and conversation context
6. Remove the PDF context anytime by clicking the X button

### Example PDF Queries
- "What is this document about?"
- "Summarize the main points"
- "What does section 3 say about...?"
- "Find information about [specific topic]"

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## ⚠️ Important Notes

### PDF.js Worker Setup
The project includes a `pdf.worker.js` file in the `public` folder. This is required for PDF processing and should not be removed. If you're getting PDF-related errors, ensure this file exists and is accessible.

### Environment Variables
Make sure to set up your `.env.local` file with the Google Gemini API key before running the application.

### Browser Compatibility
PDF processing works in all modern browsers that support Web Workers and FileReader API (Chrome, Firefox, Safari, Edge).

## 🌐 Deployment

### Deploy on Vercel (Recommended)

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Add your `GEMINI_API_KEY` in the environment variables
3. Ensure the `public/pdf.worker.js` file is included in your repository
4. Deploy with one click!

### Deploy on Other Platforms

This is a standard Next.js application and can be deployed on any platform that supports Node.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

**Note**: Make sure the `pdf.worker.js` file in the `public` folder is included in your deployment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Joydeep De**
- GitHub: [@joydeep1007](https://github.com/joydeep1007)

## 🙏 Acknowledgments

- Google AI team for the Gemini API
- Mozilla team for PDF.js library
- Vercel team for Next.js
- Radix UI team for accessible components
- Tailwind CSS team for the utility framework

---

**Made with ❤️ and powered by AI | Upload PDFs and chat intelligently!**
