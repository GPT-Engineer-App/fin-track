import React from "react";
import { Flex, Box, Text, IconButton } from "@chakra-ui/react";
import { FaSignOutAlt } from "react-icons/fa";

const NavBar = ({ onSignOut }) => {
  return (
    <Flex bg="blue.500" color="white" px={5} py={4} justifyContent="space-between" alignItems="center">
      <Box>
        <Text fontSize="xl" fontWeight="bold">
          Fin-Track
        </Text>
      </Box>
      <IconButton aria-label="Logout" icon={<FaSignOutAlt />} size="md" onClick={onSignOut} variant="outline" colorScheme="whiteAlpha" />
    </Flex>
  );
};

export default NavBar;
