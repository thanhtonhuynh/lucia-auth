import { CircleAlert } from 'lucide-react';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="text-white bg-destructive rounded p-2 flex items-center gap-2 text-sm">
      <CircleAlert size={17} />
      {message}
    </p>
  );
}
