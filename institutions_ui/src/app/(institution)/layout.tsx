'use client';

import { useEffect } from 'react';

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const fetchUserData = async () => {
      const userInfoResponse = await fetch(`${apiUrl}/user`);
      if (userInfoResponse.status === 403 || userInfoResponse.status === 401) {
        window.location.reload();
        return;
      }
      const userInfo = await userInfoResponse.json();
      console.log(userInfo);
    };

    fetchUserData();
  }, []);

  return <div>{children}</div>;
}
