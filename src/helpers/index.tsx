import React, { Suspense } from "react";
// import { Spinner } from "@chakra-ui/spinner";
import { Loader } from "components";

export const withSuspense = <P extends React.ReactNode & object, Q extends React.ReactNode & object>(
	LazyComponent: React.FC<P>,
	FallbackComponent?: React.FC<Q>
) => {
	return (props: React.ReactNode) => (
		<Suspense
			fallback={
				FallbackComponent ? (
					<FallbackComponent {...(props as Q)} />
				) : (
					<Loader />
					// <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
				)
			}
		>
			<LazyComponent {...(props as P)} />
		</Suspense>
	);
};
