// react-testing-library renders your components to document.body,
// this adds jest-dom's custom assertions
import "@testing-library/jest-dom";

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: jest.fn(),
    media: "",
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
}));

// Object.defineProperty(window, 'matchMedia', {
//     writable: true,
//     value: jest.fn().mockImplementation(query => ({
//       matches: jest.fn(),
//       media: query,
//       onchange: null,
//       addListener: jest.fn(), // deprecated
//       removeListener: jest.fn(), // deprecated
//       addEventListener: jest.fn(),
//       removeEventListener: jest.fn(),
//       dispatchEvent: jest.fn(),
//     })),
// });
