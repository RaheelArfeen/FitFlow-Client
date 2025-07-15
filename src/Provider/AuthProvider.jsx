import React, { createContext, useEffect, useState } from "react";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import axios from "axios";
import app from "../Firebase/firebase.init";

export const AuthContext = createContext();
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const register = async (name, email, password, photoURL) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            await updateProfile(firebaseUser, {
                displayName: name,
                photoURL: photoURL || null,
            });

            const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime).toISOString();

            // Send user data to backend for registration & get JWT + role
            const res = await axios.post("http://localhost:3000/register", {
                email,
                displayName: firebaseUser.displayName,
                photoURL,
                lastSignInTime,
            });

            const token = res.data.token;
            localStorage.setItem("FitFlow-token", token);

            setUser({
                displayName: firebaseUser.displayName,
                email,
                photoURL,
                role: res.data.user.role || "member",
                accessToken: token,
                lastSignInTime,
            });

            setLoading(false);
            return true;
        } catch (err) {
            console.error("Register error:", err);
            setLoading(false);
            return false;
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime).toISOString();

            const res = await axios.post("http://localhost:3000/login", { email });

            const token = res.data.token;
            localStorage.setItem("FitFlow-token", token);

            setUser({
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                role: res.data.user.role || "member",
                accessToken: token,
                lastSignInTime,
            });

            setLoading(false);
            return true;
        } catch (err) {
            setLoading(false);
            throw err;
        }
    };

    const loginWithGoogle = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime).toISOString();

            const res = await axios.post("http://localhost:3000/login", {
                email: firebaseUser.email,
            });

            const token = res.data.token;
            localStorage.setItem("FitFlow-token", token);

            setUser({
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                role: res.data.user.role || "member",
                accessToken: token,
                lastSignInTime,
            });

            setLoading(false);
            return true;
        } catch (err) {
            console.error("Google login error:", err);
            setLoading(false);
            throw err;
        }
    };

    const updateUser = async (updatedData) => {
        try {
            await updateProfile(auth.currentUser, updatedData);
            const { displayName, email, photoURL, metadata } = auth.currentUser;
            const lastSignInTime = new Date(metadata.lastSignInTime).toISOString();

            setUser((prev) => ({
                ...prev,
                displayName,
                email,
                photoURL,
                lastSignInTime,
            }));
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const logOut = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            localStorage.removeItem("FitFlow-token");
            setUser(null);
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken(true);
                    localStorage.setItem("FitFlow-token", token);

                    const roleRes = await axios.get(
                        `http://localhost:3000/users/role/${currentUser.email}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const lastSignInTime = new Date(currentUser.metadata.lastSignInTime).toISOString();

                    setUser({
                        displayName: currentUser.displayName,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        role: roleRes.data.role || "member",
                        accessToken: token,
                        lastSignInTime,
                    });
                } catch (error) {
                    console.error("Auth sync error:", error);

                    const fallbackToken = await currentUser.getIdToken();
                    const lastSignInTime = new Date(currentUser.metadata.lastSignInTime).toISOString();

                    localStorage.setItem("FitFlow-token", fallbackToken);
                    setUser({
                        displayName: currentUser.displayName,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        role: "member",
                        accessToken: fallbackToken,
                        lastSignInTime,
                    });
                }
            } else {
                setUser(null);
                localStorage.removeItem("FitFlow-token");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                register,
                login,
                loginWithGoogle,
                updateUser,
                logOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
