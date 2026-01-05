import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;

    try {
        const docRef = adminDb.collection("projects").doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const data = docSnap.data() as any;

        // Sanitize Timestamps
        ['startDate', 'endDate', 'closeDate', 'createdAt', 'updatedAt'].forEach(field => {
            if (data[field] && typeof data[field].toDate === 'function') {
                data[field] = data[field].toDate().toISOString();
            }
        });

        // Ensure documents has id
        if (data.documents) {
            data.documents = data.documents.map((d: any, i: number) => ({
                id: d.id || `doc_${i}`,
                name: d.name
            }));
        }

        return NextResponse.json({ id: docSnap.id, ...data });

    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}
