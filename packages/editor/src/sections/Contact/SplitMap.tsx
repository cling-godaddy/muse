import { useState, useEffect } from "react";
import type { ContactSection as ContactSectionType, FormField } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./SplitMap.module.css";

interface Props {
  section: ContactSectionType
  onUpdate: (data: Partial<ContactSectionType>) => void
}

const FIELD_TYPES: FormField["type"][] = ["text", "email", "textarea"];

export function SplitMap({ section, onUpdate }: Props) {
  const isEditable = useIsEditable();

  const updateField = (index: number, data: Partial<FormField>) => {
    const formFields = (section.formFields ?? []).map((field, i) =>
      i === index ? { ...field, ...data } : field,
    );
    onUpdate({ formFields });
  };

  const addField = () => {
    onUpdate({
      formFields: [
        ...(section.formFields ?? []),
        { name: `field_${Date.now()}`, type: "text" as const, label: "" },
      ],
    });
  };

  const removeField = (index: number) => {
    onUpdate({
      formFields: (section.formFields ?? []).filter((_, i) => i !== index),
    });
  };

  const [debouncedAddress, setDebouncedAddress] = useState(section.address);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedAddress(section.address), 500);
    return () => clearTimeout(timer);
  }, [section.address]);

  const apiKey = (import.meta as unknown as { env?: { VITE_GOOGLE_MAPS_API_KEY?: string } }).env?.VITE_GOOGLE_MAPS_API_KEY;
  const mapUrl = debouncedAddress
    ? apiKey
      ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(debouncedAddress)}`
      : `https://maps.google.com/maps?q=${encodeURIComponent(debouncedAddress)}&output=embed`
    : null;

  return (
    <section className={styles.section}>
      {section.headline !== undefined && (
        <EditableText
          value={section.headline}
          onChange={v => onUpdate({ headline: v || undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Section headline..."
        />
      )}
      {section.subheadline !== undefined && (
        <EditableText
          value={section.subheadline}
          onChange={v => onUpdate({ subheadline: v || undefined })}
          as="p"
          className={styles.subheadline}
          placeholder="Subheadline..."
        />
      )}

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.info}>
            <div className={styles.field}>
              <label>Email</label>
              {isEditable
                ? (
                  <input
                    type="email"
                    value={section.email ?? ""}
                    onChange={e => onUpdate({ email: e.target.value || undefined })}
                    placeholder="contact@example.com"
                  />
                )
                : section.email
                  ? <a href={`mailto:${section.email}`}>{section.email}</a>
                  : null}
            </div>
            <div className={styles.field}>
              <label>Phone</label>
              {isEditable
                ? (
                  <input
                    type="tel"
                    value={section.phone ?? ""}
                    onChange={e => onUpdate({ phone: e.target.value || undefined })}
                    placeholder="+1 (555) 123-4567"
                  />
                )
                : section.phone
                  ? <a href={`tel:${section.phone}`}>{section.phone}</a>
                  : null}
            </div>
            <div className={styles.field}>
              <label>Address</label>
              {isEditable
                ? (
                  <textarea
                    value={section.address ?? ""}
                    onChange={e => onUpdate({ address: e.target.value || undefined })}
                    placeholder="123 Main St, City, State 12345"
                    rows={2}
                  />
                )
                : section.address
                  ? <p>{section.address}</p>
                  : null}
            </div>
          </div>

          {section.formFields !== undefined && (
            <div className={styles.formSection}>
              <EditableText
                value={section.formHeadline ?? ""}
                onChange={v => onUpdate({ formHeadline: v || undefined })}
                as="h3"
                className={styles.formHeadline}
                placeholder="Send us a message"
              />

              {isEditable && (
                <>
                  <div className={styles.formFields}>
                    {section.formFields.map((field, i) => (
                      <div key={i} className={styles.formFieldRow}>
                        <input
                          type="text"
                          value={field.label}
                          onChange={e => updateField(i, { label: e.target.value })}
                          placeholder="Field label"
                          className={styles.fieldLabel}
                        />
                        <select
                          value={field.type}
                          onChange={e => updateField(i, { type: e.target.value as FormField["type"] })}
                          className={styles.fieldType}
                        >
                          {FIELD_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <label className={styles.requiredCheckbox}>
                          <input
                            type="checkbox"
                            checked={field.required ?? false}
                            onChange={e => updateField(i, { required: e.target.checked })}
                          />
                          Required
                        </label>
                        <button type="button" onClick={() => removeField(i)} className={styles.removeButton}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={addField} className={styles.addButton}>
                    Add Field
                  </button>

                  <div className={styles.submitSection}>
                    <label>Submit Button</label>
                    <input
                      type="text"
                      value={section.submitText ?? ""}
                      onChange={e => onUpdate({ submitText: e.target.value || undefined })}
                      placeholder="Send Message"
                      className={styles.submitText}
                    />
                  </div>
                </>
              )}

              {!isEditable && (
                <form className={styles.form}>
                  {section.formFields.map((field, i) => (
                    <div key={i} className={styles.formField}>
                      <label>
                        {field.label}
                        {field.required && " *"}
                      </label>
                      {field.type === "textarea"
                        ? <textarea placeholder={field.label} rows={4} />
                        : <input type={field.type} placeholder={field.label} />}
                    </div>
                  ))}
                  <button type="submit">{section.submitText ?? "Send"}</button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className={styles.mapContainer}>
          {mapUrl
            ? (
              <iframe
                src={mapUrl}
                className={styles.map}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location map"
              />
            )
            : (
              <div className={styles.placeholder}>
                <span>Enter an address to show map</span>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
