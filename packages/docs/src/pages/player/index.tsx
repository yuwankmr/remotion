import React from "react";
import Layout from "@theme/Layout";
import { LandingHeader } from "../../../components/Player/LandingHeader";
import { PlayerFeatures } from "../../../components/Player/features";
import { PoweredByRemotion } from "../../../components/Player/PoweredByRemotion";
import { PlayerPageFooter } from "../../../components/Player/Footer";
import { WrappedBanner } from "../../../components/Player/Wrapped";
import Head from "@docusaurus/Head";
import { VideoAppsTitle } from "../../../components/LambdaSplash/VideoAppsTitle";
import { VideoApps } from "../../../components/LambdaSplash/VideoApps";

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  paddingLeft: 16,
  paddingRight: 16,
};

export default () => {
  return (
    <Layout>
      <Head>
        <title>@remotion/player</title>
        <meta
          name="description"
          content="Embed videos that are written in React, and change them at runtime. Connect it to server-side rendering to turn them into real MP4 videos."
        />
        <meta name="og:image" content="/img/player-og.png" />
        <meta name="twitter:image" content="/img/player-og.png" />
        <meta property="og:image" content="/img/player-og.png" />
        <meta property="twitter:image" content="/img/player-og.png" />
      </Head>
      <div style={container}>
        <LandingHeader />
      </div>
      <PoweredByRemotion />
      <div style={container}>
        <PlayerFeatures />
      </div>
      <div style={container}>
        <VideoAppsTitle />
        <VideoApps active="player" />
      </div>
      <br />
      <br />
      <WrappedBanner />
      <PlayerPageFooter />
    </Layout>
  );
};
