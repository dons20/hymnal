import { FaSearch, FaSun, FaMoon, FaHome, FaBars } from "react-icons/fa";
import { useHistory } from "react-router-dom";
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
} from "@chakra-ui/react";
import "./Header.scss";

function Header() {
	const history = useHistory();
	const { colorMode, toggleColorMode } = useColorMode();
	const [showMobileMenu] = useMediaQuery("(max-width: 550px)");

	/** Will navigate one level up in the application */
	const back = () => history.push("/");

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
							<Input type="text" placeholder="Search songs..." pr="4.5rem" disabled />
							<InputRightElement>
								<IconButton
									size="sm"
									h="1.75rem"
									icon={<FaSearch />}
									aria-label="Search Song Database"
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
		</Box>
	);
}

export default Header;
