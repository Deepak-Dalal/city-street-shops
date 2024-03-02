import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { detailsUser } from '../actions/userActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Rating from '../components/Rating';

export default function SellerProfileScreen(props) {
    const sellerId = props.match.params.id;
    const userDetails = useSelector((state) => state.userDetails);
    const { loading, error, user } = userDetails;
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(detailsUser(sellerId));
    },[dispatch,sellerId]);
    return (
        <div>
            <h1>Seller Profile</h1>
            <div className="details-container">
                {loading ? (
                <LoadingBox></LoadingBox>
                ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
                ) : (
                <>
                <img
                    className="medium"
                    src={user.seller.logo}
                    alt={user.seller.name+"'s logo"}
                  ></img>
                <ul>
                    <li className="pairs-list-item">
                        <div className="key-value-pair"><strong>Seller's Name</strong></div>
                        <div className="key-value-pair">{user.seller.name}</div>
                    </li>
                    <li className="pairs-list-item">
                        <div className="key-value-pair"><strong>Email</strong></div>
                        <div className="key-value-pair">{user.email}</div>
                    </li>
                    <li className="pairs-list-item">
                        <div className="key-value-pair"><strong>Phone Number</strong></div>
                        <div className="key-value-pair">{user.phoneNumber}</div>
                    </li>
                    <li className="pairs-list-item">
                        <div className="key-value-pair"><strong>Description</strong></div>
                        <div className="key-value-pair">{user.seller.description}</div>
                    </li>
                    <li className="pairs-list-item">
                        <div className="key-value-pair"><strong>City</strong></div>
                        <div className="key-value-pair">{user.city}</div>
                    </li>
                    <li className="pairs-list-item">
                        <div className="key-value-pair"><strong>Address</strong></div>
                        <div className="key-value-pair">{user.address}</div>
                    </li>
                    <li className="pairs-list-item">
                        <div className="key-value-pair"><strong>Number of Reviews</strong></div>
                        <div className="key-value-pair">{user.seller.numReviews}</div>
                    </li>
                    <li className="pairs-list-item">
                        <div className="key-value-pair"><strong>Average customer Rating</strong></div>
                        <div className="key-value-pair">
                            <Rating
                                rating={user.seller.rating}
                                numReviews={''}
                            ></Rating>
                        </div>
                    </li>
                </ul>
                <h1></h1>
                </>)
                }
            </div>
        </div>
    )
}
