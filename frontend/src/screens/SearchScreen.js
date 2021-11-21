import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { listProducts } from '../actions/productActions';
import GlobalProductsSearchBox from '../components/GlobalProductsSearchBox';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Product from '../components/Product';
import { prices, ratings } from '../utils';

export default function SearchScreen(props) {
  const {
    name = 'search items on website...',
    category = 'Any',
    min = 0,
    max = 0,
    rating = 0,
    order = 'newest',
    pageNumber = 1,
  } = useParams();

  const dispatch = useDispatch();
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

  const getFilterUrl = (filter) => {
    const filterPage = filter.pageNumber || pageNumber;
    const filterCategory = filter.category || category;
    const filterName = filter.name || name;
    const filterRating = filter.rating || rating;
    const sortOrder = filter.order || order;
    const filterMin = filter.min ? filter.min : filter.min === 0 ? 0 : min;
    const filterMax = filter.max ? filter.max : filter.max === 0 ? 0 : max;
    return `/search/name/${filterName}/category/${filterCategory}/min/${filterMin}/max/${filterMax}/rating/${filterRating}/order/${sortOrder}/pageNumber/${filterPage}`;
  };
  function findMin(option){
    if(option=="Any")
      return 0;
    else if(option=='₹1 to ₹100')  
      return 1;
    else if(option=='₹101 to ₹1000')  
      return 101;
    else 
      return 1001;  
  }
  function findMax(option){
    if(option=="Any")
      return 0;
    else if(option=='₹1 to ₹100')  
      return 100;
    else if(option=='₹101 to ₹1000')  
      return 1000;
    else 
      return 1000000;  
  }
  useEffect(() => {
    dispatch(
      listProducts({
        pageNumber,
        name: name !== 'search items on website...' ? name : '',
        category: category !== 'Any' ? category : '',
        min,
        max,
        rating,
        order,
      })
    );
  }, [category, dispatch, max, min, name, order, rating, pageNumber]);
  return (
    <div>
      <h1>Filters</h1>
      <div className="filter-options-container">
        <div className="container-select-boxes-side-to-side">
          {loadingCategories ? (
            <LoadingBox></LoadingBox>
          ) : errorCategories ? (
            <MessageBox variant="danger">{errorCategories}</MessageBox>
          ) : (
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" onChange={(e)=>props.history.push(getFilterUrl({ category: e.target.value ,pageNumber:1}))}>
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
            <select id="priceRange" onChange={(e)=>props.history.push(getFilterUrl({
               min: findMin(e.target.value), max: findMax(e.target.value), pageNumber:1
               }))}>
              {
                prices.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))
              }
            </select>
          </div>
          <div>
            <label htmlFor="averageCustomerRating">Average Customer Rating</label>
            <select id="averageCustomerRating" onChange={(e)=>props.history.push(getFilterUrl({ rating: e.target.value, pageNumber:1}))}>
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
              onChange={(e)=>props.history.push(getFilterUrl({ order: e.target.value, pageNumber:1}))}
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
                to={`/search/name/${name}/category/${category}/min/${min}/max/${max}/rating/${rating}/order/${order}/pageNumber/${x+1}`}
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
