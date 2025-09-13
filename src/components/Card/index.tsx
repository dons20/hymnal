import { useMantineColorScheme, Image, Card as MantineCard, Text, Group } from "@mantine/core";
import { Link } from "react-router";
import Button from "../Button";

interface CardBase {
    /** A title for the card */
    title: string;
    /** A subtitle to display next to the title */
    subtitle: string;
    /** The label for the primary link */
    primaryLabel: string;
    /** A route to navigate to when clicking the primary button */
    primaryLink: string;
}

interface CardWithImage extends CardBase {
    /** The source for the card image */
    imageSrc: string;
    /** The alt text for the image (accessibility) */
    imageAlt: string;
}

interface CardWithoutImage extends CardBase {
    imageSrc?: never;
    imageAlt?: never;
}

type CardP = CardWithImage | CardWithoutImage;

const Card = ({ title, subtitle, primaryLink, primaryLabel, imageSrc, imageAlt }: CardP) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <MantineCard className="card" p="md" shadow="md" radius="sm" withBorder>
            <Group justify="space-between" align="center" wrap="wrap">
                <Text fw={500}>{title}</Text>
                <Text c={isDark ? 'gray.4' : 'gray.6'} size="sm">
                    {subtitle}
                </Text>
            </Group>
            {imageSrc && (
                <Image
                    loading="lazy"
                    h={280}
                    w="100%"
                    fit="contain"
                    alt={imageAlt}
                    src={imageSrc}
                    mb="md"
                />
            )}
            <Button size="md" color="blue" component={Link} to={primaryLink}>
                {primaryLabel}
            </Button>
        </MantineCard>
    );
};

export default Card;
