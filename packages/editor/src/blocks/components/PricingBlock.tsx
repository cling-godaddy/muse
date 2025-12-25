import type { PricingBlock as PricingBlockType, PricingPlan } from "@muse/core";

interface Props {
  block: PricingBlockType
  onUpdate: (data: Partial<PricingBlockType>) => void
}

export function PricingBlock({ block, onUpdate }: Props) {
  const updatePlan = (index: number, data: Partial<PricingPlan>) => {
    const plans = block.plans.map((p, i) =>
      i === index ? { ...p, ...data } : p,
    );
    onUpdate({ plans });
  };

  return (
    <div className="muse-block-pricing">
      {block.headline !== undefined && (
        <input
          type="text"
          className="muse-block-pricing-headline"
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      {block.subheadline !== undefined && (
        <input
          type="text"
          className="muse-block-pricing-subheadline"
          value={block.subheadline}
          onChange={e => onUpdate({ subheadline: e.target.value || undefined })}
          placeholder="Subheadline..."
        />
      )}
      <div className="muse-block-pricing-plans">
        {block.plans.map((plan, i) => (
          <div
            key={i}
            className={`muse-block-pricing-plan ${plan.highlighted ? "muse-block-pricing-plan--highlighted" : ""}`}
          >
            <input
              type="text"
              className="muse-block-pricing-name"
              value={plan.name}
              onChange={e => updatePlan(i, { name: e.target.value })}
              placeholder="Plan name"
            />
            <div className="muse-block-pricing-price">
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
              className="muse-block-pricing-description"
              value={plan.description ?? ""}
              onChange={e => updatePlan(i, { description: e.target.value || undefined })}
              placeholder="Plan description..."
              rows={2}
            />
            <ul className="muse-block-pricing-features">
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
