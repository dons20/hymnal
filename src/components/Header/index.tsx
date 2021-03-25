import React, { useContext, useState } from "react";
import { FaSearch, FaSun, FaMoon, FaHome, FaBars } from "react-icons/fa";
import { useDebouncedCallback } from "use-debounce";
import { useHistory } from "react-router-dom";
import { Button } from "components";
import { MainContext } from "App";
import Fuse from "fuse.js";
import {
	Box,
	InputGroup,
	Input,
	InputRightElement,
	Heading,
	Grid,
	useColorMode,
	IconButton,
	Icon,
	useMediaQuery,
	Text,
	Fade,
	useDisclosure,
	CloseButton,
	Portal,
	useColorModeValue,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	VStack,
} from "@chakra-ui/react";
import "./Header.scss";

function Header() {
	const history = useHistory();
	const { songs } = useContext(MainContext);
	const { colorMode, toggleColorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
	const fuse = new Fuse(songs!, { keys: ["number", "title"] });
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

	const searchSongs = (e?: React.ChangeEvent<any>, mobile?: boolean) => {
		const shouldSearchMobile = mobile && mobileQuery.length > 0;
		const shouldSearchDesktop = !mobile && query.length > 0;
		if (shouldSearchMobile || shouldSearchDesktop) {
			onClose();
			history.push(`/search?query=${shouldSearchMobile ? mobileQuery : query}`);
			setQueryResults([]);
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
		const result = fuse.search(value);
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
			<Grid templateColumns="max-content 1fr" alignItems="center" gap={10} justifyContent="space-between">
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
						<InputGroup size="md" as="form" onSubmit={submitQuery}>
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
						top={20}
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
							<InputGroup size="md" as="form" onSubmit={e => searchSongs(e, true)}>
								<Input
									type="search"
									value={mobileQuery}
									onChange={mobileSearchQueryChange}
									placeholder="Search songs..."
									pr="4.5rem"
								/>
								<InputRightElement>
									<IconButton
										size="sm"
										h="1.75rem"
										icon={<FaSearch />}
										aria-label="Search Song Database"
										onClick={e => searchSongs(e, true)}
										disabled
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
