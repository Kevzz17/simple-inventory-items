import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqgVFER5qlTGlj3WulPR3zGxHW5GisHSY",

  authDomain: "dynamo-web-c0e68.firebaseapp.com",

  projectId: "dynamo-web-c0e68",

  storageBucket: "dynamo-web-c0e68.firebasestorage.app",

  messagingSenderId: "200877536030",

  appId: "1:200877536030:web:1391eb69031725dc568f0f",

  measurementId: "G-GXBM1B0KST",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
