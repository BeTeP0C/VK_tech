import type { AppProps } from "next/app";
import "../styles/styles.global.scss"
import React from "react";

export default function App ({Component, pageProps}: AppProps) {
  return <Component {...pageProps}/>
}
