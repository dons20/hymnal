class Worker {
	url: any;

	onmessage: ({ ...props }) => void;

	constructor(stringUrl: any) {
		this.url = stringUrl;
		this.onmessage = () => {};
	}

	postMessage(msg: any) {
		this.onmessage(msg);
	}
}

// @ts-ignore
global.Worker = Worker;

export default Worker;
