import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { deleteOrder, listOrders } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { ORDER_DELETE_RESET } from '../constants/orderConstants';

export default function OrderListScreen(props) {
  const {
    pageNumber = 1,
  } = useParams();
  const sellerMode = props.match.path.indexOf('/seller') >= 0;
  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders, page, pages } = orderList;
  const orderDelete = useSelector((state) => state.orderDelete);
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = orderDelete;

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: ORDER_DELETE_RESET });
    dispatch(listOrders({ seller: sellerMode ? userInfo._id : '' , pageNumber}));
  }, [dispatch, sellerMode, successDelete, userInfo._id, pageNumber]);
  const deleteHandler = (order) => {
    if (window.confirm('Are you sure to delete?')) {
      dispatch(deleteOrder(order._id));
    }
  };
  const orderPageLinkHandler=(x)=>{
    if(sellerMode)
      return `/orderlist/seller/pageNumber/${x+1}`;
    else
      return `/orderlist/pageNumber/${x+1}`  
  }
  const parsedISTTime=(dateString)=>{
    let dateIST=new Date(dateString);
    return dateIST.toLocaleString("en-in",{timeZone:'Asia/Kolkata'});
  }
  return (
    <div>
      <h1>Orders</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {errorDelete && <MessageBox variant="danger">{errorDelete}</MessageBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
        <table className="table orders-list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}
                <h4></h4>
                {order.orderItems.map((item) => (
                    <div className="row">
                      <div className="min-30">
                        <Link to={`/product/${item.product}`}>
                          {item.name}
                        </Link>
                      </div>
                      <div>
                        {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                      </div>
                    </div>
                  ))}</td>
                <td>{order.user.name}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? parsedISTTime(order.paidAt) : 'No'}</td>
                <td>
                  {order.isDelivered
                    ? parsedISTTime(order.deliveredAt)
                    : 'No'}
                </td>
                <td>
                  <button
                    type="button"
                    className="small"
                    onClick={() => {
                      props.history.push(`/order/${order._id}`);
                    }}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className="small"
                    onClick={() => deleteHandler(order)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row center pagination">
          {[...Array(pages).keys()].map((x) => (
            <Link
              className={x + 1 === page ? 'active' : ''}
              key={x + 1}
              to={orderPageLinkHandler(x)}
            >
              {x + 1}
            </Link>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
