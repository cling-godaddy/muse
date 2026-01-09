import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Products, type ProductsVariant } from "@muse/sections";
import type { ProductItem } from "@muse/core";

const sampleProducts: ProductItem[] = [
  { image: { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", alt: "Watch" }, name: "Classic Watch", price: "$249", rating: 4.8 },
  { image: { url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", alt: "Headphones" }, name: "Wireless Headphones", price: "$179", originalPrice: "$229", rating: 4.5, badge: "Sale" },
  { image: { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", alt: "Sunglasses" }, name: "Aviator Sunglasses", price: "$129", rating: 4.7 },
  { image: { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", alt: "Backpack" }, name: "Canvas Backpack", price: "$89", rating: 4.6 },
  { image: { url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400", alt: "Sneakers" }, name: "Running Sneakers", price: "$145", rating: 4.9, badge: "New" },
  { image: { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400", alt: "Bag" }, name: "Leather Tote", price: "$195", rating: 4.4 },
  { image: { url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400", alt: "Camera" }, name: "Polaroid Camera", price: "$99", rating: 4.3 },
  { image: { url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400", alt: "Headphones 2" }, name: "Studio Headphones", price: "$299", rating: 4.8 },
];

const sampleMinimalProducts: ProductItem[] = [
  { image: { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400", alt: "Vase" }, name: "Ceramic Vase", price: "$85" },
  { image: { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", alt: "Chair" }, name: "Accent Chair", price: "$450", originalPrice: "$550" },
  { image: { url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400", alt: "Lamp" }, name: "Table Lamp", price: "$120" },
  { image: { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", alt: "Sofa" }, name: "Velvet Sofa", price: "$1,299" },
  { image: { url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400", alt: "Coffee Table" }, name: "Oak Coffee Table", price: "$380" },
  { image: { url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", alt: "Mirror" }, name: "Round Mirror", price: "$165" },
  { image: { url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400", alt: "Plant" }, name: "Fiddle Leaf Fig", price: "$95" },
  { image: { url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400", alt: "Clock" }, name: "Wall Clock", price: "$145" },
];

/** Renders product cards */
function ProductCards({ products }: { products: ProductItem[] }) {
  return (
    <>
      {products.map((product, i) => (
        <div key={i} style={{ background: "#f9fafb", borderRadius: "0.5rem", overflow: "hidden" }}>
          <div style={{ position: "relative" }}>
            {product.image && (
              <img src={product.image.url} alt={product.image.alt} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
            )}
            {product.badge && (
              <span style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "#6366f1", color: "white", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem" }}>
                {product.badge}
              </span>
            )}
          </div>
          <div style={{ padding: "1rem" }}>
            <h3 style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{product.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 600 }}>{product.price}</span>
              {product.originalPrice && (
                <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "0.875rem" }}>{product.originalPrice}</span>
              )}
            </div>
            {product.rating && (
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                Rating:
                {" "}
                {product.rating}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

type ProductsArgs = {
  headline: string
  subheadline: string
  variant: ProductsVariant
  itemCount: number
  useMinimal: boolean
};

const meta: Meta<ProductsArgs> = {
  title: "Sections/Products",
  argTypes: {
    variant: {
      control: "select",
      options: ["grid", "carousel"],
    },
    headline: { control: "text" },
    subheadline: { control: "text" },
    itemCount: { control: { type: "range", min: 2, max: 8, step: 1 } },
    useMinimal: { control: "boolean" },
  },
  args: {
    headline: "Featured Products",
    subheadline: "Handpicked favorites from our collection",
    variant: "grid",
    itemCount: 8,
    useMinimal: false,
  },
  render: (args) => {
    const products = args.useMinimal
      ? sampleMinimalProducts.slice(0, args.itemCount)
      : sampleProducts.slice(0, args.itemCount);
    return (
      <Products
        headline={args.headline ? <h2>{args.headline}</h2> : undefined}
        subheadline={args.subheadline ? <p>{args.subheadline}</p> : undefined}
        items={<ProductCards products={products} />}
        variant={args.variant}
      />
    );
  },
};

export default meta;
type Story = StoryObj<ProductsArgs>;

export const Grid: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /featured products/i })).toBeVisible();
    await expect(canvas.getByText(/classic watch/i)).toBeVisible();
    await expect(canvas.getByText(/\$249/)).toBeVisible();
  },
};

export const Featured: Story = {
  args: {
    headline: "Shop the Collection",
    subheadline: "Our best sellers this season",
    itemCount: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /shop the collection/i })).toBeVisible();
  },
};

export const Minimal: Story = {
  args: {
    headline: "New Arrivals",
    subheadline: "",
    itemCount: 8,
    useMinimal: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /new arrivals/i })).toBeVisible();
  },
};
