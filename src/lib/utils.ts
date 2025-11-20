export function formatTraffic(traffic: number | undefined | null): string {
  if (!traffic || traffic === 0) return '0';

  if (traffic >= 1_000_000) {
    return `${(traffic / 1_000_000).toFixed(1)}M`;
  } else if (traffic >= 1_000) {
    return `${(traffic / 1_000).toFixed(1)}K`;
  }
  return traffic.toString();
}

export function getTrafficTier(traffic: number | undefined | null): {
  tier: number;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  if (!traffic || traffic === 0) {
    return {
      tier: 0,
      label: 'No Data',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: '📊',
    };
  }

  if (traffic >= 10_000_000) {
    return {
      tier: 1,
      label: 'Tier 1',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      icon: '🏆',
    };
  }

  if (traffic >= 1_000_000) {
    return {
      tier: 2,
      label: 'Tier 2',
      color: 'text-gray-700',
      bgColor: 'bg-gray-200',
      icon: '🥈',
    };
  }

  if (traffic >= 100_000) {
    return {
      tier: 3,
      label: 'Tier 3',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      icon: '🥉',
    };
  }

  return {
    tier: 4,
    label: 'Tier 4',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '📊',
  };
}

export function truncateText(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
