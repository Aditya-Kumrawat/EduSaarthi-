import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import './index.css';

const getSystemInstruction = (language: string, city: string, postReport?: FinalReport) => `You are a smart, empathetic career discovery assistant helping students explore career options based on their interests and preferences. Focus on the student's own experiences and activities.

IMPORTANT: You MUST conduct the entire conversation in ${language}.
IMPORTANT: When recommending careers, consider the context and opportunities in ${city}, India.

${postReport ? `CONTEXT: You have already provided career recommendations to this student:
${postReport.recommended_careers.map(career => `- ${career.field}: ${career.reason}`).join('\n')}

The student may now ask follow-up questions about these recommendations, want clarification, or seek additional guidance. Answer their questions directly and helpfully, referencing the previous recommendations when relevant.` : `Your task:
- Ask situational questions about what the student enjoys doing, not technical career terms
- Use relatable activities and scenarios that students can understand
- For every question, always reply in one of two formats:
    1. MCQ-format: Plain text with options clearly laid out (use bullet format).
    2. JSON format: Key "question" and key "options" (array of strings), for API/UI use.

Rules:
- Never ask open-ended or free-text questions.
- Always suggest tickable MCQ options for every question.
- Ask about activities, hobbies, and situations rather than career fields
- Use simple language that students can relate to
- Build up from basic interests to more specific preferences
- If you feel enough information is collected, respond with a JSON object containing "recommended_careers" (array of top career fields, with a brief rationale, recommended degrees, and relevant courses for each) and "reasons" keys.
- For each career recommendation, include:
  * "field": Career field name
  * "reason": Brief explanation of why it fits
  * "recommended_degrees": Array of 3-4 relevant degree programs available in India
  * "relevant_courses": Array of 4-5 specific courses/certifications that would be valuable`}

Examples:

Sample 1 (MCQ):
What do you enjoy doing in your free time?
- Solving puzzles and brain teasers
- Reading books and stories
- Drawing or creating art
- Playing sports or being active
- Using computers or mobile apps
- Helping friends with problems
- Learning about how things work

Sample 2 (Situational):
When working on a group project, what role do you naturally take?
- I like to organize and lead the team
- I enjoy researching and finding information
- I prefer creating presentations or visuals
- I like to help resolve conflicts between team members
- I enjoy building or making things
- I like to come up with creative ideas
- I prefer to support others and help them succeed

Sample 3 (Career Suggestion JSON):
{
  "recommended_careers": [
    {
      "field": "Software Development",
      "reason": "You enjoy solving puzzles and working with technology, which are key skills in programming.",
      "recommended_degrees": ["B.Tech in Computer Science", "BCA (Bachelor of Computer Applications)", "B.Sc in Information Technology"],
      "relevant_courses": ["Full Stack Web Development", "Data Structures & Algorithms", "Mobile App Development", "Cloud Computing"]
    },
    {
      "field": "Graphic Design",
      "reason": "Your love for creating art and visual presentations aligns well with design careers.",
      "recommended_degrees": ["B.Des in Graphic Design", "BFA (Bachelor of Fine Arts)", "B.Sc in Multimedia & Animation"],
      "relevant_courses": ["Adobe Creative Suite", "UI/UX Design", "Digital Illustration", "Brand Identity Design"]
    }
  ],
  "reasons": [
    "Based on your interest in problem-solving and technology.",
    "You enjoy creative activities and helping others understand information visually."
  ]
}

For every response, always use one of the above formats and NEVER return general text or free-form paragraphs.`;


interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isCareerData?: boolean;
}

interface CareerRecommendation {
  field: string;
  reason: string;
  recommended_degrees: string[];
  relevant_courses: string[];
}

interface FinalReport {
  recommended_careers: CareerRecommendation[];
  reasons: string[];
}

const App = () => {
  const [setupStep, setSetupStep] = useState<'city' | 'language' | 'chat'>('city');
  const [city, setCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [assessmentType, setAssessmentType] = useState<'student' | 'parent'>('student');
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [postReportMode, setPostReportMode] = useState<boolean>(false);
  const [postReportInput, setPostReportInput] = useState<string>('');
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Check assessment type from localStorage (set by landing page)
    const storedAssessmentType = localStorage.getItem('assessmentType');
    if (storedAssessmentType === 'parent' || storedAssessmentType === 'student') {
      setAssessmentType(storedAssessmentType);
    }
  }, []);

  const startChat = async (language: string, userCity: string) => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction: getSystemInstruction(language, userCity),
          }
      });
      setChat(newChat);
      
      const response: GenerateContentResponse = await newChat.sendMessage({ message: "Start the conversation. Ask the first question." });
      processResponse(response.text);

    } catch (error) {
      console.error("Initialization failed:", error);
      setMessages([{ sender: 'assistant', text: "Sorry, I couldn't start the conversation. Please check the API key and refresh." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startPostReportChat = async () => {
    if (!finalReport) return;
    
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction: getSystemInstruction(preferredLanguage, city, finalReport),
          }
      });
      setChat(newChat);
      setPostReportMode(true);
      
      setMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: "I've provided your career recommendations above. Do you have any questions about these suggestions? I can help clarify details, explain career paths, or provide more information about any of the recommended fields." 
      }]);

    } catch (error) {
      console.error("Post-report chat initialization failed:", error);
      setMessages(prev => [...prev, { sender: 'assistant', text: "Sorry, I couldn't start the follow-up conversation. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const processResponse = (responseText: string) => {
    try {
        responseText = responseText.trim();
        
        // Extract JSON from markdown code blocks or direct JSON
        let jsonText = responseText;
        if (responseText.includes('```json')) {
            const jsonMatch = responseText.match(/```json\s*\n?([\s\S]*?)\n?```/);
            if (jsonMatch) {
                jsonText = jsonMatch[1].trim();
            }
        } else if (responseText.startsWith('```') && responseText.endsWith('```')) {
            // Handle cases where it's just ``` without json specifier
            jsonText = responseText.replace(/^```\s*\n?/, '').replace(/\n?```$/, '').trim();
        }
        
        // Check if response contains JSON even in post-report mode
        if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
            try {
                const data = JSON.parse(jsonText);
                if (data.recommended_careers && postReportMode) {
                    // Handle career recommendations in post-report mode
                    setMessages(prev => [...prev, { sender: 'assistant', text: "Here are some additional career recommendations based on your question:" }]);
                    // Create a temporary report to display the career cards
                    const tempReport: FinalReport = {
                        recommended_careers: data.recommended_careers,
                        reasons: data.reasons || []
                    };
                    // Add career cards as a special message type
                    setMessages(prev => [...prev, { sender: 'assistant', text: JSON.stringify(tempReport), isCareerData: true } as any]);
                    setCurrentOptions([]);
                    return;
                }
            } catch (e) {
                console.log("JSON parsing failed:", e);
                // If JSON parsing fails, treat as regular text
            }
        }
        
        // In post-report mode, treat as regular text if not career JSON
        if (postReportMode) {
            setMessages(prev => [...prev, { sender: 'assistant', text: responseText }]);
            setCurrentOptions([]);
            return;
        }
        
        if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
            const data = JSON.parse(jsonText);
            if (data.recommended_careers) {
                setFinalReport(data);
                setMessages(prev => [...prev, { sender: 'assistant', text: "Here are some career recommendations based on your answers." }]);
                setCurrentOptions([]);
            } else if (data.question && data.options) {
                setMessages(prev => [...prev, { sender: 'assistant', text: data.question }]);
                setCurrentOptions(data.options);
            }
        } else {
            const lines = responseText.split('\n').filter(line => line.trim() !== '');
            
            // Find the question (first non-bullet line)
            let questionIndex = 0;
            while (questionIndex < lines.length && lines[questionIndex].trim().startsWith('-')) {
                questionIndex++;
            }
            
            const question = questionIndex < lines.length ? lines[questionIndex] : lines[0];
            
            // Find all bullet point options
            const options = lines
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim())
                .filter(option => option.length > 0);
            
            setMessages(prev => [...prev, { sender: 'assistant', text: question }]);
            setCurrentOptions(options);
        }
    } catch (error) {
        console.error("Error processing response:", error);
        setMessages(prev => [...prev, { sender: 'assistant', text: "I encountered an issue. Please restart the conversation." }]);
        setCurrentOptions([]);
    }
  };

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setCity(cityInput.trim());
      setSetupStep('language');
    }
  };

  const handleLanguageSelect = (language: string) => {
    setPreferredLanguage(language);
    setSetupStep('chat');
    startChat(language, city);
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev => 
        prev.includes(option) 
            ? prev.filter(o => o !== option) 
            : [...prev, option]
    );
  };

  const handleSubmitSelections = async () => {
    if (!chat || isLoading || selectedOptions.length === 0) return;

    const combinedResponse = selectedOptions.join(', ');
    setMessages(prev => [...prev, { sender: 'user', text: combinedResponse }]);
    
    setCurrentOptions([]);
    setSelectedOptions([]);
    setIsLoading(true);

    try {
        const response = await chat.sendMessage({ message: combinedResponse });
        processResponse(response.text);
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => [...prev, { sender: 'assistant', text: "Something went wrong. Please try again." }]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRestart = () => {
      setChat(null);
      setMessages([]);
      setCurrentOptions([]);
      setSelectedOptions([]);
      setIsLoading(false);
      setFinalReport(null);
      setPostReportMode(false);
      setPostReportInput('');
      setCity('');
      setCityInput('');
      setPreferredLanguage('');
      setSetupStep('city');
  }

  const handlePostReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat || !postReportInput.trim() || isLoading) return;

    const userMessage = postReportInput.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setPostReportInput('');
    setIsLoading(true);

    try {
        const response = await chat.sendMessage({ message: userMessage });
        processResponse(response.text);
    } catch (error) {
        console.error("Error sending post-report message:", error);
        setMessages(prev => [...prev, { sender: 'assistant', text: "Something went wrong. Please try again." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const renderSetup = () => {
    if (setupStep === 'city') {
      return (
        <div className="setup-container">
          <div className="setup-box">
            <h2>{assessmentType === 'student' ? 'Welcome, Student!' : 'Welcome, Parent!'}</h2>
            <p>{assessmentType === 'student' 
              ? 'Let\'s discover your career interests! First, tell us your city to get local opportunities.' 
              : 'Let\'s find the best career path for your child with local insights. Please tell us your city.'}</p>
            <form onSubmit={handleCitySubmit}>
              <input 
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="E.g., Mumbai, Delhi, Chennai"
                aria-label="Enter your city"
                autoFocus
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
    return null;
  };
  
  const renderChat = () => {
    if (finalReport && postReportMode) {
      // Split-screen layout: report on left, chat on right
      return (
        <div className="split-screen-container">
          <div className="report-panel">
            <div className="final-report">
              <h2>Career Recommendations</h2>
              <div className="report-section">
                <h3>Based On Your Answers</h3>
                <ul>{finalReport.reasons.map((reason, i) => <li key={i}>{reason}</li>)}</ul>
              </div>
              <div className="report-section">
                <h3>Suggested Fields</h3>
                {finalReport.recommended_careers.map((career, i) => (
                  <div className="career-card" key={i}>
                    <h4>{career.field}</h4>
                    <p>{career.reason}</p>
                    <div className="education-section">
                        <div className="degrees-section">
                            <h5>📚 Recommended Degrees:</h5>
                            <ul>
                                {career.recommended_degrees?.map((degree, j) => (
                                    <li key={j}>{degree}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="courses-section">
                            <h5>🎯 Relevant Courses:</h5>
                            <ul>
                                {career.relevant_courses?.map((course, j) => (
                                    <li key={j}>{course}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="report-actions">
                <button className="restart-button" onClick={handleRestart}>Start Over</button>
              </div>
            </div>
          </div>
          
          <div className="chat-panel">
            <div className="chat-window" ref={chatWindowRef}>
              {messages.map((msg, index) => {
                if (msg.isCareerData) {
                  try {
                    const careerData: FinalReport = JSON.parse(msg.text);
                    return (
                      <div key={index} className="message assistant">
                        <div className="career-recommendations-inline">
                          {careerData.recommended_careers.map((career, i) => (
                            <div className="career-card" key={i}>
                              <h4>{career.field}</h4>
                              <p>{career.reason}</p>
                              <div className="education-section">
                                <div className="degrees-section">
                                  <h5>📚 Recommended Degrees:</h5>
                                  <ul>
                                    {career.recommended_degrees?.map((degree, j) => (
                                      <li key={j}>{degree}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="courses-section">
                                  <h5>🎯 Relevant Courses:</h5>
                                  <ul>
                                    {career.relevant_courses?.map((course, j) => (
                                      <li key={j}>{course}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return (
                      <div key={index} className={`message ${msg.sender}`}>
                        <div className="bubble"><p>{msg.text}</p></div>
                      </div>
                    );
                  }
                }
                return (
                  <div key={index} className={`message ${msg.sender}`}>
                    <div className="bubble"><p>{msg.text}</p></div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="message assistant">
                  <div className="bubble">
                    <div className="loading-indicator">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {!isLoading && (
              <div className="post-report-input-container">
                <form onSubmit={handlePostReportSubmit} className="post-report-form">
                  <input
                    type="text"
                    value={postReportInput}
                    onChange={(e) => setPostReportInput(e.target.value)}
                    placeholder="Ask me anything about your career recommendations..."
                    className="post-report-input"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="post-report-submit"
                    disabled={!postReportInput.trim()}
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Regular layout for assessment phase
    return (
      <>
        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((msg, index) => {
            if (msg.isCareerData) {
              try {
                const careerData: FinalReport = JSON.parse(msg.text);
                return (
                  <div key={index} className="message assistant">
                    <div className="career-recommendations-inline">
                      {careerData.recommended_careers.map((career, i) => (
                        <div className="career-card" key={i}>
                          <h4>{career.field}</h4>
                          <p>{career.reason}</p>
                          <div className="education-section">
                            <div className="degrees-section">
                              <h5>📚 Recommended Degrees:</h5>
                              <ul>
                                {career.recommended_degrees?.map((degree, j) => (
                                  <li key={j}>{degree}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="courses-section">
                              <h5>🎯 Relevant Courses:</h5>
                              <ul>
                                {career.relevant_courses?.map((course, j) => (
                                  <li key={j}>{course}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } catch (e) {
                return (
                  <div key={index} className={`message ${msg.sender}`}>
                    <div className="bubble"><p>{msg.text}</p></div>
                  </div>
                );
              }
            }
            return (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="bubble"><p>{msg.text}</p></div>
              </div>
            );
          })}
          {isLoading && (
              <div className="message assistant">
                  <div className="bubble">
                      <div className="loading-indicator">
                          <div className="dot"></div>
                          <div className="dot"></div>
                          <div className="dot"></div>
                      </div>
                  </div>
              </div>
          )}
          {finalReport && !postReportMode && (
              <div className="final-report">
                  <h2>Career Recommendations</h2>
                  <div className="report-section">
                      <h3>Based On Your Answers</h3>
                      <ul>{finalReport.reasons.map((reason, i) => <li key={i}>{reason}</li>)}</ul>
                  </div>
                  <div className="report-section">
                      <h3>Suggested Fields</h3>
                      {finalReport.recommended_careers.map((career, i) => (
                          <div className="career-card" key={i}>
                              <h4>{career.field}</h4>
                              <p>{career.reason}</p>
                              <div className="education-section">
                                  <div className="degrees-section">
                                      <h5>📚 Recommended Degrees:</h5>
                                      <ul>
                                          {career.recommended_degrees?.map((degree, j) => (
                                              <li key={j}>{degree}</li>
                                          ))}
                                      </ul>
                                  </div>
                                  <div className="courses-section">
                                      <h5>🎯 Relevant Courses:</h5>
                                      <ul>
                                          {career.relevant_courses?.map((course, j) => (
                                              <li key={j}>{course}</li>
                                          ))}
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="report-actions">
                      <button className="continue-chat-button" onClick={startPostReportChat}>
                          💬 Ask Questions About These Recommendations
                      </button>
                      <button className="restart-button" onClick={handleRestart}>Start Over</button>
                  </div>
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
  };

  const goBackToLanding = () => {
    window.location.href = 'index.html';
  };

  // Handle Enter key in post-report input
  const handlePostReportKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostReportSubmit(e as any);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-content">
          <button className="back-button" onClick={goBackToLanding}>
            ← Back to Home
          </button>
          <h1>
            {assessmentType === 'student' ? 'Student Career Assessment' : 'Parent Career Guidance'}
          </h1>
          <div className="assessment-badge">
            {assessmentType === 'student' ? '👨‍🎓 Student' : '👨‍👩‍👧‍👦 Parent'}
          </div>
        </div>
      </header>
      {setupStep === 'chat' ? renderChat() : renderSetup()}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);