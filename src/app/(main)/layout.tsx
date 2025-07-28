import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import styles from "./page.module.css";

export default function MainLayoout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main suppressHydrationWarning className={styles.main}>
      <Header />
      <div className={styles.sub_wrapper}>
        <Sidebar />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}
