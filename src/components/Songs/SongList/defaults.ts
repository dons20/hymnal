/**
 * TODO: Sync these with local state
 */

interface FilterPropT {
	enabled: boolean;
	currValue: string | null;
}

export const DEFAULT_ALPHA_PROPS = {
	enabled: false,
	sortDescending: false,
};

export const DEFAULT_NUM_PROPS = {
	enabled: true,
	sortDescending: false,
};

export const DEFAULT_FILTER_PROPS: FilterPropT = {
	enabled: false,
	currValue: null,
};
