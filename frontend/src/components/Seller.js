import React from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';

export default function Seller(props) {
  const { seller } = props;
  return (
    <div key={seller._id} className="card small-box list-card">
      <Link to={`/seller/${seller._id}`}>
        <img className="medium" src={seller.seller.logo} alt={seller.seller.name} />
      </Link>
      <div className="card-body seller-rating">
        <Link to={`/seller/${seller._id}`}>
          <h2>{seller.seller.name}</h2>
        </Link>
        <Rating
          rating={seller.seller.rating}
          numReviews={seller.seller.numReviews}
        ></Rating>
      </div>
    </div>
  );
}
