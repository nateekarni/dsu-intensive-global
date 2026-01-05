import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Check if Firebase Admin is initialized (it might be a mock object if env vars are missing)
        if (!adminDb.collection) {
            console.error("Firebase Admin DB not initialized. Check environment variables.");
            return NextResponse.json({
                error: "Service Unavailable: Database connection failed. Please check server logs for missing credentials."
            }, { status: 503 });
        }

        const snapshot = await adminDb.collection("projects").get();
        const projects = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            // Serialize dates if necessary, or let JSON.stringify handle it carefully
            // Firestore Timestamps need conversion
        }));

        // Convert Firestore Timestamps to ISO strings for JSON
        const sanitizedProjects = projects.map((p: any) => {
            const sanitized = { ...p };
            ['startDate', 'endDate', 'closeDate', 'createdAt', 'updatedAt'].forEach(field => {
                if (sanitized[field] && typeof sanitized[field].toDate === 'function') {
                    sanitized[field] = sanitized[field].toDate().toISOString();
                }
            });
            return sanitized;
        });

        return NextResponse.json(sanitizedProjects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}
