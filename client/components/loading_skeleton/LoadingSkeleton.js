import React, { Component } from 'react';
import {
  Layout,
  Card,
  Stack,
  SkeletonPage,
  SkeletonBodyText,
  Spinner,
} from '@shopify/polaris';

class LoadingSkeleton extends Component {
  render() {
    return (
      <SkeletonPage>
        <Layout sectioned>
          <Layout.Section>
            <Card sectioned>
              <SkeletonBodyText />
            </Card>
          </Layout.Section>
        </Layout>
        <br />
        <Stack distribution="fill" alignment="center" vertical spacing="tight">
          <Spinner />
        </Stack>
      </SkeletonPage>
    );
  }
}

export default LoadingSkeleton;
