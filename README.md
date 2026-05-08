# StudioLive Mobile App 🎥✨

StudioLive is a premium, high-fidelity mobile application built for creative production agencies and photography studios. It serves as an **Executive Command Center**, streamlining the entire studio pipeline from lead capture and client qualification to staff assignment and final video/photo production delivery.

## 🌟 Key Features

*   **Role-Based Dashboards:** Unique, highly tailored interfaces for every member of the studio team:
    *   **Admin/Manager:** Executive Command Center with top-line revenue tracking, operations pipelines, and marketing leaderboards.
    *   **Marketing:** Focused conversion funnels and a premium lead-capture interface.
    *   **Receptionist:** Dedicated "Qualification Desk" to triage and process new incoming inquiries.
    *   **Videographers & Editors:** Streamlined task assignment and production schedules.
*   **Pro-Studio Aesthetic:** A gorgeous, modern UI utilizing `expo-linear-gradient` to create deep, dynamic hero cards, glassmorphic badges, and floating shadow pipelines.
*   **Intelligent Forms:** Fully custom, native-feeling dropdowns and input handling for robust data capture.
*   **Agenda Schedule:** A visually rich timeline for tracking daily shoots and edit deadlines.

## 💻 Tech Stack

*   **Framework:** React Native with Expo (SDK 54+)
*   **Routing:** Expo Router (File-based navigation)
*   **Styling:** Custom "Pro-Studio" design system (Vanilla StyleSheet + Linear Gradients)
*   **State Management:** Zustand (for Auth and UI State)
*   **Networking:** Axios
*   **Icons:** Lucide React Native

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed. You will also need the Expo Go app on your iOS/Android device, or an emulator.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ashish-Kumar-007/StudioLive-app.git
   cd studiolive-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm run start
   ```

4. Scan the QR code with your phone's camera (iOS) or Expo Go app (Android) to launch the app!

## 📦 Building the APK

This project is configured with Expo Application Services (EAS) to output a direct `.apk` file for easy Android installation.

To build the APK via the cloud:
```bash
eas build -p android --profile preview
```

To build locally on your own machine (requires Android Studio/SDK):
```bash
eas build -p android --profile preview --local
```

## 🧪 Demo Access

The application currently ships with a comprehensive mock data layer (`src/api/mockData.ts`) simulating network latency and database state. 

You can log in directly using the **Demo Login Grid** on the authentication screen to instantly test different role perspectives without needing a live backend!

---
*Built with ❤️ by the StudioLive Team.*
