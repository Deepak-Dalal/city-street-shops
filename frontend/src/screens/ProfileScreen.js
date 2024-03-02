import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { detailsUser, updateUserProfile } from '../actions/userActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';
import Axios from 'axios';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [sellerName, setSellerName] = useState('');
  
  const [sellerLogo, setSellerLogo] = useState('');
  const [sellerDescription, setSellerDescription] = useState(''); 
  const [minOrderPrice, setMinOrderPrice] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState('');
  const [sellerPaymentAccountName,setSellerPaymentAccountName]=useState('');
  const [sellerPaymentMobileNumber,setSellerPaymentMobileNumber]=useState('');
  const [productCategory, setProductCategory] = useState('Packed Food Products');
  const [sellerProductCategories, setSellerProductCategories] = useState([]);

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;
  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const {
    success: successUpdate,
    error: errorUpdate,
    loading: loadingUpdate,
  } = userUpdateProfile;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: USER_UPDATE_PROFILE_RESET });
    if (!user) {
      dispatch(detailsUser(userInfo._id));
    } else {
      setName(user.name);
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber);
      setCity(user.city);
      setAddress(user.address);
      if (user.seller) {
        setSellerName(user.seller.name);
        setSellerLogo(user.seller.logo);
        setSellerDescription(user.seller.description);
        setSellerProductCategories(user.seller.sellerProductCategories);
        setMinOrderPrice(user.seller.minOrderPrice);
        setDeliveryPrice(user.seller.deliveryPrice);
        setSellerPaymentAccountName(user.seller.googlePayName);
        setSellerPaymentMobileNumber(user.seller.googlePayMobileNumber);
      }
    }
  }, [dispatch, userInfo._id, user]);
  const submitHandler = (e) => {
    e.preventDefault();
    // dispatch update profile
    if (password !== confirmPassword) {
      alert('Password and Confirm Password Are Not Matched');
    } else {
      dispatch(
        updateUserProfile({
          userId: user._id,
          name,
          email,
          password,
          phoneNumber,
          city,
          address,
          sellerName,
          sellerLogo,
          sellerDescription,
          sellerProductCategories,
          minOrderPrice,
          deliveryPrice,
          sellerPaymentAccountName,
          sellerPaymentMobileNumber
        })
      );
    }
  };
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [errorUpload, setErrorUpload] = useState('');

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('image', file);
    setLoadingUpload(true);
    try {
      const { data } = await Axios.post('/api/uploads', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setSellerLogo(data);
      setLoadingUpload(false);
    } catch (error) {
      setErrorUpload(error.message);
      setLoadingUpload(false);
    }
  };
  function categoryAddHandler(e){
    e.preventDefault();
    let list=[...sellerProductCategories];
    if(!list.includes(productCategory)){
      list.push(productCategory);
      setSellerProductCategories(list);
    }
  }
  function categoryDeleteHandler(e,category){
    e.preventDefault();
    let list=[...sellerProductCategories];
    list=list.filter(item=>item!==category);
    setSellerProductCategories(list);
  }
  return (
    <div>
      <form className="form" onSubmit={submitHandler}>
        <div>
          <h1>User Profile</h1>
        </div>
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></input>
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></input>
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
              ></input>
            </div>
            <div>
              <label htmlFor="confirmPassword">confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Enter confirm password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></input>
            </div>
            <div>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                type="number"
                placeholder="Enter your Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              ></input>
            </div>
            <div>
              <label htmlFor="city">City</label>
              <select id="city" onChange={(e) => setCity(e.target.value)}>
                <option value="" selected hidden>{city}</option>
                <option value="Rohtak" >Rohtak</option> 
                <option value="Gurugram">Gurugram</option>
              </select>
            </div>
            <div>
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                placeholder="Enter your Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></input>
            </div>
            {user.isSeller && (
              <>
                <div><h1>Seller Profile Details</h1></div>
                <div>
                  <label htmlFor="sellerName">Seller Name</label>
                  <input
                    id="sellerName"
                    type="text"
                    placeholder="Enter Seller Name"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                  ></input>
                </div>
                {/* <div>
                  <label htmlFor="sellerLogo">Seller Logo</label>
                  <input
                    id="sellerLogo"
                    type="text"
                    placeholder="Enter Seller Logo"
                    value={sellerLogo}
                    onChange={(e) => setSellerLogo(e.target.value)}
                  ></input>
                </div> */}
                <div>
                  <label htmlFor="imageFile">Seller Logo Image</label>
                  <input
                    type="file"
                    id="imageFile"
                    label="Choose Image"
                    onChange={uploadFileHandler}
                    accept="image/*"
                  ></input>
                  {loadingUpload && <LoadingBox></LoadingBox>}
                  {errorUpload && (
                    <MessageBox variant="danger">{errorUpload}</MessageBox>
                  )}
                </div>
                <div>
                  <label htmlFor="sellerDescription">Seller Description</label>
                  <input
                    id="sellerDescription"
                    type="text"
                    placeholder="Enter Seller Description"
                    value={sellerDescription}
                    onChange={(e) => setSellerDescription(e.target.value)}
                  ></input>
                </div>
                <div >
                  <label htmlFor="productCategories">Select Product Categories</label>
                  <div class="selectWithSideButton">
                    <select id="productCategories" style={{width:"78%"}} onChange={(e) => setProductCategory(e.target.value)}>
                      <option value="" selected hidden>{productCategory}</option>
                      <option value="Women beauty">Women beauty</option>
                      <option value="Women clothing">Women clothing</option>
                      <option value="Men Clothing">Men Clothing</option>
                      <option value="Women Footwears">Women Footwears</option>
                      <option value="Men Footwears">Men Footwears</option>
                      <option value="Hair Products">Hair Products</option>
                      <option value="Packed Food Products">Packed Food Products</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Indian sweets">Indian sweets</option>
                      <option value="Dairy Products">Dairy Products</option>
                      <option value="Supplements">Supplements</option>
                      <option value="Stationery">Stationery</option>
                    </select>
                    <button onClick={categoryAddHandler} style={{width:"20%"}}>Add</button>
                  </div>
                </div>
                <div>
                <div class="itemsAddBox">
                {sellerProductCategories.map(category=>{
                  return(
                    <div  key={category} className="productCategoryWrapper">
                      <div className="productCategory">
                        <span>{category}</span>
                        <button onClick={(e)=>categoryDeleteHandler(e,category)} className="productCategoryDeleteButton">X</button>
                      </div>
                    </div>
                  ) 
                })
                }
                </div>
                </div>
                <div>
                  <label htmlFor="minOrderPrice">Minimum Order Price</label>
                  <input
                    id="minOrderPrice"
                    type="number"
                    placeholder="Enter Minimum Order Amount"
                    value={minOrderPrice}
                    onChange={(e) => setMinOrderPrice(e.target.value)}
                  ></input>
                </div>
                <div>
                  <label htmlFor="deliveryPrice">Delivery Price</label>
                  <input
                    id="deliveryPrice"
                    type="number"
                    placeholder="Enter Delivery Price"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(e.target.value)}
                  ></input>
                </div>
                {/* <div>
                  <label htmlFor="sellerCategory">sellerCategory</label>
                  <select id="sellerCategory" onChange={(e) => setSellerCategory(e.target.value)}>
                    <option value="" selected hidden>{sellerCategory}</option>
                    <option value="Grocery shop" >Grocery shop</option> 
                    <option value="Women beauty">Women clothing/beauty</option>
                    <option value="Men Clothing">Men Clothing</option>
                    <option value="All Clothing">All Clothing</option>
                    <option value="Supplements">Supplements</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div> */}
              </>
            )}
            <div>
              <label />
              <button className="primary" type="submit">
                Update
              </button>
            </div>
            {loadingUpdate && <LoadingBox></LoadingBox>}
            {errorUpdate && (
              <MessageBox variant="danger">{errorUpdate}</MessageBox>
            )}
            {successUpdate && (
              <MessageBox variant="success">
                Profile Updated Successfully
              </MessageBox>
            )}
          </>
        )}
      </form>
    </div>
  );
}
