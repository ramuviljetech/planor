import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import styles from "./page.module.css";
import { AuthGuard } from "@/components/auth-guard";
import { DataProvider } from "@/providers/data-provider";

export default function MainLayoout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DataProvider>
        <main suppressHydrationWarning className={styles.main}>
          <Header />
          <div className={styles.sub_wrapper}>
            <Sidebar />
            <div className={styles.content}>{children}</div>
          </div>
        </main>
      </DataProvider>
    </AuthGuard>
  );
}
