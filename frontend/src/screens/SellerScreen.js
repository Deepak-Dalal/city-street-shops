import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { listProducts } from '../actions/productActions';
import { detailsUser } from '../actions/userActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Product from '../components/Product';
import Rating from '../components/Rating';
import SellerProductsSearchBox from '../components/SellerProductsSearchBox';
import { prices, ratings } from '../utils';

export default function SellerScreen(props) {
  const {
    pageNumber = 1,
  } = useParams();
  const sellerId = props.match.params.id;
  const name=props.match.params.name || "Any";
  const searchPlaceHolder=props.match.params.name || "search seller products...";

  const [category, setCategory] = useState('Any');
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [rating, setRating] = useState(0);
  const [order, setOrder] = useState('newest');

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const productList = useSelector((state) => state.productList);
  const {
    loading: loadingProducts,
    error: errorProducts,
    products,
    page,
    pages
  } = productList;

  const productCategoryList = useSelector((state) => state.productCategoryList);
  const {
    loading: loadingCategories,
    error: errorCategories,
    categories,
  } = productCategoryList;

  const priceRangeChangeHandler=(e)=>{
    if(e.target.value==='Any')
    {
      setMin(0);
      setMax(0);
    }
    else if(e.target.value==='₹1 to ₹100'){
      setMin(1);
      setMax(100);
    }
    else if(e.target.value==='₹101 to ₹1000'){
      setMin(101);
      setMax(1000);
    }
    else if(e.target.value==='more than ₹1000'){
      setMin(1001);
      setMax(1000000);
    }
  }
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(detailsUser(sellerId));
    dispatch(listProducts({ 
      seller: sellerId, pageNumber,
      name: name !== 'Any' ? name : '',
      category: category !== 'Any' ? category : '',
      min,
      max,
      rating,
      order,}));
  }, [dispatch,sellerId,pageNumber,category, max, min, name, order, rating]);
  return (
    <div className="row top">
      <div className="col-1">
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <ul className="card card-body">
            <li>
              <div className="row start">
                <div className="p-1">
                  <img
                    className="small"
                    src={user.seller.logo}
                    alt={user.seller.name}
                  ></img>
                </div>
                <div className="p-1">
                  <h1>{user.seller.name}</h1>
                </div>
              </div>
            </li>
            <li>
              <Rating
                rating={user.seller.rating}
                numReviews={user.seller.numReviews}
              ></Rating>
            </li>
            <li>
              <Link to={`/sellerProfile/${sellerId}`}>Go To Seller Profile</Link>
            </li>
            <li>{user.seller.description}</li>
          </ul>
        )}
      </div>    
      <div className="col-3">
        <div className="row center">
          <SellerProductsSearchBox placeHolder={searchPlaceHolder} sellerId={sellerId}></SellerProductsSearchBox>
        </div>
        <button id="filter-button"
            onClick={(e)=>{
              if(e.target.nextElementSibling.style.display !== "block"){
                e.target.nextElementSibling.style.display="block";
              }
              else {
                e.target.nextElementSibling.style.display="none";
              }
              console.log(e.target.nextElementSibling.style.display);
            }}
          ><i class="fa fa-filter"></i> Filter</button>
        <div className="filter-options-container">
          <div className="container-select-boxes-side-to-side">
            {loadingCategories ? (
              <LoadingBox></LoadingBox>
            ) : errorCategories ? (
              <MessageBox variant="danger">{errorCategories}</MessageBox>
            ) : (
            <div>
              <label htmlFor="category">Category</label>
              <select id="category" onChange={(e)=>setCategory(e.target.value)}>
                <option value="Any">Any</option>
                {
                  categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))
                }
              </select>
            </div>
            )}
            <div>
              <label htmlFor="priceRange">Price Range</label>
              <select id="priceRange" onChange={priceRangeChangeHandler}>
                {
                  prices.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <label htmlFor="averageCustomerRating">Average Customer Rating</label>
              <select id="averageCustomerRating" onChange={(e)=>setRating(e.target.value)}>
                {
                  ratings.map((r) => (<>
                    <option key={r.name} value={r.rating}>
                      {r.name}
                    </option>
                    </>
                  ))
                }
              </select>
            </div>
            <div>
              <label htmlFor="sortBy">Sort By</label>
              <select
                id="sortBy"
                value={order}
                onChange={(e)=>setOrder(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="lowest">Price: Low to High</option>
                <option value="highest">Price: High to Low</option>
                <option value="toprated">High Customer Rating</option>
              </select>
            </div>
          </div>
        </div>  
        {loadingProducts ? (
          <LoadingBox></LoadingBox>
        ) : errorProducts ? (
          <MessageBox variant="danger">{errorProducts}</MessageBox>
        ) : (
          <>
            <h2>{products.length} Results</h2>
            {products.length === 0 && <MessageBox>No Product Found</MessageBox>}
            <div className="row center">
              {products.map((product) => (
                <Product key={product._id} product={product}></Product>
              ))}
            </div>
            <div className="row center pagination">
              {[...Array(pages).keys()].map((x) => (
                <Link
                  className={x + 1 === page ? 'active' : ''}
                  key={x + 1}
                  to={`/seller/${sellerId}/name/${name}/pageNumber/${x+1}`}
                >
                  {x + 1}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
