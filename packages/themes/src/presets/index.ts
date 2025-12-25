import { registerTheme } from "../registry";
import { modern } from "./modern";
import { minimal } from "./minimal";
import { bold } from "./bold";
import { corporate } from "./corporate";
import { playful } from "./playful";

registerTheme(modern);
registerTheme(minimal);
registerTheme(bold);
registerTheme(corporate);
registerTheme(playful);

export { modern, minimal, bold, corporate, playful };
