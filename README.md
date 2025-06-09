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

## [Software Requirements Specification Document](/docs/GestureAI_SRS.pdf)

[![Document](https://github.com/user-attachments/assets/gestureai_srs_preview.jpg)](/docs/GestureAI_SRS.pdf)

---

## [Feasibility Study](/docs/GestureAI_Feasibility_Study.pdf)

[![Document](https://github.com/user-attachments/assets/gestureai_feasibility_preview.jpg)](/docs/GestureAI_Feasibility_Study.pdf)

---

## **Python Virtual Environment Setup (Backend)**  

1. Download **Python 3.12**  
2. Navigate to the **backend** directory  
3. Run the following command:

   ```powershell
   python3.12 -m venv venv
