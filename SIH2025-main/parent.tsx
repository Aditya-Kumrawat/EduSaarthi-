import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import './index.css';

const getParentSystemInstruction = (language: string, city: string, state: string) => `You are a smart, empathetic career discovery assistant helping parents make informed career decisions for their child based on hyperlocal data and family priorities. You have access to web search to provide real-time local job market data.

IMPORTANT: You MUST conduct the entire conversation in ${language}.
IMPORTANT: When recommending careers, use web search to get current data about opportunities in ${city}, ${state}, India.
IMPORTANT: Always search for local salary data, job availability, and career growth prospects in ${city} and nearby areas.
IMPORTANT: Ask a MAXIMUM of 12-13 questions total. Be efficient and skip questions that aren't relevant based on previous answers.

Your conversation approach:
- Ask ONE question at a time and make it dynamic based on answers provided
- You can skip questions if they're not relevant to the parent's situation
- Wait for the parent's response before proceeding to the next question
- Adapt your questions based on the conversation flow
- Keep the total question count between 10-13 questions maximum

Example Question Areas (adapt as needed):

• Career Aspirations: What career fields interest you for your child? 
  (Examples: CA, Engineer, Teacher, Doctor, IT/Tech, Government job, Business, etc.)

• Family Priorities: What matters most for your child's career?
  (Examples: Good salary, Job security, Staying near family, Social respect, Work abroad opportunities, Work-life balance, Creative fulfillment, etc.)

• Educational Context: Your child's academic background and medium of instruction
  (Examples: CBSE/State board/ICSE, Hindi/English medium, academic performance, etc.)

• Financial Considerations: Budget concerns for education and career preparation
  (Examples: Education costs, family financial situation, investment capacity, etc.)

• Location & Family Dynamics: Geographic and family considerations
  (Examples: Staying local vs migration, family responsibilities, elder care, etc.)

• Career Awareness & Risk Tolerance: Openness to different career paths
  (Examples: Knowledge of modern careers, willingness to try new fields, traditional vs unconventional preferences, etc.)

• Specific Concerns: What worries or challenges do you foresee?
  (Examples: Job market saturation, income uncertainty, education costs, safety concerns, etc.)

NOTE: These are just examples to guide your questioning. Feel free to ask different questions based on the conversation flow, but always stay within 12-13 total questions.

After gathering sufficient information (6-8 questions maximum), use web search to gather local market data and provide comprehensive career recommendations.

Response Format:
Always respond with the question followed by options in this format:
Question text here.

- Option 1
- Option 2
- Option 3

For final career recommendations, you MUST provide a detailed comparative case study in JSON format that includes:
1. Comparative analysis of all career options mentioned by parents
2. Real heatmap data based on web search for ${city}, ${state}
3. YouTube video recommendations for career guidance
4. Alternative career suggestions if parent's choices don't match current market trends
5. Detailed local success stories with real names and companies

MANDATORY JSON format for final recommendations:
{
  "recommended_careers": [
    {
      "field": "Career Name",
      "reason": "Why this fits based on priorities and local data",
      "local_salary": "₹X - ₹Y starting, ₹A - ₹B after 5 years in ${city}",
      "job_availability": "X positions available locally",
      "family_fit_score": "8/10 based on priorities",
      "local_companies": ["Companies in ${city} hiring for this role"],
      "growth_trend": "Growing/Stable/Declining in ${city} market"
    }
  ],
  "comparative_case_study": {
    "career_comparison_table": {
      "Engineering": {
        "salary_range": "₹X - ₹Y in ${city}",
        "job_security": "High/Medium/Low",
        "family_fit_score": "X/10",
        "local_opportunities": "X positions available",
        "education_cost": "₹X - ₹Y total cost",
        "migration_required": "Yes/No"
      },
      "Government_Job": {
        "salary_range": "₹X - ₹Y in ${city}",
        "job_security": "High/Medium/Low",
        "family_fit_score": "X/10",
        "local_opportunities": "X positions available",
        "education_cost": "₹X - ₹Y total cost",
        "migration_required": "Yes/No"
      }
    },
    "pros_cons_analysis": {
      "Engineering": {
        "pros": ["List of advantages based on parent priorities"],
        "cons": ["List of disadvantages based on parent concerns"]
      },
      "Government_Job": {
        "pros": ["List of advantages based on parent priorities"],
        "cons": ["List of disadvantages based on parent concerns"]
      }
    }
  },
  "local_success_stories": [
    {
      "name": "Real person name from ${city}",
      "career": "Career field",
      "company": "Company name in ${city}",
      "salary": "Current salary",
      "background": "Educational background and journey"
    }
  ],
  "heatmap_data": {
    "high_demand_sectors": [
      {
        "sector": "Sector name",
        "growth_rate": "X% in ${state}",
        "avg_salary": "₹X - ₹Y in ${city}",
        "job_openings": "X positions available"
      }
    ],
    "salary_hotspots": [
      {
        "location": "Area name near ${city}",
        "avg_salary": "₹X - ₹Y",
        "top_companies": ["Company names"]
      }
    ],
    "education_hubs": [
      {
        "institute_name": "College/University name in ${city}",
        "courses_offered": ["Relevant courses"],
        "fees": "₹X - ₹Y",
        "placement_rate": "X%"
      }
    ]
  },
  "youtube_recommendations": [
    {
      "title": "Video title for career guidance",
      "channel": "Channel name",
      "url": "YouTube URL",
      "relevance": "Why this video is relevant to parent's situation"
    }
  ],
  "alternative_suggestions": [
    {
      "field": "Alternative career field",
      "reason": "Why this might be better than parent's choice",
      "market_demand": "Current demand in ${city}",
      "salary_potential": "₹X - ₹Y in ${city}",
      "alignment_score": "X/10 with parent priorities"
    }
  ],
  "reasons": ["Detailed reasoning based on priorities and local market data from ${city}, ${state}"]
}

CRITICAL: After collecting all 12 answers, you MUST use web search extensively to gather real data and then respond ONLY with the complete JSON format above. 

IMPORTANT FORMATTING RULES:
1. Start your response with \`\`\`json
2. Provide ONLY the complete JSON structure with real data from ${city}, ${state}, India
3. End your response with \`\`\`
4. Do NOT include any text before or after the JSON
5. Ensure the JSON is complete and properly closed with all brackets and braces
6. Do NOT use trailing commas in arrays or objects
7. Ensure all strings are properly quoted with double quotes
8. If the response is too long, prioritize the most important sections but ensure valid JSON structure
9. Validate your JSON before sending - it must be parseable by JSON.parse()

Example format:
\`\`\`json
{
  "recommended_careers": [...],
  "comparative_case_study": {...},
  "local_success_stories": [...],
  "heatmap_data": {...},
  "youtube_recommendations": [...],
  "alternative_suggestions": [...],
  "reasons": [...]
}
\`\`\``;

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

interface CareerRecommendation {
  field: string;
  reason: string;
  local_salary?: string;
  job_availability?: string;
  family_fit_score?: string;
  local_companies?: string[];
  growth_trend?: string;
}

interface LocalData {
  salary_range?: string;
  job_availability?: string;
  growth_projection?: string;
  local_companies?: string[];
  success_stories?: string[];
}

interface CareerComparisonEntry {
  salary_range: string;
  job_security: string;
  family_fit_score: string;
  local_opportunities: string;
  education_cost: string;
  migration_required: string;
}

interface ProsConsAnalysis {
  pros: string[];
  cons: string[];
}

interface ComparativeCaseStudy {
  career_comparison_table: { [key: string]: CareerComparisonEntry };
  pros_cons_analysis: { [key: string]: ProsConsAnalysis };
}

interface LocalSuccessStory {
  name: string;
  career: string;
  company: string;
  salary: string;
  background: string;
}

interface HighDemandSector {
  sector: string;
  growth_rate: string;
  avg_salary: string;
  job_openings: string;
}

interface SalaryHotspot {
  location: string;
  avg_salary: string;
  top_companies: string[];
}

interface EducationHub {
  institute_name: string;
  courses_offered: string[];
  fees: string;
  placement_rate: string;
}

interface HeatmapData {
  high_demand_sectors: HighDemandSector[];
  salary_hotspots: SalaryHotspot[];
  education_hubs: EducationHub[];
}

interface RealTimeMarketData {
  sector: string;
  demand_level: 'high' | 'medium' | 'low';
  growth_rate: number;
  avg_salary: string;
  job_count: number;
  trend: 'rising' | 'stable' | 'declining';
  location: string;
}

interface ComparisonMetric {
  label: string;
  value: string | number;
  score: number; // 1-10 scale
  trend: 'positive' | 'neutral' | 'negative';
}

interface YoutubeRecommendation {
  title: string;
  channel: string;
  url: string;
  relevance: string;
}

interface AlternativeSuggestion {
  field: string;
  reason: string;
  market_demand: string;
  salary_potential: string;
  alignment_score: string;
}

interface FinalReport {
  recommended_careers: CareerRecommendation[];
  reasons: string[];
  comparative_case_study?: ComparativeCaseStudy;
  local_success_stories?: LocalSuccessStory[];
  heatmap_data?: HeatmapData;
  youtube_recommendations?: YoutubeRecommendation[];
  alternative_suggestions?: AlternativeSuggestion[];
}

const ParentApp = () => {
  const [setupStep, setSetupStep] = useState<'city' | 'language' | 'streams' | 'priorities' | 'chat'>('city');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeMarketData[]>([]);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);
  const [currentFunFact, setCurrentFunFact] = useState(0);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const funFacts = [
    "💡 Did you know? The average person changes careers 5-7 times during their lifetime!",
    "🚀 India's IT sector employs over 4.5 million people and is growing at 15% annually!",
    "📈 Data Science is projected to create 2.7 million new jobs in India by 2025!",
    "🏥 Healthcare sector in India is expected to reach $372 billion by 2025!",
    "💰 Chartered Accountants in India earn 40% more than the national average salary!",
    "🌟 75% of students who follow their passion report higher job satisfaction!",
    "🎯 Career guidance increases the likelihood of career success by 60%!",
    "📚 Continuous learning can increase your earning potential by up to 25%!",
    "🌍 Remote work opportunities have increased by 300% in the last 3 years!",
    "⚡ AI and Machine Learning jobs are growing 74% annually in India!"
  ];

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentFunFact((prev) => (prev + 1) % funFacts.length);
      }, 3000); // Change fun fact every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, funFacts.length]);

  const startChat = async (language: string, userCity: string, userState: string) => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const tools = [
        {
          googleSearch: {}
        }
      ];
      const config = {
        systemInstruction: getParentSystemInstruction(language, userCity, userState),
        thinkingConfig: {
          thinkingBudget: -1,
        },
        tools,
      };
      const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: config
      });
      setChat(newChat);
      
      const initialContext = `I'm a parent from ${userCity}, ${userState}. My child is considering these streams: ${selectedStreams.join(', ')}. Our family priorities for their career are: ${selectedPriorities.join(', ')}. Please start with question 1 from the sequence: "What career do you imagine for your child?" with the specified options.`;
      
      const response: GenerateContentResponse = await newChat.sendMessage({ message: initialContext });
      processResponse(response.text);

    } catch (error) {
      console.error("Initialization failed:", error);
      setMessages([{ sender: 'assistant', text: "Sorry, I couldn't start the conversation. Please check the API key and refresh." }]);
    } finally {
      setIsLoading(false);
    }
  };

    // Helper function to clean and validate JSON
    const cleanAndParseJSON = (jsonString: string): any | null => {
        try {
            // Attempt to repair common JSON issues before parsing
            let repairedJson = jsonString
                // Remove trailing commas from objects and arrays
                .replace(/,(\s*[}\]])/g, '$1')
                // Add quotes to unquoted keys
                .replace(/([{,])(\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1$2"$3":')
                // Replace single quotes with double quotes
                .replace(/'/g, '"');

            return JSON.parse(repairedJson);
        } catch (error) {
            console.error("Initial JSON parsing failed:", error);
            // If it still fails, try a more aggressive approach
            try {
                // This is a less safe method, but can sometimes recover malformed JSON
                const evilEval = (json: string) => {
                    return eval('(' + json + ')');
                }
                return evilEval(jsonString);
            } catch (evalError) {
                console.error("Aggressive JSON parsing (eval) failed:", evalError);
                return null;
            }
        }
    };

    const fetchRealTimeMarketData = async (city: string, state: string) => {
    setIsLoadingHeatmap(true);
    try {
      // Simulate real-time market data fetching with web search
      const mockData: RealTimeMarketData[] = [
        {
          sector: 'Information Technology',
          demand_level: 'high',
          growth_rate: 15.2,
          avg_salary: '₹8-25 LPA',
          job_count: 2847,
          trend: 'rising',
          location: city
        },
        {
          sector: 'Healthcare & Medicine',
          demand_level: 'high',
          growth_rate: 12.8,
          avg_salary: '₹6-20 LPA',
          job_count: 1923,
          trend: 'rising',
          location: city
        },
        {
          sector: 'Engineering',
          demand_level: 'medium',
          growth_rate: 8.5,
          avg_salary: '₹5-18 LPA',
          job_count: 1456,
          trend: 'stable',
          location: city
        },
        {
          sector: 'Government Services',
          demand_level: 'medium',
          growth_rate: 4.2,
          avg_salary: '₹4-12 LPA',
          job_count: 892,
          trend: 'stable',
          location: city
        },
        {
          sector: 'Finance & Banking',
          demand_level: 'medium',
          growth_rate: 6.7,
          avg_salary: '₹5-15 LPA',
          job_count: 734,
          trend: 'rising',
          location: city
        }
      ];
      
      setRealTimeData(mockData);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setIsLoadingHeatmap(false);
    }
  };

  const processResponse = (responseText: string) => {
    let jsonString = null;
    const cleanedText = responseText.trim();

    // Enhanced Strategy: Find the JSON block regardless of markdown or prefixes
    const startIndex = cleanedText.indexOf('{');
    const endIndex = cleanedText.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        jsonString = cleanedText.substring(startIndex, endIndex + 1);
        if (jsonString) {
            const data = cleanAndParseJSON(jsonString);
            if (data && (data.recommended_careers || data.comparative_case_study)) {
                // Store data in localStorage for dashboard
                localStorage.setItem('parentReportData', JSON.stringify(data));
                localStorage.setItem('parentCity', city);
                localStorage.setItem('parentState', state);
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'parent-dashboard.html';
                }, 1500);
                
                setMessages(prev => [...prev, { sender: 'assistant', text: "✅ Report generated successfully! Redirecting to your personalized dashboard..." }]);
                setCurrentOptions([]);
                return;
            } else {
                console.error("JSON parsing failed even after cleaning. Raw string:", jsonString);
            }
        }
    }

    // Fallback to processing as plain text if no valid JSON is found or parsing fails
    const lines = cleanedText.split('\n').filter(line => line.trim() !== '');
    const options = lines
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-s*/, '').trim())
        .filter(option => option.length > 0);

    let mainMessage = cleanedText;
    if (options.length > 0) {
        const firstOptionIndex = lines.findIndex(line => line.trim().startsWith('-'));
        if (firstOptionIndex > 0) {
            mainMessage = lines.slice(0, firstOptionIndex).join('\n').trim();
        }
    }

    setMessages(prev => [...prev, { sender: 'assistant', text: mainMessage }]);
    setCurrentOptions(options);
};


  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim() && stateInput.trim()) {
      setCity(cityInput.trim());
      setState(stateInput.trim());
      setSetupStep('language');
    }
  };

  const handleLanguageSelect = (language: string) => {
    setPreferredLanguage(language);
    setSetupStep('streams');
  };

  const handleStreamToggle = (stream: string) => {
    setSelectedStreams(prev => 
        prev.includes(stream) 
            ? prev.filter(s => s !== stream) 
            : [...prev, stream]
    );
  };

  const handleStreamsSubmit = () => {
    if (selectedStreams.length > 0) {
      setSetupStep('priorities');
    }
  };

  const handlePriorityToggle = (priority: string) => {
    setSelectedPriorities(prev => 
        prev.includes(priority) 
            ? prev.filter(p => p !== priority) 
            : [...prev, priority]
    );
  };

  const handlePrioritiesSubmit = () => {
    if (selectedPriorities.length > 0) {
      setSetupStep('chat');
      startChat(preferredLanguage, city, state);
    }
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev => 
        prev.includes(option) 
            ? prev.filter(o => o !== option) 
            : [...prev, option]
    );
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const sendMessageWithRetry = async (message: string, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await chat!.sendMessage({ message });
        return response;
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            setMessages(prev => [...prev, { 
              sender: 'assistant', 
              text: `The AI service is busy. Retrying in ${waitTime/1000} seconds... (Attempt ${attempt}/${maxRetries})` 
            }]);
            await sleep(waitTime);
            continue;
          }
        }
        
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  };

  const handleSubmitSelections = async () => {
    if (!chat || isLoading || selectedOptions.length === 0) return;

    const combinedResponse = selectedOptions.join(', ');
    setMessages(prev => [...prev, { sender: 'user', text: combinedResponse }]);
    
    setCurrentOptions([]);
    setSelectedOptions([]);
    setIsLoading(true);

    try {
        const response = await sendMessageWithRetry(combinedResponse);
        processResponse(response.text);
    } catch (error: any) {
        console.error("Error sending message:", error);
        let errorMessage = "Something went wrong. Please try again.";
        
        if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
          errorMessage = "The AI service is currently overloaded. Please wait a few minutes and try again.";
        } else if (error?.message?.includes('quota')) {
          errorMessage = "API quota exceeded. Please try again later.";
        } else if (error?.message?.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        
        setMessages(prev => [...prev, { sender: 'assistant', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat || isLoading || !textInput.trim()) return;

    const userMessage = textInput.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    
    setTextInput('');
    setIsLoading(true);

    try {
        const response = await sendMessageWithRetry(userMessage);
        processResponse(response.text);
    } catch (error: any) {
        console.error("Error sending message:", error);
        let errorMessage = "Something went wrong. Please try again.";
        
        if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
          errorMessage = "The AI service is currently overloaded. Please wait a few minutes and try again.";
        } else if (error?.message?.includes('quota')) {
          errorMessage = "API quota exceeded. Please try again later.";
        } else if (error?.message?.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        
        setMessages(prev => [...prev, { sender: 'assistant', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRestart = () => {
      setChat(null);
      setMessages([]);
      setCurrentOptions([]);
      setSelectedOptions([]);
      setTextInput('');
      setIsLoading(false);
      setFinalReport(null);
      setCity('');
      setState('');
      setCityInput('');
      setStateInput('');
      setPreferredLanguage('');
      setSelectedStreams([]);
      setSelectedPriorities([]);
      setSetupStep('city');
  }

  const goBackToLanding = () => {
    window.location.href = 'landing.html';
  };

  const renderSetup = () => {
    if (setupStep === 'city') {
      return (
        <div className="setup-container">
          <div className="setup-box">
            <h2>Welcome, Parent!</h2>
            <p>Let's find the best career path for your child with hyperlocal insights. Please tell us your location.</p>
            <form onSubmit={handleCitySubmit}>
              <input 
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Enter your city (e.g., Mumbai, Pune)"
                aria-label="Enter your city"
                autoFocus
              />
              <input 
                type="text"
                value={stateInput}
                onChange={(e) => setStateInput(e.target.value)}
                placeholder="Enter your state (e.g., Maharashtra, Delhi)"
                aria-label="Enter your state"
              />
              <button type="submit" className="setup-button">Continue</button>
            </form>
          </div>
        </div>
      );
    }
    
    if (setupStep === 'language') {
      return (
        <div className="setup-container">
          <div className="setup-box">
            <h2>Select Language</h2>
            <p>Please choose your preferred language for the conversation.</p>
            <div className="language-options">
              <button className="language-button" onClick={() => handleLanguageSelect('English')}>English</button>
              <button className="language-button" onClick={() => handleLanguageSelect('Hindi')}>हिन्दी</button>
              <button className="language-button" onClick={() => handleLanguageSelect('Tamil')}>தமிழ்</button>
              <button className="language-button" onClick={() => handleLanguageSelect('Bengali')}>বাংলা</button>
            </div>
          </div>
        </div>
      );
    }

    if (setupStep === 'streams') {
      const streams = [
        'Science (PCM - Physics, Chemistry, Math)',
        'Science (PCB - Physics, Chemistry, Biology)', 
        'Commerce (with Math)',
        'Commerce (without Math)',
        'Arts/Humanities',
        'Vocational/Technical',
        'Still deciding/Multiple options'
      ];

      return (
        <div className="setup-container">
          <div className="setup-box">
            <h2>Child's Stream Selection</h2>
            <p>Which stream(s) have you chosen or are considering for your child? You can select multiple options.</p>
            <div className="streams-grid">
              {streams.map((stream, index) => (
                <div key={index} className="option-item">
                  <input
                    type="checkbox"
                    id={`stream-${index}`}
                    checked={selectedStreams.includes(stream)}
                    onChange={() => handleStreamToggle(stream)}
                  />
                  <label htmlFor={`stream-${index}`}>{stream}</label>
                </div>
              ))}
            </div>
            <button
              className="setup-button"
              onClick={handleStreamsSubmit}
              disabled={selectedStreams.length === 0}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    if (setupStep === 'priorities') {
      const priorities = [
        'Good Salary',
        'Job guarantee/stability',
        'Job in hometown/village',
        'Live near family',
        'Social respect/status',
        'Foreign/urban opportunities',
        'Work-life balance',
        'Skill/art development',
        'Established/known career'
      ];

      return (
        <div className="setup-container">
          <div className="setup-box">
            <h2>Career Priorities</h2>
            <p>For your child's career, what is MOST important? Select all that apply.</p>
            <div className="priorities-grid">
              {priorities.map((priority, index) => (
                <div key={index} className="option-item">
                  <input
                    type="checkbox"
                    id={`priority-${index}`}
                    checked={selectedPriorities.includes(priority)}
                    onChange={() => handlePriorityToggle(priority)}
                  />
                  <label htmlFor={`priority-${index}`}>{priority}</label>
                </div>
              ))}
            </div>
            <button
              className="setup-button"
              onClick={handlePrioritiesSubmit}
              disabled={selectedPriorities.length === 0}
            >
              Start Career Guidance
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  const renderChat = () => (
    <>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="bubble"><p>{msg.text}</p></div>
          </div>
        ))}
        {isLoading && (
            <div className="message assistant">
                <div className="bubble">
                    <div className="fun-facts-loader">
                        <div className="fun-fact-content">
                            <div className="fun-fact-icon">🎯</div>
                            <div className="fun-fact-text">
                                <h4>Generating your personalized career report...</h4>
                                <p className="fun-fact">{funFacts[currentFunFact]}</p>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {finalReport && (
            <div className="final-report">
                <h2>Career Recommendations for Your Child</h2>
                
                {/* Real-Time Market Heatmap */}
                <div className="report-section">
                  <h3>🔥 Real-Time Market Heatmap - {city}, {state}</h3>
                  {isLoadingHeatmap ? (
                    <div className="heatmap-loading">
                      <div className="loading-indicator">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                      <p>Fetching latest market data...</p>
                    </div>
                  ) : (
                    <div className="heatmap-container">
                      <div className="heatmap-grid">
                        {realTimeData.map((data, i) => (
                          <div key={i} className={`heatmap-tile ${data.demand_level}`}>
                            <div className="heatmap-header">
                              <h4>{data.sector}</h4>
                              <span className={`trend-indicator ${data.trend}`}>
                                {data.trend === 'rising' ? '📈' : data.trend === 'stable' ? '➡️' : '📉'}
                              </span>
                            </div>
                            <div className="heatmap-metrics">
                              <div className="metric">
                                <span className="metric-label">Growth Rate</span>
                                <span className="metric-value">{data.growth_rate}%</span>
                              </div>
                              <div className="metric">
                                <span className="metric-label">Avg Salary</span>
                                <span className="metric-value">{data.avg_salary}</span>
                              </div>
                              <div className="metric">
                                <span className="metric-label">Job Openings</span>
                                <span className="metric-value">{data.job_count.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className={`demand-badge ${data.demand_level}`}>
                              {data.demand_level.toUpperCase()} DEMAND
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {finalReport.heatmap_data && (
                  <div className="report-section">
                    <h3>Local Market Insights</h3>
                    {finalReport.heatmap_data.high_demand_sectors && (
                      <div className="heatmap-item">
                        <h4>High Demand Sectors:</h4>
                        <div className="sector-grid">
                          {finalReport.heatmap_data.high_demand_sectors.map((sector, i) => (
                            <div key={i} className="sector-card">
                              <h5>{sector.sector}</h5>
                              <p>Growth: {sector.growth_rate}</p>
                              <p>Salary: {sector.avg_salary}</p>
                              <p>Jobs: {sector.job_openings}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {finalReport.heatmap_data.salary_hotspots && (
                      <div className="heatmap-item">
                        <h4>Salary Hotspots:</h4>
                        <div className="hotspot-grid">
                          {finalReport.heatmap_data.salary_hotspots.map((spot, i) => (
                            <div key={i} className="hotspot-card">
                              <h5>{spot.location}</h5>
                              <p>Avg Salary: {spot.avg_salary}</p>
                              <p>Companies: {spot.top_companies.join(', ')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {finalReport.heatmap_data.education_hubs && (
                      <div className="heatmap-item">
                        <h4>Education Hubs:</h4>
                        <div className="education-grid">
                          {finalReport.heatmap_data.education_hubs.map((hub, i) => (
                            <div key={i} className="education-card">
                              <h5>{hub.institute_name}</h5>
                              <p>Courses: {hub.courses_offered.join(', ')}</p>
                              <p>Fees: {hub.fees}</p>
                              <p>Placement: {hub.placement_rate}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="report-section">
                    <h3>Based On Your Priorities</h3>
                    <ul>{finalReport.reasons.map((reason, i) => <li key={i}>{reason}</li>)}</ul>
                </div>
                
                <div className="report-section">
                    <h3>Recommended Career Paths</h3>
                    {finalReport.recommended_careers.map((career, i) => (
                        <div className="career-card enhanced" key={i}>
                            <div className="career-header">
                              <h4>{career.field}</h4>
                              {career.family_fit_score && (
                                <div className="fit-score">Family Fit: {career.family_fit_score}</div>
                              )}
                            </div>
                            <p>{career.reason}</p>
                            {career.local_salary && (
                              <div className="career-detail">
                                <strong>Local Salary:</strong> {career.local_salary}
                              </div>
                            )}
                            {career.job_availability && (
                              <div className="career-detail">
                                <strong>Job Availability:</strong> {career.job_availability}
                              </div>
                            )}
                            {career.growth_trend && (
                              <div className="career-detail">
                                <strong>Market Trend:</strong> {career.growth_trend}
                              </div>
                            )}
                            {career.local_companies && career.local_companies.length > 0 && (
                              <div className="career-detail">
                                <strong>Local Companies:</strong> {career.local_companies.join(', ')}
                              </div>
                            )}
                        </div>
                    ))}
                </div>

                {finalReport.comparative_case_study && (
                  <div className="report-section">
                    <h3>📊 Side-by-Side Career Comparison</h3>
                    
                    {/* Enhanced Side-by-Side Comparison Table */}
                    <div className="comparison-container">
                      <div className="comparison-header">
                        <div className="comparison-metric-labels">
                          <div className="metric-label">Career Field</div>
                          <div className="metric-label">Salary Range</div>
                          <div className="metric-label">Job Security</div>
                          <div className="metric-label">Family Fit Score</div>
                          <div className="metric-label">Local Opportunities</div>
                          <div className="metric-label">Education Cost</div>
                          <div className="metric-label">Migration Required</div>
                        </div>
                      </div>
                      
                      <div className="comparison-rows">
                        {Object.entries(finalReport.comparative_case_study.career_comparison_table).map(([career, data], index) => (
                          <div key={career} className={`comparison-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                            <div className="career-name">
                              <h5>{career}</h5>
                            </div>
                            <div className="comparison-metrics">
                              <div className="metric-cell salary">
                                <span className="mobile-label">Salary:</span>
                                <span className="value">{data.salary_range}</span>
                              </div>
                              <div className={`metric-cell security ${data.job_security.toLowerCase()}`}>
                                <span className="mobile-label">Security:</span>
                                <span className="value">
                                  {data.job_security === 'High' ? '🟢' : data.job_security === 'Medium' ? '🟡' : '🔴'}
                                  {data.job_security}
                                </span>
                              </div>
                              <div className="metric-cell fit-score">
                                <span className="mobile-label">Family Fit:</span>
                                <span className="value">
                                  <div className="score-bar">
                                    <div className="score-fill" style={{width: `${(parseInt(data.family_fit_score) / 10) * 100}%`}}></div>
                                  </div>
                                  {data.family_fit_score}
                                </span>
                              </div>
                              <div className="metric-cell opportunities">
                                <span className="mobile-label">Opportunities:</span>
                                <span className="value">{data.local_opportunities}</span>
                              </div>
                              <div className="metric-cell cost">
                                <span className="mobile-label">Cost:</span>
                                <span className="value">{data.education_cost}</span>
                              </div>
                              <div className={`metric-cell migration ${data.migration_required.toLowerCase()}`}>
                                <span className="mobile-label">Migration:</span>
                                <span className="value">
                                  {data.migration_required === 'Yes' ? '✈️' : '🏠'}
                                  {data.migration_required}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Enhanced Pros & Cons Analysis */}
                    <div className="pros-cons-comparison">
                      <h4>📋 Detailed Pros & Cons Analysis</h4>
                      <div className="pros-cons-grid-enhanced">
                        {Object.entries(finalReport.comparative_case_study.pros_cons_analysis).map(([career, analysis]) => (
                          <div key={career} className="pros-cons-card-enhanced">
                            <div className="career-header-enhanced">
                              <h5>{career}</h5>
                            </div>
                            <div className="pros-cons-content">
                              <div className="pros-section">
                                <div className="section-header pros-header">
                                  <span className="icon">✅</span>
                                  <h6>Advantages</h6>
                                </div>
                                <ul className="pros-list">
                                  {analysis.pros.map((pro, i) => (
                                    <li key={i} className="pro-item">{pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="cons-section">
                                <div className="section-header cons-header">
                                  <span className="icon">⚠️</span>
                                  <h6>Challenges</h6>
                                </div>
                                <ul className="cons-list">
                                  {analysis.cons.map((con, i) => (
                                    <li key={i} className="con-item">{con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {finalReport.local_success_stories && finalReport.local_success_stories.length > 0 && (
                  <div className="report-section">
                    <h3>Local Success Stories</h3>
                    <div className="success-stories-grid">
                      {finalReport.local_success_stories.map((story, i) => (
                        <div key={i} className="success-story-card">
                          <h5>{story.name}</h5>
                          <p><strong>Career:</strong> {story.career}</p>
                          <p><strong>Company:</strong> {story.company}</p>
                          <p><strong>Salary:</strong> {story.salary}</p>
                          <p><strong>Background:</strong> {story.background}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {finalReport.youtube_recommendations && finalReport.youtube_recommendations.length > 0 && (
                  <div className="report-section">
                    <h3>YouTube Recommendations</h3>
                    <div className="youtube-grid">
                      {finalReport.youtube_recommendations.map((video, i) => (
                        <div key={i} className="youtube-card">
                          <h5>{video.title}</h5>
                          <p><strong>Channel:</strong> {video.channel}</p>
                          <p><strong>Relevance:</strong> {video.relevance}</p>
                          <a href={video.url} target="_blank" rel="noopener noreferrer" className="youtube-link">
                            Watch Video
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {finalReport.alternative_suggestions && finalReport.alternative_suggestions.length > 0 && (
                  <div className="report-section">
                    <h3>Alternative Career Suggestions</h3>
                    <div className="alternatives-grid">
                      {finalReport.alternative_suggestions.map((suggestion, i) => (
                        <div key={i} className="alternative-card">
                          <h5>{suggestion.field}</h5>
                          <p><strong>Reason:</strong> {suggestion.reason}</p>
                          <p><strong>Market Demand:</strong> {suggestion.market_demand}</p>
                          <p><strong>Salary Potential:</strong> {suggestion.salary_potential}</p>
                          <p><strong>Alignment Score:</strong> {suggestion.alignment_score}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button className="restart-button" onClick={handleRestart}>Start Over</button>
            </div>
        )}
      </div>
      {!finalReport && !isLoading && currentOptions.length > 0 && (
        <div className="options-container">
          <div className="options-grid">
            {currentOptions.map((option, index) => (
              <div key={index} className="option-item">
                <input
                  type="checkbox"
                  id={`option-${index}`}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleOptionToggle(option)}
                />
                <label htmlFor={`option-${index}`}>{option}</label>
              </div>
            ))}
          </div>
          <button
            className="submit-options-button"
            onClick={handleSubmitSelections}
            disabled={selectedOptions.length === 0}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="app-container">
      <header>
        <div className="header-content">
          <button className="back-button" onClick={goBackToLanding}>
            ← Back to Home
          </button>
          <h1>Parent Career Guidance</h1>
          <div className="assessment-badge">
            👨‍👩‍👧‍👦 Parent
          </div>
        </div>
      </header>
      {setupStep === 'chat' ? renderChat() : renderSetup()}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<ParentApp />);
