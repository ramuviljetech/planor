"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const MainPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard by default
    router.replace("/dashboard");
  }, [router]);

  return (
    <div>
      {/* Loading or redirecting message */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        {/* Redirecting to dashboard... */}
      </div>
    </div>
  );
};

export default MainPage; 