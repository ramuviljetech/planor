import styles from "./page.module.css";
import Image from "next/image";
import { bannerIcon } from "@/resources/images";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>{children}</div>
      <div className={styles.rightSide}>
        <Image src={bannerIcon} alt="banner" className={styles.banner_image} />
      </div>
    </div>
  );
}
