import Image from 'next/image';

interface BaseDogProps {
  imageUrl?: string | null;
}

export function BaseDog({ imageUrl }: BaseDogProps) {
  return (
    <div className="w-full h-full relative">
      <Image
        src={imageUrl ?? "/avatars/dogav1.png"}
        alt="Profile picture"
        fill
        className="object-cover rounded-full"
      />
    </div>
  );
} 