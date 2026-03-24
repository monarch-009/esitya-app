# Esitya - A Private Space for Two ♡

Welcome to **Esitya**, a premium, private social application designed exclusively for two people. It combines features of timeline, memory sharing, letters, and snaps into a single, intimate digital experience.

---

## ✨ Features

-   📖 **The Chronicle**: A shared timeline for all your beautiful memories.
-   🌌 **The Space**: A private feed for posts, thoughts, and shared media.
-   🏷️ **The Bucket List**: A place to track your shared dreams and accomplishments.
-   💌 **Letters**: Slow, deliberate, and eternal messages to each other.
-   📸 **Snaps**: Quick moments captured and shared in real-time.

---

## 🛠️ Architecture

This is a **full-stack unified project** built with **Expo Router**.
-   **Frontend**: React Native, Expo, Lucide Icons, and Reanimated for premium transitions.
-   **Backend**: Expo Router API routes (`app/api/`) powered by Node.js.
-   **Database**: MongoDB Atlas (managed via Mongoose).
-   **Storage**: Cloudinary for images and videos.

---

## 🚀 Deployment (Production APK)

Detailed instructions for production readiness can be found in the [Production Readiness Guide](./production_readiness_guide.md).

### Quick Build Steps:
1.  **Host the Backend**: Deploy the project to Vercel (recommended) to make the API routes publicly accessible.
2.  **Set Environment Variables**: Add your `MONGODB_URI`, `CLOUDINARY_*`, etc., to your hosting provider.
3.  **Update Client Config**: Set `EXPO_PUBLIC_API_URL` in your build environment to point to your hosted URL.
4.  **Build**: Use `eas build -p android --profile preview` to generate your APK.

---

## 💻 Local Development

1.  **Clone the Repository**
2.  **Install Dependencies**: `npm install`
3.  **Configure Environment**: Create a `.env` file with your credentials (see `.env.example` if available).
4.  **Start the Server**: `npx expo start`

---

## ⚖️ Privacy

Everything shared in Esitya is encrypted and private, shared only between your account and your partner's account. No one else can access your "Journey."
