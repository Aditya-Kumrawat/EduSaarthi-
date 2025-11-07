# Career Discovery Assistant

An intelligent career guidance platform that provides personalized career recommendations for students and parents using AI-powered insights and hyperlocal job market data.

## 🌟 Features

### For Students
- **Interactive Career Assessment**: Comprehensive questionnaire covering interests, strengths, and preferences
- **Personalized Recommendations**: AI-powered career suggestions based on individual profiles
- **Local Market Data**: Real-time job market information for specific cities and regions
- **Multi-language Support**: Available in English, Hindi, Tamil, and Bengali
- **Stream-based Guidance**: Tailored advice for Science (PCM/PCB), Commerce, Arts, and Vocational streams

### For Parents
- **Family-focused Guidance**: Career recommendations considering family priorities like salary, stability, and location
- **Hyperlocal Insights**: Detailed information about job opportunities in your city
- **Success Stories**: Real examples from your local area
- **Comparative Analysis**: Side-by-side comparison of different career options
- **Growth Projections**: 5-year career outlook and salary trends

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- A Gemini API key from Google AI Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd career-discovery-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to access the application

## 🏗️ Project Structure

```
career-discovery-assistant/
├── index.html          # Student assessment interface
├── parent.html         # Parent guidance interface  
├── landing.html        # Main landing page
├── index.tsx           # Student React component
├── parent.tsx          # Parent React component
├── landing.js          # Landing page functionality
├── index.css           # Shared styles
├── landing.css         # Landing page styles
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## 🎯 How It Works

### Student Flow
1. **Setup**: Enter location and select preferred language
2. **Assessment**: Complete comprehensive career questionnaire covering:
   - Academic interests and strengths
   - Personality traits and work preferences
   - Career priorities and goals
3. **Analysis**: AI processes responses with local job market data
4. **Results**: Receive personalized career recommendations with:
   - Detailed career descriptions
   - Local salary information
   - Job availability in your area
   - Required education and skills
   - Growth prospects

### Parent Flow
1. **Setup**: Enter location and language preferences
2. **Child Profile**: Select child's academic streams and interests
3. **Family Priorities**: Define what matters most (salary, stability, location, etc.)
4. **Consultation**: Interactive Q&A session about child's situation
5. **Recommendations**: Comprehensive career guidance including:
   - Family-fit scores for different careers
   - Local market analysis
   - Comparison of multiple options
   - Success stories from your area

## 🛠️ Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **AI Integration**: Google Gemini AI with web search capabilities
- **Styling**: CSS3 with modern responsive design
- **Build Tool**: Vite for fast development and building

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The application can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

## 🔧 Configuration

### API Key Setup
The application requires a Gemini API key for AI functionality:
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file
3. Restart the development server

### Customization
- **Languages**: Add new languages by updating the language selection components
- **Streams**: Modify available academic streams in the setup components
- **Priorities**: Customize family priorities in the parent guidance flow
- **Styling**: Update `index.css` and `landing.css` for visual customization

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices
- Various screen sizes and orientations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Ensure your Gemini API key is correctly set
3. Verify all dependencies are installed
4. Create an issue in the repository for bugs or feature requests

## 🎉 Acknowledgments

- Google Gemini AI for powering the intelligent recommendations
- React and Vite communities for excellent development tools
- Contributors and testers who helped improve the platform
