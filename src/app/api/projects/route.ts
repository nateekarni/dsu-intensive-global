import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const snapshot = await adminDb.collection("projects").get();
        const projects = snapshot.docs.map(doc => ({
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
