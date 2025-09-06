




const getProducts = async (req, res) => {
  res.json([]);
};

const createProducts = async (req, res) => {
  const { name, price } = req.body;
  res.json({ name, price });
}; 

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  res.json({ id, name, price });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  res.json({ message: "Product deleted successfully" });
};

const getInventoryReport = async (req, res) => {
  res.json([]);
};

const getTransactionsReport = async (req, res) => {
  res.json([]);
};  