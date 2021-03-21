import { Box, InputGroup, Input, InputRightElement, Heading, Grid, useColorMode, IconButton } from "@chakra-ui/react";
import { FaSearch, FaSun, FaMoon } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "./Header.scss";

function Header() {
	const history = useHistory();
	const { colorMode, toggleColorMode } = useColorMode();

	/** Will navigate one level up in the application */
	const back = () => history.push("/");

	return (
		<Box className="page-header" p="4">
			<Grid templateColumns="1fr 1fr" alignItems="center" gap={2} justifyContent="space-between">
				<Heading size="md" onClick={back} cursor="pointer">
					Hymns for All Times
				</Heading>
				<Grid templateColumns="minmax(auto, 300px) auto" gap={2} justifyContent="flex-end">
					<InputGroup size="md">
						<Input type="text" placeholder="Search songs..." pr="4.5rem" />
						<InputRightElement>
							<IconButton size="sm" h="1.75rem" icon={<FaSearch />} aria-label="Search Song Database" />
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
			</Grid>
		</Box>
	);
}

export default Header;
