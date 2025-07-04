import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDQnkqNixFbBt6OBprctlq3uCzREbKY9pM",
  authDomain: "fe-demo-fire-fc30f.firebaseapp.com",
  projectId: "fe-demo-fire-fc30f",
  storageBucket: "fe-demo-fire-fc30f.firebasestorage.app",
  messagingSenderId: "951541360765",
  appId: "1:951541360765:web:f11b354c6c4cfbeee96914",
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

// console.log(
//   "🔥 Firebase initialized with storage bucket:",
//   firebaseConfig.storageBucket
// );
