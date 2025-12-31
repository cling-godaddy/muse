import type { AboutBlock as AboutBlockType, TeamMember } from "@muse/core";
import { EditableText, ImageLoader } from "../ux";
import { useIsEditable } from "../context/EditorModeContext";
import styles from "./About.module.css";

interface Props {
  block: AboutBlockType
  onUpdate: (data: Partial<AboutBlockType>) => void
  isPending?: boolean
}

export function About({ block, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();

  const updateMember = (index: number, data: Partial<TeamMember>) => {
    const teamMembers = (block.teamMembers ?? []).map((member, i) =>
      i === index ? { ...member, ...data } : member,
    );
    onUpdate({ teamMembers });
  };

  const addMember = () => {
    onUpdate({
      teamMembers: [...(block.teamMembers ?? []), { name: "", role: "" }],
    });
  };

  const removeMember = (index: number) => {
    onUpdate({
      teamMembers: (block.teamMembers ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className={styles.section}>
      <EditableText
        value={block.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="About Us"
      />

      {block.image && (
        <ImageLoader image={block.image} isPending={!!isPending} className={styles.image} />
      )}

      <EditableText
        value={block.body ?? ""}
        onChange={v => onUpdate({ body: v || undefined })}
        as="p"
        className={styles.body}
        placeholder="Tell your story..."
      />

      {(block.teamMembers?.length ?? 0) > 0 && (
        <div className={styles.team}>
          <h3 className={styles.teamHeadline}>Team</h3>
          <div className={styles.teamGrid}>
            {block.teamMembers?.map((member, i) => (
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
                  value={member.bio ?? ""}
                  onChange={v => updateMember(i, { bio: v || undefined })}
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
        </div>
      )}

      {isEditable && (
        <button type="button" onClick={addMember} className={styles.addButton}>
          Add Team Member
        </button>
      )}
    </div>
  );
}
