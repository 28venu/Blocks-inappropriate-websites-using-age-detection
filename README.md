# 🔞 Age-Based Content Blocker using Vision Transformer

This project uses a **Vision Transformer (ViT)** model to estimate the user's age through the **webcam**, and accordingly **blocks inappropriate (18+) websites**. It's designed as a **Chrome Extension** integrated with a **Flask backend** for real-time age prediction.

---

## 🚀 Features

- 🎥 Detects user's face using webcam
- 🧠 Predicts age using pre-trained ViT (Vision Transformer)
- 🔐 Automatically blocks adult content if user is under 18
- 🌐 Chrome Extension with a simple UI toggle
- 🔁 Keeps the Safe Mode state across tab switches and page reloads

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Chrome Extension)
- **Backend:** Python, Flask
- **ML Model:** ViT (from Hugging Face Transformers)
- **Computer Vision:** OpenCV
- **Webcam Access:** MediaDevices API

---

### 🔧 Backend (Flask API)
- **main.py**

```bash
git clone https://github.com/28venu/Blocks-inappropriate-websites-using-age-detection.git
pip install -r requirements.txt
python app.py
