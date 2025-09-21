/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { lazy, Suspense } from 'react';

const Loader = lazy(() => import('../components/Loader'));

const withSuspense =
  <P extends React.FC | Function, Q = void>(
    // @ts-expect-error TODO: Need to find a way to fix the return types here
    LazyComponent: React.JSXElementConstructor<P> | React.LazyExoticComponent<P> | P,
    FallbackComponent?: React.FC<Q> | null
  ): P =>
  // @ts-expect-error TODO: Possibly investigate fix for this error
  (props: P, props2: Q) => {
    let fallbackLoader = <></>;
    if (FallbackComponent === undefined) {
      fallbackLoader = (
        <Suspense fallback="">
          <Loader />
        </Suspense>
      );
    }
    // @ts-expect-error TODO: Fix this
    if (FallbackComponent) fallbackLoader = <FallbackComponent {...props2} />;

    return (
      <Suspense fallback={fallbackLoader}>
        {/** @ts-expect-error TODO: Need to find a way to fix the return types here */}
        <LazyComponent {...props} />
      </Suspense>
    );
  };

export default withSuspense;
