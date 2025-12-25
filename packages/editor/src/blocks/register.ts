import { componentRegistry } from "./registry";
import { TextBlock } from "./components/TextBlock";
import { HeroBlock } from "./components/HeroBlock";
import { FeaturesBlock } from "./components/FeaturesBlock";
import { CtaBlock } from "./components/CtaBlock";
import { ImageBlock } from "./components/ImageBlock";

componentRegistry.register("text", TextBlock);
componentRegistry.register("hero", HeroBlock);
componentRegistry.register("features", FeaturesBlock);
componentRegistry.register("cta", CtaBlock);
componentRegistry.register("image", ImageBlock);
