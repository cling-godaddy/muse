import { setProjectAnnotations } from "@storybook/react-vite";
import * as a11yAnnotations from "@storybook/addon-a11y/preview";
import * as previewAnnotations from "./preview";

setProjectAnnotations([previewAnnotations, a11yAnnotations]);
