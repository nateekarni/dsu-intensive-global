import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const headersList = await headers();
        const authorization = headersList.get("Authorization");

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authorization.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const snapshot = await adminDb.collection("applications")
            .where("userId", "==", userId)
            .get();

        const applications = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();

            // Fetch project details for display
            let projectTitle = "ไม่ระบุโครงการ";
            if (data.projectId) {
                const projDoc = await adminDb.collection("projects").doc(data.projectId).get();
                if (projDoc.exists) {
                    projectTitle = projDoc.data()?.title || projectTitle;
                }
            }

            // Sanitize dates
            const sanitizedData = { ...data };
            ['createdAt', 'updatedAt', 'submittedAt'].forEach(field => {
                if (sanitizedData[field] && typeof sanitizedData[field].toDate === 'function') {
                    sanitizedData[field] = sanitizedData[field].toDate().toISOString();
                }
            });

            return {
                id: doc.id,
                ...sanitizedData,
                projectTitle
            };
        }));

        return NextResponse.json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
