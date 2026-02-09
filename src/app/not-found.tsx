import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
      <p className="text-text-secondary text-lg mb-8">
        This page doesn&apos;t exist — maybe it was moved or you followed a broken link.
      </p>
      <Button href="/" icon="arrow">
        Go Home
      </Button>
    </div>
  );
}
