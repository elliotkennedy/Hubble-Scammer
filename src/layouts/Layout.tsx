import React from "react";
import "../App.less";
import { Helmet } from 'react-helmet'
import { MainLayout } from "./Main/MainLayout";
import { LABELS } from "../constants";

const Layouts: any = {
  main: MainLayout,
}

export const Layout = React.memo(({ children, title }: LayoutProps) => {

  // Layout Rendering
  const getLayout = (): any => {
    return 'main'
  }

  const Container = Layouts[getLayout()]

  const BootstrappedLayout = () => {
    return <Container>{children}</Container>
  }

  return (
    <>
      <Helmet titleTemplate={`${LABELS.APP_TITLE} ${LABELS.APP_TITLE_EMOJI} | %s`} title={title} />
      {BootstrappedLayout()}
    </>
  );
});

interface LayoutProps {
  children: React.ReactNode,
  title?: string,
}
