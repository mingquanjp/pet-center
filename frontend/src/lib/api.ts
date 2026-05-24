const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getApiHealth(){
    if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const reponse = await fetch(`${apiUrl}/health`);

    if (!reponse.ok) {
        throw new Error("Failed to connect API");
    }

    return await reponse.json();
}
