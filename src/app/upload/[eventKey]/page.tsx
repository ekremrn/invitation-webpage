import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UploadPage } from "@/components/upload/UploadPage";
import { eventKeys, events, isEventKey } from "@/config/events";
import { siteCopy } from "@/content/copy";
import { createNoIndexMetadata } from "@/lib/metadata";
import type { EventKey } from "@/types/event";

type UploadRouteProps = {
  params: Promise<{ eventKey: string }>;
};

const uploadPageTitles = {
  henna: siteCopy.upload.pages.hennaTitle,
  ceremony: siteCopy.upload.pages.ceremonyTitle,
} satisfies Record<EventKey, string>;

export function generateStaticParams() {
  return eventKeys.map((eventKey) => ({ eventKey }));
}

export async function generateMetadata({
  params,
}: UploadRouteProps): Promise<Metadata> {
  const { eventKey } = await params;

  if (!isEventKey(eventKey)) {
    return createNoIndexMetadata();
  }

  return createNoIndexMetadata({
    title: `${uploadPageTitles[eventKey]} | ${siteCopy.metadata.title}`,
    description: siteCopy.upload.privacy,
  });
}

export default async function UploadRoute({ params }: UploadRouteProps) {
  const { eventKey } = await params;

  if (!isEventKey(eventKey)) {
    notFound();
  }

  return <UploadPage event={events[eventKey]} />;
}
