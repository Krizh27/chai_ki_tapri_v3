# ☕ Chai ki Tapri

Chai ki Tapri is an AI-powered developer hangout where users can have realistic conversations with AI versions of tech educators Hitesh Choudhary and Piyush Garg. The project focuses heavily on recreating their unique teaching styles, communication patterns, and mentoring approaches using carefully engineered persona prompts, rather than simply wrapping an LLM as a generic Q&A bot.

## 🚀 Live Demo

**Live Website:**
https://chai-ki-tapri.onrender.com/

**GitHub Repository:**
https://github.com/Krizh27/chai_ki_tapri_v3

## ✨ Features

- [x] AI conversations with Hitesh Choudhary
- [x] AI conversations with Piyush Garg
- [x] Seamless persona switching
- [x] Real-time streaming responses
- [x] High-speed Groq LLM fallback for redundancy
- [x] Secure Clerk Authentication
- [x] Persistent chat history
- [x] Curated official resource recommendations
- [x] Dark / Light theme UI
- [x] Modern responsive interface
- [x] Secure backend architecture
- [x] Daily usage limits

## 🧠 How It Works

The request lifecycle ensures that every response feels authentic and contextual:

User Message
↓
Resource Intent Detection
↓
Selected Persona Context
↓
Persona Rules & Constraints
↓
LLM Engine (Gemini/Groq)
↓
Real-Time Streaming Response
↓
Chat Interface

## 🏗️ Architecture Overview

- **Frontend:** Built with vanilla JavaScript, EJS templates, and custom CSS for a lightweight and lightning-fast client experience.
- **Backend:** Node.js and Express.js handle API routing, streaming, and prompt assembly.
- **Authentication:** Clerk securely manages user sessions and route protection.
- **AI Layer:** Google Gemini acts as the primary reasoning engine, with a high-speed Groq API integration functioning as a seamless fallback to ensure maximum uptime.
- **Resource Recommendation:** A dedicated service intercepts learning-based queries to inject official curated links dynamically.

## 🎭 Persona Data Collection & Preparation

To create highly authentic replicas of Hitesh Choudhary and Piyush Garg, persona data was collected by carefully analyzing their YouTube videos, social media activity (Twitter/LinkedIn), and course platforms. Crucially, detailed notes were taken on how they talk, interact, and explain complex concepts during their live cohort lectures. These observations were hardcoded specifically into their system prompts to match their accurate personas.

This analysis was distilled into specific traits:
- **Hinglish Vocabulary:** Capturing their specific blend of Hindi and English.
- **Teaching Philosophies:** Hitesh’s "Chai aur Code" approachable style vs. Piyush’s deep-dive, hands-on "Teachyst" style.
- **Response Patterns:** Their tendencies to encourage students, use specific examples, and how they react to broad vs. specific questions.

## ⚙️ Prompt Engineering Strategy

The chatbot utilizes robust, markdown-based system prompts that are dynamically assembled before being sent to the LLM. The strategy includes:
- **Identity & Background:** Injecting their real-world achievements and past roles to provide context.
- **Strict Negative Constraints:** Explicitly forbidding the LLM from hallucinating links, breaking character, or recommending third-party resources.
- **Output Length Rules:** Dynamically adjusting response length to prevent "walls of text", forcing the AI to give short answers for vague questions and direct users to official resources instead.

## 🗂️ Context Management Approach

To ensure smooth conversations without exceeding token limits or crashing the API, the backend implements a rigorous history trimming algorithm:
1. **Message Count Limit:** Keeps only the most recent N messages.
2. **Token/Character Budgeting:** Iterates backward through history, discarding older messages if the total length exceeds the allowed budget.
3. **LLM Strict Formatting:** Ensures the chat history passed to Gemini strictly alternates between 'user' and 'model' to comply with their API requirements.

## 💬 Sample Conversations

**Example 1: Chatting with Hitesh Choudhary**
> **User:** How should I start with backend development?
> 
> **Hitesh:** Dekho yaar, backend develop karna utna bhi mushkil nahi hai jitna lagta hai. Sabse pehle Node.js aur Express se shuru karo. Mere Chai aur Code channel pe pura series pada hai jisme humne database se leke deployment tak sab kuch cover kiya hai. Chai piyo aur code likhna shuru karo!

**Example 2: Chatting with Piyush Garg**
> **User:** Is Next.js better than React?
> 
> **Piyush:** Bhai, dono apni jagah sahi hain. React ek library hai UI banane ke liye, aur Next.js ek framework hai jo React ke upar built hai. Agar aapko SEO aur Server-Side Rendering (SSR) chahiye, toh definitely Next.js better option hai. Main hamesha bolta hu, pehle fundamentals clear karo, uske baad Next.js pe jump karna.

## 📚 Resource Recommendation System

To maintain high educational quality, the chatbot intentionally recommends only official mentor resources. It is strictly forbidden from hallucinating random YouTube videos or suggesting third-party creators.

The system natively formats and recommends:
- Official YouTube Channels
- Official Websites
- Official GitHub Repositories
- Official Courses 

## 🔒 Security

The backend is fortified with practical, lightweight protections to ensure safety without compromising the user experience:

- Clerk Authentication integration
- Rate Limiting (IP and user-based)
- Basic Prompt Injection Protection
- Input Validation
- Daily Usage Limits to manage API costs

## 💡 Challenges Faced

- **Maintaining Consistent Persona Behavior:** Ensuring the LLM didn't slip back into a generic "helpful assistant" tone during long conversations.
- **LLM Redundancy:** Architecting a reliable fallback system to seamlessly switch between Gemini and Groq if rate limits or API outages occurred.
- **Preventing Hallucinated Links:** Forcing the LLM to abandon its habit of inventing fake YouTube URLs and instead rely entirely on the injected curated resource list.
- **Streaming Responses:** Implementing smooth Server-Sent Events (SSE) that handle chunked data seamlessly on the client side.
- **Designing Natural Prompts:** Balancing strict system constraints with the need for a fluid, natural conversation.

## 📖 Setup and Run Instructions

Follow these steps to run the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Krizh27/chai_ki_tapri_v3.git
   cd chai_ki_tapri_v3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   GEMINI_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key
   PORT=3000
   ```

4. **Run the server:**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`.

## 🙌 Final Note

Chai ki Tapri was built with a strong focus on user experience, realistic mentor conversations, and a clean backend architecture. Rather than simply wrapping a generic LLM with a chat interface, this project dives deep into prompt engineering and system constraints to deliver an authentic, specialized educational hangout.
