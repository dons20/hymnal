/* eslint-disable react/function-component-definition */
import { lazy, Suspense } from "react";

const Loader = lazy(() => import("components/Loader"));

const withSuspense =
	<P extends React.FC | Function, Q = void>(
		// @ts-ignore TODO: Need to find a way to fix the return types here
		LazyComponent: React.JSXElementConstructor<P> | React.LazyExoticComponent<P> | P,
		FallbackComponent?: React.FC<Q> | null
	): P =>
	// @ts-ignore TODO: Possibly investigate fix for this error
	(props: P, props2: Q) => {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		let fallbackLoader = <></>;
		if (FallbackComponent === undefined)
			fallbackLoader = (
				<Suspense fallback="">
					<Loader />
				</Suspense>
			);
		if (FallbackComponent) fallbackLoader = <FallbackComponent {...props2} />;

		return (
			<Suspense fallback={fallbackLoader}>
				{/** @ts-ignore TODO: Need to find a way to fix the return types here */}
				<LazyComponent {...props} />
			</Suspense>
		);
	};

export default withSuspense;
