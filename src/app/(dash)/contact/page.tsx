"use client";

import Link from "next/link";
import { SectionShell, useSection } from "@/components/SectionEditor";
import { HeadingField, ImageField } from "@/components/fields";
import { Button, Field, Input, Panel, Textarea } from "@/components/ui";
import type { ContactSection } from "@/lib/types";

const formFields = [
  ["nameLabel", "Name label"],
  ["namePlaceholder", "Name placeholder"],
  ["emailLabel", "Email label"],
  ["emailPlaceholder", "Email placeholder"],
  ["messageLabel", "Message label"],
  ["messagePlaceholder", "Message placeholder"],
  ["submitLabel", "Submit button text"],
] as const;

export default function ContactPage() {
  const state = useSection<ContactSection>("home.contact");
  const { data, patch } = state;

  return (
    <SectionShell
      title="Contact"
      description="The last section of the home page, with your details and the message form."
      preview="/#contact"
      state={state}
    >
      {data && (
        <>
          <Panel
            title="Heading"
            actions={
              <Link href="/submissions">
                <Button size="sm">Read messages</Button>
              </Link>
            }
          >
            <Field label="Small label">
              <Input value={data.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
            </Field>
            <div className="mt-4">
              <HeadingField value={data.lines} onChange={(lines) => patch({ lines })} rows={4} />
            </div>
            <Field label="Description" className="mt-4">
              <Textarea rows={3} value={data.description} onChange={(e) => patch({ description: e.target.value })} />
            </Field>
          </Panel>

          <Panel title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram handle">
                <Input
                  value={data.instagram.handle}
                  onChange={(e) => patch({ instagram: { ...data.instagram, handle: e.target.value } })}
                />
              </Field>
              <Field label="Instagram link">
                <Input
                  value={data.instagram.url}
                  onChange={(e) => patch({ instagram: { ...data.instagram, url: e.target.value } })}
                />
              </Field>
              <Field label="Email address" hint="Shown on the site and used for the mailto link.">
                <Input type="email" value={data.email} onChange={(e) => patch({ email: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5">
              <ImageField
                label="Background image"
                value={data.background}
                onChange={(background) => patch({ background })}
                folder="contact"
                hint="Sits faintly behind the whole section."
              />
            </div>
          </Panel>

          <Panel title="Form wording" description="The labels and hint text inside the message form.">
            <div className="grid gap-4 sm:grid-cols-2">
              {formFields.map(([key, label]) => (
                <Field key={key} label={label}>
                  <Input value={data.form[key]} onChange={(e) => patch({ form: { ...data.form, [key]: e.target.value } })} />
                </Field>
              ))}
            </div>
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
