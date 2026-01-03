import type { EditorThemeClasses } from "lexical";

export const theme: EditorThemeClasses = {
  paragraph: "muse-paragraph",
  text: {
    bold: "muse-bold",
    italic: "muse-italic",
    underline: "muse-underline",
    strikethrough: "muse-strikethrough",
  },
  link: "muse-link",
  list: {
    ul: "muse-list-ul",
    ol: "muse-list-ol",
    listitem: "muse-listitem",
    nested: {
      listitem: "muse-nested-listitem",
    },
  },
  heading: {
    h1: "muse-h1",
    h2: "muse-h2",
    h3: "muse-h3",
  },
};
