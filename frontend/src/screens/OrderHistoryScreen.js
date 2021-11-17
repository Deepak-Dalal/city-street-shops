import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { listOrderMine } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

export default function OrderHistoryScreen(props) {
  const {
    pageNumber = 1,
  } = useParams();
  const orderMineList = useSelector((state) => state.orderMineList);
  const { loading, error, orders, page, pages } = orderMineList;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listOrderMine({pageNumber}));
  }, [dispatch, pageNumber]);

  const parsedISTTime=(dateString)=>{
    let dateIST=new Date(dateString);
    return dateIST.toLocaleString("en-in",{timeZone:'Asia/Kolkata'});
  }
  return (
    <div>
      <h1>Order History</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ORDER DATE</th>
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
                <td>{parsedISTTime(order.createdAt)}</td>
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
              to={`/orderhistory/pageNumber/${x+1}`}
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
