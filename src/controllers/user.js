

const register = async (req, res) => {
  const { name, email, password } = req.body;
  res.json({ message: "User registered successfully", name, email });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  res.json({ message: "Login successful", email });
};

const logout = async (req, res) => {
  res.json({ message: "Logout successful" });
};