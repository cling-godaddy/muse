import type { PricingBlock as PricingBlockType, PricingPlan } from "@muse/core";
import { useAutoResize } from "../hooks";
import styles from "./Pricing.module.css";

interface Props {
  block: PricingBlockType
  onUpdate: (data: Partial<PricingBlockType>) => void
}

export function Pricing({ block, onUpdate }: Props) {
  const headlineRef = useAutoResize(block.headline ?? "");

  const updatePlan = (index: number, data: Partial<PricingPlan>) => {
    const plans = block.plans.map((p, i) =>
      i === index ? { ...p, ...data } : p,
    );
    onUpdate({ plans });
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
      <div className={styles.plans}>
        {block.plans.map((plan, i) => (
          <div
            key={i}
            className={`${styles.plan} ${plan.highlighted ? styles.highlighted : ""}`}
          >
            <input
              type="text"
              className={styles.name}
              value={plan.name}
              onChange={e => updatePlan(i, { name: e.target.value })}
              placeholder="Plan name"
            />
            <div className={styles.price}>
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
            </div>
            <textarea
              className={styles.description}
              value={plan.description ?? ""}
              onChange={e => updatePlan(i, { description: e.target.value || undefined })}
              placeholder="Plan description..."
              rows={2}
            />
            <ul className={styles.features}>
              {plan.features.map((feature, j) => (
                <li key={j}>
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const features = [...plan.features];
                      features[j] = e.target.value;
                      updatePlan(i, { features });
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
