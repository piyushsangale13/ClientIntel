# Client Intel 🔍

> An AI-powered research assistant for IT sales representatives to automatically investigate and summarize client company information.


## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Client Intel** is a mobile application designed to help IT sales representatives prepare for client meetings by automatically gathering, analyzing, and summarizing company information from multiple sources including:

- Official company websites
- Recent news articles
- Industry updates
- AI-powered summaries

The app reduces research time from hours to minutes, allowing sales teams to focus on building relationships and closing deals.

## ✨ Features

### 🔐 **User Authentication**
- Secure JWT-based authentication
- Password encryption with bcrypt
- Token storage using Expo Secure Store
- Password change functionality

### 🏢 **Company Research**
- Automated website discovery via Google Custom Search
- Real-time web scraping using Cheerio
- News aggregation from Google News RSS
- 24-hour intelligent caching system
- Structured data extraction (domain, size, locations)

### 🤖 **AI-Powered Analysis**
- Azure OpenAI (GPT-5-mini) integration
- Automatic content summarization
- Structured JSON responses
- Context-aware insights

### 💬 **Interactive Chat**
- Company-specific Q&A
- Conversation history
- Real-time AI responses
- Context-aware follow-up questions

### 📊 **Analytics**
- Token usage tracking
- API cost monitoring
- Research history

## 🛠 Tech Stack

### Frontend
- **Framework:** React Native 0.81.4
- **Development:** Expo ~54.0.12
- **Navigation:** Expo Router 6.0.10
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** React Hooks
- **Authentication:** JWT + Expo Secure Store
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB with Mongoose 8.19.1
- **Authentication:** JWT + bcryptjs
- **Web Scraping:** Cheerio 1.1.2
- **News Parsing:** RSS Parser 3.13.0
- **AI Integration:** Azure OpenAI (openai 6.5.0)

### Third-Party APIs
- **Azure OpenAI API** - GPT-5-mini for text analysis
- **Google Custom Search API** - Website discovery
- **Google News RSS** - News aggregation

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login/    │  │   Company    │  │    Chat      │      │
│  │   Signup    │  │   Research   │  │   Screen     │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ JWT Token
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Backend                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Auth     │  │   Research   │  │     LLM      │      │
│  │ Controller  │  │  Controller  │  │  Controller  │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└────────┬───────────────┬────────────────┬──────────────────┘
         │               │                │
         ▼               ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  MongoDB    │  │   Google     │  │    Azure     │
│  Database   │  │   APIs       │  │   OpenAI     │
└─────────────┘  └──────────────┘  └──────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Expo CLI (`npm install -g expo-cli`)
- Azure OpenAI API key
- Google Custom Search API credentials

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/client-intel.git
   cd client-intel/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   touch .env
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Start the backend server**
   ```bash
   npm start
   ```
   
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update backend URL** in `app/config.js`
   ```javascript
   export default {
     "BACKEND_API_URL": "http://YOUR_IP:5000"  // Replace with your backend URL
   }
   ```

4. **Start Expo development server**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/clientintel

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Azure OpenAI
OPEN_AI_API_KEY=your_azure_openai_api_key
OPEN_AI_API_ENDPOINT=https://your-resource.openai.azure.com/

# Google APIs
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_custom_search_engine_id
```

### Getting API Keys

1. **Azure OpenAI:**
   - Sign up at [Azure Portal](https://portal.azure.com/)
   - Create OpenAI resource
   - Deploy GPT-5-mini model
   - Copy API key and endpoint

2. **Google Custom Search:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Custom Search API
   - Create credentials (API key)
   - Set up Custom Search Engine at [CSE Control Panel](https://cse.google.com/)

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Change Password
```http
POST /api/auth/change_password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "securePassword123",
  "newPassword": "newSecurePassword456"
}
```

### LLM Endpoints (Protected)

#### Research Company
```http
POST /api/llm/company
Authorization: Bearer <token>
Content-Type: application/json

{
  "company": "Microsoft"
}
```

**Response:**
```json
{
  "company": "Microsoft",
  "officialWebsite": "https://www.microsoft.com",
  "companyDomain": "Technology",
  "employeeSize": "200,000+",
  "companyLocations": ["Redmond, USA", "Bangalore, India"],
  "summary": "Microsoft is a leading technology company...",
  "topNews": [
    {
      "title": "Microsoft announces new AI features",
      "link": "https://...",
      "pubDate": "Mon, 20 Oct 2025"
    }
  ],
  "cached": false
}
```

#### Chat with AI
```http
POST /api/llm/prompt
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "What are Microsoft's recent AI initiatives?"
}
```

#### Get Token Usage
```http
GET /api/llm/token_count
Authorization: Bearer <token>
```

## 📁 Project Structure

```
client-intel/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── getResponseController.js    # Chat controller
│   │   └── researchController.js       # Company research
│   ├── middlewares/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── CompanyResearch.js    # Research cache schema
│   │   └── TokenUsage.js         # Token tracking schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   └── llmRoutes.js          # LLM routes
│   ├── utils/
│   │   ├── webScraper.js         # Cheerio scraper
│   │   ├── rssFetcher.js         # News fetcher
│   │   └── llmClient.js          # OpenAI client
│   ├── .env                      # Environment variables
│   ├── .gitignore
│   ├── index.js                  # Server entry point
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── (tabs)/
    │   │   ├── CompanyInfoScreen.jsx   # Main search screen
    │   │   ├── ChatScreen.jsx          # Chat interface
    │   │   ├── ProfileScreen.jsx       # User profile
    │   │   └── _layout.tsx             # Tab navigation
    │   ├── utils/
    │   │   └── Auth.js                 # Auth utilities
    │   ├── LoginScreen.jsx
    │   ├── SignupScreen.jsx
    │   ├── ChangePasswordScreen.jsx
    │   ├── UserAuthenticated.jsx       # Auth guard
    │   ├── config.js                   # API configuration
    │   ├── _layout.tsx                 # Root layout
    │   └── index.tsx                   # Entry point
    ├── assets/
    ├── global.css                      # Tailwind styles
    ├── app.json                        # Expo configuration
    ├── package.json
    └── tailwind.config.js
```

## 📱 Screenshots

### Login & Signup
Beautiful authentication screens with form validation and secure password handling.

### Company Research
Search for any company and get instant comprehensive insights including:
- Official website
- Company domain and industry
- Employee size
- Locations
- AI-generated summary
- Top 3 recent news articles

### Interactive Chat
Ask follow-up questions about the company and get AI-powered responses with full context awareness.

### Profile Management
View user information and change password securely.

## 🔄 Data Flow

1. **User enters company name** → Frontend
2. **API request with JWT** → Backend
3. **Check MongoDB cache** (24-hour validity)
4. If not cached:
   - **Google Custom Search** → Find official website
   - **Web Scraping (Cheerio)** → Extract content
   - **Google News RSS** → Fetch recent news
   - **Azure OpenAI** → Summarize & structure data
   - **MongoDB** → Cache results
5. **Structured response** → Frontend
6. **Display results** → User

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment (Vercel)

The backend is configured for Vercel deployment with `vercel.json`:

```bash
cd backend
vercel --prod
```

### Frontend Deployment (EAS Build)

```bash
cd frontend
eas build --platform android
eas build --platform ios
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Use ESLint configuration provided
- Follow React Native best practices
- Write meaningful commit messages
- Add comments for complex logic

## 🐛 Known Issues

- Web scraping may fail for websites with strict anti-bot measures
- Google News RSS may have rate limiting
- OpenAI API costs can accumulate with heavy usage (use caching!)

## 🔮 Future Enhancements

- [ ] Financial data integration (revenue, funding)
- [ ] Social media sentiment analysis
- [ ] Competitor analysis
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Export reports as PDF
- [ ] Offline mode with local caching
- [ ] Multi-language support
- [ ] Voice input for searches

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Azure OpenAI for powerful AI capabilities
- Expo team for excellent React Native tooling
- MongoDB for flexible data storage
- Google for search and news APIs

## 📞 Support

For support, email support@clientintel.com or open an issue on GitHub.

---

**Made with ❤️ for IT Sales Representatives**

⭐ Star this repo if you find it helpful!
