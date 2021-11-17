import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Admin',
      email: 'admin@example.com',
      password: bcrypt.hashSync('1234', 8),
      isAdmin: true,
      isSeller: true,
      seller: {
        name: 'Admin',
        logo: '/images/admin-sign-laptop-icon-stock-vector-166205404.jpg',
        description: 'best seller',
        rating: 4.5,
        numReviews: 120,
      },
    },
  ],
  products: [
    {
      name: 'Adidas shoes',
      category: 'Shoes',
      image: '/images/Bravada_Shoes_Black_FV8085_01_standard.jpg',
      price: 120,
      countInStock: 10,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality product',
    },
  ],
};
export default data;
