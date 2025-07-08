import React, { createContext, useEffect, useState } from "react";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import axios from "axios";
import app from "../Firebase/firebase.init";

export const AuthContext = createContext();
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // user with role and token
    const [loading, setLoading] = useState(true);

    // Register user with name, email, password, photoURL
    const register = async (name, email, password, photoURL) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update Firebase profile with displayName and photoURL
            await updateProfile(firebaseUser, { displayName: name, photoURL: photoURL || null });

            const updatedUser = auth.currentUser;
            const accessToken = await updatedUser.getIdToken();

            // Register user in backend DB and set JWT cookie
            await axios.post(
                "http://localhost:3000/register",
                {
                    email: updatedUser.email,
                    displayName: updatedUser.displayName,
                    photoURL: updatedUser.photoURL,
                    lastSignInTime: new Date().toISOString(),
                },
                { withCredentials: true }
            );

            // Assume default role 'member' on register
            setUser({
                displayName: updatedUser.displayName,
                email: updatedUser.email,
                photoURL: updatedUser.photoURL,
                role: "member",
                accessToken,
            });

            setLoading(false);
            return true;
        } catch (err) {
            console.error("Register error:", err);
            setLoading(false);
            return false;
        }
    };

    // Sign in user and sync with backend
    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const currentUser = userCredential.user;
            const accessToken = await currentUser.getIdToken();

            // Notify backend to set JWT cookie
            await axios.post(
                "http://localhost:3000/login",
                { email },
                { withCredentials: true }
            );

            // Fetch user role from backend
            const roleRes = await axios.get(`http://localhost:3000/users/role/${email}`);
            const role = roleRes.data.role || "member";

            setUser({
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                role,
                accessToken,
            });

            setLoading(false);
            return true;
        } catch (err) {
            setLoading(false);
            throw err;
        }
    };

    // Update Firebase user profile after register or later
    const updateUser = async (updatedData) => {
        try {
            await updateProfile(auth.currentUser, updatedData);
            const { displayName, email, photoURL } = auth.currentUser;
            setUser((prev) => ({ ...prev, displayName, email, photoURL }));
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    // Logout from Firebase and backend
    const logOut = async () => {
        setLoading(true);
        try {
            // Clear backend JWT cookie
            await axios.post("http://localhost:3000/logout", {}, { withCredentials: true });
            // Firebase sign out
            await signOut(auth);
            setUser(null);
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                try {
                    const accessToken = await currentUser.getIdToken();

                    // Sync backend login state (set JWT cookie)
                    await axios.post(
                        "http://localhost:3000/login",
                        { email: currentUser.email },
                        { withCredentials: true }
                    );

                    // Get user role from backend
                    const roleRes = await axios.get(`http://localhost:3000/users/role/${currentUser.email}`);
                    const role = roleRes.data.role || "member";

                    setUser({
                        displayName: currentUser.displayName,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        role,
                        accessToken,
                    });
                } catch (error) {
                    console.error("Error during auth state sync:", error);
                    // fallback to default role
                    setUser({
                        displayName: currentUser.displayName,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        role: "member",
                        accessToken: await currentUser.getIdToken(),
                    });
                }
            } else {
                setUser(null);
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
                signIn,
                updateUser,
                logOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
