import styles from "./page.module.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>{children}</div>
      <div className={styles.rightSide} />
    </div>
  );
}
