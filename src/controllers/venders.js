


const getContacts = async (req, res) => {
  res.json([]);
};

const createContact = async (req, res) => {
  const { name, email, phone } = req.body;
  res.json({ name, email, phone });
};      

const updateContact = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  res.json({ id, name, email, phone });
};

const deleteContact = async (req, res) => {
  const { id } = req.params;
  res.json({ message: "Contact deleted successfully" });
};

const getTransactions = async (req, res) => {
  res.json([]);
};

const createTransaction = async (req, res) => {
  const { amount, date, description } = req.body;
  res.json({ amount, date, description });
};  