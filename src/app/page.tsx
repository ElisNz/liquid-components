import styles from "./page.module.css";
import Liquid from "./components/Liquid/Liquid";
import ContrastText from "./components/ContrastText/ContrastText";

const text = `When I was a child, I stared into my lava lamp for hours, mesmerized by the way the blobs moved and merged. It was like watching a slow-motion dance of colors and shapes, a hypnotic display that sparked my imagination. Now, as an adult, I find myself drawn to the same sense of wonder and tranquility that those swirling liquids provided.`;

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <Liquid label="Welcome to My Lava Lamp" glow />
        </div>
        <div className={styles.container}>
          <ContrastText className={styles.heading}>{text}</ContrastText>
          <Liquid className={styles.background} glow color="#00c372ff"/>
        </div>
        <div className={styles.container}>
          <Liquid className={styles.background} light color="#c0c300ff"/>
        </div>
      </main>
    </div>
  );
}
