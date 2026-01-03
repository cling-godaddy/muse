import type { AboutSection as AboutSectionType, TeamMember, RichContent } from "@muse/core";
import { EditableText, ImageLoader } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Team.module.css";

interface Props {
  section: AboutSectionType
  onUpdate: (data: Partial<AboutSectionType>) => void
  isPending?: boolean
}

export function Team({ section, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();

  const updateMember = (index: number, data: Partial<TeamMember>) => {
    const teamMembers = (section.teamMembers ?? []).map((member, i) =>
      i === index ? { ...member, ...data } : member,
    );
    onUpdate({ teamMembers });
  };

  const addMember = () => {
    onUpdate({
      teamMembers: [...(section.teamMembers ?? []), { name: "", role: "" }],
    });
  };

  const removeMember = (index: number) => {
    onUpdate({
      teamMembers: (section.teamMembers ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <section className={styles.section}>
      <EditableText
        value={section.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="Meet the Team"
      />

      <div className={styles.grid}>
        {section.teamMembers?.map((member, i) => (
          <div key={i} className={styles.member}>
            {member.image && (
              <ImageLoader
                image={member.image}
                isPending={!!isPending}
                className={styles.avatar}
              />
            )}
            <EditableText
              value={member.name}
              onChange={v => updateMember(i, { name: v })}
              as="h4"
              className={styles.memberName}
              placeholder="Name"
            />
            <EditableText
              value={member.role}
              onChange={v => updateMember(i, { role: v })}
              as="span"
              className={styles.memberRole}
              placeholder="Role"
            />
            <EditableText
              rich
              value={member.bio ?? ""}
              onChange={(v: RichContent) => updateMember(i, { bio: v.text ? v : undefined })}
              as="p"
              className={styles.memberBio}
              placeholder="Short bio..."
            />
            {isEditable && (
              <button type="button" onClick={() => removeMember(i)} className={styles.removeButton}>
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {isEditable && (
        <button type="button" onClick={addMember} className={styles.addButton}>
          Add Team Member
        </button>
      )}
    </section>
  );
}
