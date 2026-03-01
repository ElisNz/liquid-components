import styles from "./page.module.css";
import Liquid from "./components/Liquid/Liquid";
import ContrastText from "./components/ContrastText/ContrastText";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <Liquid label="I'm unlit" />
        </div>
        <div className={styles.container}>
          <ContrastText className={styles.heading}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla aliquam numquam repellendus accusamus ullam illum blanditiis accusantium dicta, maiores delectus velit voluptates animi hic eaque sit commodi reiciendis. Aliquam, quas.</ContrastText>
          <Liquid className={styles.background} glow />
        </div>
      </main>
    </div>
  );
}
