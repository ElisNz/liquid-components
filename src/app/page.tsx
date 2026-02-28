import styles from "./page.module.css";
import Liquid from "./components/Liquid/Liquid";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <Liquid />
        </div>
      </main>
    </div>
  );
}
