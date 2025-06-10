# GestureAI App

## Overview

GestureAI is a mobile application designed to provide real-time translation of American Sign Language (ASL) into text, and vice versa, to enhance communication between deaf/hard-of-hearing individuals and hearing users. The app enables two key features: live sign-to-text recognition using the device camera, and speech-to-text for spoken inputs. 

GestureAI targets mobile users and researchers working in assistive technology, offering an offline-capable and responsive platform that performs gesture inference directly on-device using a PyTorch model. The solution integrates mobile development, computer vision, and AI into a seamless interface suitable for real-time communication.

GestureAI is being developed as part of a research initiative at Midwestern State University, with emphasis on AI-driven accessibility.

---

## **Technologies Used**  
- **React Native (Expo)**  
- **PyTorch (TorchScript)**  
- **FastAPI**  
- **SQLite3 / PostgreSQL**  
- **MediaPipe / OpenCV**  
- **Google Speech-to-Text API (optional)**  

---
## **Dataset**  

The dataset used for training GestureAI was sourced from the [How2Sign](https://how2sign.github.io/#download) project, which provides a large-scale, multi-view collection of American Sign Language videos paired with aligned English translations.

We used:

- **Video clips** of sign language phrases
- **Frame-level annotations** and segment timestamps
- **Text captions** for semantic grounding

The model was trained to recognize gesture patterns corresponding to labeled phrases. This involved aligning temporal segments with their corresponding text annotations, and then training a CNN-based model using frame-wise extracted keypoints and video data.

The dataset was preprocessed into training, validation, and testing splits using custom scripts, and further used to fine-tune our TorchScript model for real-time on-device inference.

---

## [Software Requirements Specification Document](/docs/GestureAI_SRS.pdf)

<a href="https://github.com/asoma0710/GestureAI/blob/main/docs/SRS_Version_1.3_7petabytes%20(1).pdf">
  <img src="https://github.com/asoma0710/GestureAI/blob/main/docs/srs.jpg" alt="SRS Document" width="300"/>
</a>


---

## [Feasibility Study](/docs/GestureAI_Feasibility_Study.pdf)

<a href="https://github.com/asoma0710/GestureAI/blob/main/docs/Feasibility%20Study.pdf">
  <img src="https://github.com/asoma0710/GestureAI/blob/main/docs/fs.jpg" alt="Feasibility Study" width="300"/>
</a>


---


## 📽️ Demo Videos

### 1. **This video demonstrates the problem and the solution we provided with the app**  
[![Live Gesture Recognition](https://img.youtube.com/vi/JxiekddkLgA/hqdefault.jpg)](https://youtu.be/JxiekddkLgA)

### 2. **This video demonstrates the agile methodoligies used in the development of the application**  
[![Live Gesture Recognition](https://img.youtube.com/vi/0yeVmOtsJmA/hqdefault.jpg)](https://youtu.be/0yeVmOtsJmA)

---

## 📦 Features Overview

### 👤 User-Side
- Real-time ASL to text conversion using mobile camera
- Speech-to-text transcription for hearing users
- Toggle between translation modes
- Smooth live preview with gesture overlay
- Works offline (model embedded using TorchScript)

### 🔧 Backend/ML
- TorchScript model inference in mobile
- RESTful FastAPI backend for metadata and logs
- Gesture detection powered by 2D keypoints and CNN
- Vision pipeline using OpenCV/MediaPipe
- Pose-based trigger to prevent idle inference

---

## 🛠️ Tech Stack

### 🖥️ Frontend
- **React Native + Expo**
- Gesture preview and text overlay
- Camera input with frame throttling
- UI/UX with accessibility in mind

### ⚙️ Backend
- **FastAPI (Python 3.12)**
- TorchScript-based model interface
- SQLite/PostgreSQL database for user/test logs
- Vision model runner for testing in development

### 📊 AI/ML
- **PyTorch CNN Model** trained on ASL image frames
- TorchScript export for mobile runtime
- Frame-based keypoint detection using MediaPipe

---

## 🧠 Model Training Overview

The gesture recognition model was trained using the [How2Sign dataset](https://how2sign.github.io/#download), which includes multi-view ASL videos paired with captioned segments. The training pipeline involves:

- Extracting frames from videos and aligning them with textual annotations
- Generating keypoints using MediaPipe for pose estimation
- Feeding structured sequences into a CNN-based classifier
- Exporting the trained model to TorchScript format using `train_live.py`
- Testing inference with `test_cp.py`

The final TorchScript `.pt` model is bundled in the mobile app for offline, real-time inference.

---

## 🌐 Backend API & Deployment

The backend is built using **FastAPI** and consists of two key components:

- `api.py` – the main server file that exposes RESTful endpoints for client interaction, speech-to-text, and model-related tasks
- `testtospeech.py` – supports voice input handling

### Deployment
The backend is deployed on a **DigitalOcean Ubuntu droplet**, running the FastAPI server using `uvicorn`. Gunicorn/Nginx can also be configured for production.

Example startup:

uvicorn api:app --host 0.0.0.0 --port 8000


### Database Schema & Hosting
The PostgreSQL database is hosted on a DigitalOcean managed database cluster.
Schema creation and table definitions are handled by:

schema.sql – defines tables like AppUsers, Admins, Feedback, Merchandise, Purchases, GestureAIModel, etc.

db.py – initializes the connection and interfaces with the PostgreSQL database using SQLAlchemy or psycopg2.

Tables include:

AppUsers – stores user credentials and profiles

Feedback – captures user input for improvements

Merchandise & Purchases – support the e-commerce module

GestureAIModel – tracks deployed model versions and accuracy

📁 Folder Structure
```bash
GestureAI/
├── gestureaifrontend/          # React Native mobile frontend
│   ├── App.js
│   └── screens/                # All UI pages and navigation
│
├── backend/                    # Backend API code (FastAPI)
│   ├── api.py                  # RESTful API endpoints
│   ├── testtospeech.py         # Speech-to-text processing
│
├── database/                   # Database logic and schema
│   ├── schema.sql              # Table creation scripts
│   └── db.py                   # PostgreSQL connection setup
│
├── model/                      # Model training and testing
│   ├── train_live.py           # Training script
│   └── test_cp.py              # Inference tester
│
├── docs/                       # SRS, feasibility study, images
├── README.md







