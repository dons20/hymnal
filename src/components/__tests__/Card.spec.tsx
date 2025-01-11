import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Card } from "components";
import SampleImg from "img/favourites.svg";

describe("#Card", () => {
    it("should render content based on props", () => {
        const props = {
            title: "Example",
            subtitle: "Sample Card",
            primaryLink: "/next-page",
            primaryLabel: "Sample Link",
            imageSrc: SampleImg,
            imageAlt: "Sample Image",
        };
        render(
            <BrowserRouter>
                <Card {...props} />
            </BrowserRouter>
        );
        const title = screen.getByText(props.title);
        const subtitle = screen.getByText(props.subtitle);
        const link = screen.getByRole("link");
        const image = screen.getByRole("img");

        expect(title).toBeInTheDocument();
        expect(subtitle).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(props.primaryLink);
        expect(link.textContent).toBe(props.primaryLabel);
        expect(image.getAttribute("src")).toEqual(props.imageSrc);
        expect(image.getAttribute("alt")).toEqual(props.imageAlt);
    });
});
