import type { AboutSection as AboutSectionType, TeamMember, RichContent, ImageSource, Usage } from "@muse/core";
import { Image } from "../../controls/Image";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Team.module.css";

interface Props {
  section: AboutSectionType
  onUpdate: (data: Partial<AboutSectionType>) => void
  isPending?: boolean
  trackUsage?: (usage: Usage) => void
}

export function Team({ section, onUpdate, trackUsage }: Props) {
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

  const updateMemberImage = (index: number, image: ImageSource) => {
    updateMember(index, { image });
  };

  const removeMemberImage = (index: number) => {
    updateMember(index, { image: undefined });
  };

  return (
    <section className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      <EditableText
        rich
        hideLists
        value={section.headline ?? ""}
        onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
        as="h2"
        className={styles.headline}
        placeholder="Meet the Team"
        elementType="headline"
      />

      <div className={styles.grid}>
        {section.teamMembers?.map((member, i) => (
          <div key={i} className={styles.member}>
            {member.image && (
              <Image
                image={member.image}
                onUpdate={img => updateMemberImage(i, img)}
                onRemove={() => removeMemberImage(i)}
                onUsage={trackUsage}
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
              elementType="description"
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
