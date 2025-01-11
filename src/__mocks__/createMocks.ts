class Worker {
    url: unknown;

    onmessage: ({ ...props }) => void;

    constructor(stringUrl: unknown) {
        this.url = stringUrl;
        this.onmessage = () => {};
    }

    postMessage(msg: Record<string, unknown>) {
        this.onmessage(msg);
    }
}

// @ts-expect-error Mocked Worker
global.Worker = Worker;

export default Worker;
