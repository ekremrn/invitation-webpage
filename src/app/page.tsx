import { InvitationShell } from "@/components/layout/InvitationShell";
import { EventSection } from "@/components/invitation/EventSection";
import { FinalSection } from "@/components/invitation/FinalSection";
import { Hero } from "@/components/invitation/Hero";
import { InvitationCopy } from "@/components/invitation/InvitationCopy";
import { MusicButton } from "@/components/invitation/MusicButton";
import { UploadCallToAction } from "@/components/invitation/UploadCallToAction";
import { eventKeys, events } from "@/config/events";

export default function Home() {
  return (
    <>
      <InvitationShell>
        <Hero />
        <InvitationCopy />
        {eventKeys.map((eventKey) => (
          <EventSection key={eventKey} event={events[eventKey]} />
        ))}
        <UploadCallToAction />
        <FinalSection />
      </InvitationShell>
      <MusicButton />
    </>
  );
}
