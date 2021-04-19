import React, { lazy, useState } from "react";
import { useColorMode, useMediaQuery, useDisclosure, useColorModeValue, Box } from "@chakra-ui/react";
import { FaSearch, FaSun, FaMoon, FaHome, FaBars } from "react-icons/fa";
import { useDebouncedCallback } from "use-debounce";
import withSuspense from "helpers/withSuspense";
import { useHistory } from "react-router-dom";
import { useMainContext } from "App";
import Fuse from "fuse.js";
import "./Header.scss";

import type {
	Icon as IconType,
	Grid as GridType,
	Text as TextType,
	Fade as FadeType,
	Input as InputType,
	Modal as ModalType,
	Portal as PortalType,
	VStack as VStackType,
	Heading as HeadingType,
	ModalBody as ModalBodyType,
	IconButton as IconButtonType,
	InputGroup as InputGroupType,
	ModalHeader as ModalHeaderType,
	CloseButton as CloseButtonType,
	ModalOverlay as ModalOverlayType,
	ModalContent as ModalContentType,
	ModalCloseButton as ModalCloseButtonType,
	InputRightElement as InputRightElementType,
} from "@chakra-ui/react/dist/types";

/* Lazy Base Imports */
const CloseButtonImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.CloseButton })));
const FadeImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.Fade })));
const GridImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.Grid })));
const HeadingImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.Heading })));
const InputImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.Input })));
const IconImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.Icon })));
const IconButtonImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.IconButton })));
const InputGroupImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.InputGroup })));
const InputRightElementImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.InputRightElement })));
const ModalImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.Modal })));
const ModalOverlayImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.ModalOverlay })));
const ModalContentImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.ModalContent })));
const ModalHeaderImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.ModalHeader })));
const ModalCloseButtonImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.ModalCloseButton })));
const ModalBodyImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.ModalBody })));
const PortalImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.Portal })));
const TextImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.Text })));
const VStackImport = lazy(() => import("@chakra-ui/react").then(m => ({ default: m.VStack })));
const ButtonImport = lazy(() => import("components/Button"));

/* With Suspense Wrapper */
const Fade = withSuspense<typeof FadeType>(FadeImport);
const Grid = withSuspense<typeof GridType, null>(GridImport, null);
const Heading = withSuspense<typeof HeadingType, null>(HeadingImport, null);
const Input = withSuspense<typeof InputType, null>(InputImport, null);
const Icon = withSuspense<typeof IconType>(IconImport);
const CloseButton = withSuspense<typeof CloseButtonType>(CloseButtonImport);
const IconButton = withSuspense<typeof IconButtonType>(IconButtonImport);
const InputGroup = withSuspense<typeof InputGroupType, null>(InputGroupImport, null);
const InputRightElement = withSuspense<typeof InputRightElementType, null>(InputRightElementImport, null);
const Modal = withSuspense<typeof ModalType, null>(ModalImport, null);
const ModalOverlay = withSuspense<typeof ModalOverlayType, null>(ModalOverlayImport, null);
const ModalContent = withSuspense<typeof ModalContentType, null>(ModalContentImport, null);
const ModalHeader = withSuspense<typeof ModalHeaderType, null>(ModalHeaderImport, null);
const ModalCloseButton = withSuspense<typeof ModalCloseButtonType, null>(ModalCloseButtonImport, null);
const ModalBody = withSuspense<typeof ModalBodyType, null>(ModalBodyImport, null);
const Portal = withSuspense<typeof PortalType, null>(PortalImport, null);
const Text = withSuspense<typeof TextType>(TextImport);
const VStack = withSuspense<typeof VStackType, null>(VStackImport, null);
const Button = withSuspense<typeof ButtonImport, null>(ButtonImport, null);

function Header() {
	const history = useHistory();
	const { songs } = useMainContext();
	const { colorMode, toggleColorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
	const fuse = new Fuse(songs!, { keys: ["number", "title"], minMatchCharLength: 2, threshold: 0.4 });
	const [query, setQuery] = useState("");
	const [mobileQuery, setMobileQuery] = useState("");
	const [queryResults, setQueryResults] = useState<Fuse.FuseResult<Song>[]>([]);
	const [showMobileMenu] = useMediaQuery("(max-width: 550px)");
	const resultsBG = useColorModeValue("white", "gray.800");
	const headerBG = useColorModeValue("gray.100", "gray.800");
	const searchBG = useColorModeValue("gray.50", "gray.700");

	/** Will navigate one level up in the application */
	const back = () => history.push("/");

	const submitQuery = (e: React.FormEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (query.length > 0) searchSongs();
	};
	const submitMobileQuery = (e: React.FormEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (mobileQuery.length > 0) searchSongs(e, true);
	};

	const searchSongs = (e?: React.ChangeEvent<any>, mobile?: boolean) => {
		const shouldSearchMobile = mobile && mobileQuery.length > 0;
		const shouldSearchDesktop = !mobile && query.length > 0;
		if (shouldSearchMobile || shouldSearchDesktop) {
			onClose();
			onModalClose();
			setQuery("");
			setMobileQuery("");
			setQueryResults([]);
			history.push(`/search?query=${shouldSearchMobile ? mobileQuery : query}`);
		}
	};

	const mobileSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.target.value;
		setMobileQuery(searchValue);
	};

	const searchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.target.value;
		setQuery(searchValue);
		if (searchValue.length > 0) handleSearch(searchValue);
		else onClose();
	};

	const handleSearch = useDebouncedCallback((value: string) => {
		const result = fuse.search(value, { limit: 6 });
		setQueryResults(result.slice(0, 6));
		if (result.length > 0) onOpen();
	}, 300);

	const gotoSong = (index: number) => {
		onClose();
		setQuery("");
		history.push(`/songs/${index}`);
	};

	return (
		<Box className="page-header" p={4} bg={headerBG}>
			<Grid templateColumns="auto 1fr" alignItems="center" gap={10} justifyContent="space-between" px={5}>
				<Heading size="md" onClick={back} cursor="pointer" display="flex" alignItems="center" width="auto">
					Hymns for All Times
					<Icon as={FaHome} size={20} ml={3} />
				</Heading>
				{showMobileMenu ? (
					<IconButton
						size="xs"
						icon={<FaBars />}
						aria-label="Open mobile menu"
						justifySelf="flex-end"
						onClick={onModalOpen}
					/>
				) : (
					<Grid templateColumns="minmax(auto, 300px) auto" gap={2} justifyContent="flex-end">
						<InputGroup size="md" as="form" onSubmit={submitQuery} role="search">
							<Input
								value={query}
								onChange={searchQueryChange}
								type="search"
								placeholder="Search songs..."
								pr="4.5rem"
								bg={searchBG}
							/>
							<InputRightElement>
								<IconButton
									size="sm"
									h="1.75rem"
									icon={<FaSearch />}
									aria-label="Search Song Database"
									onClick={searchSongs}
								/>
							</InputRightElement>
						</InputGroup>

						<IconButton
							size="md"
							w="1.5rem"
							onClick={toggleColorMode}
							icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
							aria-label="Toggle Color Mode"
						/>
					</Grid>
				)}
			</Grid>
			<Fade in={isOpen}>
				<Portal>
					<Box
						bg={resultsBG}
						pos="absolute"
						zIndex={105}
						top="60px"
						right="65"
						w={350}
						px={5}
						pb={5}
						hidden={!isOpen || showMobileMenu}
						borderRadius="md"
						shadow="md"
					>
						<CloseButton size="md" onClick={onClose} pos="absolute" top="1" right="5" />
						<Grid gap={5} mt={10} w="100%">
							{queryResults.map(result => (
								<Button
									bg="blue.500"
									onClick={() => gotoSong(result.item.number)}
									overflow="hidden"
									key={result.item.number}
								>
									<Grid templateColumns="auto 1fr" gap="3" w="100%" justifyItems="left">
										<Text size="sm" color="white">
											{result.item.number}
										</Text>
										<Text size="sm" color="white">
											{result.item.title}
										</Text>
									</Grid>
								</Button>
							))}
						</Grid>
					</Box>
				</Portal>
			</Fade>

			<Modal isOpen={isModalOpen} onClose={onModalClose}>
				<ModalOverlay />
				<ModalContent pb={10}>
					<ModalHeader>Menu</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing="4">
							<InputGroup size="md" as="form" onSubmit={submitMobileQuery}>
								<Input
									type="search"
									value={mobileQuery}
									onChange={mobileSearchQueryChange}
									placeholder="Search songs..."
									pr="4.5rem"
									bg={searchBG}
								/>
								<InputRightElement>
									<IconButton
										size="sm"
										h="1.75rem"
										icon={<FaSearch />}
										aria-label="Search Song Database"
										onClick={e => searchSongs(e, true)}
									/>
								</InputRightElement>
							</InputGroup>

							<Button
								leftIcon={colorMode === "light" ? <FaMoon /> : <FaSun />}
								onClick={toggleColorMode}
								w="100%"
							>
								Toggle {colorMode === "light" ? "Dark" : "Light"} Mode
							</Button>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Box>
	);
}

export default Header;
