import type { AboutBlock as AboutBlockType, TeamMember } from "@muse/core";
import { useAutoResize } from "../hooks";
import { ImageLoader } from "../ux";
import styles from "./About.module.css";

interface Props {
  block: AboutBlockType
  onUpdate: (data: Partial<AboutBlockType>) => void
  isPending?: boolean
}

export function About({ block, onUpdate, isPending }: Props) {
  const headlineRef = useAutoResize(block.headline ?? "");
  const bodyRef = useAutoResize(block.body ?? "");

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
      <textarea
        ref={headlineRef}
        className={styles.headline}
        rows={1}
        value={block.headline ?? ""}
        onChange={e => onUpdate({ headline: e.target.value || undefined })}
        placeholder="About Us"
      />

      {block.image && (
        <ImageLoader image={block.image} isPending={!!isPending} className={styles.image} />
      )}

      <textarea
        ref={bodyRef}
        className={styles.body}
        value={block.body ?? ""}
        onChange={e => onUpdate({ body: e.target.value || undefined })}
        placeholder="Tell your story..."
        rows={4}
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
                <input
                  type="text"
                  value={member.name}
                  onChange={e => updateMember(i, { name: e.target.value })}
                  placeholder="Name"
                  className={styles.memberName}
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={e => updateMember(i, { role: e.target.value })}
                  placeholder="Role"
                  className={styles.memberRole}
                />
                <textarea
                  value={member.bio ?? ""}
                  onChange={e => updateMember(i, { bio: e.target.value || undefined })}
                  placeholder="Short bio..."
                  rows={2}
                  className={styles.memberBio}
                />
                <button type="button" onClick={() => removeMember(i)} className={styles.removeButton}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button type="button" onClick={addMember} className={styles.addButton}>
        Add Team Member
      </button>
    </div>
  );
}
