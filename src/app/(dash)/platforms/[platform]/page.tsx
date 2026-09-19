"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { SectionShell, useSection } from "@/components/SectionEditor";
import { MediaPicker } from "@/components/MediaPicker";
import { HeadingField } from "@/components/fields";
import { Button, DeleteButton, EmptyState, Field, Input, Panel, Textarea } from "@/components/ui";
import { isBlankHeading } from "@/lib/heading";
import { MAX_PLATFORM_IMAGES, type Platform, type PlatformId, type PlatformImage } from "@/lib/types";

type Data = { items: Platform[] };

const labels: Record<PlatformId, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };

export default function PlatformPage() {
  const id = (useParams().platform as PlatformId) ?? "instagram";
  const state = useSection<Data>("home.platforms");
  const { data, patch } = state;
  const [picking, setPicking] = useState(false);

  const index = data?.items.findIndex((p) => p.id === id) ?? -1;
  const platform = index >= 0 ? data!.items[index] : null;

  const updatePlatform = (changes: Partial<Platform>) =>
    patch({ items: data!.items.map((p, i) => (i === index ? { ...p, ...changes } : p)) });

  const updateImage = (i: number, changes: Partial<PlatformImage>) =>
    updatePlatform({ images: platform!.images.map((img, j) => (j === i ? { ...img, ...changes } : img)) });

  const headingError = platform && isBlankHeading(platform.lines) ? "Add some heading text. It is shown above the tabs." : undefined;

  const photoCount = platform?.images.length ?? 0;
  const full = photoCount >= MAX_PLATFORM_IMAGES;

  // The button is disabled at the limit; this guard covers a picker that was already open.
  const addImage = (url: string) => {
    if (!platform || full) return;
    updatePlatform({ images: [...platform.images, { url }] });
  };

  return (
    <SectionShell
      title={labels[id] ?? "Platform"}
      description="This tab of the social media section. Every photo can link to its own post."
      preview="/#social"
      state={state}
      invalid={headingError ? "The heading can't be empty. Add some text before saving." : undefined}
    >
      {data && !platform && <EmptyState title="Platform not found" description="This platform is not part of the website yet." />}

      {platform && (
        <>
          <Panel
            title="Small label and heading"
            description={`Shown above the tabs while the ${labels[id]} tab is open. The other platforms keep their own.`}
          >
            <Field label="Small label" hint="The short line above the heading, for example -Platforms.">
              <Input value={platform.eyebrow} onChange={(e) => updatePlatform({ eyebrow: e.target.value })} />
            </Field>
            <div className="mt-4">
              <HeadingField
                value={platform.lines}
                onChange={(lines) => updatePlatform({ lines })}
                rows={2}
                error={headingError}
              />
            </div>
          </Panel>

          <Panel title={`${labels[id]} details`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tab name">
                <Input value={platform.name} onChange={(e) => updatePlatform({ name: e.target.value })} />
              </Field>
              <Field label="Follower count" hint="Shown exactly as you type it, for example 24k Followers.">
                <Input value={platform.followers} onChange={(e) => updatePlatform({ followers: e.target.value })} />
              </Field>
              <Field label="Handle">
                <Input value={platform.handle} onChange={(e) => updatePlatform({ handle: e.target.value })} />
              </Field>
              <Field label="Profile link" hint="Where the follow button sends people.">
                <Input value={platform.profileUrl} onChange={(e) => updatePlatform({ profileUrl: e.target.value })} />
              </Field>
              <Field label="Follow button text">
                <Input value={platform.followLabel} onChange={(e) => updatePlatform({ followLabel: e.target.value })} />
              </Field>
              <Field label="Collab button text">
                <Input value={platform.collabLabel} onChange={(e) => updatePlatform({ collabLabel: e.target.value })} />
              </Field>
            </div>
            <Field label="Description" className="mt-4">
              <Textarea rows={3} value={platform.description} onChange={(e) => updatePlatform({ description: e.target.value })} />
            </Field>
            <Field label="Collab button link" className="mt-4" hint="Usually #contact, so the button scrolls down to the form.">
              <Input value={platform.collabUrl} onChange={(e) => updatePlatform({ collabUrl: e.target.value })} />
            </Field>
          </Panel>

          <Panel
            title="Photos"
            description={`The grid under the description. Give each photo the link to the post it came from. ${photoCount} of ${MAX_PLATFORM_IMAGES} photos used.`}
            actions={
              <Button
                type="button"
                size="sm"
                onClick={() => setPicking(true)}
                disabled={full}
                title={full ? `This tab already has ${MAX_PLATFORM_IMAGES} photos` : undefined}
              >
                <Plus size={14} weight="bold" />
                Add photo
              </Button>
            }
          >
            {full && (
              <p role="status" className="mb-4 rounded-[--radius-control] border border-line bg-sand/30 px-4 py-3 text-[13px]">
                This tab already shows {MAX_PLATFORM_IMAGES} photos, the most its grid holds. Remove one to add another.
              </p>
            )}

            {platform.images.length === 0 ? (
              <EmptyState
                title="No photos yet"
                description="Add the posts you want to show in this tab."
                action={
                  <Button type="button" onClick={() => setPicking(true)}>
                    Add photo
                  </Button>
                }
              />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {platform.images.map((image, i) => (
                  <li key={i} className="flex gap-3 rounded-[--radius-control] border border-line bg-cream/60 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS media from an arbitrary host */}
                    <img src={image.url} alt="" className="size-20 shrink-0 rounded-[6px] border border-line object-cover" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <Field label="Post link">
                        <Input
                          value={image.link ?? ""}
                          placeholder="https://"
                          onChange={(e) => updateImage(i, { link: e.target.value || undefined })}
                        />
                      </Field>
                      <div className="flex justify-end">
                        <DeleteButton
                          label="Remove"
                          onConfirm={() => updatePlatform({ images: platform.images.filter((_, j) => j !== i) })}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <MediaPicker
              open={picking}
              kind="image"
              folder={id}
              onClose={() => setPicking(false)}
              onSelect={(asset) => addImage(asset.url)}
            />
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
