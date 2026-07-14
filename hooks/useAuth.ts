"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export interface UserData {
  uid: string;
  email: string;
  role?: string;
  status?: string;
  fullName?: string;
  discountPercentage?: number;
  phone?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check session expiry
        const loginTimestamp = localStorage.getItem("auth_login_timestamp");
        const now = Date.now();

        if (loginTimestamp && now - parseInt(loginTimestamp, 10) > SESSION_DURATION) {
          // Session expired
          firebaseSignOut(auth!).then(() => {
            localStorage.removeItem("auth_login_timestamp");
            setUser(null);
            setUserData(null);
            setLoading(false);
            window.location.href = "/auth";
          });
        } else {
          setUser(currentUser);
          try {
            if (!db) throw new Error("Firestore not initialized");
            const docRef = doc(db!, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserData(docSnap.data() as UserData);
            } else {
              setUserData(null);
            }
          } catch (error) {
            console.error("Error fetching user data", error);
            setUserData(null);
          }
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    // Active session monitoring interval
    const interval = setInterval(() => {
      if (!auth) return;
      const currentUser = auth.currentUser;
      if (currentUser) {
        const loginTimestamp = localStorage.getItem("auth_login_timestamp");
        const now = Date.now();
        const fallbackSignInTime = new Date(currentUser.metadata.lastSignInTime || now).getTime();
        
        // Use local storage timestamp, or fallback to Firebase's lastSignInTime
        const signInTime = loginTimestamp ? parseInt(loginTimestamp, 10) : fallbackSignInTime;
        
        if (now - signInTime > SESSION_DURATION) {
          firebaseSignOut(auth).then(() => {
            localStorage.removeItem("auth_login_timestamp");
            setUser(null);
            setUserData(null);
            // We can optionally force a page reload or redirect here
            window.location.href = "/auth";
          });
        }
      }
    }, 60000); // Check every minute

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const setLoginSession = () => {
    localStorage.setItem("auth_login_timestamp", Date.now().toString());
  };

  const signOut = () => {
    if (auth) {
      firebaseSignOut(auth).then(() => {
        localStorage.removeItem("auth_login_timestamp");
        setUser(null);
        setUserData(null);
      });
    }
  };

  return { user, userData, loading, setLoginSession, signOut };
}
