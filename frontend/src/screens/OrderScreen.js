import Axios from 'axios';
import { PayPalButton } from 'react-paypal-button-v2';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { confirmPay, deliverOrder, detailsOrder, payOrder } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import {
  ORDER_CONFIRM_PAY_RESET,
  ORDER_DELIVER_RESET,
  ORDER_PAY_RESET,
} from '../constants/orderConstants';

export default function OrderScreen(props) {
  const orderId = props.match.params.id;
  
  //const [sdkReady, setSdkReady] = useState(false);
  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;
  
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  
  /*
  const orderPay = useSelector((state) => state.orderPay);
  const {
    loading: loadingPay,
    error: errorPay,
    success: successPay,
  } = orderPay;
  */
  const orderConfirmPay = useSelector((state) => state.orderConfirmPay);
  const {
    loading: loadingConfirmPay,
    error: errorConfirmPay,
    success: successConfirmPay,
  } = orderConfirmPay;
  const orderDeliver = useSelector((state) => state.orderDeliver);
  const {
    loading: loadingDeliver,
    error: errorDeliver,
    success: successDeliver,
  } = orderDeliver;
  const dispatch = useDispatch();
  useEffect(() => {
    /*const addPayPalScript = async () => {
      const { data } = await Axios.get('/api/config/paypal');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${data}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };
    if (
      !order ||
      successPay ||
      successDeliver ||
      (order && order._id !== orderId)
    ) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(detailsOrder(orderId));
    } else {
      if (!order.isPaid) {
        if (!window.paypal) {
          addPayPalScript();
        } else {
          setSdkReady(true);
        }
      }
    }*/
    if (
      !order ||
      successConfirmPay ||
      successDeliver ||
      (order && order._id !== orderId)
    ){
      dispatch({ type: ORDER_CONFIRM_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(detailsOrder(orderId));
    }
  }, [dispatch, orderId, successConfirmPay, successDeliver, order]);
 /*
  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(order, paymentResult));
  };
  */
  const deliverHandler = () => {
    dispatch(deliverOrder(order._id));
  };
  const confirmPayHandler = () => {
    dispatch(confirmPay(order._id));
  };

  const parsedISTTime=(dateString)=>{
    let dateIST=new Date(dateString);
    return dateIST.toLocaleString("en-in",{timeZone:'Asia/Kolkata'});
  }
  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <h1>Order {order._id}</h1>
      <div className="row top">
        <div className="col-2">
          <ul>
            <li>
              <div className="card card-body">
                <h2>Delivery</h2>
                <p>
                  <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                  <strong>Phone Number:</strong> {order.shippingAddress.phoneNumber} <br />
                  <strong>Address: </strong> {order.shippingAddress.address},
                  {order.shippingAddress.city},{' '}
                  {order.shippingAddress.postalCode},
                  {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
                  <MessageBox variant="success">
                    Delivered on {parsedISTTime(order.deliveredAt)}
                  </MessageBox>
                ) : (
                  <MessageBox variant="danger">Not Delivered</MessageBox>
                )}
              </div>
            </li>
            <li>
              <div className="card card-body">
                <h2>Payment</h2>
                <p>
                  <strong>Method:</strong> {order.paymentMethod}
                </p>
                {order.isPaid ? (
                  <MessageBox variant="success">
                    Paid on {parsedISTTime(order.paidAt)}
                  </MessageBox>
                ) : (
                  <MessageBox variant="danger">Not Paid</MessageBox>
                )}
              </div>
            </li>
            <li>
              <div className="card card-body">
                <b>Seller : </b>
                <Link to={`/seller/${order.seller._id}`}>
                  {order.seller.seller.name}
                </Link>  
                <h2>Order Items</h2>
                <ul>
                  {order.orderItems.map((item) => (
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
                  <div>₹{order.itemsPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>Delivery</div>
                  <div>₹{order.shippingPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>Tax</div>
                  <div>₹{order.taxPrice.toFixed(2)}</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>
                    <strong> Order Total</strong>
                  </div>
                  <div>
                    <strong>₹{order.totalPrice.toFixed(2)}</strong>
                  </div>
                </div>
              </li>        
              {
                (userInfo.isAdmin || userInfo.isSeller) && !order.isPaid && (
                  <li>
                  {loadingConfirmPay && <LoadingBox></LoadingBox>}
                  {errorConfirmPay && (
                    <MessageBox variant="danger">{errorConfirmPay}</MessageBox>
                  )}
                  <button
                    type="button"
                    className="primary block"
                    onClick={confirmPayHandler}
                  >
                    Confirm Order Paid
                  </button>
                </li>
                )
              }
              {/*
              {!order.isPaid && (
                <li>
                  {!sdkReady ? (
                    <LoadingBox></LoadingBox>
                  ) : (
                    <>
                      {errorPay && (
                        <MessageBox variant="danger">{errorPay}</MessageBox>
                      )}
                      {loadingPay && <LoadingBox></LoadingBox>}

                      <PayPalButton
                        amount={order.totalPrice}
                        onSuccess={successPaymentHandler}
                      ></PayPalButton>
                    </>
                  )}
                </li>
                )}*/}
              {(userInfo.isAdmin || userInfo.isSeller) && order.isPaid && !order.isDelivered && (
                <li>
                  {loadingDeliver && <LoadingBox></LoadingBox>}
                  {errorDeliver && (
                    <MessageBox variant="danger">{errorDeliver}</MessageBox>
                  )}
                  <button
                    type="button"
                    className="primary block"
                    onClick={deliverHandler}
                  >
                    Confirm Order Delivered
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
