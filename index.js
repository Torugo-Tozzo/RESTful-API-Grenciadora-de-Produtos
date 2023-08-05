const crypto = require('crypto');
const express = require('express');
const app = express();
const { db } = require('./config/creds.json');

app.use(express.json());

// Rota para listar todos os produtos
app.get("/products", (req, res) => {
  db.collection('products').get()
    .then((querySnapshot) => {
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      res.json(products);
    })
    .catch((error) => {
      console.error("Erro ao obter os produtos:", error);
      res.status(500).json({ message: "Erro ao obter os produtos!" });
    });
});

// Rota para obter um produto específico
app.get("/products/:id", (req, res) => {
  const productId = req.params.id;
  db.collection('products').doc(productId).get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ message: "Produto não encontrado!" });
      }
      const product = { id: doc.id, ...doc.data() };
      return res.json(product);
    })
    .catch((error) => {
      console.error("Erro ao obter o produto:", error);
      return res.status(500).json({ message: "Erro ao obter o produto!" });
    });
});

// Rota para criar um novo produto
app.post("/products", (req, res) => {
    const { name, price, ...additionalFields } = req.body;
  
    // Validar se o valor name é uma string e price é um número
    if (typeof name !== 'string' || isNaN(price) || typeof price !== 'number') {
      return res.status(400).json({ message: "Dados inválidos! O campo 'name' deve ser uma string e o campo 'price' deve ser um número." });
    }
  
    // Gerar um ID aleatório com 20 caracteres alfanuméricos
    const id = crypto.randomBytes(10).toString('hex').toUpperCase();
  
    const productData = { name, price, ...additionalFields };
  
    db.collection("products")
      .doc(id)
      .set(productData)
      .then(() => {
        console.log("Produto criado com ID:", id);
        res.json({ message: "Produto criado com sucesso!", id: id });
      })
      .catch((error) => {
        console.error("Erro ao criar o produto:", error);
        res.status(500).json({ message: "Erro ao criar o produto!" });
      });
  });  

// Rota para atualizar um produto existente
app.put("/products/:id", (req, res) => {
  const productId = req.params.id;
  const { name, price, category } = req.body;

  // Validar se o valor name é uma string e price é um número
  if (typeof name !== 'string' || isNaN(price) || typeof price !== 'number') {
    return res.status(400).json({ message: "Dados inválidos! O campo 'name' deve ser uma string e o campo 'price' deve ser um número." });
  }

  const productData = { name, price, category };

  db.collection('products').doc(productId).update(productData)
    .then(() => {
      res.json({ message: "Produto atualizado com sucesso!" });
    })
    .catch((error) => {
      console.error("Erro ao atualizar o produto:", error);
      res.status(500).json({ message: "Erro ao atualizar o produto!" });
    });
});

// Rota para deletar um produto
app.delete("/products/:id", (req, res) => {
  const productId = req.params.id;
  db.collection('products').doc(productId).delete()
    .then(() => {
      res.json({ message: "Produto deletado com sucesso!" });
    })
    .catch((error) => {
      console.error("Erro ao deletar o produto:", error);
      res.status(500).json({ message: "Erro ao deletar o produto!" });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
