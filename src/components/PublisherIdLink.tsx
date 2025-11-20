'use client';

import { useRouter } from 'next/navigation';

interface PublisherIdLinkProps {
  sellerId: string;
}

export default function PublisherIdLink({ sellerId }: PublisherIdLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/publisher/${sellerId}`);
  };

  return (
    <span
      onClick={handleClick}
      className="px-2 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 text-xs font-mono rounded transition-colors cursor-pointer"
    >
      {sellerId}
    </span>
  );
}
