import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <main className="min-h-screen bg-petcenter-background p-10 text-petcenter-text">
      <Card className="max-w-md rounded-card border-petcenter-border bg-petcenter-card p-6 shadow-card">
        <h1 className="heading-md">PetCenter</h1>
        <p className="body-md mt-2 text-petcenter-text-secondary">
          Design đã hoạt động.
        </p>

        <Button className="mt-6 bg-petcenter-primary text-white hover:bg-petcenter-primary-hover">
          Kiểm tra Button
        </Button>
      </Card>
    </main>
  );
}