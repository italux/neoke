"use client";

import { Karaoke } from '@/components/karaoke';

interface SessionPageProps {
  params: {
    code: string;
  };
}

export default function SessionPage({ params }: SessionPageProps) {
  return <Karaoke code={params.code} />;
}