import type { PricingSection as PricingSectionType, PricingPlan, RichContent } from "@muse/core";
import { EditableText, Skeleton } from "../ux";
import { useIsEditable } from "../context/EditorMode";
import styles from "./Pricing.module.css";

interface Props {
  section: PricingSectionType
  onUpdate: (data: Partial<PricingSectionType>) => void
  isPending?: boolean
}

export function Pricing({ section, onUpdate, isPending }: Props) {
  const isEditable = useIsEditable();

  // Show section-level skeleton when empty array during generation
  if (isPending && section.plans.length === 0) {
    return (
      <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
        {section.headline !== undefined && (
          <Skeleton variant="text" height="2em" width="50%" className={styles.headline} />
        )}
        {section.subheadline !== undefined && (
          <Skeleton variant="text" height="1.2em" width="60%" className={styles.subheadline} />
        )}
        <div className={styles.plans}>
          {[0, 1, 2].map(i => (
            <div key={i} className={styles.plan}>
              <Skeleton variant="text" height="1.8em" width="60%" className={styles.name} />
              <div className={styles.price}>
                <Skeleton variant="text" height="2.5em" width="80px" />
                <Skeleton variant="text" height="1em" width="60px" />
              </div>
              <Skeleton variant="text" height="1em" width="100%" />
              <div>
                <Skeleton variant="text" height="1em" width="90%" />
                <Skeleton variant="text" height="1em" width="85%" />
                <Skeleton variant="text" height="1em" width="90%" />
                <Skeleton variant="text" height="1em" width="88%" />
              </div>
              <Skeleton variant="rect" height="44px" width="100%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const updatePlan = (index: number, data: Partial<PricingPlan>) => {
    const plans = section.plans.map((p, i) =>
      i === index ? { ...p, ...data } : p,
    );
    onUpdate({ plans });
  };

  return (
    <div className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      {section.headline !== undefined && (
        <EditableText
          rich
          hideLists
          value={section.headline}
          onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
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
      <div className={styles.plans}>
        {section.plans.map((plan, i) => (
          <div
            key={i}
            className={`${styles.plan} ${plan.highlighted ? styles.highlighted : ""}`}
          >
            <EditableText
              value={plan.name}
              onChange={v => updatePlan(i, { name: v })}
              as="h3"
              className={styles.name}
              placeholder="Plan name"
            />
            <div className={styles.price}>
              {isEditable
                ? (
                  <>
                    <input
                      type="text"
                      value={plan.price}
                      onChange={e => updatePlan(i, { price: e.target.value })}
                      placeholder="$0"
                    />
                    <input
                      type="text"
                      value={plan.period ?? ""}
                      onChange={e => updatePlan(i, { period: e.target.value || undefined })}
                      placeholder="/month"
                    />
                  </>
                )
                : (
                  <span>
                    {plan.price}
                    {plan.period}
                  </span>
                )}
            </div>
            <EditableText
              rich
              value={plan.description ?? ""}
              onChange={(v: RichContent) => updatePlan(i, { description: v.text ? v : undefined })}
              as="p"
              className={styles.description}
              placeholder="Plan description..."
            />
            <ul className={styles.features}>
              {plan.features.map((feature, j) => (
                <li key={j}>
                  {isEditable
                    ? (
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const features = [...plan.features];
                          features[j] = e.target.value;
                          updatePlan(i, { features });
                        }}
                      />
                    )
                    : (
                      <span>{feature}</span>
                    )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
