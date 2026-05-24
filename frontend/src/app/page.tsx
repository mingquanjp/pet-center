import { getApiHealth } from "@/lib/api";

export default async function Home() {
  const health = await getApiHealth();

  return (
    <main>
      <h1>Pet Center - bwu</h1>
      <p>Backend status: {health.status}</p>
    </main>
  );
}