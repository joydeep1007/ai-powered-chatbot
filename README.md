# 🤖 Gubluxxy - AI Chatbot

A modern, intelligent chatbot powered by Google's Gemini AI, built with Next.js and TypeScript. Gubluxxy provides an intuitive conversational experience with advanced features like conversation memory, dark mode, and smooth scrolling.

![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4)

## ✨ Features

- 🎯 **Smart Conversations** - Powered by Google Gemini 1.5 Flash for intelligent responses
- 🧠 **Context Memory** - Maintains conversation history for coherent dialogues
- 🌙 **Dark/Light Mode** - Toggle between themes for comfortable viewing
- 📜 **Scroll History** - Browse through previous conversations seamlessly
- ⚡ **Real-time Responses** - Fast and responsive chat experience
- 🎨 **Modern UI** - Clean, gradient-based design with smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🔄 **Auto-scroll** - Smart scrolling that respects user interaction

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joydeep1007/ai-powered-chatbot.git
   cd ai-powered-chatbot
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
   
   Navigate to [http://localhost:3000](http://localhost:3000) to start chatting with Gubluxxy!

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.4.1](https://nextjs.org/) - React framework for production
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- **AI Engine**: [Google Gemini 1.5 Flash](https://ai.google.dev/) - Advanced language model
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful & consistent icons
- **Fonts**: [Geist](https://vercel.com/font) - Modern font family

## 📁 Project Structure

```
joychatbot/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts      # Chat API endpoint
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Main chat interface
│   │   └── globals.css            # Global styles
│   ├── components/ui/             # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   └── lib/
│       └── utils.ts               # Utility functions
├── public/                        # Static assets
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
└── package.json
```

## 🎯 Key Features Explained

### Conversation Memory
Gubluxxy remembers your conversation history, allowing for contextual responses that reference previous messages.

### Smart Scrolling
- Automatically scrolls to new messages when you're at the bottom
- Preserves your reading position when scrolling up
- Floating "scroll to bottom" button for easy navigation

### Dark Mode
Toggle between light and dark themes with a smooth transition animation for comfortable viewing in any environment.

### Name Recognition
Ask "What is your name?" and Gubluxxy will always respond with "My name is Gubluxxy!" for consistent branding.

## 🔧 API Configuration

The chat API is configured to:
- Handle conversation context (last 10 messages)
- Respond to name-related queries directly
- Use Google Gemini 1.5 Flash model
- Provide error handling and fallback responses

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Deployment

### Deploy on Vercel (Recommended)

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Add your `GEMINI_API_KEY` in the environment variables
3. Deploy with one click!

### Deploy on Other Platforms

This is a standard Next.js application and can be deployed on any platform that supports Node.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

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
- Vercel team for Next.js
- Radix UI team for accessible components
- Tailwind CSS team for the utility framework

---

**Made with ❤️ and powered by AI**
