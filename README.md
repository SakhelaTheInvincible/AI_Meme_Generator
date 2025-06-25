# Meme Generator

## Setup

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
