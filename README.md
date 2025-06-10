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

## 📁 Project Structure

```plaintext
GestureAI/
├── frontend/                  # React Native mobile app
│   └── gestureapp/
├── backend/                   # FastAPI backend server
│   └── app/
├── model/                     # Trained TorchScript models
├── dataset/                  # Processed image/pose datasets
├── docs/                      # Reports, videos, and assets
├── scripts/                   # Preprocessing and model tools
└── README.md









