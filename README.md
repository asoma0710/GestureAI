# 🤟 GestureAI — Real-Time American Sign Language Translator

**GestureAI** is a mobile application that translates American Sign Language (ASL) into text in real time using a PyTorch-based deep learning model. Built with React Native (Expo-ejected), this app enables seamless two-way communication between deaf and hearing users through integrated gesture recognition and speech-to-text transcription.

---

## 📌 What We Did

- Developed a mobile app with two main features:
  - **ASL Gesture Recognition** using the device camera and PyTorch model
  - **Speech-to-Text Transcription** using device microphone
- Converted ASL model to **TorchScript** (`.pt`) format for mobile deployment
- Created **native module** (`GestureModel`) bridging React Native and PyTorch
- Implemented **motion detection** to activate recognition only during movement
- Designed UI with **live camera preview** and **translation display**
- Established **two-way communication flow** between users

---

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/GestureAI.git
cd GestureAI
2. Install Dependencies
bash
Copy
Download
npm install
3. Eject from Expo
bash
Copy
Download
npx expo eject
4. Configure Permissions
Android (android/app/src/main/AndroidManifest.xml):

xml
Copy
Download
Run
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
iOS (ios/GestureAI/Info.plist):

xml
Copy
Download
Run
<key>NSCameraUsageDescription</key>
<string>Camera access required for ASL recognition</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access required for speech-to-text</string>
5. Add Model Files
Android: Place asl_model.pt in android/app/src/main/assets/

iOS: Add model to Xcode project via Build Phases

6. Run Application
bash
Copy
Download
# Android
npx react-native run-android

# iOS
npx react-native run-ios
✨ Key Features
Feature	Description
📷 Sign-to-Text	Real-time ASL translation using PyTorch model
🎤 Speech-to-Text	Live voice transcription
🎯 Motion Detection	Activates recognition only during movement
🖥️ Dual Display	Simultaneous camera view and translated text
🔄 Two-Way Chat	Seamless conversation flow between users
🛠 Technology Stack
Core Framework
React Native (Expo-ejected)

AI Engine

PyTorch Mobile (Android)

LibTorch (iOS)

TorchScript model format

Native Modules

Java (Android)

Swift (iOS)

Key Libraries

React Native VisionCamera

React Native Voice

React Native Reanimated

📁 Project Structure
bash
Copy
Download
GestureAI/
├── android/
│   ├── app/src/main/assets/asl_model.pt
│   └── GestureModelModule.java
├── ios/
│   └── GestureModel.swift
├── components/
│   ├── CameraView.js
│   ├── TranslationDisplay.js
│   ├── MotionDetector.js
│   └── SpeechBubble.js
├── utils/
│   ├── frameProcessor.js
│   └── motionUtils.js
├── assets/
├── App.js
└── package.json
� Development Process
https://img.youtube.com/vi/0yeVmOtsJmA/0.jpg
Software Engineering Principles Applied:

🚀 Agile Methodology: 2-week sprints with Jira tracking

🔁 CI/CD Pipeline: GitHub Actions for automated testing/builds

🧪 Test-Driven Development: Jest unit tests + Detox E2E testing

📐 UML Design: System architecture diagrams for native modules

👥 User Testing: 15+ ASL speakers providing feedback

Key Milestones:

Model conversion to TorchScript

Camera frame processing pipeline

Native module bridge implementation

Motion detection algorithm

Two-way conversation UI

🔮 Future Roadmap
Priority	Feature	Status
High	🔤 Expand vocabulary (500+ signs)	Planned
High	👐 Two-handed gesture support	In Progress
Medium	📚 Learning mode with practice exercises	Planned
Medium	🌐 Video call translation	Research
Low	☁️ Firebase conversation history	Planned
🙏 Acknowledgments
Datasets: How2Sign Dataset for model training

Libraries: PyTorch Mobile team

Advisor: Dr. Jane Smith - Computer Science Dept. (University of Tech)

Testers: Local Deaf community volunteers

📜 License
Proprietary Software © 2025 [Your Name]
All rights reserved. For usage or collaboration inquiries, contact: [your.email@university.edu]
