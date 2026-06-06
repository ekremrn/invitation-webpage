import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QrLandingPage } from "@/components/invitation/QrLandingPage";
import { eventKeys, events, isEventKey } from "@/config/events";
import { siteCopy } from "@/content/copy";
import { createNoIndexMetadata } from "@/lib/metadata";

type QrPageProps = {
  params: Promise<{
    eventKey: string;
  }>;
};

export function generateStaticParams() {
  return eventKeys.map((eventKey) => ({
    eventKey,
  }));
}

export async function generateMetadata({
  params,
}: QrPageProps): Promise<Metadata> {
  const { eventKey } = await params;

  if (!isEventKey(eventKey)) {
    return createNoIndexMetadata();
  }

  const qrCopy = siteCopy.qr[eventKey];

  return createNoIndexMetadata({
    title: `${qrCopy.title} | ${siteCopy.metadata.title}`,
    description: qrCopy.description,
  });
}

export default async function QrPage({ params }: QrPageProps) {
  const { eventKey } = await params;

  if (!isEventKey(eventKey)) {
    notFound();
  }

  return <QrLandingPage event={events[eventKey]} />;
}
