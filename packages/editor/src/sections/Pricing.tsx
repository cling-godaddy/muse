import type { PricingSection as PricingSectionType, PricingPlan, RichContent } from "@muse/core";
import { EditableText } from "../ux";
import { useIsEditable } from "../context/EditorMode";
import styles from "./Pricing.module.css";

interface Props {
  section: PricingSectionType
  onUpdate: (data: Partial<PricingSectionType>) => void
}

export function Pricing({ section, onUpdate }: Props) {
  const isEditable = useIsEditable();

  const updatePlan = (index: number, data: Partial<PricingPlan>) => {
    const plans = section.plans.map((p, i) =>
      i === index ? { ...p, ...data } : p,
    );
    onUpdate({ plans });
  };

  return (
    <div className={styles.section}>
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
