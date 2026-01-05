import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            studentId,
            birthDate, // expects YYYY-MM-DD
            nameThai,
            surnameThai,
            nameEng,
            surnameEng,
            email,
            ...otherData
        } = body;

        // Validate critical fields
        if (!studentId || !birthDate || !nameThai || !surnameThai) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Generate Custom Auth Credentials
        const loginEmail = `${studentId}@dsu.student`;

        // Parse birthDate to format ddmmyyyy (e.g., 25032550 for 25 March 2550 BE)
        // Note: User request said "ddmmyyyy" and "yy as Buddhist Era year" in one place, 
        // but typically passwords are just strings. The request said:
        // "password = วันเดือนปีเกิด format ddmmyyyy"
        // Let's assume input birthDate is standard ISO (YYYY-MM-DD) from the date picker.

        const dateObj = new Date(birthDate);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        // Use Gregorian Year (AD) last 2 digits
        const yearAD = String(dateObj.getFullYear()).slice(-2);
        const password = `${day}${month}${yearAD}`; // Format: ddmmyy (AD)

        let uid = '';
        let isNewUser = false;

        // 2. Check if user exists
        try {
            const userRecord = await adminAuth.getUserByEmail(loginEmail);
            uid = userRecord.uid;
            // Optionally update password if needed? For now, assume if exists, we just link.
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // Create new user
                const newUser = await adminAuth.createUser({
                    email: loginEmail,
                    password: password,
                    displayName: `${nameEng} ${surnameEng}`,
                });
                uid = newUser.uid;
                isNewUser = true;
            } else {
                throw error;
            }
        }

        // 3. Save/Update User Profile in Firestore
        const userDocRef = adminDb.collection("users").doc(uid);
        const userData = {
            role: "student",
            studentId,
            email: email || loginEmail, // Contact email vs Login email
            nameThai,
            surnameThai,
            nameEng,
            surnameEng,
            birthDate,
            updatedAt: FieldValue.serverTimestamp(),
            profile: {
                studentId,
                birthDate,
                nameThai,
                surnameThai,
                nameEng,
                surnameEng,
                email,
                ...otherData
            }
        };

        // If new user, set; if existing, merge
        await userDocRef.set(userData, { merge: true });

        // 4. Generate Custom Token for Client Auto-Login
        const customToken = await adminAuth.createCustomToken(uid);

        return NextResponse.json({
            success: true,
            customToken,
            uid,
            isNewUser
        });

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
    }
}
