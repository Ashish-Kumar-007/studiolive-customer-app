# StudioLive Customer App 📸🚀

StudioLive is a quick-commerce inspired mobile application for photography and creative production booking. Inspired by apps like Blinkit and Swiggy Instamart, it offers lightning-fast discovery, transparent pricing, and a frictionless booking experience.

## 🌟 Key Features
* **Quick-Commerce Discovery:** Search-first navigation, category browsing, and visually rich service cards.
* **Frictionless Booking:** Select dates, pick time slots, and view an instant transparent pricing summary.
* **Streamlined Authentication:** Mobile-first Phone Number & 4-digit OTP login flow.
* **Secure Checkout:** Integrated Razorpay checkout simulation with a unified bottom action bar.

## 💻 Tech Stack
* **Framework:** React Native with Expo (SDK 54+)
* **Routing:** Expo Router
* **Styling:** Custom Design System (Vanilla StyleSheet + Linear Gradients)
* **State Management:** Zustand
* **Networking:** Axios (with full offline mocking)

## 🚀 Getting Started

1. Install dependencies:
   `ash
   npm install
   `
2. Start the Expo development server:
   `ash
   npm run start
   `

> **Note on Testing:** The backend API is currently delinked and fully mocked. You can log in using *any* 10-digit phone number and *any* 4-digit OTP. The entire booking flow works offline.

## 📈 Development Roadmap & Phases
*Current Status: Completed Phase 6. Moving to Phase 7.*

- [x] **Phase 1:** Project Setup (Expo, Routing, API Client, Theme)
- [x] **Phase 2:** Discovery (Home, Search, Categories, Services, Projects)
- [x] **Phase 3:** Configuration (Packages, Customization)
- [x] **Phase 4:** Scheduling (Availability, Booking flow UI)
- [x] **Phase 5:** Authentication Implementation (AWS SNS OTP)
- [x] **Phase 6:** Commerce Core (Payments, Razorpay, Checkout)
- [ ] **Phase 7:** Physical Products (Shop, Cart, Orders)
- [ ] **Phase 8:** Tracking (Booking/Order timelines, Notifications)
- [ ] **Phase 9:** Post-Shoot (Private Galleries, S3 integration, Selection)
- [ ] **Phase 10:** Value-Add (Albums, Prints, Customization)
- [ ] **Phase 11:** Growth (Personalization, Rebooking, Recommendations)
- [ ] **Phase 12:** Polish (Analytics, Performance, Security, A11y, Hardening)

---
*Built with ❤️ by the StudioLive Team.*
