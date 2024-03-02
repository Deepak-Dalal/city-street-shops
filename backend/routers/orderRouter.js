import express from 'express';
import Razorpay from 'razorpay';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import {
  isAdmin,
  isAuth,
  isSellerOrAdmin,
  sendEmailToCustomerAndSeller
} from '../utils.js';

const orderRouter = express.Router();
orderRouter.get(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const pageSize = 5;
    const page = Number(req.query.pageNumber) || 1;
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};
    const count = await Order.count({ ...sellerFilter });
    const orders = await Order.find({ ...sellerFilter })
    .populate('user','name')
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);
    res.send({orders, page, pages: Math.ceil(count / pageSize) });
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const numSellers = await User.count({isSeller:true});
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, numSellers, orders, dailyOrders, productCategories });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const pageSize = 5;
    const page = Number(req.query.pageNumber) || 1;
    const count = await Order.count({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);
    res.send({orders,page,pages: Math.ceil(count / pageSize)});
  })
);

orderRouter.get(
  '/get-razorpay-key',
  isAuth,
  expressAsyncHandler(async (req, res) => {
     res.send({ key: process.env.RAZORPAY_KEY_ID });
  }),
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0) {
      res.status(400).send({ message: 'Cart is empty' });
    } else {
      const order = new Order({
        seller: req.body.orderItems[0].seller,
        orderItems: req.body.orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
        ...(req.body.paymentMethod === 'razorpay' && {
          razorpay: {
              orderId: req.razorpayOrderId,
              paymentId: req.razorpayPaymentId,
              signature: req.razorpaySignature,
            },
          isPaid: true,
          paidAt: new Date(),
        }),
      });
      const createdOrder = await order.save();

      const orderinfo = await Order.findById(createdOrder._id)
      .populate(
        'user',
        'email name'
      ).populate(
        'seller',
        'email seller'
      );

      sendEmailToCustomerAndSeller(orderinfo);
      
      res
        .status(201)
        .send({ message: 'New Order Created', order: createdOrder });
    }
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('seller','seller.name seller.googlePayMobileNumber seller.googlePayName');
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// orderRouter.put(
//   '/:id/pay',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const order = await Order.findById(req.params.id).populate(
//       'user',
//       'email name'
//     );
//     if (order) {
//       order.isPaid = true;
//       order.paidAt = Date.now();
//       order.paymentResult = {
//         id: req.body.id,
//         status: req.body.status,
//         update_time: req.body.update_time,
//         email_address: req.body.email_address,
//       };
//       const updatedOrder = await order.save();
//       mailgun()
//         .messages()
//         .send(
//           {
//             from: 'Amazona <amazona@mg.yourdomain.com>',
//             to: `${order.user.name} <${order.user.email}>`,
//             subject: `New order ${order._id}`,
//             html: payOrderEmailTemplate(order),
//           },
//           (error, body) => {
//             if (error) {
//               console.log(error);
//             } else {
//               console.log(body);
//             }
//           }
//         );
//       res.send({ message: 'Order Paid', order: updatedOrder });
//     } else {
//       res.status(404).send({ message: 'Order Not Found' });
//     }
//   })
// );

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      const deleteOrder = await order.remove();
      res.send({ message: 'Order Deleted', order: deleteOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);
orderRouter.put(
  '/:id/confirmPay',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      let date=new Date();
      order.paidAt =date;
      const updatedOrder = await order.save();
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);
orderRouter.put(
  '/:id/deliver',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      let date=new Date();
      order.deliveredAt =date;
      const updatedOrder = await order.save();
      res.send({ message: 'Order Delivered', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.post(
  '/create-razorpay-order',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });
      const options = {
        amount: req.body.amount,
        currency: 'INR',
      };
      const order = await instance.orders.create(options);
      if (!order) return res.status(500).send('Some error occured');
      res.send(order);
    } catch (error) {
      res.status(500).send(error);
    }
  })
);

export default orderRouter;
