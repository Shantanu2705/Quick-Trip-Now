"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Check session expiry
        const loginTimestamp = localStorage.getItem("auth_login_timestamp");
        const now = Date.now();

        if (loginTimestamp && now - parseInt(loginTimestamp, 10) > SESSION_DURATION) {
          // Session expired
          firebaseSignOut(auth).then(() => {
            localStorage.removeItem("auth_login_timestamp");
            setUser(null);
          });
        } else {
          // Valid session, but if there's no timestamp (e.g. just logged in), we set it in the sign-in logic itself.
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setLoginSession = () => {
    localStorage.setItem("auth_login_timestamp", Date.now().toString());
  };

  const signOut = () => {
    if (auth) {
      firebaseSignOut(auth).then(() => {
        localStorage.removeItem("auth_login_timestamp");
        setUser(null);
      });
    }
  };

  return { user, loading, setLoginSession, signOut };
}
