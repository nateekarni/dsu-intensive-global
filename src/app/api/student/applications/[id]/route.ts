import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Await params in Next.js 15+

        const headersList = await headers();
        const authorization = headersList.get("Authorization");

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authorization.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        if (!id) {
            return NextResponse.json({ error: "Parameters missing" }, { status: 400 });
        }

        // Fetch Application
        const appRef = adminDb.collection("applications").doc(id);
        const appSnap = await appRef.get();

        if (!appSnap.exists) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        const appData = appSnap.data();

        // Verify Ownership
        if (appData?.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({
            id: appSnap.id,
            ...appData
        });

    } catch (error) {
        console.error("Error fetching application:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
