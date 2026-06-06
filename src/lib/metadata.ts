import type { Metadata } from "next";

type RobotsMetadata = Exclude<Metadata["robots"], string | null | undefined>;

export const noIndexRobots = {
  index: false,
  follow: false,
} satisfies RobotsMetadata;

export function createNoIndexMetadata(metadata: Metadata = {}): Metadata {
  return {
    ...metadata,
    robots: noIndexRobots,
  };
}
