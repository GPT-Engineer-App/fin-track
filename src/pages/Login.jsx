import { useState } from "react";
import { supabase } from "../supabase";
import { Button, Input, VStack, Container, Heading, Text } from "@chakra-ui/react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <Container centerContent>
      <VStack spacing={4} align="stretch" w="100%">
        <Heading as="h1" size="xl" textAlign="center">
          Welcome to Fin-Track
        </Heading>
        <Text fontSize="md" textAlign="center">
          Manage your finances effortlessly. Sign in to track your income and expenses, categorize transactions, and make informed financial decisions.
        </Text>
        <form onSubmit={handleLogin}>
          <VStack spacing={4}>
            <Input type="email" placeholder="Your email" value={email} required={true} onChange={(e) => setEmail(e.target.value)} />
            <Button isLoading={loading} loadingText="Sending..." type="submit" colorScheme="blue">
              {loading ? "Loading" : "Send magic link"}
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
}
