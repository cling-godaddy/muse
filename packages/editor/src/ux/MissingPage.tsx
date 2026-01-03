import { Dialog } from "./Dialog";
import styles from "./MissingPage.module.css";

interface MissingPageProps {
  open: boolean
  slug: string
  onClose: () => void
  onGenerate: () => void
}

export function MissingPage({ open, slug, onClose, onGenerate }: MissingPageProps) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()} title="Page not found">
      <div className={styles.content}>
        <p className={styles.message}>
          The page
          {" "}
          <code className={styles.slug}>{slug}</code>
          {" "}
          doesn't exist yet.
        </p>
        <p className={styles.hint}>Would you like to generate it?</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.generate} onClick={onGenerate}>
            Generate page
          </button>
        </div>
      </div>
    </Dialog>
  );
}
