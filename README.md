# 🎭 AI-Powered Meme Generator

> 🤖 Automatically generate hilarious memes with AI-powered caption creation

## 📋 Project Description

An intelligent meme generation platform that combines artificial intelligence with modern web technologies. Upload any image and watch as our AI creates contextually relevant, humorous captions while intelligently placing text for maximum comedic impact.

**🌟 Key Features:**
- 🎯 AI-powered caption generation using advanced language models
- 🖼️ Smart image analysis and text placement algorithms  
- 📱 Modern responsive UI with glassmorphism design
- 👤 User authentication and social voting system
- 🔄 Support for both single and multi-panel meme formats

**🛠️ Tech Stack:** Django REST API + Next.js + AI Integration (DeepSeek, BotsAI) + OpenCV

---

## ⚙️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/SakhelaTheInvincible/AI_Meme_Generator.git
cd "Meme Generator"
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Create `.env` file in backend directory:
```
DEEPSEEK_API_KEY="Some key"
BOTSAI_API_KEY="Some key"
```

Update `settings.py` database configuration:
```python
DATABASES = {
    ...change database settings here...
}
    
```

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Project

### Backend
```bash
cd backend
venv\Scripts\activate  # Windows
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm run dev
```

Backend: `http://localhost:8000`
Frontend: `http://localhost:3000` 
