import type { ContactBlock as ContactBlockType, FormField } from "@muse/core";
import { useAutoResize } from "../hooks";
import styles from "./Contact.module.css";

interface Props {
  block: ContactBlockType
  onUpdate: (data: Partial<ContactBlockType>) => void
}

const FIELD_TYPES: FormField["type"][] = ["text", "email", "textarea"];

export function Contact({ block, onUpdate }: Props) {
  const headlineRef = useAutoResize(block.headline ?? "");
  const formHeadlineRef = useAutoResize(block.formHeadline ?? "");

  const updateField = (index: number, data: Partial<FormField>) => {
    const formFields = (block.formFields ?? []).map((field, i) =>
      i === index ? { ...field, ...data } : field,
    );
    onUpdate({ formFields });
  };

  const addField = () => {
    onUpdate({
      formFields: [
        ...(block.formFields ?? []),
        { name: `field_${Date.now()}`, type: "text" as const, label: "" },
      ],
    });
  };

  const removeField = (index: number) => {
    onUpdate({
      formFields: (block.formFields ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className={styles.section}>
      {block.headline !== undefined && (
        <textarea
          ref={headlineRef}
          className={styles.headline}
          rows={1}
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      {block.subheadline !== undefined && (
        <input
          type="text"
          className={styles.subheadline}
          value={block.subheadline}
          onChange={e => onUpdate({ subheadline: e.target.value || undefined })}
          placeholder="Subheadline..."
        />
      )}

      <div className={styles.info}>
        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={block.email ?? ""}
            onChange={e => onUpdate({ email: e.target.value || undefined })}
            placeholder="contact@example.com"
          />
        </div>
        <div className={styles.field}>
          <label>Phone</label>
          <input
            type="tel"
            value={block.phone ?? ""}
            onChange={e => onUpdate({ phone: e.target.value || undefined })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className={styles.field}>
          <label>Address</label>
          <textarea
            value={block.address ?? ""}
            onChange={e => onUpdate({ address: e.target.value || undefined })}
            placeholder="123 Main St, City, State 12345"
            rows={2}
          />
        </div>
      </div>

      {block.formFields !== undefined && (
        <div className={styles.formSection}>
          <textarea
            ref={formHeadlineRef}
            className={styles.formHeadline}
            rows={1}
            value={block.formHeadline ?? ""}
            onChange={e => onUpdate({ formHeadline: e.target.value || undefined })}
            placeholder="Send us a message"
          />

          <div className={styles.formFields}>
            {block.formFields.map((field, i) => (
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
              value={block.submitText ?? ""}
              onChange={e => onUpdate({ submitText: e.target.value || undefined })}
              placeholder="Send Message"
              className={styles.submitText}
            />
          </div>
        </div>
      )}
    </div>
  );
}
