import React, { useEffect, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import Seller from '../components/Seller';
import Product from '../components/Product';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';
import { listSellers, listTopSellers } from '../actions/userActions';
import { Link, useParams } from 'react-router-dom';

export default function HomeScreen(props) {
  const {
    pageNumber = 1,
    city=localStorage.getItem('city')||'Rohtak'
  } = useParams();
  const dispatch = useDispatch();
  // const productList = useSelector((state) => state.productList);
  // const { loading, error, products } = productList;

  const userSellersList = useSelector((state) => state.userSellersList);
  const {
    loading: loadingSellers,
    error: errorSellers,
    users: sellers,
    page,
    pages
  } = userSellersList;

  const userTopSellersList = useSelector((state) => state.userTopSellersList);
  const {
    loading: loadingTopSellers,
    error: errorTopSellers,
    users: topSellers,
  } = userTopSellersList;

  useEffect(() => {
    localStorage.setItem('city', city);
    dispatch(listSellers({pageNumber,city}));
    //dispatch(listTopSellers({city}));
  }, [dispatch, pageNumber,  city]);
  return (
    <div>
      <div className="city-selector">
        <div className="city-selector-wrapper">
            <label htmlFor="cities"><strong>Choose your city: </strong></label>
            <select id="cities" class="city" onChange={(e)=>props.history.push(`/city/${e.target.value}/pageNumber/1`)}>
                <option value="" disabled selected hidden>{city}</option>
                <option value="Rohtak" >Rohtak</option> 
                <option value="Gurugram">Gurugram</option>      
            </select>
        </div>
      </div>
      {/* <h2>Top Sellers</h2>
      {loadingTopSellers ? (
        <LoadingBox></LoadingBox>
      ) : errorTopSellers ? (
        <MessageBox variant="danger">{errorTopSellers}</MessageBox>
      ) : (
        <>
          {topSellers.length === 0 && <MessageBox>No Seller Found</MessageBox>}
          <Carousel showArrows autoPlay showThumbs={false}>
            {topSellers.map((seller) => (
              <div key={seller._id}>
                <Link to={`/seller/${seller._id}`}>
                  <img src={seller.seller.logo} alt={seller.seller.name} />
                  <p className="legend">{seller.seller.name}</p>
                </Link>
              </div>
            ))}
          </Carousel>
        </>
      )} */}
      <h2>Sellers List</h2> 
      {loadingSellers ? (
        <LoadingBox></LoadingBox>
      ) : errorSellers ? (
        <MessageBox variant="danger">{errorSellers}</MessageBox>
      ) : (
        <>
          {sellers.length === 0 && <MessageBox>No Seller Found</MessageBox>}
          <div className="row center">
            {sellers.map((seller) => (
              <Seller key={seller._id} seller={seller}></Seller>
            ))}
          </div>
          <div className="row center pagination">
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === page ? 'active' : ''}
                key={x + 1}
                to={`/city/${city}/pageNumber/${x+1}`}
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
