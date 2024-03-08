import React, { useState, useEffect, useCallback } from "react";
import NavBar from "../components/NavBar";
import { supabase } from "../supabase";
import { Box, Button, Flex, Heading, Input, Select, Stack, Text, useToast, VStack, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash, FaFileDownload } from "react-icons/fa";

// Transaction item component
const TransactionItem = ({ transaction, onEdit, onDelete }) => (
  <Flex justifyContent="space-between" alignItems="center" p={2} borderWidth="1px" borderRadius="lg" w="100%">
    <Box>
      <Text fontSize="sm">{new Date(transaction.date).toLocaleDateString()}</Text>
      <Text fontWeight="bold">
        {transaction.type === "income" ? "+" : "-"}${transaction.amount}
      </Text>
      <Text fontSize="sm">{transaction.category}</Text>
    </Box>
    <Box>
      <IconButton aria-label="Edit transaction" icon={<FaEdit />} size="sm" mr={2} onClick={() => onEdit(transaction)} />
      <IconButton aria-label="Delete transaction" icon={<FaTrash />} size="sm" onClick={() => onDelete(transaction.id)} />
    </Box>
  </Flex>
);

// Main component
const Index = () => {
  // State
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    const fetchTransactions = async () => {
      let { data: transactions, error } = await supabase.from("transactions").select("*");
      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(transactions);
      }
    };

    fetchTransactions();
  }, []);
  const [form, setForm] = useState({});
  const [filter, setFilter] = useState({});
  const [editMode, setEditMode] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Toast
  const toast = useToast();

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (editMode) {
      const { data, error } = await supabase.from("transactions").update(form).match({ id: form.id }).select();
      if (error) {
        console.error("Error updating transaction:", error);
      } else {
        setTransactions((prev) => prev.map((t) => (t.id === form.id ? data[0] : t)));
      }
    } else {
      const { data, error } = await supabase.from("transactions").insert([form]).select();
      if (error) {
        console.error("Error adding transaction:", error);
      } else {
        setTransactions((prev) => [data[0], ...prev]);
      }
    }

    toast({
      title: `Transaction ${editMode ? "updated" : "added"}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    setForm({});
    setEditMode(false);
    onClose();
  };

  const handleEdit = (transaction) => {
    setForm(transaction);
    setEditMode(true);
    onOpen();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("transactions").delete().match({ id });
    if (error) {
      console.error("Error deleting transaction:", error);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
    toast({
      title: "Transaction deleted.",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  };

  const calculateBalance = () =>
    transactions.reduce((acc, t) => {
      return t.type === "income" ? acc + t.amount : acc - t.amount;
    }, 0);

  const handleExport = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(transactions))}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "transactions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((transaction) => {
    return (!filter.type || transaction.type === filter.type) && (!filter.category || transaction.category === filter.category) && (!filter.dateFrom || new Date(transaction.date) >= new Date(filter.dateFrom)) && (!filter.dateTo || new Date(transaction.date) <= new Date(filter.dateTo));
  });

  const signOut = () => supabase.auth.signOut();

  console.log(transactions);
  // JSX
  return (
    <VStack spacing={4}>
      <NavBar onSignOut={signOut} />

      <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={onOpen}>
        Add Transaction
      </Button>
      <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={signOut}>
        Logout
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editMode ? "Edit Transaction" : "Add Transaction"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={3}>
              <Input placeholder="Amount" name="amount" type="number" value={form.amount || ""} onChange={handleInputChange} />
              <Select name="type" value={form.type || ""} onChange={handleInputChange}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
              <Select name="category" placeholder="Select category" value={form.category || ""} onChange={handleInputChange}>
                <option value="Salary">Salary</option>
                <option value="Groceries">Groceries</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </Select>
              <Input placeholder="Date" name="date" type="date" value={form.date || ""} onChange={handleInputChange} />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box w="100%">
        <Heading size="md">Filters</Heading>
        <Flex>
          <Select name="type" placeholder="Type" onChange={handleFilterChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Input placeholder="Category" name="category" onChange={handleFilterChange} />
          <Input placeholder="From" type="date" name="dateFrom" onChange={handleFilterChange} />
          <Input placeholder="To" type="date" name="dateTo" onChange={handleFilterChange} />
        </Flex>
      </Box>

      <Box w="100%">
        <Heading size="md">Transactions</Heading>
        <VStack spacing={2}>
          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </VStack>
      </Box>

      <Flex justifyContent="space-between" alignItems="center" w="100%">
        <Heading size="md">Total Balance: ${calculateBalance()}</Heading>
        <Button leftIcon={<FaFileDownload />} colorScheme="green" onClick={handleExport}>
          Export Transactions
        </Button>
      </Flex>
    </VStack>
  );
};

export default Index;
