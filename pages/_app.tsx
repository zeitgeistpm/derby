import { observer } from "mobx-react";
import type { AppProps } from "next/app";
import AppLayout from "../lib/components/AppLayout";
import "../styles/globals.css";

const MyApp = observer(({ Component, pageProps }: AppProps) => {
  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
});

export default MyApp;
