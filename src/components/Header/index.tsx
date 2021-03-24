import React, { useContext, useState } from "react";
import { FaSearch, FaSun, FaMoon, FaHome, FaBars } from "react-icons/fa";
import { useDebouncedCallback } from "use-debounce";
import { useHistory } from "react-router-dom";
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
} from "@chakra-ui/react";
import "./Header.scss";
import { Button } from "components";

function Header() {
	const history = useHistory();
	const { songs } = useContext(MainContext);
	const { colorMode, toggleColorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [query, setQuery] = useState("");
	const [queryResults, setQueryResults] = useState<Fuse.FuseResult<Song>[]>([]);
	const [showMobileMenu] = useMediaQuery("(max-width: 550px)");
	const resultsBG = useColorModeValue("white", "gray.800");
	const fuse = new Fuse(songs!, { keys: ["number", "title"] });

	/** Will navigate one level up in the application */
	const back = () => history.push("/");

	const searchSongs = () => {
		history.push(`/search?${query}`);
		setQueryResults([]);
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
		<Box className="page-header" p="4">
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
						disabled
					/>
				) : (
					<Grid templateColumns="minmax(auto, 300px) auto" gap={2} justifyContent="flex-end">
						<InputGroup size="md">
							<Input
								value={query}
								onChange={searchQueryChange}
								type="text"
								placeholder="Search songs..."
								pr="4.5rem"
							/>
							<InputRightElement>
								<IconButton
									size="sm"
									h="1.75rem"
									icon={<FaSearch />}
									aria-label="Search Song Database"
									onClick={searchSongs}
									disabled
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
						zIndex={105}
						top={20}
						right="65"
						w={350}
						pos="absolute"
						px={5}
						pb={5}
						hidden={!isOpen}
						shadow="md"
						borderRadius="md"
					>
						<CloseButton size="md" onClick={onClose} pos="absolute" top="1" right="5" />
						<Grid gap={5} mt={10} w="100%">
							{queryResults.map(result => (
								<Button bg="blue.500" onClick={() => gotoSong(result.item.number)} overflow="hidden">
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
		</Box>
	);
}

export default Header;
