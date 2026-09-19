"use client";

import { SectionShell, useSection } from "@/components/SectionEditor";
import { FileField, HeadingField, ImageField, ItemList } from "@/components/fields";
import { Field, Input, Panel } from "@/components/ui";
import { newId } from "@/lib/heading";
import type { MediaItem, SectionHeading } from "@/lib/types";

type Data = SectionHeading & { items: MediaItem[] };

export default function PodcastMediaPage() {
  const state = useSection<Data>("home.media");
  const { data, patch } = state;

  return (
    <SectionShell
      title="Podcast & media"
      description="The video carousel. Each item shows its cover image until someone presses play."
      preview="/#media"
      state={state}
    >
      {data && (
        <>
          <Panel title="Section heading">
            <Field label="Small label">
              <Input value={data.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
            </Field>
            <div className="mt-4">
              <HeadingField value={data.lines} onChange={(lines) => patch({ lines })} rows={2} />
            </div>
          </Panel>

          <Panel title="Videos" description="Three items keep the carousel balanced, but you can add more.">
            <ItemList
              items={data.items}
              onChange={(items) => patch({ items })}
              itemTitle={(item, i) => item.title || `Video ${i + 1}`}
              create={(): MediaItem => ({ id: newId(), title: "", poster: "" })}
              addLabel="Add video"
              renderItem={(item, update) => (
                <>
                  <Field label="Title">
                    <Input value={item.title} onChange={(e) => update({ title: e.target.value })} />
                  </Field>
                  <ImageField
                    label="Cover image"
                    value={item.poster}
                    onChange={(poster) => update({ poster })}
                    folder="media"
                    aspect="aspect-video"
                    hint="Shown before the video starts."
                  />
                  <FileField
                    label="Video file"
                    kind="video"
                    folder="media"
                    value={item.videoSrc ?? ""}
                    onChange={(url) => update({ videoSrc: url && url !== "#" ? url : undefined })}
                    hint="MP4 or WebM. Without a video the cover image is shown on its own."
                  />
                </>
              )}
            />
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
