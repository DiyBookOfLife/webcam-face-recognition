# 🎥 Webcam Facial Recognition App

This is a responsive React + TypeScript web application that captures live webcam feeds, performs facial detection and analysis using `face-api.js`, and allows users to upload images for face recognition as well.

## 🔗 Live Demo

👉 [Click here to view the live app](https://webcam-face-recognition-wine.vercel.app)

## 📸 Features

- Start and stop webcam feed using MediaDevices API.
- Real-time face detection with:
  - Bounding box overlays
  - Age & gender prediction
  - Facial landmarks
  - Emotion recognition
- Upload an image from your device and perform facial analysis on it.
- Redux store used to manage webcam state (`isWebcamOn`).
- Built using **React**, **TypeScript**, **Bootstrap**, and **face-api.js**.
- Responsive layout — works on desktop and mobile.

## 🧠 Facial Recognition Tech

- **Framework:** face-api.js (built on TensorFlow.js)
- **Models Used:**
  - `tiny_face_detector_model`
  - `face_landmark_68_model`
  - `face_expression_model`
  - `age_gender_model`

## 🛠 Tech Stack

| Tech           | Usage                        |
|----------------|------------------------------|
| React          | Frontend framework           |
| TypeScript     | Strongly typed JS            |
| Bootstrap      | Styling & responsiveness     |
| face-api.js    | Face recognition framework   |
| Redux Toolkit  | State management (webcam)    |

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed

### Installation

```bash
git clone https://github.com/DiyBookOfLife/webcam-face-recognition.git
cd webcam-face-recognition
npm install

