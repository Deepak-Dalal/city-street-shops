import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { createOrder } from '../actions/orderActions';
import CheckoutSteps from '../components/CheckoutSteps';
import { ORDER_CREATE_RESET } from '../constants/orderConstants';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { detailsProduct } from '../actions/productActions';
import axios from 'axios';

export default function PlaceOrderScreen(props) {
  const cart = useSelector((state) => state.cart);
  if (!cart.paymentMethod) {
    props.history.push('/payment');
  }

  const productDetails = useSelector((state) => state.productDetails);
  const {loading:loadingSeller,error:errorSeller,product} = productDetails;

  const orderCreate = useSelector((state) => state.orderCreate);
  const { loading, success, error, order } = orderCreate;
  const { userInfo } = useSelector((state) => state.userSignin);
  const { name, email } = userInfo;

  const [loadingRazorPay, setLoadingRazorPay] = useState(false);

  const toPrice = (num) => Number(num.toFixed(2)); // 5.123 => "5.12" => 5.12
  cart.itemsPrice = toPrice(
    cart.cartItems.reduce((a, c) => a + c.qty * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 200 ? toPrice(0) : toPrice(20);
  // cart.taxPrice = toPrice(0.15 * cart.itemsPrice);
  cart.taxPrice = 0;
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;
  const dispatch = useDispatch();
  const placeOrderHandler = (razorpayOrderAndPaymentData) => {
    dispatch(createOrder({ 
      ...cart,
      orderItems: cart.cartItems,
      ...(cart.paymentMethod === 'razorpay' && { ...razorpayOrderAndPaymentData }) }));
  };

  function loadRazorpay() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onerror = () => {
      alert('Razorpay SDK failed to load. Are you online?');
    };
    script.onload = async () => {
      try {
        setLoadingRazorPay(true);
        const result = await axios.post('/api/orders/create-razorpay-order', {
          amount: cart.totalPrice + '00',
        },{
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
        });
        const { amount, id: order_id, currency } = result.data;
        const {
          data: { key: razorpayKey },
        } = await axios.get('/api/orders/get-razorpay-key', {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },});

        const options = {
          key: razorpayKey,
          amount: amount.toString(),
          currency: currency,
          name,
          description: 'online purchase transaction',
          order_id: order_id,
          handler: async function (response) {
            placeOrderHandler({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name,
            email,
          },
          notes: {
            address: '',
          },
          theme: {
            color: '#80c0f0',
          },
        };

        setLoadingRazorPay(false);
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        alert(err);
        setLoadingRazorPay(false);
      }
    };
    document.body.appendChild(script);
  }

  useEffect(() => {
    if (success) {
      props.history.push(`/order/${order._id}`);
      dispatch({ type: ORDER_CREATE_RESET });
    }
    dispatch(detailsProduct(localStorage.getItem("cart_seller_product_id")));
  }, [dispatch, order, props.history, success]);
  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <div className="row top">
        <div className="col-2">
          <ul>
            <li>
              <div className="card card-body">
                <h2>Delivery</h2>
                <p>
                  <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                  <strong>Phone Number:</strong> {cart.shippingAddress.phoneNumber} <br />
                  <strong>Address: </strong> {cart.shippingAddress.address},
                  {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}
                  ,{cart.shippingAddress.country}
                </p>
              </div>
            </li>
            <li>
              <div className="card card-body">
                <h2>Payment</h2>
                <p>
                  <strong>Method:</strong> {cart.paymentMethod}
                </p>
              </div>
            </li>
            <li>
              <div className="card card-body">
                {loadingSeller ? (
                  <LoadingBox></LoadingBox>
                ) : errorSeller ? (
                  <MessageBox variant="danger">{error}</MessageBox>
                ) : (
                <li>
                  <b>Seller : </b>{' '}
                  <Link to={`/seller/${product.seller._id}`}>
                    {product.seller.seller.name}
                  </Link>
                </li>)}
                <h2>Order Items</h2>
                <ul>
                  {cart.cartItems.map((item) => (
                    <li key={item.product}>
                      <div className="row">
                        <div>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="small"
                          ></img>
                        </div>
                        <div className="min-30">
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </div>

                        <div>
                          {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
        </div>
        <div className="col-1">
          <div className="card card-body">
            <ul>
              <li>
                <h2>Order Summary</h2>
              </li>
              <li>
                <div className="row">
                  <div>Items</div>
                  <div>₹{cart.itemsPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>Delivery</div>
                  <div>₹{cart.shippingPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>Tax</div>
                  <div>₹{cart.taxPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>
                    <strong> Order Total</strong>
                  </div>
                  <div>
                    <strong>₹{cart.totalPrice.toFixed(2)}</strong>
                  </div>
                </div>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => cart.paymentMethod === 'razorpay' ? loadRazorpay() : placeOrderHandler()}
                  className="primary block"
                  disabled={cart.cartItems.length === 0}
                >
                  Place Order
                </button>
              </li>
              <br/>
              {loadingRazorPay && <LoadingBox></LoadingBox>}
              {loading && <LoadingBox></LoadingBox>}
              {error && <MessageBox variant="danger">{error}</MessageBox>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
