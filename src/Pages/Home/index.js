import HomeBanner from "../../Components/HomeBanner";
import Button from "@mui/material/Button";
import { IoIosArrowRoundForward } from "react-icons/io";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import ProductItem from "../../Components/ProductItem";
import HomeCat from "../../Components/HomeCat";

import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";

import homeBannerPlaceholder from "../../assets/images/homeBannerPlaceholder.jpg";
import Banners from "../../Components/banners";
import { Link } from "react-router-dom";
import ChatBox from "../Chat";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCat, setselectedCat] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [homeSlides, setHomeSlides] = useState([]);

  const [value, setValue] = React.useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [bannerList, setBannerList] = useState([]);
  const [randomCatProducts, setRandomCatProducts] = useState([]);
  const [homeSideBanners, setHomeSideBanners] = useState([]);
  const [homeBottomBanners, setHomeBottomBanners] = useState([]);

  const context = useContext(MyContext);
  const filterSlider = useRef();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const selectCat = (cat) => {
    setselectedCat(cat);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setisHeaderFooterShow(true);

    // Only set selected category if categoryData exists and has items
    if (
      Array.isArray(context.categoryData) &&
      context.categoryData.length > 0
    ) {
      setselectedCat(context.categoryData[0]?.name || "");
    }

    const location = localStorage.getItem("location");

    if (location !== null && location !== "" && location !== undefined) {
      fetchDataFromApi(`/api/products/featured?location=${location}`).then(
        (res) => {
          setFeaturedProducts(res || []);
        }
      );

      fetchDataFromApi(
        `/api/products?page=1&perPage=16&location=${location}`
      ).then((res) => {
        setProductsData(res || {});
      });
    }

    fetchDataFromApi("/api/homeBanner").then((res) => {
      setHomeSlides(res || []);
    });

    fetchDataFromApi("/api/banners").then((res) => {
      setBannerList(res || []);
    });

    fetchDataFromApi("/api/homeSideBanners").then((res) => {
      setHomeSideBanners(res || []);
    });

    fetchDataFromApi("/api/homeBottomBanners").then((res) => {
      setHomeBottomBanners(res || []);
    });

    context.setEnableFilterTab(false);
    context.setIsBottomShow(true);
  }, []);

  useEffect(() => {
    if (
      Array.isArray(context.categoryData) &&
      context.categoryData.length > 0
    ) {
      setselectedCat(context.categoryData[0]?.name || "");

      const randomIndex = Math.floor(
        Math.random() * context.categoryData.length
      );
      const selectedCategory = context.categoryData[randomIndex];

      if (selectedCategory?.id) {
        const location = localStorage.getItem("location");
        fetchDataFromApi(
          `/api/products/catId?catId=${selectedCategory.id}&location=${location}`
        ).then((res) => {
          setRandomCatProducts({
            catName: selectedCategory.name,
            catId: selectedCategory.id,
            products: res?.products || [],
          });
        });
      }
    }
  }, [context.categoryData]);

  useEffect(() => {
    if (selectedCat) {
      setIsLoading(true);
      const location = localStorage.getItem("location");
      fetchDataFromApi(
        `/api/products/catName?catName=${selectedCat}&location=${location}`
      ).then((res) => {
        setFilterData(res?.products || []);
        setIsLoading(false);
        filterSlider?.current?.swiper?.slideTo(0);
      });
    }
  }, [selectedCat]);

  return (
    <>
      {Array.isArray(homeSlides) && homeSlides.length > 0 ? (
        <HomeBanner data={homeSlides} />
      ) : (
        <div className="container mt-3">
          <div className="homeBannerSection">
            <img
              src={homeBannerPlaceholder}
              className="w-100"
              alt="banner placeholder"
            />
          </div>
        </div>
      )}

      {Array.isArray(context.categoryData) &&
        context.categoryData.length > 0 && (
          <HomeCat catData={context.categoryData} />
        )}

      <section className="homeProducts pb-0">
        <div className="container">
          <div className="row homeProductsRow">
            <div className="col-md-3">
              <div className="sticky">
                {Array.isArray(homeSideBanners) &&
                  homeSideBanners.length > 0 &&
                  homeSideBanners.map((item, index) => (
                    <div className="banner mb-3" key={index}>
                      {item?.subCatId ? (
                        <Link
                          to={`/products/subCat/${item.subCatId}`}
                          className="box"
                        >
                          <img
                            src={item?.images[0]}
                            className="w-100 transition"
                            alt="banner img"
                          />
                        </Link>
                      ) : (
                        <Link
                          to={`/products/category/${item.catId}`}
                          className="box"
                        >
                          <img
                            src={item?.images[0]}
                            className="cursor w-100 transition"
                            alt="banner img"
                          />
                        </Link>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="col-md-9 productRow">
              <div className="d-flex align-items-center res-flex-column">
                <div className="info" style={{ width: "35%" }}>
                  <h3 className="mb-0 hd">Popular Products</h3>
                  <p className="text-light text-sml mb-0">
                    Do not miss the current offers until the end of March.
                  </p>
                </div>

                <div
                  className="ml-auto d-flex align-items-center justify-content-end res-full"
                  style={{ width: "65%" }}
                >
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    className="filterTabs"
                  >
                    {Array.isArray(context.categoryData) &&
                      context.categoryData.map((item, index) => (
                        <Tab
                          key={index}
                          className="item"
                          label={item.name}
                          onClick={() => selectCat(item.name)}
                        />
                      ))}
                  </Tabs>
                </div>
              </div>

              <div
                className="product_row w-100 mt-2"
                style={{
                  opacity: isLoading ? "0.5" : "1",
                }}
              >
                {context.windowWidth > 992 ? (
                  <Swiper
                    ref={filterSlider}
                    slidesPerView={4}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {Array.isArray(filterData) &&
                      filterData.length > 0 &&
                      filterData
                        .slice(0)
                        .reverse()
                        .map((item, index) => (
                          <SwiperSlide key={index}>
                            <ProductItem item={item} />
                          </SwiperSlide>
                        ))}

                    <SwiperSlide style={{ opacity: 0 }}>
                      <div className={`productItem`}></div>
                    </SwiperSlide>
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {Array.isArray(filterData) &&
                      filterData.length > 0 &&
                      filterData
                        .slice(0)
                        .reverse()
                        .map((item, index) => (
                          <ProductItem item={item} key={index} />
                        ))}
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center mt-2">
                <div className="info w-75">
                  <h3 className="mb-0 hd">NEW PRODUCTS</h3>
                  <p className="text-light text-sml mb-0">
                    New products with updated stocks.
                  </p>
                </div>
              </div>

              {!Array.isArray(productsData?.products) ||
              productsData?.products?.length === 0 ? (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ minHeight: "300px" }}
                >
                  <CircularProgress />
                </div>
              ) : (
                <div className="product_row productRow2 w-100 mt-4 d-flex productScroller ml-0 mr-0">
                  {productsData.products
                    .slice(0)
                    .reverse()
                    .map((item, index) => (
                      <ProductItem key={index} item={item} />
                    ))}
                </div>
              )}

              {Array.isArray(bannerList) && bannerList.length > 0 && (
                <Banners data={bannerList} col={3} />
              )}
            </div>
          </div>

          <div className="d-flex align-items-center mt-4">
            <div className="info">
              <h3 className="mb-0 hd">featured products</h3>
              <p className="text-light text-sml mb-0">
                Do not miss the current offers until the end of March.
              </p>
            </div>
          </div>

          {Array.isArray(featuredProducts) && featuredProducts.length > 0 && (
            <div className="product_row w-100 mt-2">
              {context.windowWidth > 992 ? (
                <Swiper
                  slidesPerView={4}
                  spaceBetween={0}
                  navigation={true}
                  slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                  modules={[Navigation]}
                  className="mySwiper"
                  breakpoints={{
                    300: {
                      slidesPerView: 1,
                      spaceBetween: 5,
                    },
                    400: {
                      slidesPerView: 2,
                      spaceBetween: 5,
                    },
                    600: {
                      slidesPerView: 3,
                      spaceBetween: 5,
                    },
                    750: {
                      slidesPerView: 5,
                      spaceBetween: 5,
                    },
                  }}
                >
                  {featuredProducts
                    .slice(0)
                    .reverse()
                    .map((item, index) => (
                      <SwiperSlide key={index}>
                        <ProductItem item={item} />
                      </SwiperSlide>
                    ))}

                  <SwiperSlide style={{ opacity: 0 }}>
                    <div className={`productItem`}></div>
                  </SwiperSlide>
                </Swiper>
              ) : (
                <div className="productScroller">
                  {featuredProducts
                    .slice(0)
                    .reverse()
                    .map((item, index) => (
                      <ProductItem item={item} key={index} />
                    ))}
                </div>
              )}
            </div>
          )}

          {Array.isArray(homeBottomBanners) && homeBottomBanners.length > 0 && (
            <Banners data={homeBottomBanners} col={3} />
          )}
        </div>
      </section>

      <div className="container">
        {randomCatProducts?.products &&
          randomCatProducts.products.length > 0 && (
            <>
              <div className="d-flex align-items-center mt-1 pr-3">
                <div className="info">
                  <h3 className="mb-0 hd">{randomCatProducts.catName}</h3>
                  <p className="text-light text-sml mb-0">
                    Do not miss the current offers until the end of March.
                  </p>
                </div>

                <Link
                  to={`/products/category/${randomCatProducts.catId}`}
                  className="ml-auto"
                >
                  <Button className="viewAllBtn">
                    View All <IoIosArrowRoundForward />
                  </Button>
                </Link>
              </div>

              <div className="product_row w-100 mt-2">
                {context.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={5}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                    breakpoints={{
                      300: {
                        slidesPerView: 1,
                        spaceBetween: 5,
                      },
                      400: {
                        slidesPerView: 2,
                        spaceBetween: 5,
                      },
                      600: {
                        slidesPerView: 4,
                        spaceBetween: 5,
                      },
                      750: {
                        slidesPerView: 5,
                        spaceBetween: 5,
                      },
                    }}
                  >
                    {randomCatProducts.products
                      .slice(0)
                      .reverse()
                      .map((item, index) => (
                        <SwiperSlide key={index}>
                          <ProductItem item={item} />
                        </SwiperSlide>
                      ))}

                    <SwiperSlide style={{ opacity: 0 }}>
                      <div className={`productItem`}></div>
                    </SwiperSlide>
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {randomCatProducts.products
                      .slice(0)
                      .reverse()
                      .map((item, index) => (
                        <ProductItem item={item} key={index} />
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
      </div>

      <ChatBox />
    </>
  );
};

export default Home;
