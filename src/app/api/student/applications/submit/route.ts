import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const headersList = await headers();
        const authorization = headersList.get("Authorization");

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authorization.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await request.json();
        const { appId, projectId, personalData, consent, status, currentStep, uploadedDocuments, payment } = body;

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Determine Logic: Create or Update
        // If appId provided, verify ownership? 
        // Or just construct ID as before: projectId_userId
        const derivedAppId = appId || `${projectId}_${userId}`;
        const appRef = adminDb.collection("applications").doc(derivedAppId);

        // Prepare update data
        // Remove undefined fields to avoid overwriting with null/undefined if partial update
        const updateData: any = {
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (userId) updateData.userId = userId;
        if (projectId) {
            updateData.projectId = projectId;
            // Fetch Project Title to cache it
            const projectSnap = await adminDb.collection("projects").doc(projectId).get();
            if (projectSnap.exists) {
                updateData.projectTitle = projectSnap.data()?.title || "";
            }
        }
        if (personalData) updateData.personalData = personalData;
        if (consent) updateData.consent = consent;
        if (status) updateData.status = status;
        if (currentStep) updateData.currentStep = currentStep;
        if (uploadedDocuments) updateData.uploadedDocuments = uploadedDocuments;
        if (payment) updateData.payment = payment;

        // Logic for timestamps
        if (!appId) { // New application (derived or not existing yet check is implicit usually, but set merge true handles it)
            // Ideally check existence, but simpler: set createdAt if not exists logic is hard with set merge. 
            // Better: use set with merge, but we can't condition createdAt easily without a read.
            // Let's just set createdAt if status is 'draft' (initial creation) usually.
            // Or we can blindly set createdAt if we believe it's new.
            // Current flow: appId is passed if existing, null if new.
            if (status === 'draft' || status === 'submitted') {
                // Check if exists
                const docSnap = await appRef.get();
                if (!docSnap.exists) {
                    updateData.createdAt = FieldValue.serverTimestamp();
                }
            }
        }

        if (status === 'submitted') {
            updateData.submittedAt = FieldValue.serverTimestamp();
        }

        // Use set with merge: true to handle both create and update
        await appRef.set(updateData, { merge: true });

        return NextResponse.json({ success: true, appId: derivedAppId });

    } catch (error) {
        console.error("Error submitting application:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
