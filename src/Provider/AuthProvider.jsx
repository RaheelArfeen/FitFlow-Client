import React, { createContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import axios from "axios";
import app from "../Firebase/firebase.init";

export const AuthContext = createContext();
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // user object with role and token
    const [loading, setLoading] = useState(true);

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const updateUser = (updatedData) => {
        return updateProfile(auth.currentUser, updatedData)
            .then(() => {
                const { displayName, email, photoURL, uid } = auth.currentUser;
                const updatedUser = { displayName, email, photoURL, uid };
                setUser(updatedUser);
            })
            .catch((error) => {
                console.error("Error updating profile:", error);
            });
    };

    const logOut = async () => {
        setLoading(true);
        try {
            // Clear backend JWT cookie
            await axios.post("http://localhost:3000/logout", {}, { withCredentials: true });
            // Sign out Firebase
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                const { displayName, email, photoURL, uid } = currentUser;

                try {
                    const accessToken = await currentUser.getIdToken();

                    // Send login request to backend to set JWT cookie
                    await axios.post(
                        "http://localhost:3000/login",
                        { email },
                        { withCredentials: true }
                    );

                    // Fetch role from backend
                    const roleRes = await axios.get(`http://localhost:3000/users/role/${email}`);
                    const role = roleRes.data.role || "member";

                    const userDatas = { displayName, email, photoURL, uid, role, accessToken };
                    setUser(userDatas);
                } catch (error) {
                    console.error("Backend login or role fetch error:", error);
                    // Fallback with default role and token
                    const accessToken = await currentUser.getIdToken();
                    setUser({ displayName, email, photoURL, uid, role: "member", accessToken });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const authData = {
        user,
        loading,
        createUser,
        signIn,
        updateUser,
        logOut,
    };

    return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
